const base='https://prhbjeplmftxxzjjtkkb.supabase.co';
const publicKey='sb_publishable_O7o7Mv2Qejck-7FcGkwUUA_VjKzuxYq';
const api=base+'/functions/v1/classroom-sync';
const app=document.getElementById('pilot'),notice=document.getElementById('sync-status');
const stateKey='mial-connected-session-v1';
let credentials={},periodId=new URLSearchParams(location.search).get('period')||'period-1';
const fragment=new URLSearchParams(location.hash.slice(1));
if(fragment.has('student_access'))credentials={studentAccess:fragment.get('student_access')};
else if(fragment.has('access_token'))credentials={accessToken:fragment.get('access_token'),refreshToken:fragment.get('refresh_token'),expiresAt:Date.now()+Number(fragment.get('expires_in')||3600)*1000,recoveryPending:fragment.get('type')==='recovery'};
else {try{credentials=JSON.parse(sessionStorage.getItem(stateKey)||'{}');}catch{}}
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
function keep(){sessionStorage.setItem(stateKey,JSON.stringify(credentials));}
keep();
async function authCall(path,body){const r=await fetch(base+'/auth/v1/'+path,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Sign-in could not complete. Try again later.');return r.json();}
async function refresh(){if(credentials.accessToken&&credentials.expiresAt<Date.now()+60000){const x=await authCall('token?grant_type=refresh_token',{refresh_token:credentials.refreshToken});credentials={accessToken:x.access_token,refreshToken:x.refresh_token,expiresAt:Date.now()+x.expires_in*1000,recoveryPending:credentials.recoveryPending};keep();}}
async function request(path,body,explicitPeriod){
 const nextPeriod=explicitPeriod??(path==='login'?body.periodId:periodId);
 if(path!=='teacher-recovery')await refresh();
 const headers={'Content-Type':'application/json',apikey:publicKey};
 if(credentials.studentAccess)headers['x-classroom-access']=credentials.studentAccess;
 else if(credentials.pinToken)headers['x-teacher-session']=credentials.pinToken;
 else if(credentials.accessToken)headers.Authorization='Bearer '+credentials.accessToken;
 let r;try{r=await fetch(api,{method:'POST',headers,body:JSON.stringify({path,body,periodId:nextPeriod})});}catch{throw new Error('Connection interrupted. No save is confirmed. Keep this page open and check your connection.');}
 const x=await r.json();if(!r.ok){const e=new Error(x.error||'Cloud request failed.');e.status=r.status;throw e;}
 if(path==='login')periodId=nextPeriod;
 if(['progress','submit','circle','review','participation'].includes(path)&&body)notice.textContent='Saved online at '+new Date().toLocaleTimeString()+'.';
 return x;
}
function signIn(){
 app.replaceChildren();notice.textContent='Enter your teacher PIN, or open your personal student link.';
 const section=document.createElement('section');section.className='hero';
 const h=document.createElement('h1');h.textContent='Teacher PIN';
 const form=document.createElement('form'),input=document.createElement('input');
 input.type='password';input.inputMode='numeric';input.pattern='[0-9]{4}';input.maxLength=4;input.autocomplete='off';input.required=true;input.setAttribute('aria-label','Four-digit teacher PIN');
 const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(3,4rem);gap:.5rem';
 for(const digit of ['1','2','3','4','5','6','7','8','9','Clear','0','Delete']){const key=document.createElement('button');key.type='button';key.className='btn';key.textContent=digit;key.onclick=()=>{if(digit==='Clear')input.value='';else if(digit==='Delete')input.value=input.value.slice(0,-1);else if(input.value.length<4)input.value+=digit;};grid.append(key);}
 const button=document.createElement('button');button.type='submit';button.className='btn primary';button.textContent='Open teacher dashboard';
 form.onsubmit=async event=>{event.preventDefault();if(!/^\d{4}$/.test(input.value))return;button.disabled=true;try{const response=await fetch(api,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({path:'teacher-pin-login',periodId,body:{pin:input.value}})});input.value='';const x=await response.json();if(!response.ok)throw new Error(x.error||'Teacher sign-in failed.');credentials={pinToken:x.token,expiresAt:Date.parse(x.expiresAt)};keep();await start();}catch(e){input.value='';notice.textContent=e.message;button.disabled=false;}};
 form.append(input,grid,button);section.append(h,form);app.append(section);
}
function passwordSetup(){
 app.replaceChildren();notice.textContent='Choose your classroom password once. Future sign-ins will not need email.';
 const section=document.createElement('section');section.className='hero';const h=document.createElement('h1');h.textContent='Choose your teacher password';
 const p=document.createElement('p');p.textContent='Use a private password of 12–72 characters, not your email address or Gmail password. This changes only the classroom account password; other classroom sessions may be signed out.';
 const form=document.createElement('form');const one=document.createElement('input'),two=document.createElement('input');
 for(const [input,label] of [[one,'New teacher password'],[two,'Repeat teacher password']]){input.type='password';input.autocomplete='new-password';input.required=true;input.minLength=12;input.maxLength=72;input.placeholder=label;input.className='control';input.setAttribute('aria-label',label);}
 const button=document.createElement('button');button.className='btn primary';button.type='submit';button.textContent='Save password and open dashboard';
 form.onsubmit=async event=>{event.preventDefault();if(one.value!==two.value){notice.textContent='The passwords do not match. Re-enter both.';return;}if(one.value.length<12||one.value.length>72||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(one.value)){notice.textContent='Use 12–72 characters and do not use an email address.';return;}button.disabled=true;let attempted=false,passwordSaved=false;try{
  await request('session');attempted=true;
  const response=await fetch(base+'/auth/v1/user',{method:'PUT',headers:{apikey:publicKey,Authorization:'Bearer '+credentials.accessToken,'Content-Type':'application/json'},body:JSON.stringify({password:one.value})});
  if(!response.ok)throw new Error('Password was not accepted. Choose a different private password, or request a fresh recovery link if this one expired.');
  passwordSaved=true;one.value='';two.value='';credentials.recoveryPending=false;keep();notice.textContent='Password saved.';await start();
 }catch(e){one.value='';two.value='';const uncertain=attempted&&e instanceof TypeError;notice.textContent=passwordSaved?'Password saved, but the dashboard could not load. Use Back to teacher sign-in and enter your new password.':uncertain?'Connection interrupted; the password update may have completed. Use Back to teacher sign-in and try your new password before requesting another reset.':e.message;button.disabled=passwordSaved||uncertain;}};
 const back=document.createElement('button');back.type='button';back.className='btn';back.textContent='Back to teacher sign-in';back.onclick=()=>{one.value='';two.value='';credentials={};keep();signIn();};
 form.append(one,two,button);section.append(h,p,form,back);app.append(section);
}
async function start(){
 if(!credentials.studentAccess&&!credentials.accessToken&&!credentials.pinToken)return signIn();
 const session=await request('session');
 if(credentials.recoveryPending)return passwordSetup();
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
