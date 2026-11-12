import {createDemo} from './demo-adapter.js';
try {
 const demo=createDemo({storage:window.localStorage});
 window.ClassroomDemo=demo;
 document.getElementById('demo-storage').textContent='Saved changes stay in this browser. Clearing site data erases them. Multiple tabs share the same demo storage.';
 document.getElementById('demo-export').addEventListener('click',()=>{try{const blob=new Blob([demo.exportCSV()],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='classroom-demo-results.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}catch(e){document.getElementById('demo-storage').textContent=e.message;}});
 document.getElementById('demo-reset').addEventListener('click',()=>{if(confirm('Erase only this browser’s demo responses, reviews, Circle entries and participation? This cannot be undone. Export first if needed.')){try{demo.reset();Object.keys(sessionStorage).filter(k=>k.startsWith('mial-local-demo-section:')).forEach(k=>sessionStorage.removeItem(k));location.reload();}catch{document.getElementById('demo-storage').textContent='Reset failed. No other site data was removed.';}}});
 await import('./pilot.js');
} catch(e) {document.getElementById('pilot').textContent=e.message+' No data was sent to a server.';document.getElementById('demo-reset').onclick=()=>{if(confirm('Remove this demo’s unreadable local data?')){localStorage.removeItem('mial-fictional-full-demo-v1');location.reload();}};}
