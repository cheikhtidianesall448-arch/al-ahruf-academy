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

  // Never return stored passwords to the browser.
  s.students.forEach((student: any) => {
    if (student && typeof student === "object") delete student.pw;
  });

  return s;
}

function studentState(state: any, username: string) {
  const id = lower(username);
  const s = cleanState(state);

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
  s.students = s.students.filter((student: any) => lower(student?.teacher) === teacher);
  const assigned = new Set(s.students.map((student: any) => lower(student?.id)));
  s.pay = s.pay.filter((payment: any) => assigned.has(lower(payment?.sid)));
  const filteredAttendance: Record<string, any> = {};
  for (const [date, value] of Object.entries(s.att || {})) {
    if (!value || typeof value !== "object") continue;
    const day: Record<string, any> = {};
    for (const [sid, record] of Object.entries(value as Record<string, any>)) {
      if (assigned.has(lower(sid))) day[sid] = record;
    }
    if (Object.keys(day).length) filteredAttendance[date] = day;
  }
  s.att = filteredAttendance;
  return s;
}

async function getAcademyState(ctx: any) {
  const { data, error } = await ctx.supabaseAdmin
    .from("academy_state")
    .select("state")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  return data?.state || EMPTY_STATE;
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
    state,
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

async function upsertStudent(ctx: any, body: any) {
  const admin = await requireStaff(ctx, ["admin"]);
  void admin;

  const s = body.student || {};
  const studentId = text(s.id);
  const fullName = text(s.name);
  const password = text(s.pw);
  const emailInput = lower(s.email);
  const phone = text(s.phone);

  if (!studentId || !fullName) {
    throw new Error("Student ID and full name are required.");
  }

  const normalizedStudentId = studentId.toLowerCase();
  const safeStudentId = normalizedStudentId.replace(/[^a-z0-9]/g, "");
  const authEmail =
    emailInput || `${safeStudentId || crypto.randomUUID()}@student.alahruf.local`;

  // Find an existing Academy profile case-insensitively.
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

  // IMPORTANT: full_name is required by the current profiles schema.
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

  const state = await getAcademyState(ctx);
  const cleanStudent = {
    id: studentId,
    name: fullName,
    phone,
    email: emailInput,
    level: text(s.level) || "Beginner",
    pay: text(s.pay) || "pending",
    sur: Array.isArray(s.sur) ? s.sur : [],
    teacher: text(s.teacher),
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

  return { ok: true, state: cleanState(state) };
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
    state: visibleState,
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

  const full = await getAcademyState(ctx);
  const incoming = cleanState(body.state);
  const assignedIds = new Set(full.students
    .filter((s: any) => lower(s?.teacher) === lower(profile.username))
    .map((s: any) => lower(s?.id)));

  full.students = full.students.map((existing: any) => {
    const id = lower(existing?.id);
    if (!assignedIds.has(id)) return existing;
    return incoming.students.find((s: any) => lower(s?.id) === id) || existing;
  });

  full.pay = full.pay.filter((p: any) => !assignedIds.has(lower(p?.sid)));
  for (const p of incoming.pay || []) {
    if (assignedIds.has(lower(p?.sid))) full.pay.push(p);
  }

  for (const date of Object.keys(incoming.att || {})) {
    if (!full.att[date]) full.att[date] = {};
    for (const [sid, record] of Object.entries(incoming.att[date] || {})) {
      if (assignedIds.has(lower(sid))) full.att[date][sid] = record;
    }
  }

  if (Array.isArray(incoming.classes)) full.classes = incoming.classes;

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
