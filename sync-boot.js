const base='https://prhbjeplmftxxzjjtkkb.supabase.co';
const publicKey='sb_publishable_O7o7Mv2Qejck-7FcGkwUUA_VjKzuxYq';
const api=base+'/functions/v1/classroom-sync';
const app=document.getElementById('pilot'),notice=document.getElementById('sync-status');
const stateKey='mial-connected-session-v1';
let credentials={},periodId=new URLSearchParams(location.search).get('period')||'period-1';
const fragment=new URLSearchParams(location.hash.slice(1));
if(fragment.has('student_access'))credentials={studentAccess:fragment.get('student_access')};
else if(fragment.has('access_token'))credentials={accessToken:fragment.get('access_token'),refreshToken:fragment.get('refresh_token'),expiresAt:Date.now()+Number(fragment.get('expires_in')||3600)*1000};
else {try{credentials=JSON.parse(sessionStorage.getItem(stateKey)||'{}');}catch{}}
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
function keep(){sessionStorage.setItem(stateKey,JSON.stringify(credentials));}
keep();
async function authCall(path,body){const r=await fetch(base+'/auth/v1/'+path,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Sign-in could not complete. Try again later.');return r.json();}
async function refresh(){if(credentials.accessToken&&credentials.expiresAt<Date.now()+60000){const x=await authCall('token?grant_type=refresh_token',{refresh_token:credentials.refreshToken});credentials={accessToken:x.access_token,refreshToken:x.refresh_token,expiresAt:Date.now()+x.expires_in*1000};keep();}}
async function request(path,body,explicitPeriod){
 const nextPeriod=explicitPeriod??(path==='login'?body.periodId:periodId);
 await refresh();
 const headers={'Content-Type':'application/json',apikey:publicKey};
 if(credentials.studentAccess)headers['x-classroom-access']=credentials.studentAccess;
 else if(credentials.accessToken)headers.Authorization='Bearer '+credentials.accessToken;
 let r;try{r=await fetch(api,{method:'POST',headers,body:JSON.stringify({path,body,periodId:nextPeriod})});}catch{throw new Error('Connection interrupted. No save is confirmed. Keep this page open and check your connection.');}
 const x=await r.json();if(!r.ok){const e=new Error(x.error||'Cloud request failed.');e.status=r.status;throw e;}
 if(path==='login')periodId=nextPeriod;
 if(['progress','submit','circle','review','participation'].includes(path)&&body)notice.textContent='Saved online at '+new Date().toLocaleTimeString()+'.';
 return x;
}
function signIn(){app.replaceChildren();const section=document.createElement('section');section.className='hero';const h=document.createElement('h1');h.textContent='Your connected classroom';const p=document.createElement('p');p.textContent='Students: open the personal classroom link provided by your teacher. Teachers: get a sign-in link by email. No password needed.';const email=document.createElement('input');email.type='email';email.autocomplete='email';email.placeholder='Teacher email address';email.className='control';email.setAttribute('aria-label','Teacher email address');const b=document.createElement('button');b.className='btn primary';b.textContent='Email my teacher sign-in link';b.onclick=async()=>{if(!email.value.trim()||!email.reportValidity())return;b.disabled=true;try{await authCall('otp?redirect_to='+encodeURIComponent(location.origin+location.pathname),{email:email.value.trim(),create_user:false});notice.textContent='Sign-in email requested. Open the newest link in this browser. Delivery is not yet confirmed.';}catch(e){notice.textContent=e.message;b.disabled=false;}};section.append(h,p,email,b);app.append(section);}
async function start(){
 if(!credentials.studentAccess&&!credentials.accessToken)return signIn();
 const session=await request('session');
 window.ClassroomDemo={request,config:session.config};
 notice.textContent='Connected. Saved work and submissions sync between devices. Use your personal link on each student device.';
 const exit=document.getElementById('sync-exit');exit.hidden=false;exit.onclick=()=>{sessionStorage.removeItem(stateKey);location.assign(location.pathname);};
 if(session.account.role==='teacher'){
  const panel=document.getElementById('student-links');panel.hidden=false;
  const picker=document.createElement('select');picker.className='control';
  for(const s of session.config.students){const o=document.createElement('option');o.value=s.id;o.textContent=session.config.periods.find(p=>p.id===s.periodId).label+' · '+s.label;picker.append(o);}
  const btn=document.createElement('button');btn.className='btn';btn.textContent='Create personal student link';
  const result=document.createElement('input');result.className='control';result.readOnly=true;result.setAttribute('aria-label','Personal student link');
  btn.onclick=async()=>{btn.disabled=true;revoke.disabled=true;result.value='';try{const student=session.config.students.find(s=>s.id===picker.value);const x=await request('student-link',{accountId:student.id},student.periodId);result.value=location.origin+location.pathname+'?period='+encodeURIComponent(student.periodId)+'#student_access='+x.token;notice.textContent='Personal link created. Share only with this student. It opens only their work.';}catch(e){notice.textContent=e.message;}finally{btn.disabled=false;revoke.disabled=false;}};
  const revoke=document.createElement('button');revoke.className='btn';revoke.textContent='Revoke this student’s access links';
  revoke.onclick=async()=>{const student=session.config.students.find(s=>s.id===picker.value);if(!confirm('Stop all existing access links for '+student.label+'? Saved work will remain. Create a new link afterward if needed.'))return;revoke.disabled=true;btn.disabled=true;try{await request('revoke-student-links',{accountId:student.id},student.periodId);result.value='';notice.textContent='Old access links revoked. Saved work was preserved.';}catch(e){notice.textContent=e.message;}finally{revoke.disabled=false;btn.disabled=false;}};
  const exportButton=document.createElement('button');exportButton.className='btn';exportButton.textContent='Export this class (CSV)';
  exportButton.onclick=async()=>{exportButton.disabled=true;try{const x=await request('export');const object=URL.createObjectURL(new Blob([x.csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=object;a.download='classroom-'+periodId+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(object),1000);}catch(e){notice.textContent=e.message;}finally{exportButton.disabled=false;}};
  panel.append(picker,btn,result,revoke,exportButton);
 }
 await import('./sync-pilot.js');
}
start().catch(e=>{notice.textContent=e.message;signIn();});
