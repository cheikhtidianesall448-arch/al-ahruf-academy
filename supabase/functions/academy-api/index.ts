import { withSupabase } from "npm:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanState(state: any) {
  const s = JSON.parse(JSON.stringify(state || {students:[],pay:[],att:{},classes:[]}));
  (s.students || []).forEach((x: any) => delete x.pw);
  return s;
}

async function roleOf(ctx: any) {
  const uid = ctx.userClaims?.sub;
  if (!uid) return null;
  const { data } = await ctx.supabaseAdmin.from("profiles").select("id,username,name,role,email,phone").eq("id", uid).maybeSingle();
  return data || null;
}

export default {
  fetch: withSupabase({ auth: ["user", "publishable"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
      const body = await req.json();
      const action = body.action;

      // Login is intentionally allowed with the publishable key; credentials are
      // exchanged for a normal Supabase Auth session. No secret key is sent to the browser.
      if (action === "login") {
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        const wantedRole = String(body.role || "");

        const { data: profile, error: pe } = await ctx.supabaseAdmin
          .from("profiles")
          .select("id,username,name,role,email,phone")
          .or("username.ilike." + username + ",email.ilike." + username)
          .maybeSingle();

        if (pe || !profile || profile.role !== wantedRole || !profile.email) {
          return json({ error: "Invalid login" }, 401);
        }

        const { data: authData, error: ae } = await ctx.supabaseAdmin.auth.signInWithPassword({
          email: profile.email,
          password,
        });
        if (ae || !authData.session) return json({ error: "Invalid login" }, 401);

        const { data: stateRow } = await ctx.supabaseAdmin.from("academy_state").select("state").eq("id",1).single();
        let state = stateRow?.state || {students:[],pay:[],att:{},classes:[]};

        if (profile.role === "student") {
          state = {
            ...state,
            students: (state.students || []).filter((s:any) => s.id === profile.username),
            pay: (state.pay || []).filter((p:any) => p.sid === profile.username),
            att: Object.fromEntries(Object.entries(state.att || {}).map(([d,v]:any) => [d, v?.[profile.username] ? {[profile.username]:v[profile.username]} : {}])),
          };
        }

        return json({
          session: authData.session,
          user: { id: profile.id, role: profile.role, name: profile.name, username: profile.username },
          state: cleanState(state),
        });
      }

      // Everything below requires a signed-in user.
      const profile = await roleOf(ctx);
      if (!profile) return json({ error: "Not authenticated" }, 401);

      const { data: stateRow, error: stateError } = await ctx.supabaseAdmin
        .from("academy_state").select("state").eq("id",1).single();
      if (stateError) throw stateError;
      let state = cleanState(stateRow?.state);

      if (action === "get_state") {
        if (profile.role === "student") {
          state = {
            ...state,
            students: (state.students || []).filter((s:any) => s.id === profile.username),
            pay: (state.pay || []).filter((p:any) => p.sid === profile.username),
            att: Object.fromEntries(Object.entries(state.att || {}).map(([d,v]:any) => [d, v?.[profile.username] ? {[profile.username]:v[profile.username]} : {}])),
          };
        }
        return json({ user:{id:profile.id,role:profile.role,name:profile.name,username:profile.username}, state });
      }

      if (action === "save_state") {
        if (!["admin","teacher"].includes(profile.role)) return json({error:"Permission denied"},403);
        await ctx.supabaseAdmin.from("academy_state").update({state:cleanState(body.state),updated_at:new Date().toISOString()}).eq("id",1);
        return json({ok:true});
      }

      if (action === "upsert_student") {
        if (profile.role !== "admin") return json({error:"Only an administrator can create or edit student accounts"},403);
        const s = body.student || {};
        if (!s.id || !s.name) return json({error:"Student ID and name are required"},400);

        const email = (s.email || (s.id.toLowerCase().replace(/[^a-z0-9]/g,"") + "@students.alahruf.local")).toLowerCase();
        const existing = await ctx.supabaseAdmin.from("profiles").select("id,email").eq("username",s.id).maybeSingle();
        let uid = existing.data?.id;

        if (!uid) {
          if (!s.pw) return json({error:"A password is required for a new student"},400);
          const {data: created,error} = await ctx.supabaseAdmin.auth.admin.createUser({
            email,password:s.pw,email_confirm:true,user_metadata:{name:s.name,role:"student"}
          });
          if(error) throw error;
          uid=created.user.id;
          const {error: pe} = await ctx.supabaseAdmin.from("profiles").insert({
            id:uid,username:s.id,name:s.name,role:"student",email,phone:s.phone||""
          });
          if(pe) throw pe;
        } else {
          const attrs:any={email,user_metadata:{name:s.name,role:"student"}};
          if(s.pw) attrs.password=s.pw;
          const {error:ue}=await ctx.supabaseAdmin.auth.admin.updateUserById(uid,attrs);
          if(ue) throw ue;
          const {error:pe}=await ctx.supabaseAdmin.from("profiles").update({name:s.name,email,phone:s.phone||""}).eq("id",uid);
          if(pe) throw pe;
        }

        const clean={id:s.id,name:s.name,phone:s.phone||"",email:s.email||"",level:s.level||"Beginner",pay:s.pay||"pending",sur:Array.isArray(s.sur)?s.sur:[]};
        const list=(state.students||[]).filter((x:any)=>x.id!==s.id);
        list.push(clean); state.students=list;
        await ctx.supabaseAdmin.from("academy_state").update({state,updated_at:new Date().toISOString()}).eq("id",1);
        return json({ok:true,state});
      }

      if (action === "delete_student") {
        if (profile.role !== "admin") return json({error:"Permission denied"},403);
        const id=String(body.studentId||"");
        const p=await ctx.supabaseAdmin.from("profiles").select("id").eq("username",id).maybeSingle();
        if(p.data?.id) await ctx.supabaseAdmin.auth.admin.deleteUser(p.data.id);
        state.students=(state.students||[]).filter((s:any)=>s.id!==id);
        state.pay=(state.pay||[]).filter((p:any)=>p.sid!==id);
        Object.keys(state.att||{}).forEach(d=>{if(state.att[d])delete state.att[d][id]});
        await ctx.supabaseAdmin.from("academy_state").update({state,updated_at:new Date().toISOString()}).eq("id",1);
        return json({ok:true,state});
      }

      return json({error:"Unknown action"},400);
    } catch (e) {
      console.error(e);
      return json({error:e?.message || "Server error"},500);
    }
  }),
};
