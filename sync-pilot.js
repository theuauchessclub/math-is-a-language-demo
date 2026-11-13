(() => {
  "use strict";
  const app = document.getElementById("pilot");
  const samples = () => [{id:"teacher",name:"Teacher demo",detail:"Daily view, review, participation and Circle in this browser.",action:"Open teacher view"},...window.ClassroomDemo.config.students.filter(s=>s.periodId===periodId()).map(s=>({id:s.id,name:s.label,detail:"Test "+s.variant+" lesson version. Results start blank.",action:"Open student demo"}))];
  const short = { opener: "Opener", notes: "Class Notes", classwork: "Classwork", exit: "Exit Ticket" };
  const draft = Object.create(null);
  const positions = Object.create(null);
  const graphGuides = Object.create(null);
  let saveCurrentPart;
  let partDirty=false;
  window.addEventListener("beforeunload",event=>{if(partDirty){event.preventDefault();event.returnValue="";}});
  let account, active, model, teacher, studentCircle, preview, observers = [];
  let closeCircle, teacherTab = "daily", navigationBusy = false, renderVersion = 0;
  let teacherRoster, rosterPeriodFilter = "";
  const periodId = () => preview?.periodId ?? "period-1";
  const periodLabel = () => preview?.periods?.find(period => period.id === periodId())?.label ?? "Selected period";
  const lessonId = () => window.ClassroomDemo.lessonId || "lesson-3";
  const lessonLabel = () => lessonId().replace(/^lesson-/, "Lesson ");
  const legacyProgressKey = () => "mial-connected-section:" + periodId() + ":" + account.id;
  const progressKey = () => legacyProgressKey() + ":" + lessonId();
  const responseKey = () => lessonId() + ":" + periodId() + ":" + account?.id + ":" + active;
  const isOperator = () => ["owner-preview", "local-preview"].includes(preview?.mode);
  function clearRoleState() {
    closeCircle?.(); closeCircle = undefined;
    saveCurrentPart = undefined; partDirty = false;
    for (const state of [draft, positions, graphGuides]) Object.keys(state).forEach(key => delete state[key]);
    active = model = teacher = studentCircle = teacherRoster = undefined;
    rosterPeriodFilter = "";
    teacherTab = "daily";
  }
  function setSession(value) {
    account = value.account;
    preview = value.preview;
    const mast = document.querySelector(".mast .class");
    if (mast) mast.textContent = "Algebra 1 · " + periodLabel() + " · Brother Truth & Ms. Joey";
  }

  const e = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const select = (values, selected = "") => '<option value="">Choose a response</option>' + values.map(value => '<option value="' + e(value) + '"' + (selected === value ? " selected" : "") + ">" + e(value) + "</option>").join("");
  const button = (text, action, style = "") => '<button class="btn ' + style + '" type="button" data-act="' + e(action) + '">' + e(text) + "</button>";
  async function request(path, body) { return window.ClassroomDemo.request(path, body); }
  function render(html) {
    renderVersion++;
    closeCircle?.();
    closeCircle = undefined;
    observers.forEach(observer => observer.disconnect());
    observers = [];
    app.innerHTML = html;
    app.removeAttribute("aria-busy");
  }
  function report(err) {
    let alert = app.querySelector("[data-alert]");
    if (!alert) {
      alert = document.createElement("p"); alert.className = "error"; alert.setAttribute("role", "alert"); alert.dataset.alert = "";
      app.prepend(alert);
    }
    alert.textContent = err.message;
  }
  const accountLabel = () => account?.label ?? account?.name ?? "Fictional account";
  const sessionBar = (roster = false) => '<div class="session-bar"><div><strong>' + e(accountLabel()) + '</strong> ' + (roster ? '<span class="pill">Class roster</span>' : '<span class="pill">' + e(periodLabel()) + '</span> <span class="pill">Cloud saved</span>') + '</div>' + (isOperator() ? button("Change preview role", "logout") : "") + "</div>";
  function periodPicker(action = "choose-period") {
    return '<label class="period-picker">Class period<select class="control" data-period-action="' + e(action) + '">' + (preview?.periods ?? []).map(period => '<option value="' + e(period.id) + '"' + (period.id === periodId() ? " selected" : "") + '>' + e(period.label) + '</option>').join("") + '</select></label>';
  }
  function authorizationView(error) {
    clearRoleState(); account=preview=undefined;
    render('<section class="hero"><h1 data-heading tabindex="-1">Connected classroom could not open</h1><p>'+e(error?.message??'Check your connection and reopen your access link if needed.')+'</p><p>Your previous saved work is still online. Reopen your personal link or teacher sign-in to continue.</p>'+button('Try again','retry-session')+'</section>');
  }
  function home() {
    if (!isOperator()) return authorizationView({status:401});
    render('<section class="hero"><div class="eyebrow">Password-free browser demo · Unit 4 · Lesson 3</div><h1 tabindex="-1" data-heading>Interpreting &amp; Using Function Notation</h1><p>Choose a period and role to test the lesson. Use fictional responses only, never private information.</p><div class="preview-context">' + periodPicker() + '<p class="micro muted">' + e(preview.operatorLabel ?? "Demo visitor") + ' · ' + (preview.mode === "local-preview" ? 'Local preview' : 'Browser-only demo') + '<br>No real student reporting. Anyone can switch roles.</p></div></section><div class="grid role-grid">' +
      samples().map(sample => '<section class="card"><div class="eyebrow">' + (sample.id === "teacher" ? "Classroom tools" : "Student") + '</div><h2>' + e(sample.name) + "</h2><p>" + e(sample.detail) + "</p>" + button(sample.action, "login:" + sample.id, sample.id === "teacher" ? "primary" : "") + "</section>").join("") +
      '</div><p class="micro muted">Each period has separate local test work. Role switching is not security: anyone can open teacher tools.</p>');
  }
  function graphUI(config, kind, key = "") {
    const axes = config.axes ?? {};
    const alt = kind === "drone"
      ? "Drone height rises from takeoff to 2 seconds, stays level through 5 seconds, and descends to ground level at 7 seconds. No numbered height scale."
      : "Coordinate graph. " + axes.x + ". " + axes.y + ".";
    return '<div class="graph-card" data-graph="' + e(kind) + '" data-key="' + e(key) + '"><svg role="img" aria-label="' + e(alt) + '"></svg>' +
      (kind === "drone" ? '<p class="graph-caption">Tap or click the graph to place a time guide, or choose two times below.</p><div class="plot-fields"><label>Time A<select class="control" data-guide="a">' + [0,1,2,3,4,5,6,7].map(time => '<option value="' + time + '">' + time + (time===1?' second':' seconds') + '</option>').join("") + '</select></label><label>Time B<select class="control" data-guide="b">' + [0,1,2,3,4,5,6,7].map(time => '<option value="' + time + '"' + (time === 4 ? " selected" : "") + '>' + time + (time===1?' second':' seconds') + '</option>').join("") + '</select></label></div>'
        : '<p class="graph-caption">Tap or click to place a point, or enter its coordinates below. Connect points if your sketch needs line segments.</p><div class="plot-fields"><label>Horizontal coordinate<input class="control" type="number" data-x></label><label>Vertical coordinate<input class="control" type="number" data-y></label>' + button("Add point","add-point") + '</div><label><input type="checkbox" data-connect> Connect points</label><ul class="point-list" aria-label="Points placed"></ul><p class="micro" data-plot-status role="status"></p>') + "</div>";
  }
  function attachGraph(el, config, answer, change, locked) {
    const drone = el.dataset.graph === "drone";
    const svg = el.querySelector("svg");
    const points = Array.isArray(answer?.points) ? answer.points.slice() : (Array.isArray(answer) ? answer.slice() : []);
    const connect = el.querySelector("[data-connect]");
    const xs = config.xMin ?? 0, xe = config.xMax ?? 8, dx = config.xStep ?? 1;
    const ys = config.yMin ?? 0, ye = config.yMax ?? 10, dy = config.yStep ?? 1;
    const ax = el.querySelector("[data-x]"), ay = el.querySelector("[data-y]");
    const ga = el.querySelector('[data-guide="a"]'), gb = el.querySelector('[data-guide="b"]');
    let bounds, guide = "a";
    if (connect) connect.checked = Boolean(answer?.connect);
    function ticks(start, end, step) {
      const count = Math.min(40, Math.floor((end - start) / step + 1e-6));
      return Array.from({length:count + 1}, (_, i) => Number((start + i * step).toFixed(6)));
    }
    function draw() {
      const w = Math.round(svg.getBoundingClientRect().width), h = Math.round(svg.getBoundingClientRect().height);
      if (w < 180 || h < 140) return;
      const left = w < 420 ? 50 : 62, right = w - 22, top = 16, bottom = h - 47;
      const px = value => left + (right-left)*(value-xs)/(xe-xs);
      const py = value => bottom - (bottom-top)*(value-ys)/(ye-ys);
      bounds = { left,right,top,bottom };
      const xEvery = w < 450 && (xe-xs)/dx > 8 ? 2 : 1;
      const yt = drone ? [] : ticks(ys,ye,dy);
      const xt = ticks(xs,xe,dx);
      const hGrid = yt.map((v,i) => '<line class="gridline" x1="'+left+'" x2="'+right+'" y1="'+py(v)+'" y2="'+py(v)+'"/>'+(yt.length<=12||i%2===0?'<text x="'+(left-7)+'" y="'+(py(v)+4)+'" text-anchor="end">'+v+'</text>':"")).join("");
      const vGrid = xt.map((v,i) => '<line class="gridline" y1="'+top+'" y2="'+bottom+'" x1="'+px(v)+'" x2="'+px(v)+'"/>'+(i%xEvery===0?'<text x="'+px(v)+'" y="'+(bottom+18)+'" text-anchor="middle">'+v+'</text>':"")).join("");
      const guides = drone ? [ga,gb].map((select,i) => '<line class="guide-'+(i?"b":"a")+'" x1="'+px(Number(select.value))+'" x2="'+px(Number(select.value))+'" y1="'+top+'" y2="'+bottom+'"/>').join("") : "";
      const linePoints = drone ? config.points : points.slice().sort((a,b)=>a[0]-b[0]);
      const line = drone || (connect?.checked && linePoints.length > 1) ? '<polyline class="line" points="'+linePoints.map(([x,y])=>px(x)+","+py(y)).join(" ")+'"/>' : "";
      const marks = drone ? "" : points.map(([x,y])=>'<circle cx="'+px(x)+'" cy="'+py(y)+'" r="5.5" fill="#b44f15" stroke="#fff" stroke-width="1.3"/>').join("");
      svg.setAttribute("viewBox","0 0 "+w+" "+h);
      svg.innerHTML = hGrid+vGrid+guides+'<path class="axis" d="M '+left+' '+top+' V '+bottom+' H '+right+'" fill="none"/>'+line+marks+
        '<text x="'+((left+right)/2)+'" y="'+(h-7)+'" text-anchor="middle">'+e(config.axes?.x)+'</text>'+
        '<text x="13" y="'+((top+bottom)/2)+'" text-anchor="middle" transform="rotate(-90 13 '+((top+bottom)/2)+')">'+e(config.axes?.y)+'</text>';
    }
    function updatePoints() {
      const list = el.querySelector(".point-list");
      list.innerHTML = points.map(([x,y],i) => '<li>' + (locked ? e("("+x+", "+y+")") : '<button class="btn" type="button" data-remove="'+i+'" aria-label="Remove point '+e(x)+', '+e(y)+'">('+e(x)+', '+e(y)+') ×</button>') + '</li>').join("");
      change({ points: points.slice(), connect: Boolean(connect?.checked) });
      draw();
    }
    function addPoint(x,y) {
      const notice = el.querySelector("[data-plot-status]");
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < xs || x > xe || y < ys || y > ye) {
        notice.textContent = "Enter coordinates within the graph."; return;
      }
      if (points.length >= 20 || points.some(p => p[0]===x && p[1]===y)) return;
      points.push([x,y]); notice.textContent = "Point ("+x+", "+y+") added."; updatePoints();
    }
    if (drone) {
      ga.addEventListener("change",draw); gb.addEventListener("change",draw);
    } else {
      ax.min=xs; ax.max=xe; ax.step="any"; ay.min=ys; ay.max=ye; ay.step="any";
      el.querySelector("[data-act='add-point']").addEventListener("click", () => addPoint(ax.value === "" ? NaN : Number(ax.value), ay.value === "" ? NaN : Number(ay.value)));
      el.querySelector(".point-list").addEventListener("click", event => {
        const control = event.target.closest("[data-remove]");
        if (control && !locked) { points.splice(Number(control.dataset.remove),1); updatePoints(); }
      });
      connect.addEventListener("change",updatePoints);
      el.querySelectorAll("button,input").forEach(control => { control.disabled=locked; });
      updatePoints();
    }
    svg.addEventListener("click", event => {
      if ((!drone && locked) || !bounds) return;
      const rect=svg.getBoundingClientRect(), x=event.clientX-rect.left, y=event.clientY-rect.top;
      if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return;
      const raw=xs+(xe-xs)*(x-bounds.left)/(bounds.right-bounds.left);
      if (drone) {
        (guide==="a"?ga:gb).value=String(Math.min(7,Math.round(raw))); guide=guide==="a"?"b":"a"; draw(); return;
      }
      const rawY=ys+(ye-ys)*(bounds.bottom-y)/(bounds.bottom-bounds.top);
      addPoint(Number((xs+Math.round((raw-xs)/dx)*dx).toFixed(6)),Number((ys+Math.round((rawY-ys)/dy)*dy).toFixed(6)));
    });
    const observer = new ResizeObserver(draw); observers.push(observer); observer.observe(svg); draw();
  }
  function targets(lesson) {
    return '<details class="card" open><summary><strong>Learning targets and standards</strong></summary><ul>' +
      lesson.targets.map(text=>'<li>'+e(text)+'</li>').join("")+'</ul>'+lesson.standards.map(standard=>'<p><strong>'+e(standard.code)+'</strong> '+e(standard.plain)+'</p>').join("")+"</details>";
  }
  function showSources(lesson) {
    return '<details class="sources"><summary>Curriculum and assessment references</summary><ul>'+lesson.sources.map(source=>'<li><a target="_blank" rel="noopener noreferrer" href="'+e(source.url)+'">'+e(source.name)+'</a> '+e(source.detail)+'</li>').join("")+"</ul></details>";
  }
  function question(item, values, locked, result, sharedPlot = false) {
    const value=values[item.id];
    const header='<span class="qid">'+e(item.id)+'</span>'+e(item.prompt);
    const attrs=' class="control" data-answer="'+e(item.id)+'"'+(locked?' disabled':'');
    let field;
    if (item.type === "plot") field='<h3>'+header+'</h3>'+(sharedPlot ? '<p class="micro">Use the shared graph to place and connect your points. Your sketch stays visible as you move between parts.</p>' : graphUI(item.graph, "plot", item.id));
    else if (item.type === "choice") field='<label>'+header+'<select'+attrs+'>'+select(item.choices,value)+'</select></label>';
    else field='<label>'+header+'<textarea rows="3"'+attrs+'>'+e(value)+'</textarea></label>';
    const feedback=result?'<p class="question-status">'+e(({correct:"Correct",incorrect:"Revisit this response",pending:"Waiting for teacher review",blank:"Blank",reviewed:"Teacher reviewed",partial:"Partial credit"})[result.status]??result.status)+(result.feedback?" · "+e(result.feedback):"")+"</p>":"";
    return '<div class="question">'+(item.label?'<h3>'+e(item.label)+'</h3>':'')+(item.intro?'<p>'+e(item.intro)+'</p>':'')+field+(item.scaffold?'<p class="hint"><strong>Try this</strong> '+e(item.scaffold)+'</p>':'')+feedback+'</div>';
  }
  function scoreText(score) {
    if (!score) return "Awaiting submission";
    if (score.total === null || score.pending) return "Teacher review pending · " + (score.earned ?? 0) + "/" + (score.gradedPoints ?? 0) + " scored points";
    return score.total + "%";
  }
  const entries = value => Array.isArray(value) ? value : Object.values(value ?? {});
  function studentTabs() {
    const tab = (label, id, completed) => '<button class="btn" type="button" aria-current="'+(active===id)+'" data-act="'+(id==="circle"?"circle:student":"section:"+e(id))+'">'+e(label)+(completed?" ✓":"")+'</button>';
    const lessonTabs = studentCircle && !studentCircle.submission ? "" : model.lesson.sections.map(step=>tab(short[step.id]??step.title,step.id,entries(model.submissions).some(done=>done.sectionId===step.id))).join("");
    return '<nav class="tabs" aria-label="Lesson sections">'+tab("Community Circle","circle",Boolean(studentCircle?.submission))+lessonTabs+'</nav>';
  }
  function connectedCircleCopy(root) {
    const replacements = [
      ["Microphone recording and audio storage are disabled in this public local demo. Use fictional written responses only.", "Microphone recording and audio storage are not enabled. Keep written responses appropriate for your classroom."],
      ["Your test check-in can be viewed through teacher demo tools in this browser only.", "Your check-in has been saved online for your teacher."],
      ["Use a fictional positive example, not personal or sensitive information.", "Use a positive classroom example; do not include private personal information."],
      ["Anyone using this browser can view these test responses in teacher demo tools. Circle is separate from your math grade.", "Your teacher can view your response. Other students cannot read your check-in. Circle is separate from your math grade."]
    ];
    for (const paragraph of root.querySelectorAll("p.micro.muted, p.feedback, .circle-shout > p")) {
      for (const node of paragraph.childNodes) {
        if (node.nodeType !== 3) continue;
        for (const [before, after] of replacements) node.textContent = node.textContent.replace(before, after);
      }
    }
  }
  function studentCircleView(message = "") {
    active="circle";
    render(sessionBar()+studentTabs()+'<section data-circle-view></section>');
    const root=app.querySelector("[data-circle-view]");
    if (!studentCircle) {
      root.innerHTML='<div class="card"><h1 tabindex="-1" data-heading>Community Circle</h1><p role="status">'+e(message)+'</p>'+button("Try Circle again","circle:student")+' '+button("Go to the math opener","section:opener","primary")+'</div>';
      return;
    }
    const version=renderVersion;
    closeCircle=window.CommunityCircle.studentView(root,studentCircle,{request,onSubmitted:result=>{
      if (version!==renderVersion) return;
      studentCircle=result;
      studentCircleView();
      app.querySelector("[data-heading]").focus();
    }});
    connectedCircleCopy(root);
  }
  async function openStudentCircle(goToOpenerIfDone = false) {
    try {
      studentCircle=await request("circle");
      if (!window.CommunityCircle) throw new Error("Community Circle could not load.");
    } catch (err) {
      if (err.status === 401 || err.status === 403) throw err;
      studentCircle=null;
      return studentCircleView("Community Circle is unavailable right now. You can retry or start your math opener.");
    }
    if (goToOpenerIfDone && studentCircle.submission) {
      try { active=sessionStorage.getItem(progressKey()) || (lessonId()==="lesson-3" ? sessionStorage.getItem(legacyProgressKey()) : null); } catch {}
      if(!model.lesson.sections.some(section=>section.id===active))active=model.lesson.sections[0].id;
      return studentView();
    }
    studentCircleView();
  }
  function studentView() {
    const lesson=model.lesson;
    const section=lesson.sections.find(item=>item.id===active)??lesson.sections[0];
    active=section.id;
    try { sessionStorage.setItem(progressKey(),active); } catch {}
    partDirty=false;
    const submitted=entries(model.submissions).find(value=>value.sectionId===active);
    const id=responseKey();
    const saved=entries(model.progress).find(value=>value.sectionId===active);
    const values=submitted?.answers??(draft[id]??={...(saved?.answers??{})});
    const results=submitted?.results??[];
    let index=Math.max(0,Math.min(section.items.length-1,positions[id]??saved?.index??0));
    let busy=false, cleanupGraph=()=>{};
    const next=lesson.sections[lesson.sections.indexOf(section)+1];
    const status=submitted?'<div class="feedback" role="status"><strong>'+e(short[active])+' submitted.</strong> '+e(scoreText(submitted.score))+(submitted.feedback?'<p>'+e(submitted.feedback)+'</p>':'')+'</div>':"";
    render(sessionBar()+studentTabs()+'<section class="hero lesson-hero"><div class="eyebrow">'+e(lesson.edition || lessonLabel())+'</div><h1>'+e(lesson.title)+'</h1><p>Opener → Class Notes → Classwork → Exit Ticket</p></section>'+targets(lesson).replace(' open','')+
      '<section data-lesson-flow><h2 tabindex="-1" data-heading>'+e(section.title)+'</h2><p class="pill">'+e(section.standard)+'</p>'+status+
      '<p class="micro muted">One part at a time. Save each response, then submit the section for grading at the end.</p>'+
      '<div class="part-layout"><aside class="shared-reference" aria-label="Shared graph and activity context" data-reference></aside><div class="part-work"><div class="part-progress" role="status" aria-live="polite" data-progress></div><form data-student-form><div data-part></div><div class="part-actions"><button type="button" class="btn" data-previous>Previous</button><button class="btn primary" type="submit" data-next></button></div><p class="micro" role="status" data-save-status></p></form><div data-review-summary></div></div></div>'+
      (submitted&&next?'<p>'+button(active==="opener"?"Read Class Notes":"Continue to "+short[next.id],"section:"+next.id,"primary")+'</p>':"")+
      (model.soloUnlocked?'<p>'+button("Open Unit 4 solo practice","game:solo","accent")+'</p>':'<p class="micro muted">Unit 4 solo practice opens after all four sections are submitted.</p>')+'</section>'+showSources(lesson));
    const form=app.querySelector("[data-student-form]");
    const reference=app.querySelector("[data-reference]");
    const step=app.querySelector("[data-part]");
    const previous=form.querySelector("[data-previous]");
    const forward=form.querySelector("[data-next]");
    const saveStatus=form.querySelector("[data-save-status]");
    let referenceKey;
    function setBusy(value) {
      busy=value;
      reference.inert=value;
      previous.disabled=value||index===0;
      forward.disabled=value||(Boolean(submitted)&&index===section.items.length-1);
      step.querySelectorAll("input,select,textarea,button").forEach(control=>control.disabled=value||Boolean(submitted));
    }
    function focusPart() {
      const target=step.querySelector("[data-part-heading]");
      target?.focus({preventScroll:true});
      const layout=app.querySelector(".part-layout");
      if (layout.getBoundingClientRect().top<0 || layout.getBoundingClientRect().top>window.innerHeight/2) layout.scrollIntoView({block:"start",behavior:"instant"});
    }
    function groupFor(item) {
      if (active==="opener" && lesson.graph && (lesson.graph.kind==="drone" || (lessonId()==="lesson-3" && Array.isArray(lesson.graph.points)))) return {key:"drone",intro:section.intro,items:section.items,graph:lesson.graph,kind:"drone",label:"Shared drone graph"};
      const cape=item.id.startsWith("CAPE-");
      const group=section.items.filter(row=>row.id.startsWith("CAPE-")===cape);
      const plots=group.filter(row=>row.type==="plot");
      if(plots.length>1){const ownPlot=item.type==="plot"?item:undefined;return {key:active+":"+item.id,intro:section.intro,items:[item],plot:ownPlot,graph:ownPlot?.graph,kind:"plot",label:ownPlot?"Graph for "+item.id:"Activity context"};}
      const plot=plots[0];
      return {key:cape?"cape":active,intro:cape?group[0].intro:section.intro,items:group,plot,graph:plot?.graph,kind:"plot",label:cape?group[0].label:"Activity context"};
    }
    function showPart() {
      app.querySelector(".part-layout").classList.remove("reviewing");
      positions[id]=index;
      const item=section.items[index], group=groupFor(item);
      const graphEditable=!submitted&&item.id===group.plot?.id;
      const key=group.key+":"+graphEditable;
      if(referenceKey!==key) {
        cleanupGraph();
        observers.forEach(observer=>observer.disconnect());observers=[];
        const guideKey=id+":"+group.key;
        reference.innerHTML='<div class="context-note"><strong>'+e(group.label??"Activity context")+'</strong><p>'+e(group.intro)+'</p></div>'+
          (group.graph?graphUI(group.graph,group.kind,group.plot?.id):"")+
          (group.plot?'<p class="micro graph-help">'+(graphEditable?'Place points now. Use the coordinate fields for precise or keyboard entry.':'Your graph is shown here for reference. '+(section.items.indexOf(group.plot)<index?'Use Previous to edit ':'Edit it when you reach ')+e(group.plot.id)+'.')+'</p>':"");
        const graph=reference.querySelector("[data-graph]");
        if(graph) {
          if(group.kind==="drone") {
            const guides=graphGuides[guideKey];
            if(guides) {graph.querySelector('[data-guide="a"]').value=guides.a;graph.querySelector('[data-guide="b"]').value=guides.b;}
            attachGraph(graph,group.graph,null,()=>{},Boolean(submitted));
            const keepGuides=()=>{graphGuides[guideKey]={a:graph.querySelector('[data-guide="a"]').value,b:graph.querySelector('[data-guide="b"]').value};};
            graph.addEventListener("change",keepGuides);graph.addEventListener("click",keepGuides);cleanupGraph=keepGuides;
          } else {
            attachGraph(graph,group.graph,values[group.plot.id],answer=>{if(graphEditable){if(JSON.stringify(values[group.plot.id]??{points:[],connect:false})!==JSON.stringify(answer))partDirty=true;values[group.plot.id]=answer;}},!graphEditable);
            cleanupGraph=()=>{};
          }
        }
        referenceKey=key;
      }
      step.innerHTML='<h3 class="part-heading" tabindex="-1" data-part-heading>Part '+(index+1)+' of '+section.items.length+' · '+e(item.id)+'</h3>'+
        (section.scaffold?'<p class="hint">'+e(section.scaffold)+'</p>':'')+
        question({...item,intro:undefined,label:undefined},values,Boolean(submitted),results.find(result=>result.itemId===item.id),true)+
        (item.type==="plot"?'<details class="earlier-parts"><summary>View earlier parts and my responses</summary>'+group.items.filter(row=>section.items.indexOf(row)<index).map(row=>'<div class="note"><strong>'+e(row.id)+'</strong> '+e(row.prompt)+'<p class="answer-text">'+e(typeof values[row.id]==="string"?values[row.id]:"See the graph")+'</p></div>').join("")+'</details>':"");
      app.querySelector("[data-progress]").textContent=(submitted?"Submitted section · Review ":"Your progress · ")+(index+1)+" / "+section.items.length;
      forward.textContent=submitted?"Next part":index<section.items.length-1?"Save answer & next":"Save answer & review";
      app.querySelector("[data-review-summary]").innerHTML="";
      saveStatus.textContent=submitted?"Your submitted answers are read-only.":"Saved responses sync online. Submit the whole section to send it to your teacher for review.";
      setBusy(false);
    }
    async function savePart(nextIndex=index) {
      if(submitted)return true;
      const item=section.items[index];
      const result=await request("progress",{sectionId:section.id,itemId:item.id,answer:values[item.id]??"",nextIndex});
      if(responseKey()!==id)return false;
      model.progress=[...entries(model.progress).filter(row=>row.sectionId!==section.id),result.progress];
      partDirty=false;
      return true;
    }
    saveCurrentPart=async()=>{
      if(busy)throw new Error("Please wait while your answer is saved.");
      if(!await savePart(index))return;
    };
    form.addEventListener("input",event=>{if(event.target.dataset.answer){values[event.target.dataset.answer]=event.target.value;partDirty=true;}});
    previous.addEventListener("click",async()=>{
      if(busy||index===0)return;
      setBusy(true);
      try{if(!await savePart(index-1))return;index--;showPart();focusPart();}catch(err){report(err);setBusy(false);saveStatus.textContent="Not saved. Your response is still on this screen. Try again.";}
    });
    form.addEventListener("submit",async event=>{
      event.preventDefault();if(busy)return;
      if(submitted){if(index<section.items.length-1){index++;showPart();focusPart();}return;}
      setBusy(true);saveStatus.textContent="Saving your answer…";
      try {
        if(!await savePart(Math.min(index+1,section.items.length-1)))return;
        if(index<section.items.length-1){index++;showPart();focusPart();return;}
        const missing=section.items.filter(item=>typeof values[item.id]==="string"?!values[item.id].trim():!values[item.id]?.points?.length);
        const summary=app.querySelector("[data-review-summary]");
        app.querySelector(".part-layout").classList.add("reviewing");
        summary.innerHTML='<section class="card"><h3 tabindex="-1" data-summary-heading>Ready to submit '+e(short[active])+'?</h3><p>'+section.items.length+' parts saved.'+(missing.length?' '+missing.length+' blank response'+(missing.length===1?'':'s')+' will receive no credit.':'')+'</p><p>You can use Previous to review or change your answers before final submission.</p><button class="btn primary" type="button" data-final-submit>Submit '+e(short[active])+'</button></section>';
        setBusy(false);saveStatus.textContent="All parts saved. Review, then submit for grading.";
        summary.querySelector("[data-summary-heading]").focus({preventScroll:true});
        summary.scrollIntoView({block:"start",behavior:"instant"});
        summary.querySelector("[data-final-submit]").addEventListener("click",async event=>{
          if(busy)return;const finalButton=event.currentTarget;setBusy(true);finalButton.disabled=true;
          try {
            const result=await request("submit",{sectionId:section.id,answers:values});
            if(responseKey()!==id)return;
            model.submissions=[...entries(model.submissions).filter(row=>row.sectionId!==section.id),result.submission];model.soloUnlocked=result.soloUnlocked;
            saveCurrentPart=undefined;studentView();app.querySelector("[data-heading]").focus();
          }catch(err){report(err);setBusy(false);finalButton.disabled=false;}
        });
      }catch(err){report(err);setBusy(false);saveStatus.textContent="Not saved. Your response is still on this screen. Try again.";}
    });
    showPart();
  }
  function reviewForm(submission) {
    const written=submission.results.filter(item=>item.manual && item.teacherRubric && item.status!=="blank");
    if (!written.length) return "";
    const answer = value => typeof value === "object" ? JSON.stringify(value) : value;
    return '<form class="card" data-review="'+e(submission.id)+'"><h3>'+e(short[submission.sectionId])+' · '+e(submission.accountLabel??submission.accountId)+'</h3>'+
      written.map(item=>'<div class="note"><p><strong>'+e(item.itemId)+'</strong> '+e(item.teacherRubric)+'</p><p class="answer-text">'+e(answer(submission.answers[item.itemId]))+'</p><label>Points out of '+e(item.points)+' <input class="control score-input" type="number" min="0" max="'+e(item.points)+'" step="0.5" data-score="'+e(item.itemId)+'" value="'+e(item.status==="pending"?"":item.earned)+'"></label></div>').join("")+
      '<label>Feedback<textarea class="control" rows="2" name="feedback">'+e(submission.feedback)+'</textarea></label><button class="btn primary" type="submit">Save review</button></form>';
  }
  const variantLabel = variant => variant === "scaffold" ? "Scaffolded" : "Grade-level";
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  function evidenceText(evidence) {
    if (!evidence || !number(evidence.possiblePoints)) return "No scored evidence yet";
    return number(evidence.earnedPoints) + "/" + number(evidence.possiblePoints) + " scored points" + (evidence.percent == null ? "" : " · " + Math.round(number(evidence.percent)) + "%");
  }
  function statusLabel(section) {
    return ({"not-started":"Not started",draft:"Draft",submitted:"Submitted","awaiting-review":"Awaiting review",scored:"Scored"})[section.status] ?? "Not started";
  }
  function statusCell(section) {
    if (!section) return '<span class="work-status status-not-started">Not started</span>';
    return '<span class="work-status status-' + e(section.status) + '">' + e(statusLabel(section)) + '</span>' +
      (section.submitted && section.status !== "submitted" ? '<span class="submitted-label">Submitted</span>' : '') +
      '<span class="cell-detail">' + number(section.answeredCount) + '/' + number(section.itemCount) + ' responses present</span>' +
      (number(section.pendingCount) ? '<span class="cell-detail">' + number(section.pendingCount) + ' awaiting review</span>' : '');
  }
  function teacherHero(title, detail) {
    return '<section class="hero teacher-hero"><div><div class="eyebrow">Teacher tools · ' + e(lessonLabel()) + '</div><h1 tabindex="-1" data-heading>' + e(title) + '</h1><p>' + e(detail) + '</p><p>' + e(teacher?.lessonTitle || lessonLabel()) + '</p><p class="micro muted">' + e(periodLabel()) + ' · Connected student submissions</p></div><div class="teacher-toolbar">' + periodPicker("switch-period") + button("Refresh view", "refresh-teacher") + '</div></section>';
  }
  function participationView(students) {
    const data = teacher.participation ?? { students:[], categories:[], events:[] };
    const categories = data.categories ?? [];
    const totals = new Map((data.students ?? []).map(student => [student.id ?? student.accountId, student]));
    const labelFor = id => students.find(student => student.accountId === id)?.label ?? id;
    const categoryFor = id => categories.find(category => category.id === id)?.label ?? id;
    const events = (data.events ?? []).filter(event => !event.undone).slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,6);
    return '<section class="card report-section"><div class="section-heading"><div><div class="eyebrow">Participation · ' + e(data.date ?? teacher.report?.date ?? "Today") + '</div><h2>Notice how students contribute</h2></div><span class="pill">No grade effects</span></div><p class="micro muted">Teacher-recorded participation is separate from completion and mathematical accuracy. Add one point for an observed contribution, or undo a recent entry.</p>' +
      (categories.length ? '<div class="participation-grid">' + students.map(student => {
        const total = totals.get(student.accountId);
        return '<article class="participation-student"><div class="section-heading"><h3>' + e(student.label) + '</h3><strong class="participation-total">' + number(total?.total) + ' <span>points</span></strong></div><p class="micro muted">' + e(variantLabel(student.variant)) + ' · Student</p><div class="participation-actions">' + categories.map(category => '<button class="btn participation-button" type="button" data-act="participation" data-account="' + e(student.accountId) + '" data-category="' + e(category.id) + '"><span>+1 ' + e(category.label) + '</span><span class="category-total">' + number(total?.byCategory?.[category.id]) + '</span></button>').join("") + '</div></article>';
      }).join("") + '</div>' : '<p>Participation categories are unavailable. Refresh the view to try again.</p>') +
      (events.length ? '<details class="recent-participation"><summary>Recent entries · Undo</summary><ul>' + events.map(event => '<li><span><strong>' + e(labelFor(event.accountId)) + '</strong> · ' + e(categoryFor(event.category)) + ' <span class="micro">+1</span></span><button class="btn" type="button" data-act="undo-participation" data-undo="' + e(event.id) + '" aria-label="Undo ' + e(categoryFor(event.category)) + ' point for ' + e(labelFor(event.accountId)) + '">Undo</button></li>').join("") + '</ul></details>' : '<p class="micro muted">No active participation entries for this date.</p>') + '</section>';
  }
  function evidenceView(students) {
    return '<section class="card report-section"><div class="eyebrow">Mathematical accuracy</div><h2>Scored evidence, by student and section</h2><p class="micro muted">Only scored, nonblank responses count in these point denominators. Blank and pending responses are shown separately. This is partial evidence, not the final section grade or a mastery judgment.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Scored evidence table"><table class="evidence-table"><thead><tr><th scope="col">Student / version</th><th scope="col">Section</th><th scope="col">Scored evidence</th><th scope="col">Blank</th><th scope="col">Pending review</th></tr></thead><tbody>' + students.flatMap(student => student.sections.map(section => '<tr><th scope="row">' + e(student.label) + '<span class="cell-detail">' + e(variantLabel(student.variant)) + '</span></th><td>' + e(short[section.sectionId] ?? section.sectionId) + '</td><td>' + e(evidenceText(section.correctness)) + '<span class="cell-detail">' + number(section.scoredItemCount) + ' scored responses</span></td><td>' + (section.submitted ? number(section.blankCount) : '—') + '</td><td>' + number(section.pendingCount) + '</td></tr>')).join("") + '</tbody></table></div><p class="micro muted">Use Gradebook for final section scores and written-response review. The Opener keeps its existing 70/30 grading model.</p></section>';
  }
  function reteachView(rows) {
    return '<section class="report-section" aria-labelledby="reteach-heading"><div class="eyebrow">Question-level evidence</div><h2 id="reteach-heading">Plan a follow-up</h2><p class="micro muted">Versions stay separate. Correctness uses scored responses only; submitted, blank, pending, and missing work remain visible. The test sample is too small to generalize to a class.</p>' + ["grade","scaffold"].map(variant => {
      const list = rows.filter(row => row.variant === variant);
      return '<details class="card analysis-panel"><summary><strong>' + e(variantLabel(variant)) + ' question evidence</strong><span class="micro muted">' + list.length + ' questions · Test sample</span></summary>' + (list.length ? '<div class="table-scroll" tabindex="0" role="region" aria-label="' + e(variantLabel(variant)) + ' question evidence"><table class="analysis-table"><thead><tr><th scope="col">Question</th><th scope="col">Submitted / students</th><th scope="col">Blank / pending</th><th scope="col">Scored evidence</th><th scope="col">Follow-up</th></tr></thead><tbody>' + list.map(row => '<tr><th scope="row"><span class="qid">' + e(row.itemId) + '</span><span class="cell-detail">' + e(short[row.sectionId]) + '</span><span class="question-prompt">' + e(row.prompt) + '</span></th><td>' + number(row.submittedCount) + '/' + number(row.rosterCount) + '<span class="cell-detail">' + number(row.missingSubmissionCount) + ' missing submissions</span><span class="cell-detail">' + number(row.draftCount) + ' drafts</span></td><td>' + number(row.blankCount) + ' blank<br>' + number(row.pendingCount) + ' pending</td><td>' + e(evidenceText({earnedPoints:row.earnedPoints,possiblePoints:row.possiblePoints,percent:row.correctnessPercent})) + '<span class="cell-detail">' + number(row.evidenceCount) + ' scored responses · ' + number(row.evidenceStudentCount) + ' students</span><span class="cell-detail">' + number(row.incorrectCount) + ' incorrect · ' + number(row.partialCount) + ' partial · ' + number(row.correctCount) + ' correct</span></td><td>' + e(row.followUp) + '<span class="cell-detail sample-caveat">' + e(row.caveat ?? "Small test sample; inspect the work before deciding next steps.") + '</span></td></tr>').join("") + '</tbody></table></div>' : '<p>No question evidence is available.</p>') + '</details>';
    }).join("") + '</section>';
  }
  function standardsView(rows) {
    return '<section class="report-section" aria-labelledby="standards-heading"><div class="eyebrow">Standards evidence</div><h2 id="standards-heading">Check the evidence behind each standard</h2><p class="micro muted">Item-to-standard mappings are candidates for teacher review. Scores describe the submitted evidence only; they do not establish mastery.</p>' + ["grade","scaffold"].map(variant => {
      const list = rows.filter(row => row.variant === variant);
      return '<details class="card analysis-panel"><summary><strong>' + e(variantLabel(variant)) + ' standards evidence</strong><span class="micro muted">Mapping needs teacher review</span></summary>' + (list.length ? '<div class="table-scroll" tabindex="0" role="region" aria-label="' + e(variantLabel(variant)) + ' standards evidence"><table class="standards-table"><thead><tr><th scope="col">Standard / mapped items</th><th scope="col">Scored evidence</th><th scope="col">Coverage</th><th scope="col">Evidence limits</th></tr></thead><tbody>' + list.map(row => '<tr><th scope="row">' + e(row.code) + '<span class="cell-detail">' + e(row.description) + '</span><span class="cell-detail">' + e((row.mappedItemIds ?? []).join(", ")) + '</span></th><td>' + e(evidenceText({earnedPoints:row.earnedPoints,possiblePoints:row.possiblePoints,percent:row.correctnessPercent})) + '<span class="cell-detail">' + number(row.evidenceCount) + ' scored responses</span></td><td>' + number(row.submittedCount) + ' submitted item responses<br>' + number(row.blankCount) + ' blank · ' + number(row.pendingCount) + ' pending<span class="cell-detail">' + number(row.missingSubmissionItemCount) + ' missing item submissions</span></td><td>' + number(row.evidenceStudentCount) + '/' + number(row.rosterCount) + ' students with scored evidence<span class="cell-detail sample-caveat">' + e(row.caveat ?? "Small test sample; not a mastery estimate.") + '</span></td></tr>').join("") + '</tbody></table></div>' : '<p>No mapped evidence is available.</p>') + '</details>';
    }).join("") + '</section>';
  }
  function readinessView() {
    const attendance = typeof teacher.readiness?.attendance === "string" ? teacher.readiness.attendance : "Attendance/check-in sync remains disconnected. The separate roster view shows imported memberships without enabling student sign-ins.";
    const approval = typeof teacher.readiness?.approval === "string" ? teacher.readiness.approval : "The teacher reports district approval, including student voice recording. Real enrollment remains off until student account access is verified.";
    const audio = typeof teacher.readiness?.audio === "string" ? teacher.readiness.audio : "Optional 20-second recording is for local playback only. Audio is never uploaded or stored for teacher review.";
    return '<section class="card report-section readiness"><div class="eyebrow">Pilot readiness</div><h2>What is and is not connected</h2><dl><div><dt>Access</dt><dd>Students can access only their own work. Teacher tools require verified teacher access.</dd></div><div><dt>Approval scope</dt><dd>' + e(approval) + '</dd></div><div><dt>Attendance</dt><dd>' + e(attendance) + '</dd></div><div><dt>Audio</dt><dd>' + e(audio) + '</dd></div></dl></section>';
  }
  function dailyView(message = "") {
    teacherTab = "daily";
    const daily = teacher.report?.daily;
    const students = daily?.students ?? [];
    const counts = daily?.counts ?? {};
    const sections = daily?.sections ?? [];
    const participationTotal = (teacher.participation?.students ?? []).reduce((sum,student) => sum + number(student.total),0);
    const pendingResponses = sections.reduce((sum,section) => sum + number(section.pendingItemCount),0);
    const content = daily ? '<div class="metric-grid"><article class="metric-card"><span>Completion · Sections submitted</span><strong>' + number(counts.submittedSectionCount) + '<small> / ' + number(counts.sectionOpportunityCount) + '</small></strong><p>' + number(counts.allSectionsSubmittedCount) + '/' + number(counts.rosterCount) + ' students submitted all sections</p></article><article class="metric-card"><span>Participation · ' + e(teacher.participation?.date ?? teacher.report.date) + '</span><strong>' + participationTotal + '<small> points</small></strong><p>Teacher observations only · No grade effects</p></article><article class="metric-card"><span>Teacher review</span><strong>' + pendingResponses + '<small> responses pending</small></strong><p>' + number(counts.awaitingReviewSectionCount) + ' sections awaiting written-response review</p></article></div><section class="card report-section"><div class="section-heading"><div><div class="eyebrow">Completion</div><h2>Where each student is in the lesson</h2></div>' + button("Review written work", "gradebook") + '</div><p class="micro muted">Saved drafts are not submissions. A submitted section may still contain blanks or await teacher review. Completion is not correctness.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Student lesson progress"><table class="daily-table"><thead><tr><th scope="col">Student</th>' + sections.map(section => '<th scope="col">' + e(short[section.sectionId] ?? section.title) + '</th>').join("") + '</tr></thead><tbody>' + students.map(student => '<tr><th scope="row">' + e(student.label) + '<span class="cell-detail">' + e(variantLabel(student.variant)) + '</span><span class="cell-detail">Circle: ' + (student.circleSubmitted ? 'submitted' : 'not submitted') + '</span></th>' + sections.map(section => '<td>' + statusCell(student.sections.find(item => item.sectionId === section.sectionId)) + '</td>').join("") + '</tr>').join("") + '</tbody></table></div><p class="micro muted">Lesson completion and scored evidence remain across dates. Participation is shown for ' + e(teacher.participation?.date ?? teacher.report.date) + '.</p></section>' + participationView(students) + evidenceView(students) + reteachView(teacher.report.reteach ?? []) + standardsView(teacher.report.standards ?? []) : '<section class="card"><h2>Daily report is unavailable</h2><p>Refresh to try again, or open Gradebook to review submitted work.</p>' + button("Open Gradebook", "gradebook") + '</section>';
    render(sessionBar() + teacherTabs("daily") + teacherHero("Daily view", "Start with lesson progress, then check participation and scored evidence separately.") + (message ? '<p class="feedback" role="status">' + e(message) + '</p>' : '') + content + readinessView());
  }
  function teacherView() {
    teacherTab = "gradebook";
    const rows=entries(teacher.submissions);
    const table=variant=>{
      const list=rows.filter(row=>row.variant===variant);
      return '<section class="card"><h2>'+(variant==="grade"?"Grade-level submissions":"Scaffolded submissions")+'</h2>'+
        (list.length?'<div class="table-scroll" tabindex="0" role="region" aria-label="'+e(variantLabel(variant))+' submissions"><table><thead><tr><th scope="col">Student</th><th scope="col">Section</th><th scope="col">Section grade</th></tr></thead><tbody>'+list.map(row=>'<tr><td>'+e(row.accountLabel??row.accountId)+'</td><td>'+e(short[row.sectionId])+'</td><td>'+e(scoreText(row.score))+'</td></tr>').join("")+'</tbody></table></div>':'<p>Waiting for a submission from this lesson version.</p>')+
        list.map(reviewForm).join("")+'</section>';
    };
    render(sessionBar()+teacherTabs("gradebook")+teacherHero("Gradebook", "Review submitted work and score written responses. Versions are shown separately.")+'<p class="micro muted">Section grades use the existing scoring model. Participation points do not change them.</p><div class="actions">'+button("Host Unit 4 team game","game:team","accent")+' <span class="micro">Classic online multiplayer is unavailable. Team game runs on this device only.</span></div>'+table("grade")+table("scaffold"));
    app.querySelectorAll("[data-review]").forEach(form=>form.addEventListener("submit",async event=>{
      event.preventDefault();
      if (navigationBusy || form.dataset.busy) return;
      const scores=Object.fromEntries([...form.querySelectorAll("[data-score]")].filter(control=>control.value!=="").map(control=>[control.dataset.score,Number(control.value)]));
      if (!Object.keys(scores).length) { report(new Error("Enter points for at least one written response.")); return; }
      form.dataset.busy="true";navigationBusy=true;
      const submit=form.querySelector('[type="submit"]');submit.disabled=true;
      try {
        await request("review",{submissionId:form.dataset.review,scores,feedback:form.elements.feedback.value});
        teacher=await request("teacher");teacherView();
        const message=document.createElement("p");message.className="feedback";message.setAttribute("role","status");message.textContent="Review saved.";app.prepend(message);
      } catch(err){report(err);}
      finally {delete form.dataset.busy;submit.disabled=false;navigationBusy=false;}
    }));
  }
  function teacherTabs(selected) {
    return '<nav class="tabs" aria-label="Teacher tools">' + [["Daily view","daily"],["Gradebook","gradebook"],["Community Circle","circle:teacher"],["Roster","roster"]].map(([label,id]) => '<button class="btn" type="button" aria-current="' + (selected === id) + '" data-act="' + id + '">' + label + '</button>').join("") + '</nav>';
  }
  function rosterView(data=null,state="ready") {
    teacherTab="roster";
    render(sessionBar()+teacherTabs("roster")+'<section class="hero"><h1 tabindex="-1" data-heading>Class roster</h1><p>Initials-only attendance roster snapshot. No prior records imported.</p></section><section class="card">'+(state==="loading"?'<p>Opening class roster…</p>':state==="error"?'<p>Class roster could not load.</p>':'<div class="table-scroll"><table><thead><tr><th>Display label</th><th>Period</th><th>Test assignment</th></tr></thead><tbody>'+window.ClassroomDemo.config.students.map(s=>'<tr><td>'+e(s.label)+'</td><td>'+e(window.ClassroomDemo.config.periods.find(p=>p.id===s.periodId)?.label)+'</td><td>'+e(s.variant==='grade'?'Grade-level':'Scaffolded')+'</td></tr>').join('')+'</tbody></table></div><p>Roster editing and importing are disabled. Roster changes are managed separately.</p>')+'</section>');
  }
  async function openRoster() {
    teacherRoster = undefined;
    rosterView(null,"loading");
    const version = renderVersion;
    try {
      const data = await request("teacher/roster");
      if (version !== renderVersion) return;
      if (data.enrollmentEnabled !== false || !Array.isArray(data.periods) || !Array.isArray(data.memberships)
        || data.memberships.some(row => row.enrollmentStatus !== "not-enrolled" || row.variant !== null)) throw new Error("The roster response is not available for this private view.");
      teacherRoster = data;
      if (!data.periods.some(period => period.id === rosterPeriodFilter)) rosterPeriodFilter = "";
      rosterView(data);
    } catch (err) {
      if (version !== renderVersion) return;
      if (err.status === 401) throw err;
      rosterView(null,"error");
    }
  }
  function teacherCircleView(data, message = "") {
    teacherTab = "circle:teacher";
    render(sessionBar()+teacherTabs("circle:teacher")+'<section data-circle-view></section>');
    const version=renderVersion;
    closeCircle=window.CommunityCircle.teacherView(app.querySelector("[data-circle-view]"),data,{request,onUpdated:(next,confirmation)=>{
      if (version!==renderVersion) return;
      teacherCircleView(next,confirmation);
      app.querySelector("[data-heading]").focus();
    }},message);
  }
  async function openAccount() {
    if (!account) return home();
    if (account.role==="teacher") { teacher=await request("teacher"); return dailyView(); }
    model=await request("lesson");
    await openStudentCircle(true);
  }
  async function refreshTeacher() {
    if (teacherTab === "roster") return openRoster();
    if (teacherTab === "circle:teacher") return teacherCircleView(await request("teacher/circle"));
    teacher = await request("teacher");
    if (teacherTab === "gradebook") teacherView();
    else dailyView();
  }
  async function loadSession() {
    const value = await request("session");
    clearRoleState(); setSession(value);
    await openAccount();
  }
  app.addEventListener("submit", async event => {
    const form = event.target.closest("[data-manual-roster-add]");
    if (!form) return;
    event.preventDefault();
    if (navigationBusy || teacherTab !== "roster" || account?.id !== "teacher") return;
    navigationBusy = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    // Retain this request ID after an uncertain response, never in localStorage.
    form.dataset.requestId ||= crypto.randomUUID();
    let saved = false;
    try {
      await request("teacher/roster/manual-add", { requestId: form.dataset.requestId,
        rosterPeriodId: form.elements.rosterPeriodId.value, displayName: form.elements.displayName.value });
      saved = true;
      await openRoster();
      if (teacherRoster) { const message = document.createElement("p"); message.className = "feedback"; message.setAttribute("role", "status"); message.textContent = "Manual entry saved. Student enrollment remains disabled."; app.prepend(message); }
    } catch (err) {
      if (err.status === 401 || err.status === 403) authorizationView(err);
      else report(saved ? new Error("The manual entry was saved, but the refreshed view could not load. Refresh before adding another entry.") : err);
    } finally { navigationBusy = false; submit.disabled = false; }
  });
  app.addEventListener("change", async event => {
    const rosterFilter = event.target.closest("[data-roster-period]");
    if (rosterFilter) {
      if (navigationBusy || teacherTab !== "roster" || !teacherRoster) return;
      if (rosterFilter.value && !teacherRoster.periods.some(period => period.id === rosterFilter.value)) return;
      rosterPeriodFilter = rosterFilter.value;
      rosterView(teacherRoster);
      app.querySelector("[data-roster-period]")?.focus({preventScroll:true});
      return;
    }
    const control = event.target.closest("[data-period-action]");
    if (!control) return;
    if (navigationBusy) { control.value = periodId(); return; }
    const nextPeriod = control.value;
    if (nextPeriod === periodId()) return;
    if (!(account?.role === "teacher" && preview?.mode === "connected") || !preview.periods.some(period => period.id === nextPeriod)) return;
    navigationBusy = true; control.disabled = true;
    try {
      if (control.dataset.periodAction === "choose-period") {
        clearRoleState(); setSession({account:null,preview:{...preview,periodId:nextPeriod}}); home();
      } else {
        const result = await request("login", {account:"teacher",periodId:nextPeriod});
        clearRoleState(); setSession(result); await openAccount();
      }
      app.querySelector("[data-heading]")?.focus();
    } catch(err) {
      control.value = periodId();
      if (err.status === 401 || err.status === 403) authorizationView(err); else report(err);
    } finally { navigationBusy = false; control.disabled = false; }
  });
  app.addEventListener("click", async event=>{
    const control=event.target.closest("[data-act]");
    if (!control) return;
    const [action,arg]=control.dataset.act.split(":");
    if (!["login","logout","section","circle","gradebook","daily","roster","refresh-teacher","game","participation","undo-participation","retry-session","manual-archive","manual-restore"].includes(action)) return;
    if (navigationBusy) return;
    navigationBusy=true;control.disabled=true;
    let mutationSaved = false;
    try {
      if (action==="login") {
        if (!isOperator()) return authorizationView({status:401});
        const sample=samples().find(row=>row.id===arg);
        if (!sample) return;
        const result=await request("login",{account:sample.id,periodId:periodId()});
        clearRoleState(); setSession(result); await openAccount();
        app.querySelector("[data-heading]")?.focus();
      } else if (action==="logout") {
        await saveCurrentPart?.();
        const result=await request("logout",{});
        clearRoleState();setSession(result);home();
        app.querySelector("[data-heading]")?.focus();
      } else if (action==="retry-session") {
        await loadSession();
        app.querySelector("[data-heading]")?.focus();
      } else if (action==="section") {
        if (studentCircle && !studentCircle.submission) return;
        await saveCurrentPart?.();saveCurrentPart=undefined;
        active=arg; studentView();app.querySelector("[data-heading]").focus();
      } else if (action==="circle") {
        await saveCurrentPart?.();saveCurrentPart=undefined;
        if (arg==="teacher") {
          if (!window.CommunityCircle) throw new Error("Community Circle could not load.");
          teacherCircleView(await request("teacher/circle"));
        } else {
          await openStudentCircle();
        }
        app.querySelector("[data-heading]")?.focus();
      } else if (action === "manual-archive" || action === "manual-restore") {
        await request("teacher/roster/manual-status", { id: control.dataset.manualId, status: action === "manual-archive" ? "archived" : "active" });
        mutationSaved = true;
        await openRoster();
      } else if (action==="roster") {
        await openRoster();app.querySelector("[data-heading]")?.focus();
      } else if (action==="gradebook" || action==="daily") {
        teacher=await request("teacher");
        if(action==="gradebook") teacherView(); else dailyView();
        app.querySelector("[data-heading]").focus();
      } else if (action==="refresh-teacher") {
        await refreshTeacher();app.querySelector("[data-heading]")?.focus();
      } else if (action==="participation" || action==="undo-participation") {
        await request("participation",action==="participation"?{accountId:control.dataset.account,category:control.dataset.category}:{undoId:control.dataset.undo});
        mutationSaved=true;
        teacher=await request("teacher");dailyView(action==="participation"?"Participation point recorded. Lesson grades are unchanged.":"Participation entry undone. Lesson grades are unchanged.");
        const matching = [...app.querySelectorAll('[data-act="participation"]')].find(button => button.dataset.account===control.dataset.account && button.dataset.category===control.dataset.category);
        matching?.focus({preventScroll:true});
      } else if (action==="game") {
        await saveCurrentPart?.();saveCurrentPart=undefined;
        await request("game?mode="+arg);
        if (!window.MathReview) throw new Error("The game board could not load.");
        render(sessionBar()+'<section id="review-board"></section>');
        window.MathReview.mount(app.querySelector("#review-board"),{mode:arg,onExit:()=>openAccount().catch(report)});
      }
    } catch(err) {
      if (err.status===401 || ((action==="login" || action==="retry-session") && err.status===403)) authorizationView(err);
      else report(mutationSaved ? new Error("Your change was saved, but the updated view could not load. Refresh before making another change.") : err);
    } finally { navigationBusy=false;control.disabled=false; }
  });
  loadSession().catch(authorizationView);
})();
