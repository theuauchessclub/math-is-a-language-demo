const base='https://prhbjeplmftxxzjjtkkb.supabase.co';
const publicKey='sb_publishable_O7o7Mv2Qejck-7FcGkwUUA_VjKzuxYq';
const api=base+'/functions/v1/classroom-sync';
const app=document.getElementById('pilot'),notice=document.getElementById('sync-status');
const stateKey='mial-connected-session-v1';
const teacherMode=new URLSearchParams(location.search).get('teacher')==='1';
let lessonId=new URLSearchParams(location.search).get('lesson')||'lesson-3';
let credentials={},periodId=new URLSearchParams(location.search).get('period')||'period-1';
const fragment=new URLSearchParams(location.hash.slice(1));
if(fragment.has('student_access'))credentials={studentAccess:fragment.get('student_access')};
else if(fragment.has('access_token'))credentials={accessToken:fragment.get('access_token'),refreshToken:fragment.get('refresh_token'),expiresAt:Date.now()+Number(fragment.get('expires_in')||3600)*1000,recoveryPending:fragment.get('type')==='recovery'};
else {try{credentials=JSON.parse(sessionStorage.getItem(stateKey)||'{}');}catch{}}
if(credentials.studentSession&&credentials.periodId)periodId=credentials.periodId;
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
function keep(){sessionStorage.setItem(stateKey,JSON.stringify(credentials));}
keep();
async function authCall(path,body){const r=await fetch(base+'/auth/v1/'+path,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Sign-in could not complete. Try again later.');return r.json();}
async function refresh(){if(credentials.accessToken&&credentials.expiresAt<Date.now()+60000){const x=await authCall('token?grant_type=refresh_token',{refresh_token:credentials.refreshToken});credentials={accessToken:x.access_token,refreshToken:x.refresh_token,expiresAt:Date.now()+x.expires_in*1000,recoveryPending:credentials.recoveryPending};keep();}}
async function request(path,body,explicitPeriod){
 const nextPeriod=explicitPeriod??(path==='login'?body.periodId:periodId);
 if(path!=='teacher-recovery')await refresh();
 const headers={'Content-Type':'application/json',apikey:publicKey};
 if(credentials.studentSession)headers['x-student-session']=credentials.studentSession;
 else if(credentials.studentAccess)headers['x-classroom-access']=credentials.studentAccess;
 else if(credentials.pinToken)headers['x-teacher-session']=credentials.pinToken;
 else if(credentials.accessToken)headers.Authorization='Bearer '+credentials.accessToken;
 let r;try{r=await fetch(api,{method:'POST',headers,body:JSON.stringify({path,body,periodId:nextPeriod,lessonId})});}catch{throw new Error('Connection interrupted. No save is confirmed. Keep this page open and check your connection.');}
 const x=await r.json();if(!r.ok){const e=new Error(x.error||'Cloud request failed.');e.status=r.status;throw e;}
 if(path==='login')periodId=nextPeriod;
 if(['progress','submit','circle','review','participation'].includes(path)&&body)notice.textContent='Saved online at '+new Date().toLocaleTimeString()+'.';
 return x;
}
async function publicRequest(path,body,pid=periodId){
 let response;try{response=await fetch(api,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({path,periodId:pid,body,lessonId})});}catch{throw new Error('Connection interrupted. Please check your connection.');}
 const x=await response.json();if(!response.ok)throw new Error(x.error||'Sign-in did not complete.');return x;
}
function signIn(message=''){
 if(teacherMode)return teacherSignIn(message);
 app.replaceChildren();notice.textContent=message||'Choose your period, name and student PIN. Your saved work follows you between devices.';
 const section=document.createElement('section');section.className='hero';const h=document.createElement('h1');h.textContent='Student entrance';
 const form=document.createElement('form'),period=document.createElement('select'),student=document.createElement('select'),pin=document.createElement('input');
 period.className=student.className=pin.className='control';period.setAttribute('aria-label','Class period');student.setAttribute('aria-label','Student name');period.required=student.required=true;
 pin.type='password';pin.inputMode='numeric';pin.autocomplete='off';pin.pattern='[0-9]{4}';pin.minLength=4;pin.maxLength=4;pin.required=true;pin.placeholder='Student PIN';pin.setAttribute('aria-label','Student PIN');
 const button=document.createElement('button');button.type='submit';button.className='btn primary';button.textContent='Open my classroom';button.disabled=true;
 const hint=document.createElement('p');hint.textContent='Use the PIN your teacher assigned. Five incorrect attempts lock your PIN until your teacher resets it.';
 form.noValidate=true;form.append(period,student,pin,button);section.append(h,hint,form);app.append(section);
 publicRequest('student-directory').then(directory=>{
  if(!section.isConnected)return;
  for(const row of directory.periods){const option=document.createElement('option');option.value=row.id;option.textContent=row.label;period.append(option);}
  if(directory.periods.some(row=>row.id===periodId))period.value=periodId;
  const fill=()=>{student.replaceChildren();pin.value='';for(const row of directory.students.filter(row=>row.periodId===period.value)){const option=document.createElement('option');option.value=row.id;option.textContent=row.label;student.append(option);}button.disabled=!student.options.length;};
  period.onchange=fill;student.onchange=()=>{pin.value='';};fill();
 }).catch(e=>{if(section.isConnected)notice.textContent=e.message;});
 form.onsubmit=async event=>{event.preventDefault();if(!/^\d{4}$/.test(pin.value)){notice.textContent='Enter your four-digit student PIN.';pin.focus();return;}if(!student.value||!period.value){notice.textContent='Choose your period and name before opening the classroom.';return;}const pid=period.value,accountId=student.value;button.disabled=period.disabled=student.disabled=true;button.textContent='Opening…';notice.textContent='Checking your PIN and opening your classroom…';try{
  const x=await publicRequest('student-pin-login',{accountId,pin:pin.value},pid);pin.value='';periodId=pid;credentials={studentSession:x.token,expiresAt:Date.parse(x.expiresAt),periodId:pid};keep();await start();
 }catch(e){pin.value='';notice.textContent=e.message;button.disabled=period.disabled=student.disabled=false;button.textContent='Open my classroom';}};
}
function teacherSignIn(message=''){
 app.replaceChildren();notice.textContent=message||'Enter your teacher PIN.';
 const section=document.createElement('section');section.className='hero';
 const h=document.createElement('h1');h.textContent='Teacher PIN';
 const form=document.createElement('form'),input=document.createElement('input');
 input.type='password';input.inputMode='numeric';input.pattern='[0-9]{4}';input.maxLength=4;input.autocomplete='off';input.required=true;input.setAttribute('aria-label','Four-digit teacher PIN');
 const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(3,4rem);gap:.5rem';
 for(const digit of ['1','2','3','4','5','6','7','8','9','Clear','0','Delete']){const key=document.createElement('button');key.type='button';key.className='btn';key.textContent=digit;key.onclick=()=>{if(digit==='Clear')input.value='';else if(digit==='Delete')input.value=input.value.slice(0,-1);else if(input.value.length<4)input.value+=digit;};grid.append(key);}
 const button=document.createElement('button');button.type='submit';button.className='btn primary';button.textContent='Open teacher dashboard';
 form.onsubmit=async event=>{event.preventDefault();if(!/^\d{4}$/.test(input.value))return;button.disabled=true;try{const response=await fetch(api,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json'},body:JSON.stringify({path:'teacher-pin-login',periodId,lessonId,body:{pin:input.value}})});input.value='';const x=await response.json();if(!response.ok)throw new Error(x.error||'Teacher sign-in failed.');credentials={pinToken:x.token,expiresAt:Date.parse(x.expiresAt)};keep();await start();}catch(e){input.value='';notice.textContent=e.message;button.disabled=false;}};
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
function mountLessonChooser(session){
 const holder=document.getElementById('lesson-selector');holder.replaceChildren();holder.hidden=true;
 const lessons=Array.isArray(session.lessons)?session.lessons:[];
 if(!lessons.length)return;
 const label=document.createElement('label');label.textContent='Choose lesson ';
 const select=document.createElement('select');select.className='control';select.setAttribute('aria-label','Choose lesson');
 for(const lesson of lessons){const option=document.createElement('option');option.value=lesson.id;option.textContent=({'lesson-3':'U4 L3','lesson-4':'U4 L4','lesson-5':'U4 L5'}[lesson.id]?({'lesson-3':'U4 L3','lesson-4':'U4 L4','lesson-5':'U4 L5'}[lesson.id]+' · '):'')+lesson.title;select.append(option);}
 select.value=lessonId;
 if(!lessons.some(lesson=>lesson.id===lessonId)){notice.textContent='This lesson is not available. Choose an available lesson.';select.value='';}
 select.onchange=()=>{const next=select.value;select.value=lessonId;if(next===lessonId||!lessons.some(lesson=>lesson.id===next))return;if(!confirm('Switch lessons? Save or submit unfinished answers, teacher scores, feedback, or Circle responses before continuing. Saved work will remain.'))return;const target=new URL(location.href);target.searchParams.set('period',periodId);target.searchParams.set('lesson',next);target.hash='';location.assign(target.href);};
 label.append(select);holder.append(label);holder.hidden=false;
}
async function start(){
 if(!credentials.studentAccess&&!credentials.accessToken&&!credentials.pinToken&&!credentials.studentSession)return signIn();
 const session=await request('session');
 if(credentials.recoveryPending)return passwordSetup();
 lessonId=session.lessonId||lessonId;
 mountLessonChooser(session);
 window.ClassroomDemo={request,config:session.config,lessonId};
 notice.textContent='Connected. Saved lesson work and submissions sync between devices. Students can use the same classroom link with their period, name and PIN.';
 const exit=document.getElementById('sync-exit');exit.hidden=false;exit.onclick=()=>{sessionStorage.removeItem(stateKey);location.assign(location.pathname+(teacherMode?'?teacher=1':''));};
 if(session.account.role==='teacher'){
  const panel=document.getElementById('student-links');panel.hidden=false;panel.replaceChildren();
  const picker=document.createElement('select');picker.className='control';picker.setAttribute('aria-label','Student for PIN or access-link management');
  for(const s of session.config.students){const o=document.createElement('option');o.value=s.id;o.textContent=session.config.periods.find(p=>p.id===s.periodId).label+' · '+s.label;picker.append(o);}
  const btn=document.createElement('button');btn.className='btn';btn.textContent='Create personal student link';
  const result=document.createElement('input');result.className='control';result.readOnly=true;result.setAttribute('aria-label','Personal student link');
  btn.onclick=async()=>{btn.disabled=true;revoke.disabled=true;result.value='';try{const student=session.config.students.find(s=>s.id===picker.value);const x=await request('student-link',{accountId:student.id},student.periodId);result.value=location.origin+location.pathname+'?period='+encodeURIComponent(student.periodId)+'#student_access='+x.token;notice.textContent='Personal link created. Share only with this student. It opens only their work.';}catch(e){notice.textContent=e.message;}finally{btn.disabled=false;revoke.disabled=false;}};
  const revoke=document.createElement('button');revoke.className='btn';revoke.textContent='Revoke this student’s access links';
  revoke.onclick=async()=>{const student=session.config.students.find(s=>s.id===picker.value);if(!confirm('Stop all existing access links for '+student.label+'? Saved work will remain. Create a new link afterward if needed.'))return;revoke.disabled=true;btn.disabled=true;try{await request('revoke-student-links',{accountId:student.id},student.periodId);result.value='';notice.textContent='Old access links revoked. Saved work was preserved.';}catch(e){notice.textContent=e.message;}finally{revoke.disabled=false;btn.disabled=false;}};
  const exportButton=document.createElement('button');exportButton.className='btn';exportButton.textContent='Export this class (CSV)';
  exportButton.onclick=async()=>{exportButton.disabled=true;try{const x=await request('export');const object=URL.createObjectURL(new Blob([x.csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=object;a.download='classroom-'+periodId+'-'+lessonId+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(object),1000);}catch(e){notice.textContent=e.message;}finally{exportButton.disabled=false;}};
  let pinSaveBusy=false;
  const pinHeading=document.createElement('h2');pinHeading.textContent='Assign or reset student PIN';
  const pinHelp=document.createElement('p');pinHelp.textContent='Select a student, then enter their PIN twice or generate one. Save privately and give it only to that student. Reassigning unlocks their PIN and ends old PIN sessions; work and existing personal links remain.';
  const pinForm=document.createElement('form'),one=document.createElement('input'),two=document.createElement('input');
  for(const [input,label] of [[one,'New student PIN'],[two,'Repeat student PIN']]){input.type='password';input.inputMode='numeric';input.autocomplete='off';input.pattern='[0-9]{4}';input.minLength=4;input.maxLength=4;input.required=true;input.className='control';input.placeholder=label;input.setAttribute('aria-label',label);}
  const generate=document.createElement('button');generate.type='button';generate.className='btn';generate.textContent='Generate four-digit PIN';
  generate.onclick=()=>{let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294960000);one.value=two.value=String(n%10000).padStart(4,'0');one.type=two.type='text';notice.textContent='Generated privately, not saved yet. Record it privately, then select Save or reset student PIN.';};
  const save=document.createElement('button');save.type='submit';save.className='btn primary';save.textContent='Save or reset student PIN';
  const hide=document.createElement('button');hide.type='button';hide.className='btn';hide.textContent='Show or hide PIN';hide.onclick=()=>{one.type=two.type=one.type==='password'?'text':'password';};
  picker.addEventListener('change',()=>{one.value=two.value='';one.type=two.type='password';result.value='';});
  pinForm.onsubmit=async event=>{event.preventDefault();if(pinSaveBusy)return;if(!/^\d{4}$/.test(one.value)||one.value!==two.value){notice.textContent='Enter the same 4 digits in both PIN fields.';return;}const student=session.config.students.find(s=>s.id===picker.value);pinSaveBusy=true;fileInput.disabled=bulkSave.disabled=bulk.disabled=save.disabled=generate.disabled=picker.disabled=true;try{await request('student-pin-set',{accountId:student.id,pin:one.value},student.periodId);one.value=two.value='';one.type=two.type='password';notice.textContent='PIN saved for '+session.config.periods.find(p=>p.id===student.periodId).label+' · '+student.label+'. Their work and personal links were preserved.';}catch(e){one.value=two.value='';one.type=two.type='password';notice.textContent=e.message+' PIN save is not confirmed; do not assume the old PIN changed.';}finally{pinSaveBusy=false;fileInput.disabled=bulkSave.disabled=bulk.disabled=save.disabled=generate.disabled=picker.disabled=false;}};
  const bulkHeading=document.createElement('h2');bulkHeading.textContent='Assign a private PIN list';
  const bulkHelp=document.createElement('p');bulkHelp.textContent='Choose a private CSV/TXT file or paste one student per line: period, initials, PIN. Example format: 1, A.B., 0042. An optional first line is period,initials,pin. Use your actual roster and private PINs. The entire list is checked before saving. Do not paste PINs in chat.';
  const bulkForm=document.createElement('form'),bulk=document.createElement('textarea');bulk.className='control';bulk.rows=6;bulk.autocomplete='off';bulk.spellcheck=false;bulk.required=true;bulk.setAttribute('aria-label','Private student PIN list');
  const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.csv,.txt,text/csv,text/plain';fileInput.setAttribute('aria-label','Choose private student PIN file');
  fileInput.onchange=async()=>{if(pinSaveBusy)return;const file=fileInput.files?.[0];if(!file)return;fileInput.value='';if(!/\.(csv|txt)$/i.test(file.name)||file.size>32768){notice.textContent='Choose a CSV or TXT file no larger than 32 KiB. Nothing was sent.';return;}pinSaveBusy=true;fileInput.disabled=bulkSave.disabled=bulk.disabled=save.disabled=generate.disabled=picker.disabled=true;
   try{const text=await file.text();if(new TextEncoder().encode(text).length>32768)throw new Error('size');if(!panel.isConnected)return;bulk.value=text.replace(/^\uFEFF/,'');notice.textContent='PIN list loaded only in this browser. Review it, then select Save PIN list. Nothing has been sent.';}
   catch{notice.textContent='The PIN file could not be read or is too large. Nothing was sent.';}
   finally{fileInput.value='';pinSaveBusy=false;fileInput.disabled=bulkSave.disabled=bulk.disabled=save.disabled=generate.disabled=picker.disabled=false;}
  };
  const bulkSave=document.createElement('button');bulkSave.type='submit';bulkSave.className='btn primary';bulkSave.textContent='Save PIN list';
  bulkForm.onsubmit=async event=>{event.preventDefault();if(pinSaveBusy)return;const rows=[],seen=new Set();const lines=bulk.value.replace(/^\uFEFF/,'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(/^period\s*,\s*initials\s*,\s*pin$/i.test(lines[0]||''))lines.shift();if(!lines.length){notice.textContent='Add at least one student row. Nothing saved.';return;}
   for(let i=0;i<lines.length;i++){const parts=lines[i].split(',').map(x=>x.trim());if(parts.length!==3||!/^\d{4}$/.test(parts[2])){notice.textContent='Line '+(i+1)+': use period, initials, and a 4-digit PIN. Nothing saved.';return;}const pid='period-'+parts[0].replace(/^period[- ]*/i,'');const label=parts[1].toUpperCase().replace(/\s/g,'');const student=session.config.students.find(x=>x.periodId===pid&&(x.initials||x.label).toUpperCase().replace(/\s/g,'')===label);if(!student){notice.textContent='Line '+(i+1)+': period or initials do not match this roster. Nothing saved.';return;}const key=pid+':'+student.id;if(seen.has(key)){notice.textContent='Line '+(i+1)+': student is listed twice. Nothing saved.';return;}seen.add(key);rows.push({student,pin:parts[2]});}
   bulk.value='';pinSaveBusy=true;fileInput.disabled=bulkSave.disabled=bulk.disabled=save.disabled=generate.disabled=picker.disabled=true;let saved=0,current=null;
   try{for(const row of rows){current=row.student;await request('student-pin-set',{accountId:row.student.id,pin:row.pin},row.student.periodId);row.pin='';saved++;}notice.textContent='PIN list saved for '+saved+' students. Work and personal links preserved.';}
   catch{const who=current?session.config.periods.find(p=>p.id===current.periodId).label+' · '+current.label:'current student';notice.textContent=saved+' PINs confirmed saved. The save for '+who+' is unconfirmed and may have completed. Remaining students were not attempted. No automatic retry.';}
   finally{for(const row of rows)row.pin='';bulk.value='';pinSaveBusy=false;fileInput.disabled=bulkSave.disabled=bulk.disabled=save.disabled=generate.disabled=picker.disabled=false;}
  };
  bulkForm.append(bulk,fileInput,bulkSave);pinForm.append(one,two,generate,hide,save);panel.append(picker,pinHeading,pinHelp,pinForm,bulkHeading,bulkHelp,bulkForm,btn,result,revoke,exportButton);
 }
 await import('./sync-pilot.js?v=20261113-entry2');
}
start().catch(e=>{credentials={};keep();signIn(e.message);});
