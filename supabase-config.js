// Al-Ahruf Academy — Supabase client configuration
// Browser-safe Publishable Key only.
// Never put a Supabase Secret/Service key in this file.

window.AHRUF_SUPABASE = {
  url: "https://bxwrdutoauonbfdbrhsu.supabase.co",
  key: "sb_publishable_wNR2PB3BxbDsRFFp_oaEUA_-K2aP9SP"
};


/* Al-Ahruf Students Management Upgrade
   Keeps the existing academy UI/authentication intact and enhances the
   Students screen after the main application has loaded. */
(function(){
  let installed=false;
  function install(){
    if(installed || typeof window.render!=="function" || typeof window.modal!=="function" ||
       typeof window.onlineApi!=="function" || typeof S==="undefined") return false;
    installed=true;

    const oldRender=window.render;
    window.render=function(){
      oldRender();
      setTimeout(enhanceStudents,0);
    };

    window.studentDetails=function(id){
      const s=(S.students||[]).find(x=>x.id===id);
      if(!s) return;
      const total=(S.students||[]).length;
      const attendance=Object.values(S.att||{}).map(day=>day&&day[id]).filter(Boolean);
      const present=attendance.filter(x=>x.a==="present").length;
      const late=attendance.filter(x=>x.a==="late").length;
      const absent=attendance.filter(x=>x.a==="absent").length;
      const payments=(S.pay||[]).filter(p=>p.sid===id);
      const paid=payments.filter(p=>p.st==="paid").reduce((a,p)=>a+(+p.amt||0),0);
      const due=payments.filter(p=>p.st!=="paid").reduce((a,p)=>a+(+p.amt||0),0);
      const progress=Math.round((s.sur||[]).length/114*1000)/10;
      const rank=[...(S.students||[])].sort((a,b)=>(b.sur||[]).length-(a.sur||[]).length).findIndex(x=>x.id===id)+1;
      const teacher=s.teacher||"Not assigned";
      modal("Student profile",\`
        <div class="student-profile-head">
          <div><h3>\${esc(s.name)}</h3><span class="mute">\${esc(s.id)} · \${esc(s.level||"Beginner")}</span></div>
          <span class="badge \${esc(s.pay||"pending")}">\${esc(s.pay||"pending")}</span>
        </div>
        <div class="stats student-mini-stats">
          <div class="card"><b>\${(s.sur||[]).length}/114</b><span>Surahs</span></div>
          <div class="card"><b>\${progress}%</b><span>Qur'an progress</span></div>
          <div class="card"><b>#\${rank||"-"}</b><span>Ranking</span></div>
          <div class="card"><b>\${present+late+absent}</b><span>Attendance records</span></div>
        </div>
        <div class="grid2">
          <div class="card"><h3>Contact</h3><p><b>Phone:</b> \${esc(s.phone||"—")}</p><p><b>Email:</b> \${esc(s.email||"—")}</p><p><b>Teacher:</b> \${esc(teacher)}</p></div>
          <div class="card"><h3>Attendance</h3><p class="present">Present: \${present}</p><p class="late">Late: \${late}</p><p class="absent">Absent: \${absent}</p></div>
        </div>
        <div class="card" style="margin-top:12px"><h3>Payments</h3><p>Paid: <b>$\${paid}</b> · Outstanding: <b>$\${due}</b></p></div>
        <div class="card" style="margin-top:12px"><h3>Memorized surahs</h3><p class="mute">\${(s.sur||[]).length} of 114 completed</p>
          <div>\${(s.sur||[]).map((x,i)=>\`<span class="tag">\${esc(x)}</span>\`).join("")||'<span class="mute">No surahs recorded yet.</span>'}</div>
        </div>
      \`,()=>{}, "Close");
    };

    window.editS=function(id){
      const s=(S.students||[]).find(x=>x.id===id)||{
        id:"ST"+String((S.students||[]).length+1).padStart(3,"0"),
        name:"",phone:"",email:"",pw:"",level:"Beginner",pay:"pending",sur:[],teacher:""
      };
      const opt=(a,v)=>a.map(x=>\`<option \${x===v?"selected":""}>\${esc(x)}</option>\`).join("");
      const teachers=[...new Set((S.students||[]).map(x=>x.teacher).filter(Boolean))];
      modal(id?"Edit student":"Add student",\`
        <div class="student-modal-grid">
          <div><label>Full name</label><input name="name" required value="\${esc(s.name)}"></div>
          <div><label>Student ID</label><input name="id" required value="\${esc(s.id)}"></div>
          <div><label>Password \${id?'<span class="mute">(leave blank to keep current)</span>':""}</label><input name="pw" \${id?"":"required"} type="password" value=""></div>
          <div><label>Phone</label><input name="phone" value="\${esc(s.phone||"")}"></div>
          <div><label>Email</label><input name="email" type="email" value="\${esc(s.email||"")}"></div>
          <div><label>Teacher</label><input name="teacher" list="teacher-list" value="\${esc(s.teacher||"")}" placeholder="e.g. Ustadh Ibrahim">
            <datalist id="teacher-list">\${teachers.map(t=>\`<option value="\${esc(t)}">\`).join("")}</datalist>
          </div>
          <div><label>Level</label><select name="level">\${opt(["Beginner","Intermediate","Advanced"],s.level||"Beginner")}</select></div>
          <div><label>Payment</label><select name="pay">\${opt(["paid","pending","overdue"],s.pay||"pending")}</select></div>
        </div>
        <label>Memorized surahs — select one or more</label>
        <select name="sur" multiple size="8">\${SUR.map((x,i)=>\`<option value="\${esc(x)}" \${(s.sur||[]).includes(x)?"selected":""}>\${i+1}. \${esc(x)}</option>\`).join("")}</select>
        <p class="mute" style="margin-top:7px">Hold Ctrl/Cmd to select multiple surahs. Progress is calculated automatically from 114 surahs.</p>
      \`,async f=>{
        const nid=f.id.value.trim();
        if((S.students||[]).some(x=>x.id===nid&&x.id!==id)){toast("That ID is already used");return false}
        const d={
          id:nid,name:f.name.value.trim(),pw:f.pw.value,phone:f.phone.value.trim(),
          email:f.email.value.trim(),teacher:f.teacher.value.trim(),level:f.level.value,
          pay:f.pay.value,sur:[...f.sur.selectedOptions].map(o=>o.value)
        };
        if(ONLINE){
          const result=await onlineApi("upsert_student",{student:d,existingId:id||null});
          if(result.state)S=result.state;
        }else{
          const i=S.students.findIndex(x=>x.id===id);
          if(i<0)S.students.push(d); else S.students[i]={...S.students[i],...d};
          save();
        }
        toast(ONLINE?"Student account created/updated online":"Student saved");
        render();
      });
    };

    window.rows=function(){
      const q=(document.querySelector("#q")?.value||"").toLowerCase().trim();
      const level=(document.querySelector("#student-level-filter")?.value||"").toLowerCase();
      const pay=(document.querySelector("#student-pay-filter")?.value||"").toLowerCase();
      const teacher=(document.querySelector("#student-teacher-filter")?.value||"").toLowerCase();
      const tb=document.querySelector("#tb"); if(!tb)return;
      const list=(S.students||[]).filter(s=>{
        const hay=[s.name,s.id,s.phone,s.email,s.teacher].join(" ").toLowerCase();
        return (!q||hay.includes(q))&&(!level||String(s.level||"").toLowerCase()===level)&&
          (!pay||String(s.pay||"").toLowerCase()===pay)&&(!teacher||String(s.teacher||"").toLowerCase()===teacher);
      });
      tb.innerHTML=list.map(s=>{
        const p=Math.round((s.sur||[]).length/114*1000)/10;
        return \`<tr>
          <td><b>\${esc(s.id)}</b></td>
          <td><b>\${esc(s.name)}</b><br><span class="mute">\${esc(s.phone||"")}</span></td>
          <td>\${esc(s.level||"Beginner")}</td>
          <td><div class="bar2"><i style="width:\${p}%"></i></div><span class="mute">\${(s.sur||[]).length}/114 · \${p}%</span></td>
          <td><span class="badge \${esc(s.pay||"pending")}">\${esc(s.pay||"pending")}</span></td>
          <td><span class="mute">\${esc(s.teacher||"Unassigned")}</span></td>
          <td class="row">
            <button class="btn ghost sm" onclick="studentDetails('\${esc(s.id)}')">View</button>
            <button class="btn ghost sm" onclick="editS('\${esc(s.id)}')">Edit</button>
            \${user.role==="admin"?\`<button class="btn ghost sm" onclick="delS('\${esc(s.id)}',this)">Delete</button>\`:""}
          </td>
        </tr>\`;
      }).join("")||'<tr><td colspan="7" class="mute">No students match your filters.</td></tr>';
      const count=document.querySelector("#student-result-count");
      if(count)count.textContent=list.length+" shown";
    };

    window.enhanceStudents=enhanceStudents;
    enhanceStudents();
    return true;
  }

  function enhanceStudents(){
    if(typeof tab==="undefined" || tab!=="students")return;
    const app=document.querySelector("#app"); if(!app)return;
    const table=document.querySelector("#tb"); if(!table)return;
    const oldToolbar=app.querySelector("#student-tools");
    if(!oldToolbar){
      const card=table.closest(".card");
      const originalInput=document.querySelector("#q");
      if(originalInput){
        originalInput.id="q";
        originalInput.placeholder="Search name, ID, phone, email...";
        originalInput.style.maxWidth="360px";
        originalInput.oninput=()=>window.rows();
      }
      const toolbar=originalInput?.closest(".row");
      if(toolbar){
        toolbar.id="student-tools";
        toolbar.style.alignItems="stretch";
        toolbar.insertAdjacentHTML("afterend",\`
          <div id="student-filter-row" class="row" style="margin-bottom:12px">
            <select id="student-level-filter" style="max-width:180px"><option value="">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
            <select id="student-pay-filter" style="max-width:180px"><option value="">All payments</option><option>paid</option><option>pending</option><option>overdue</option></select>
            <select id="student-teacher-filter" style="max-width:220px"><option value="">All teachers</option></select>
            <span id="student-result-count" class="mute" style="align-self:center"></span>
          </div>
          <div id="student-stats" class="stats" style="margin-bottom:14px"></div>
        \`);
        ["student-level-filter","student-pay-filter","student-teacher-filter"].forEach(id=>{
          document.querySelector("#"+id)?.addEventListener("change",()=>window.rows());
        });
      }
      if(card){
        const head=card.querySelector("thead tr");
        if(head && head.children.length===6){
          head.children[4].insertAdjacentHTML("afterend","<th>Teacher</th>");
        }
      }
    }
    const tf=document.querySelector("#student-teacher-filter");
    if(tf){
      const current=tf.value;
      const teachers=[...new Set((S.students||[]).map(s=>s.teacher).filter(Boolean))].sort();
      tf.innerHTML='<option value="">All teachers</option>'+teachers.map(t=>\`<option value="\${esc(t)}">\${esc(t)}</option>\`).join("");
      if(teachers.includes(current))tf.value=current;
    }
    const stats=document.querySelector("#student-stats");
    if(stats){
      const students=S.students||[];
      const active=students.filter(s=>s.is_active!==false).length;
      const assigned=students.filter(s=>s.teacher).length;
      const avg=students.length?(students.reduce((a,s)=>a+(s.sur||[]).length,0)/students.length/114*100):0;
      stats.innerHTML=\`
        <div class="card"><b>\${students.length}</b><span>Total students</span></div>
        <div class="card"><b>\${active}</b><span>Active</span></div>
        <div class="card"><b>\${assigned}</b><span>Teacher assigned</span></div>
        <div class="card"><b>\${avg.toFixed(1)}%</b><span>Average progress</span></div>\`;
    }
    window.rows();
  }

  const timer=setInterval(()=>{
    if(install())clearInterval(timer);
  },100);
  setTimeout(()=>clearInterval(timer),15000);
})();