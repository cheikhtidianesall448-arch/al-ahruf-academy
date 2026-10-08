import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMPTY_STATE = {
  students: [],
  teachers: [],
  pay: [],
  att: {},
  classes: [],
  messages: [],
  notifications: [],
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return json({ error: message }, status);
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function lower(value: unknown) {
  return text(value).toLowerCase();
}

function cleanState(state: any) {
  const s = JSON.parse(JSON.stringify(state || EMPTY_STATE));
  s.students = Array.isArray(s.students) ? s.students : [];
  s.teachers = Array.isArray(s.teachers) ? s.teachers : [];
  s.pay = Array.isArray(s.pay) ? s.pay : [];
  s.att = s.att && typeof s.att === "object" ? s.att : {};
  s.classes = Array.isArray(s.classes) ? s.classes : [];
  s.messages = Array.isArray(s.messages) ? s.messages : [];
  s.notifications = Array.isArray(s.notifications) ? s.notifications : [];
  s.messagePeers = Array.isArray(s.messagePeers) ? s.messagePeers : [];
  s.paymentReminders = Array.isArray(s.paymentReminders) ? s.paymentReminders : [];

  // Never return stored passwords to the browser.
  s.students.forEach((student: any) => {
    if (student && typeof student === "object") delete student.pw;
  });

  return s;
}

function studentState(state: any, username: string) {
  const id = lower(username);
  const s = cleanState(state);

  const me = s.students.find((student: any) => lower(student?.id) === id);
  const teacher = lower(me?.teacher);
  s.messagePeers = teacher
    ? s.students.filter((student: any) => lower(student?.teacher) === teacher && lower(student?.id) !== id).map((student: any) => ({ id: student.id, name: student.name, teacher: student.teacher }))
    : [];
  s.students = s.students.filter(
    (student: any) => lower(student?.id) === id,
  );

  s.pay = s.pay.filter((payment: any) => lower(payment?.sid) === id);

  const filteredAttendance: Record<string, any> = {};
  for (const [date, value] of Object.entries(s.att || {})) {
    if (value && typeof value === "object" && value[id]) {
      filteredAttendance[date] = { [id]: value[id] };
    }
  }
  s.att = filteredAttendance;

  return s;
}


function teacherState(state: any, username: string) {
  const s = cleanState(state);
  const teacher = lower(username);
  const assigned = s.students.filter((student: any) => lower(student?.teacher) === teacher);
  const assignedIds = new Set(assigned.map((student: any) => lower(student?.id)));
  s.students = assigned;
  // Teachers may see and edit attendance for their assigned students only.
  const filteredAttendance: Record<string, any> = {};
  for (const [date, value] of Object.entries(s.att || {})) {
    if (value && typeof value === "object") {
      const day: Record<string, any> = {};
      for (const [sid, record] of Object.entries(value as Record<string, any>)) {
        if (assignedIds.has(lower(sid))) day[sid] = record;
      }
      if (Object.keys(day).length) filteredAttendance[date] = day;
    }
  }
  s.att = filteredAttendance;
  // Teachers never receive payment data.
  s.pay = [];
  return s;
}

function visibleMessages(state: any, profile: any) {
  const s = cleanState(state);
  const role = normalizedRole(profile?.role);
  const me = lower(profile?.username);
  if (role === "admin") return s.messages;
  const assignedIds = role === "teacher"
    ? new Set(s.students.filter((x: any) => lower(x?.teacher) === me).map((x: any) => lower(x?.id)))
    : new Set([me]);
  const myStudent = role === "student" ? s.students.find((x: any) => lower(x?.id) === me) : null;
  const peerIds = role === "student" && myStudent?.teacher
    ? new Set(s.students.filter((x: any) => lower(x?.teacher) === lower(myStudent.teacher)).map((x: any) => lower(x?.id)))
    : new Set<string>();
  return s.messages.filter((m: any) => {
    const from = lower(m?.from);
    const to = lower(m?.to);
    if (from === me || to === me) return true;
    if (role === "student" && peerIds.has(from) && peerIds.has(to)) return true;
    if (role === "teacher" && assignedIds.has(from) && assignedIds.has(to)) return true;
    return false;
  });
}

function buildNotifications(state: any, profile: any) {
  const s = cleanState(state);
  const role = normalizedRole(profile?.role);
  const me = lower(profile?.username);
  const out = s.notifications.filter((n: any) => {
    if (role === "admin") return !n?.target || lower(n.target) === me || n.targetRole === "admin";
    return lower(n?.target) === me;
  });
  const now = new Date();
  if (role === "teacher") return out.sort((a:any,b:any)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  const students = role === "student"
    ? s.students.filter((x: any) => lower(x?.id) === me)
    : s.students;
  for (const student of students) {
    for (const p of s.pay.filter((x: any) => lower(x?.sid) === lower(student?.id) && x?.st !== "paid" && x?.due)) {
      const due = new Date(String(p.due) + "T23:59:59");
      const days = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      if (days <= 5 && days >= 0) {
        out.push({ id:"payment-"+p.inv+"-"+(role==="student"?me:"admin"), type:"payment", target:role==="student"?me:"admin", title:days===0?"Payment due today":"Payment due soon", body:days===0?("Payment "+p.inv+" is due today."):("Payment "+p.inv+" is due in "+days+" day"+(days===1?"":"s")+"."), createdAt:new Date().toISOString(), read:false });
      } else if (days < 0) {
        out.push({ id:"overdue-"+p.inv+"-"+(role==="student"?me:"admin"), type:"payment", target:role==="student"?me:"admin", title:"Payment overdue", body:"Payment "+p.inv+" is overdue.", createdAt:new Date().toISOString(), read:false });
      }
    }
  }
  return out.sort((a:any,b:any)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
}

async function sendMessage(ctx: any, body: any) {
  const profile = await getCurrentProfile(ctx);
  if (!profile || !isActive(profile)) throw new Error("Not authenticated.");
  const requestedTo = text(body.to);
  const subject = text(body.subject);
  const message = text(body.message);
  const category = text(body.category) || "general";
  if (!requestedTo || !message) throw new Error("Recipient and message are required.");

  const state = ensureMessageState(await getAcademyState(ctx));
  const role = normalizedRole(profile.role);
  const me = lower(profile.username);

  // Student complaints are always routed to the administrator.
  const to = role === "student" && category === "complaint" ? "ahruf" : requestedTo;

  const found = await ctx.supabaseAdmin.from("profiles").select("id").ilike("username", to).limit(1);
  if (found.error) throw found.error;
  let target = found.data?.[0] ? await getProfile(ctx, found.data[0].id) : null;

  if (!target && lower(to) === "ahruf") {
    const admins = await ctx.supabaseAdmin.from("profiles").select("id").eq("role","admin").neq("is_active",false).limit(2);
    if (admins.error) throw admins.error;
    if (admins.data?.length === 1) target = await getProfile(ctx, admins.data[0].id);
  }
  if (!target || !isActive(target)) throw new Error("Recipient was not found.");

  const targetRole = normalizedRole(target.role);
  const myStudent = role === "student" ? state.students.find((s:any)=>lower(s?.id)===me) : null;
  const targetStudent = targetRole === "student" ? state.students.find((s:any)=>lower(s?.id)===lower(target.username)) : null;
  const allowed =
    role === "admin" ||
    (role === "teacher" && targetRole === "student" && state.students.some((s:any)=>lower(s?.id)===lower(target.username)&&lower(s?.teacher)===me)) ||
    (role === "student" && targetRole === "teacher" && lower(target.username) === lower(myStudent?.teacher)) ||
    (role === "student" && targetRole === "student" && !!myStudent?.teacher && lower(myStudent.teacher) === lower(targetStudent?.teacher));

  if (!allowed) throw new Error("You can only message the academy or your assigned teacher/student.");

  const item = {
    id: crypto.randomUUID(),
    from: profile.username, fromName: profileName(profile), fromRole: role,
    to: target.username, toName: profileName(target), toRole: targetRole,
    subject: subject || "Message from Al-Ahruf Academy", category, body: message,
    status: "open", createdAt: new Date().toISOString(), readBy: [profile.username],
  };

  state.messages.push(item);
  const {error}=await ctx.supabaseAdmin.from("academy_state")
    .update({state:cleanState(state),updated_at:new Date().toISOString()}).eq("id",1);
  if(error) throw error;

  const recipientEmail=text(target.email);
  if(recipientEmail) {
    const emailSubject = category === "complaint" ? "New complaint received" : "New Al-Ahruf Academy message";
    await sendAcademyEmail(
      recipientEmail,
      emailSubject,
      `<p>Hello ${escapeHtml(profileName(target))},</p><p>You have a new message in <strong>Al-Ahruf International Academy</strong>.</p><p><strong>Subject:</strong> ${escapeHtml(item.subject)}</p><p>Please sign in to the Academy dashboard to read and respond.</p>`,
      `Hello ${profileName(target)},\\n\\nYou have a new message in Al-Ahruf International Academy.\\nSubject: ${item.subject}\\n\\nPlease sign in to the Academy dashboard to read and respond.`
    );
  }

  return {ok:true,state:{messages:visibleMessages(state,profile),notifications:buildNotifications(state,profile)}};
}

async function sendPaymentReminders(ctx: any) {
  await requireStaff(ctx, ["admin"]);
  const state = await getAcademyState(ctx);
  state.paymentReminders = Array.isArray(state.paymentReminders) ? state.paymentReminders : [];
  const now = new Date(), today = now.toISOString().slice(0,10), sent:any[] = [];

  for (const p of state.pay || []) {
    if (!p || p.st === "paid" || !p.due || !p.sid) continue;
    const dueDate = new Date(String(p.due)+"T23:59:59");
    if (Number.isNaN(dueDate.getTime())) continue;
    const days = Math.ceil((dueDate.getTime()-now.getTime())/86400000);
    const kind = days===5 ? "5-days" : days===0 ? "due-today" : days<0 ? "overdue" : "";
    if (!kind) continue;
    const key = `${p.inv || p.sid}:${kind}:${today}`;
    if (state.paymentReminders.some((x:any)=>x?.key===key)) continue;
    const student=state.students.find((s:any)=>lower(s?.id)===lower(p.sid));
    const email=text(student?.email);
    if(!student || !email.includes("@")) continue;
    let subject="Al-Ahruf Academy payment reminder";
    let body=`Your payment ${p.inv || ""} is due soon.`;
    if(kind==="due-today") body=`Your payment ${p.inv || ""} is due today.`;
    if(kind==="overdue"){ subject="Al-Ahruf Academy payment overdue"; body=`Your payment ${p.inv || ""} is overdue. Please contact the Academy if you need assistance.`; }
    const result=await sendAcademyEmail(email,subject,
      `<p>Hello ${escapeHtml(student.name)},</p><p>${escapeHtml(body)}</p><p>Please sign in to the Al-Ahruf Academy dashboard for your payment information.</p>`,
      `Hello ${student.name},\\n\\n${body}\\n\\nPlease sign in to the Al-Ahruf Academy dashboard for your payment information.`);
    if(result.ok){ state.paymentReminders.push({key,sid:student.id,kind,sentAt:new Date().toISOString()}); sent.push({sid:student.id,kind}); }
  }
  const {error}=await ctx.supabaseAdmin.from("academy_state").update({state:cleanState(state),updated_at:new Date().toISOString()}).eq("id",1);
  if(error) throw error;
  return {ok:true,sent};
}

async function markNotificationRead(ctx: any, body: any) {
  const profile = await getCurrentProfile(ctx);
  if (!profile || !isActive(profile)) throw new Error("Not authenticated.");
  const id=text(body.id); if(!id) throw new Error("Notification ID is required.");
  const state=await getAcademyState(ctx);
  const n=state.notifications.find((x:any)=>x?.id===id && lower(x?.target)===lower(profile.username));
  if(n) n.read=true;
  const {error}=await ctx.supabaseAdmin.from("academy_state").update({state:cleanState(state),updated_at:new Date().toISOString()}).eq("id",1);
  if(error) throw error;
  return {ok:true,state:{messages:visibleMessages(state,profile),notifications:buildNotifications(state,profile)}};
}

async function getAcademyState(ctx: any) {
  const { data, error } = await ctx.supabaseAdmin
    .from("academy_state")
    .select("state")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  return cleanState(data?.state || EMPTY_STATE);
}

async function getProfile(ctx: any, userId: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from("profiles")
    .select(
      "id,username,name,full_name,role,email,phone,photo_url,gender,is_active",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function getCurrentProfile(ctx: any) {
  // withSupabase can expose the verified UID through userClaims, but the
  // authenticated Supabase client is the reliable fallback for protected
  // requests coming from the browser.
  const claimUserId = ctx.userClaims?.sub;

  if (claimUserId) {
    return await getProfile(ctx, claimUserId);
  }

  const { data, error } = await ctx.supabase.auth.getUser();

  if (error || !data?.user?.id) {
    return null;
  }

  return await getProfile(ctx, data.user.id);
}

function normalizedRole(value: unknown) {
  const r = lower(value);
  if (r === "administrator") return "admin";
  return r;
}

function ensureMessageState(state: any) {
  const s = state && typeof state === "object" ? state : {};
  s.students = Array.isArray(s.students) ? s.students : [];
  s.teachers = Array.isArray(s.teachers) ? s.teachers : [];
  s.pay = Array.isArray(s.pay) ? s.pay : [];
  s.att = s.att && typeof s.att === "object" ? s.att : {};
  s.classes = Array.isArray(s.classes) ? s.classes : [];
  s.messages = Array.isArray(s.messages) ? s.messages : [];
  s.notifications = Array.isArray(s.notifications) ? s.notifications : [];
  s.paymentReminders = Array.isArray(s.paymentReminders) ? s.paymentReminders : [];
  return s;
}

function escapeHtml(value: unknown) {
  return text(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}

async function sendAcademyEmail(to: string, subject: string, html: string, textBody: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");

  if (!apiKey || !from || !to || !to.includes("@")) {
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: textBody,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend email failed:", response.status, detail);
      return { ok: false, error: detail };
    }

    return { ok: true };
  } catch (error) {
    console.error("Resend request failed:", error);
    return { ok: false, error: String(error) };
  }
}

function profileName(profile: any, fallback = "User") {
  return text(profile?.full_name) ||
    text(profile?.name) ||
    text(profile?.username) ||
    fallback;
}

function isActive(profile: any) {
  // Legacy rows with NULL are treated as active.
  return profile?.is_active !== false;
}

async function findProfileForLogin(ctx: any, username: string) {
  const input = lower(username);
  if (!input) return null;

  // 1. Username — case insensitive.
  const byUsername = await ctx.supabaseAdmin
    .from("profiles")
    .select(
      "id,username,name,full_name,role,email,phone,photo_url,gender,is_active",
    )
    .ilike("username", input)
    .limit(2);

  if (byUsername.error) throw byUsername.error;
  if (byUsername.data?.length === 1) return byUsername.data[0];

  // 2. Profile email — case insensitive.
  if (input.includes("@")) {
    const byEmail = await ctx.supabaseAdmin
      .from("profiles")
      .select(
        "id,username,name,full_name,role,email,phone,photo_url,gender,is_active",
      )
      .ilike("email", input)
      .limit(2);

    if (byEmail.error) throw byEmail.error;
    if (byEmail.data?.length === 1) return byEmail.data[0];
  }

  // 3. Name fallback. Useful for the existing admin account if its username
  // field was never saved correctly.
  const byName = await ctx.supabaseAdmin
    .from("profiles")
    .select(
      "id,username,name,full_name,role,email,phone,photo_url,gender,is_active",
    )
    .or(`name.ilike.${input},full_name.ilike.${input}`)
    .limit(2);

  if (byName.error) throw byName.error;
  if (byName.data?.length === 1) return byName.data[0];

  // 4. If the login is the admin username and there is exactly one active
  // admin profile, use it. This repairs older installations where "ahruf"
  // was displayed in the UI but not stored in profiles.username.
  if (input === "ahruf") {
    const admins = await ctx.supabaseAdmin
      .from("profiles")
      .select(
        "id,username,name,full_name,role,email,phone,photo_url,gender,is_active",
      )
      .eq("role", "admin")
      .neq("is_active", false)
      .limit(2);

    if (admins.error) throw admins.error;
    if (admins.data?.length === 1) return admins.data[0];
  }

  return null;
}

async function authenticateLogin(ctx: any, username: string, password: string) {
  const input = lower(username);

  if (!input) throw new Error("Username or student ID is required.");
  if (!password) throw new Error("Password is required.");

  let profile = await findProfileForLogin(ctx, input);
  let authEmail = "";

  // If the user supplied an email, we can authenticate directly even when
  // the profile row is incomplete. We then recover the profile by auth UID.
  if (input.includes("@")) authEmail = input;

  if (profile) {
    const { data: authUserData, error: authUserError } =
      await ctx.supabaseAdmin.auth.admin.getUserById(profile.id);

    if (!authUserError && authUserData?.user?.email) {
      authEmail = authUserData.user.email;
    } else if (!authEmail && profile.email) {
      authEmail = lower(profile.email);
    }
  }

  if (!authEmail) {
    throw new Error("No account was found with that username or student ID.");
  }

  // Password verification happens through the normal Supabase Auth client.
  const { data: authData, error: authError } =
    await ctx.supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

  if (authError || !authData?.session || !authData.user) {
    console.error(
      "Login password verification failed:",
      authError?.message || "No session",
    );
    throw new Error("Invalid username or password.");
  }

  // Recover the profile from the authenticated UID. This is the final source
  // of truth and avoids trusting a stale profile email.
  profile = await getProfile(ctx, authData.user.id);

  if (!profile) {
    // An email-authenticated account can still be useful if the profile row
    // was missing; however, the Academy requires a role, so reject it clearly.
    throw new Error("Your account is missing its Academy profile.");
  }

  if (!isActive(profile)) {
    await ctx.supabase.auth.signOut();
    throw new Error("This account is inactive. Please contact the administrator.");
  }

  return { authData, profile };
}

async function login(ctx: any, payload: any) {
  const username = text(
    payload.username ??
      payload.studentId ??
      payload.student_id ??
      payload.email,
  );
  const password = text(payload.password);
  const wantedRole = normalizedRole(payload.role);

  const { authData, profile } = await authenticateLogin(
    ctx,
    username,
    password,
  );

  const actualRole = normalizedRole(profile.role);

  if (wantedRole && actualRole !== wantedRole) {
    await ctx.supabase.auth.signOut();
    throw new Error(
      `This account is registered as ${actualRole}, not ${wantedRole}.`,
    );
  }

  const fullState = await getAcademyState(ctx);
  const state = actualRole === "student"
    ? studentState(fullState, profile.username)
    : actualRole === "teacher"
      ? teacherState(fullState, profile.username)
      : cleanState(fullState);

  return {
    ok: true,
    session: authData.session,
    user: {
      id: profile.id,
      email: authData.user.email ?? profile.email ?? "",
      username: profile.username ?? username,
      name: profileName(profile),
      full_name: profileName(profile),
      role: actualRole,
      phone: profile.phone ?? "",
      photo_url: profile.photo_url ?? "",
    },
    profile,
    state: {...state, messages: visibleMessages(fullState, profile), notifications: buildNotifications(fullState, profile)},
  };
}

async function requireStaff(ctx: any, allowed: string[]) {
  const profile = await getCurrentProfile(ctx);
  if (!profile) throw new Error("Not authenticated.");
  if (!isActive(profile)) throw new Error("This account is inactive.");

  const actualRole = normalizedRole(profile.role);
  if (!allowed.includes(actualRole)) throw new Error("Permission denied.");

  return profile;
}


async function upsertTeacher(ctx: any, body: any) {
  await requireStaff(ctx, ["admin"]);
  const teacher = body.teacher || {};
  const name = text(teacher.name), username = text(teacher.username);
  const emailInput = lower(teacher.email), phone = text(teacher.phone), password = text(teacher.password);
  if (!name || !username) throw new Error("Teacher name and username are required.");
  if (!emailInput || !emailInput.includes("@")) throw new Error("A valid teacher email is required.");

  const existing = await ctx.supabaseAdmin.from("profiles").select("id").ilike("username", username).limit(2);
  if (existing.error) throw existing.error;
  if ((existing.data?.length || 0) > 1) throw new Error("More than one profile uses this username.");

  let userId = existing.data?.[0]?.id;
  if (!userId) {
    if (!password) throw new Error("A password is required for a new teacher.");
    const { data: created, error } = await ctx.supabaseAdmin.auth.admin.createUser({
      email: emailInput, password, email_confirm: true,
      user_metadata: { name, full_name: name, role: "teacher", username },
    });
    if (error || !created?.user) throw error || new Error("Could not create the teacher account.");
    userId = created.user.id;
  } else {
    const attrs: any = { user_metadata: { name, full_name: name, role: "teacher", username } };
    if (emailInput) attrs.email = emailInput;
    if (password) attrs.password = password;
    const { error } = await ctx.supabaseAdmin.auth.admin.updateUserById(userId, attrs);
    if (error) throw error;
  }

  const { error: profileError } = await ctx.supabaseAdmin.from("profiles").upsert({
    id: userId, username, name, full_name: name, role: "teacher",
    email: emailInput, phone, is_active: true,
  }, { onConflict: "id" });
  if (profileError) throw new Error("Could not save teacher profile: " + profileError.message);

  const state = await getAcademyState(ctx);
  state.teachers = (state.teachers || []).filter((x: any) => lower(x?.username) !== lower(username));
  state.teachers.push({ id: userId, name, username, email: emailInput, phone, active: true });

  const { error: stateError } = await ctx.supabaseAdmin.from("academy_state")
    .update({ state: cleanState(state), updated_at: new Date().toISOString() }).eq("id", 1);
  if (stateError) throw stateError;
  return { ok: true, state: cleanState(state) };
}

async function deleteTeacher(ctx: any, body: any) {
  await requireStaff(ctx, ["admin"]);
  const username = text(body.username);
  if (!username) throw new Error("Teacher username is required.");
  const profileResult = await ctx.supabaseAdmin.from("profiles").select("id").ilike("username", username).limit(2);
  if (profileResult.error) throw profileResult.error;
  if (profileResult.data?.length > 1) throw new Error("More than one profile uses this username.");
  const userId = profileResult.data?.[0]?.id;
  if (userId) {
    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
  const state = await getAcademyState(ctx);
  state.teachers = (state.teachers || []).filter((x: any) => lower(x?.username) !== lower(username));
  state.students = (state.students || []).map((s: any) =>
    lower(s?.teacher) === lower(username) ? { ...s, teacher: "" } : s
  );
  const { error } = await ctx.supabaseAdmin.from("academy_state")
    .update({ state: cleanState(state), updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) throw error;
  return { ok: true, state: cleanState(state) };
}

function generatedStudentId(fullName: string, phone: string, usedIds: string[], preserveId = "") {
  const keep = text(preserveId);
  if (keep) return keep;
  const letters = fullName.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^A-Za-z]/g, "").toUpperCase();
  const digits = phone.replace(/\\D/g, "");
  if (letters.length < 2) throw new Error("The student's full name must contain at least two letters.");
  if (digits.length < 2) throw new Error("A valid phone number with at least two digits is required to generate the Student ID.");
  const base = `${letters[0]}${letters[letters.length - 1]}ARF${digits.slice(-2)}`;
  const used = new Set(usedIds.map((x) => lower(x)));
  if (!used.has(lower(base))) return base;
  let n = 2;
  while (used.has(lower(`${base}-${n}`))) n++;
  return `${base}-${n}`;
}

async function upsertStudent(ctx: any, body: any) {
  const admin = await requireStaff(ctx, ["admin"]);
  void admin;

  const s = body.student || {};
  const fullName = text(s.name);
  const password = text(s.pw);
  const emailInput = lower(s.email);
  const phone = text(s.phone);
  const existingId = text(body.existingId);

  if (!fullName) throw new Error("Student full name is required.");
  if (!phone) throw new Error("A phone number is required to generate the Student ID.");

  const state = await getAcademyState(ctx);
  const currentStudent = existingId
    ? (state.students || []).find((x: any) => lower(x?.id) === lower(existingId))
    : null;

  let studentId = existingId || text(s.id);
  if (!studentId) {
    const profileResult = await ctx.supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("role", "student");
    if (profileResult.error) throw profileResult.error;
    const usedIds = [
      ...(state.students || []).map((x: any) => text(x?.id)),
      ...(profileResult.data || []).map((x: any) => text(x?.username)),
    ].filter(Boolean);
    studentId = generatedStudentId(fullName, phone, usedIds);
  } else if (currentStudent && lower(studentId) !== lower(currentStudent.id)) {
    throw new Error("The existing Student ID could not be verified.");
  }

  const normalizedStudentId = studentId.toLowerCase();
  const safeStudentId = normalizedStudentId.replace(/[^a-z0-9]/g, "");
  const authEmail =
    emailInput || `${safeStudentId || crypto.randomUUID()}@student.alahruf.local`;

  const existing = await ctx.supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("username", studentId)
    .limit(2);

  if (existing.error) throw existing.error;
  if ((existing.data?.length || 0) > 1) {
    throw new Error("More than one profile uses this Student ID.");
  }

  let userId = existing.data?.[0]?.id;

  if (!userId) {
    if (!password) {
      throw new Error("A password is required for a new student.");
    }

    const { data: created, error } =
      await ctx.supabaseAdmin.auth.admin.createUser({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: fullName,
          full_name: fullName,
          role: "student",
          username: studentId,
        },
      });

    if (error || !created?.user) {
      throw error || new Error("Could not create the student account.");
    }

    userId = created.user.id;
  } else {
    const attrs: any = {
      user_metadata: {
        name: fullName,
        full_name: fullName,
        role: "student",
        username: studentId,
      },
    };

    if (emailInput) attrs.email = authEmail;
    if (password) attrs.password = password;

    const { error } = await ctx.supabaseAdmin.auth.admin.updateUserById(
      userId,
      attrs,
    );

    if (error) throw error;
  }

  const { error: profileError } = await ctx.supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        username: studentId,
        name: fullName,
        full_name: fullName,
        role: "student",
        email: emailInput || authEmail,
        phone,
        is_active: true,
      },
      { onConflict: "id" },
    );

  if (profileError) {
    console.error("Student profile save error:", profileError);
    throw new Error(`Could not save student profile: ${profileError.message}`);
  }

  const teacherUsername = text(s.teacher);
  if (teacherUsername) {
    const teacherProfile = await ctx.supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", teacherUsername)
      .eq("role", "teacher")
      .limit(2);
    if (teacherProfile.error) throw teacherProfile.error;
    if (teacherProfile.data?.length !== 1) {
      throw new Error("The selected teacher account was not found.");
    }
  }

  const age = Number(s.age);
  const sex = text(s.sex);
  if (!Number.isInteger(age) || age < 1 || age > 120) throw new Error("A valid student age between 1 and 120 is required.");
  if (sex !== "Male" && sex !== "Female") throw new Error("Student sex must be Male or Female.");

  const cleanStudent = {
    id: studentId,
    name: fullName,
    age,
    sex,
    phone,
    email: emailInput,
    level: text(s.level) || "Beginner",
    pay: text(s.pay) || "pending",
    sur: Array.isArray(s.sur) ? s.sur : [],
    teacher: teacherUsername,
  };

  const students = (state.students || []).filter(
    (x: any) => lower(x?.id) !== normalizedStudentId,
  );
  students.push(cleanStudent);
  state.students = students;

  const { error: stateError } = await ctx.supabaseAdmin
    .from("academy_state")
    .update({
      state: cleanState(state),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (stateError) throw stateError;

  return { ok: true, state: cleanState(state), studentId };
}

async function deleteStudent(ctx: any, body: any) {
  await requireStaff(ctx, ["admin"]);

  const studentId = text(body.studentId);
  if (!studentId) throw new Error("Student ID is required.");

  const profileResult = await ctx.supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("username", studentId)
    .limit(2);

  if (profileResult.error) throw profileResult.error;

  if (profileResult.data?.length > 1) {
    throw new Error("More than one profile uses this Student ID.");
  }

  const userId = profileResult.data?.[0]?.id;
  if (userId) {
    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
  }

  const state = await getAcademyState(ctx);
  const id = lower(studentId);

  state.students = (state.students || []).filter(
    (s: any) => lower(s?.id) !== id,
  );
  state.pay = (state.pay || []).filter(
    (p: any) => lower(p?.sid) !== id,
  );

  for (const date of Object.keys(state.att || {})) {
    if (state.att[date] && typeof state.att[date] === "object") {
      delete state.att[date][id];
      delete state.att[date][studentId];
    }
  }

  const { error } = await ctx.supabaseAdmin
    .from("academy_state")
    .update({
      state: cleanState(state),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw error;

  return { ok: true, state: cleanState(state) };
}

async function getState(ctx: any) {
  const profile = await getCurrentProfile(ctx);
  if (!profile) throw new Error("Not authenticated.");
  if (!isActive(profile)) throw new Error("This account is inactive.");

  const state = await getAcademyState(ctx);
  const actualRole = normalizedRole(profile.role);
  const visibleState = actualRole === "student"
    ? studentState(state, profile.username)
    : actualRole === "teacher"
      ? teacherState(state, profile.username)
      : cleanState(state);

  return {
    user: {
      id: profile.id,
      email: profile.email ?? "",
      username: profile.username ?? "",
      name: profileName(profile),
      full_name: profileName(profile),
      role: actualRole,
    },
    state: {...visibleState, messages: visibleMessages(state, profile), notifications: buildNotifications(state, profile)},
  };
}

async function saveState(ctx: any, body: any) {
  const profile = await requireStaff(ctx, ["admin", "teacher"]);
  if (!body.state || typeof body.state !== "object") throw new Error("A valid state object is required.");

  if (normalizedRole(profile.role) === "admin") {
    const { error } = await ctx.supabaseAdmin.from("academy_state")
      .update({ state: cleanState(body.state), updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) throw error;
    return { ok: true };
  }

  // Teachers may save live-class state and attendance for their assigned students only.
  const full = await getAcademyState(ctx);
  const incoming = cleanState(body.state);
  if (Array.isArray(incoming.classes)) full.classes = incoming.classes;

  const teacher = lower(profile.username);
  const assignedIds = new Set(
    full.students
      .filter((student: any) => lower(student?.teacher) === teacher)
      .map((student: any) => lower(student?.id))
  );

  if (incoming.att && typeof incoming.att === "object") {
    for (const [date, value] of Object.entries(incoming.att)) {
      if (!value || typeof value !== "object") continue;
      const day = (full.att[date] && typeof full.att[date] === "object")
        ? { ...full.att[date] }
        : {};
      for (const [sid, record] of Object.entries(value as Record<string, any>)) {
        if (assignedIds.has(lower(sid))) day[sid] = record;
      }
      full.att[date] = day;
    }
  }

  const { error } = await ctx.supabaseAdmin.from("academy_state")
    .update({ state: cleanState(full), updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) throw error;
  return { ok: true };
}

export default {
  fetch: withSupabase(
    { auth: ["user", "publishable"] },
    async (req, ctx) => {
      if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
      }

      if (req.method !== "POST") {
        return errorResponse("Method not allowed.", 405);
      }

      try {
        const body = await req.json().catch(() => ({}));
        const action = lower(body.action);

        if (!action) {
          return errorResponse("Missing action.", 400);
        }

        // Login is intentionally available through the publishable-key path.
        // Supabase Auth performs the password verification and returns a normal
        // user session; the service-role client is never exposed to the browser.
        if (action === "login") {
          return json(await login(ctx, body));
        }

        if (action === "get_state") {
          return json(await getState(ctx));
        }

        if (action === "save_state") {
          return json(await saveState(ctx, body));
        }

        if (action === "send_message") {
          return json(await sendMessage(ctx, body));
        }

        if (action === "send_payment_reminders") {
          return json(await sendPaymentReminders(ctx));
        }

        if (action === "mark_notification_read") {
          return json(await markNotificationRead(ctx, body));
        }

        if (action === "upsert_student") {
          return json(await upsertStudent(ctx, body));
        }

        if (action === "upsert_teacher") {
          return json(await upsertTeacher(ctx, body));
        }

        if (action === "delete_teacher") {
          return json(await deleteTeacher(ctx, body));
        }

        if (action === "delete_student") {
          return json(await deleteStudent(ctx, body));
        }

        return errorResponse(`Unknown action: ${action}`, 404);
      } catch (error: any) {
        console.error("academy-api error:", error);
        return errorResponse(
          text(error?.message) || "Server error.",
          Number.isInteger(error?.status) ? error.status : 500,
        );
      }
    },
  ),
};
