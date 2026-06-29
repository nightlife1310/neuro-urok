/* ============================================================
   НЕЙРО · движок Урока 1
   Data-driven рендер заданий + геймификация + режим учителя.
   ============================================================ */
const TEACHER_PASSWORD = "neuro2026";   // ← пароль учителя, меняй здесь

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const L = window.LESSON;

/* ---------------- состояние + сохранение ---------------- */
const SAVE_KEY = "neuro_lesson1";
const state = loadState();
function freshState(){ return { xp:0, doneMissions:[], doneTasks:[], badge:false }; }
function loadState(){
  try{ const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.xp!=null ? s : freshState(); }
  catch(e){ return freshState(); }
}
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} }
const has = (arr,id) => arr.indexOf(id)>=0;
const add = (arr,id) => { if(!has(arr,id)) arr.push(id); };

/* ---------------- уровни ---------------- */
const XP_PER_LEVEL = 100;
const levelOf = xp => Math.floor(xp / XP_PER_LEVEL) + 1;
function refreshHud(){
  $("#xp").textContent = state.xp;
  $("#lvl").textContent = levelOf(state.xp);
  const into = state.xp % XP_PER_LEVEL;
  $("#xpbar i").style.width = (into / XP_PER_LEVEL * 100) + "%";
}
function addXP(n, atEl){
  const before = levelOf(state.xp);
  state.xp += n; save();
  animateNum($("#xp"), state.xp);
  $("#lvl").textContent = levelOf(state.xp);
  $("#xpbar i").style.width = (state.xp % XP_PER_LEVEL / XP_PER_LEVEL * 100) + "%";
  if(atEl){ const r = atEl.getBoundingClientRect(); xpPop(n, r.left + r.width/2, r.top); }
  sfx.xp();
  if(levelOf(state.xp) > before){ setTimeout(()=>{ sfx.levelup(); mascot("Новый уровень — " + levelOf(state.xp) + "! Ты растёшь 🚀", 3500); }, 600); }
}
function animateNum(el,to){ let from=+el.textContent||0,t0=performance.now();
  (function tick(t){let k=Math.min(1,(t-t0)/500);el.textContent=Math.round(from+(to-from)*k);if(k<1)requestAnimationFrame(tick);})(performance.now()); }
function xpPop(n,x,y){ const p=document.createElement("div");p.className="xp-pop";p.textContent="+"+n+" XP";
  p.style.left=x+"px";p.style.top=y+"px";document.body.appendChild(p);setTimeout(()=>p.remove(),1100); }

/* ---------------- маскот ---------------- */
let mascotTimer=null;
function mascot(text, ms=4000){
  const el=$("#mascotSay"); el.textContent=text; el.classList.add("show");
  clearTimeout(mascotTimer); mascotTimer=setTimeout(()=>el.classList.remove("show"), ms);
}
const PRAISE=["Отлично! 🔥","Так держать!","Чисто сработано ✦","Ты разбираешься!","Красиво!","Вот это глаз!"];
const SOFT=["Почти! Глянь ещё раз 👀","Не страшно — теперь понятнее, почему.","Ошибка — это часть пути."];

/* ---------------- экраны ---------------- */
function go(name){
  $$(".screen").forEach(s=>s.classList.toggle("show", s.dataset.screen===name));
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------------- toast ---------------- */
function toast(m,ms=2600){ const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),ms); }

/* ============================================================
   КАРТА МИССИЙ
============================================================ */
function buildMap(){
  stopDemo(); stopTaskViz();
  $("#map-title").textContent = L.code + ". " + L.title;
  $("#map-sub").textContent = L.goal;
  const path=$("#path"); path.innerHTML="";
  L.missions.forEach((m,i)=>{
    const done = isMissionDone(m);
    const prevDone = teacherUnlock || i===0 || isMissionDone(L.missions[i-1]);
    const status = done ? "done" : prevDone ? "active" : "lock";
    const tag = done ? "пройдено" : status==="active" ? "открыто" : "🔒";
    const pin = done ? "✓" : (i+1);
    const node=document.createElement("div");
    node.className="node "+status;
    node.innerHTML=`<div class="pin">${pin}</div>
      <div class="body"><span class="mi">${m.icon}</span>
        <div><div class="ttl">${m.title}</div><div class="meta">${m.blurb}</div></div>
        <span class="tag">${tag}</span></div>`;
    if(status!=="lock") node.onclick=()=>startMission(i);
    path.appendChild(node);
  });
  go("map");
  $("#stepbar").classList.add("hidden");
  if(allDone()) $("#finishBar").style.display="";
}
const isMissionDone = m => m.tasks.every(t=>has(state.doneTasks,t.id));
const allDone = () => L.missions.every(isMissionDone);

/* ============================================================
   ЗАПУСК МИССИИ → ПОСЛЕДОВАТЕЛЬНОСТЬ ЗАДАНИЙ
============================================================ */
let cur = { mi:0, ti:0 };
let introIx = 0;
function startMission(mi){
  cur.mi=mi; cur.ti=0;
  sfx.whoosh();
  const m=L.missions[mi];
  if(m.intro && m.intro.slides && m.intro.slides.length){ introIx=0; renderIntro(); }
  else renderTask();
  mascot(m.icon + " Миссия «" + m.title + "». Поехали!", 3500);
}

/* ---------------- INTRO (слайды-теория) ---------------- */
let currentDemo=null;
function stopDemo(){ if(currentDemo && currentDemo.stop){ try{ currentDemo.stop(); }catch(e){} } currentDemo=null; }
function renderIntro(){
  const m=L.missions[cur.mi], slides=m.intro.slides, s=slides[introIx];
  go("intro");
  $("#stepbar").classList.add("hidden");
  stopDemo();
  const viz=$("#intro-viz");
  if(s.demo && window.DEMOS && DEMOS[s.demo]){
    viz.innerHTML=""; viz.classList.add("is-demo");
    currentDemo = DEMOS[s.demo](viz);
  } else {
    viz.classList.remove("is-demo");
    viz.innerHTML = (window.ILLO && ILLO[s.viz]) ? ILLO[s.viz] : "";
  }
  $("#intro-eyebrow").textContent = m.icon + " " + m.title;
  $("#intro-title").textContent = s.title;
  $("#intro-body").textContent = s.body;
  const pts=$("#intro-points"); pts.innerHTML="";
  if(s.points){ s.points.forEach(p=>{ const li=document.createElement("div"); li.className="intro-point";
    li.innerHTML='<span class="ip-dot"></span><span>'+p+'</span>'; pts.appendChild(li); }); }
  const dots=$("#intro-dots"); dots.innerHTML="";
  slides.forEach((_,i)=>{ const d=document.createElement("i"); d.className=i===introIx?"on":""; dots.appendChild(d); });
  $("#intro-back").textContent = introIx>0 ? "← Назад" : "← К карте";
  $("#intro-next").textContent = introIx<slides.length-1 ? "Дальше →" : "К заданиям →";
  renderIntroTeach(m);
}
function introNext(){
  const slides=L.missions[cur.mi].intro.slides;
  if(introIx<slides.length-1){ introIx++; renderIntro(); }
  else { sfx.whoosh(); renderTask(); }
}
function introBack(){
  if(introIx>0){ introIx--; renderIntro(); }
  else buildMap();
}
let taskCleanup=null;
function stopTaskViz(){ if(taskCleanup){ try{ taskCleanup(); }catch(e){} } taskCleanup=null; }
function renderTask(){
  const m=L.missions[cur.mi], task=m.tasks[cur.ti];
  stopDemo(); stopTaskViz();
  go("task");
  // вводная (student-facing) + сброс разбора
  const lead=$("#task-lead"); if(task.lead){ lead.innerHTML='<span class="tl-ic">💡</span><span>'+task.lead+'</span>'; lead.style.display=""; } else lead.style.display="none";
  const recap=$("#task-recap"); recap.style.display="none"; recap.innerHTML="";
  renderTaskTeach(task,m);
  // step bar
  const sb=$("#stepbar"); sb.classList.remove("hidden"); sb.innerHTML="";
  m.tasks.forEach((t,i)=>{ const x=document.createElement("i");
    x.className = i<cur.ti?"done":i===cur.ti?"active":""; sb.appendChild(x); });
  // head
  $("#q-step").textContent = "Миссия "+(cur.mi+1)+" · задание "+(cur.ti+1)+" из "+m.tasks.length;
  $("#q-title").textContent = task.q;
  $("#q-prompt").textContent = task.prompt;
  // body + banner reset
  $("#task-banner").className="banner"; $("#task-banner").innerHTML="";
  const body=$("#taskbody"); body.innerHTML="";
  const acts=$("#task-actions"); acts.innerHTML="";
  $("#task-hint").textContent="";
  // dispatch
  (RENDER[task.type]||RENDER.unknown)(task, body, acts);
}

/* shared: after grading a task */
function gradeDone(task, ok, total, opts={}){
  const pct = total ? Math.round(ok/total*100) : 100;
  const gained = opts.participation ? task.xp : Math.round(task.xp * ok/total);
  add(state.doneTasks, task.id); save();
  const b=$("#task-banner");
  const perfect = pct===100;
  (perfect ? sfx.great : sfx.correct)();
  b.className = "banner show " + (perfect?"ok":"mid");
  const checkBtn=$("#checkBtn"); if(checkBtn) checkBtn.style.display="none";
  b.innerHTML = `<span class="big">${perfect?"🎉":"👍"}</span>
    <span>${opts.msg || (ok+" из "+total+" верно")} · <b>+${gained} XP</b></span>`;
  addXP(gained, b);
  mascot(perfect ? PRAISE[Math.random()*PRAISE.length|0] : SOFT[Math.random()*SOFT.length|0], 3000);
  // краткий разбор (student-facing)
  if(task.recap){ const rc=$("#task-recap"); rc.innerHTML='<div class="tr-head">🔎 Разбор</div><p>'+task.recap+'</p>'; rc.style.display=""; }
  // next button
  const acts=$("#task-actions"); acts.innerHTML="";
  const last = cur.ti >= L.missions[cur.mi].tasks.length-1;
  const btn=document.createElement("button");
  btn.className="btn pink"; btn.textContent = last ? "Завершить миссию →" : "Дальше →";
  btn.onclick = ()=>{ if(last){ finishMission(); } else { cur.ti++; renderTask(); } };
  acts.appendChild(btn);
}
function finishMission(){
  const m=L.missions[cur.mi];
  add(state.doneMissions, m.id); save();
  if(cur.mi >= L.missions.length-1 && allDone()){ showResult(); }
  else { mascot("Миссия пройдена ✓ Возвращаю на карту.", 2600); buildMap(); }
}

/* primary check button helper */
function checkButton(label, onClick, disabled=true){
  const acts=$("#task-actions");
  const btn=document.createElement("button");
  btn.id="checkBtn"; btn.className="btn"; btn.textContent=label||"Проверить";
  btn.disabled=disabled; btn.onclick=onClick;
  acts.appendChild(btn);
  return btn;
}

/* ============================================================
   DRAG-ДВИЖОК (общий)
============================================================ */
function makeDraggable(card, root, onChange){
  card.addEventListener("pointerdown",e=>{
    if(card.classList.contains("locked")||card.classList.contains("used"))return;
    e.preventDefault();
    const r=card.getBoundingClientRect(), origin=card.parentElement;
    const offX=e.clientX-r.left, offY=e.clientY-r.top;
    card.setPointerCapture(e.pointerId); card.classList.add("dragging"); sfx.pickup();
    Object.assign(card.style,{width:r.width+"px",position:"fixed",left:r.left+"px",top:r.top+"px",zIndex:999});
    const move=ev=>{ card.style.left=(ev.clientX-offX)+"px"; card.style.top=(ev.clientY-offY)+"px";
      const z=zoneUnder(ev.clientX,ev.clientY,card,root);
      root.querySelectorAll(".dropzone").forEach(d=>d.classList.toggle("hover",d===z)); };
    const up=ev=>{ document.removeEventListener("pointermove",move); document.removeEventListener("pointerup",up);
      const z=zoneUnder(ev.clientX,ev.clientY,card,root);
      root.querySelectorAll(".dropzone").forEach(d=>d.classList.remove("hover"));
      Object.assign(card.style,{position:"",left:"",top:"",width:"",zIndex:""}); card.classList.remove("dragging");
      if(z){ dropInto(z,card,origin); sfx.drop(); } else origin.appendChild(card);
      onChange&&onChange(z,card); };
    document.addEventListener("pointermove",move); document.addEventListener("pointerup",up);
  });
}
function zoneUnder(x,y,card,root){ card.style.pointerEvents="none"; let el=document.elementFromPoint(x,y); card.style.pointerEvents="";
  if(!el)return null; const z=el.closest(".dropzone"); return (z&&root.contains(z))?z:null; }
function dropInto(zone,card,origin){
  const target=zone.querySelector(".slot-cards")||zone;
  if(zone.classList.contains("single")){ const ex=target.querySelector(".drag-card");
    if(ex&&ex!==card){ (origin.querySelector(".slot-cards")||origin).appendChild(ex); } }
  target.appendChild(card);
}
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; }

/* ============================================================
   РЕНДЕРЕРЫ ТИПОВ ЗАДАНИЙ
============================================================ */
const RENDER = {};

/* ---- unknown fallback ---- */
RENDER.unknown=(task,body)=>{ body.innerHTML="<p style='color:var(--on-soft)'>Тип задания «"+task.type+"» ещё в разработке.</p>"; };

/* ---------------- SORT (корзины) ---------------- */
RENDER.sort=(task,body)=>{
  const tray=document.createElement("div"); tray.className="tray dropzone"; tray.id="sortTray";
  const bins=document.createElement("div"); bins.className="bins";
  task.bins.forEach(b=>{ const el=document.createElement("div"); el.className="bin dropzone"; el.dataset.bin=b.id;
    el.innerHTML=`<div class="bin-label" style="color:${b.color}">${b.label}</div><div class="slot-cards"></div>`; bins.appendChild(el); });
  body.appendChild(tray); body.appendChild(bins);
  const root=$('[data-screen="task"]');
  const update=()=>{ btn.disabled = !!tray.querySelector(".drag-card"); };
  shuffle(task.cards).forEach((c,i)=>{ const el=document.createElement("div"); el.className="drag-card";
    el.dataset.bin=c.bin; el.innerHTML=`<span class="emo">${c.e}</span><span>${c.t}</span>`;
    tray.appendChild(el); makeDraggable(el,root,update); });
  $("#task-hint").textContent="Перетаскивай карточки пальцем или мышкой";
  const btn=checkButton("Проверить",()=>{
    let ok=0,total=task.cards.length;
    task.bins.forEach(b=>{ $$(`.bin[data-bin="${b.id}"] .drag-card`).forEach(c=>{
      const r=c.dataset.bin===b.id; c.classList.add(r?"correct":"wrong"); if(r)ok++; }); });
    $$("#sortTray .drag-card").forEach(c=>c.classList.add("wrong"));
    gradeDone(task,ok,total);
  });
};

/* ---------------- AXIS (миф ↔ правда) ---------------- */
RENDER.axis=(task,body)=>{
  const tray=document.createElement("div"); tray.className="tray dropzone"; tray.id="axisTray";
  const wrap=document.createElement("div"); wrap.className="axis-wrap";
  wrap.innerHTML=`<div class="axis-track"><span class="lab l">${task.leftLabel}</span><span class="lab r">${task.rightLabel}</span></div>
    <div class="axis-zones">
      <div class="axis-zone myth dropzone" data-side="myth"><div class="slot-cards"></div></div>
      <div class="axis-zone truth dropzone" data-side="truth"><div class="slot-cards"></div></div>
    </div>`;
  body.appendChild(tray); body.appendChild(wrap);
  const root=$('[data-screen="task"]');
  const update=()=>{ btn.disabled=!!tray.querySelector(".drag-card"); };
  shuffle(task.items).forEach(it=>{ const el=document.createElement("div"); el.className="drag-card";
    el.dataset.side=it.side; el.innerHTML=`<span>${it.t}</span>`; tray.appendChild(el); makeDraggable(el,root,update); });
  $("#task-hint").textContent="Перетащи каждое утверждение в свой конец шкалы";
  const btn=checkButton("Проверить",()=>{
    let ok=0,total=task.items.length;
    ["myth","truth"].forEach(side=>{ $$(`.axis-zone[data-side="${side}"] .drag-card`).forEach(c=>{
      const r=c.dataset.side===side; c.classList.add(r?"correct":"wrong"); if(r)ok++; }); });
    $$("#axisTray .drag-card").forEach(c=>c.classList.add("wrong"));
    gradeDone(task,ok,total);
  });
};

/* ---------------- ORDER (по порядку) ---------------- */
RENDER.order=(task,body)=>{
  const tray=document.createElement("div"); tray.className="order-tray dropzone"; tray.id="orderTray";
  const wrap=document.createElement("div"); wrap.className="order-wrap";
  task.steps.forEach((t,i)=>{ const slot=document.createElement("div"); slot.className="order-slot";
    slot.innerHTML=`<div class="num">${i+1}</div><div class="slot dropzone single" data-pos="${i}"></div>`; wrap.appendChild(slot); });
  body.appendChild(tray); body.appendChild(wrap);
  const root=$('[data-screen="task"]');
  const update=()=>{ btn.disabled=!!tray.querySelector(".drag-card"); };
  shuffle(task.steps.map((t,i)=>({t,i}))).forEach(o=>{ const el=document.createElement("div"); el.className="drag-card";
    el.dataset.correct=o.i; el.innerHTML=`<span>${o.t}</span>`; tray.appendChild(el); makeDraggable(el,root,update); });
  $("#task-hint").textContent="Перетащи карточки в слоты по порядку";
  const btn=checkButton("Проверить",()=>{
    let ok=0,total=task.steps.length;
    $$(".order-wrap .slot").forEach(s=>{ const c=s.querySelector(".drag-card"); if(!c)return;
      const r=+c.dataset.correct===+s.dataset.pos; c.classList.add(r?"correct":"wrong"); if(r)ok++; });
    $$("#orderTray .drag-card").forEach(c=>c.classList.add("wrong"));
    gradeDone(task,ok,total);
  });
};

/* ---------------- MATCH (пары) ---------------- */
const HUE=["#a78bfa","#5eead4","#f472b6","#fbbf24"];
RENDER.match=(task,body)=>{
  const m=document.createElement("div"); m.className="match";
  m.innerHTML=`<div class="col-h">Термин</div><div class="col-h">Что это значит</div>
    <div class="m-col" id="mLeft"></div><div class="m-col" id="mRight"></div>`;
  body.appendChild(m);
  let sel=null, links={};
  const left=body.querySelector("#mLeft"), right=body.querySelector("#mRight");
  task.pairs.forEach(p=>{ const l=document.createElement("div"); l.className="m-card"; l.dataset.k=p.k;
    l.innerHTML=`<span class="emo">${p.e}</span><span>${p.k}</span>`;
    l.onclick=()=>{ if(l.classList.contains("locked"))return; left.querySelectorAll(".m-card").forEach(c=>c.classList.remove("sel"));
      l.classList.add("sel"); sel=l; }; left.appendChild(l); });
  shuffle(task.pairs).forEach(p=>{ const r=document.createElement("div"); r.className="m-card"; r.dataset.k=p.k; r.textContent=p.v;
    r.onclick=()=>{ if(!sel||r.classList.contains("locked"))return; const k=sel.dataset.k;
      for(const kk in links){ if(kk===k||links[kk].right===r){ links[kk].left.classList.remove("linked"); links[kk].right.classList.remove("linked"); delete links[kk]; } }
      const hue=HUE[Object.keys(links).length%HUE.length]; sel.style.setProperty("--linkc",hue); r.style.setProperty("--linkc",hue);
      sel.classList.add("linked"); r.classList.add("linked"); sel.classList.remove("sel"); links[k]={left:sel,right:r}; sel=null;
      btn.disabled = Object.keys(links).length < task.pairs.length; };
    right.appendChild(r); });
  const btn=checkButton("Проверить",()=>{
    let ok=0; for(const k in links){ const {left:lc,right:rc}=links[k]; const r=rc.dataset.k===k;
      lc.classList.add("locked",r?"good":"bad"); rc.classList.add("locked",r?"good":"bad"); if(r)ok++; }
    gradeDone(task,ok,task.pairs.length);
  });
};

/* ---------------- BINARY (человек / ИИ, со стриком) ---------------- */
RENDER.binary=(task,body)=>{
  const vals = task.vals || ["ai","human"];
  const items=shuffle(task.items); let idx=0, ok=0, streak=0, maxStreak=0;
  const meta=document.createElement("div"); meta.className="binary-meta";
  meta.innerHTML=`<span id="bProg"></span><span class="streak" id="bStreak">серия 0</span>`;
  const stack=document.createElement("div"); stack.className="bin-stack";
  const btns=document.createElement("div"); btns.className="binary-btns";
  btns.innerHTML=`<button class="bbtn left">${task.leftLabel}</button><button class="bbtn right">${task.rightLabel}</button>`;
  body.appendChild(meta); body.appendChild(stack); body.appendChild(btns);
  const leftBtn=btns.querySelector(".left"), rightBtn=btns.querySelector(".right");
  $("#task-hint").textContent = "Цель: серия из "+(task.streakGoal||items.length)+" верных";
  function show(){
    const it=items[idx];
    body.querySelector("#bProg").textContent=(idx+1)+" / "+items.length;
    stack.innerHTML=`<div class="swipe-card"><div class="qt">${it.t}</div>${it.sub?`<div class="qs">${it.sub}</div>`:""}<div class="verdict"></div></div>`;
    leftBtn.disabled=rightBtn.disabled=false;
  }
  function answer(val){
    const it=items[idx]; const card=stack.querySelector(".swipe-card");
    leftBtn.disabled=rightBtn.disabled=true;
    const right = val===it.answer;
    if(right){ ok++; streak++; maxStreak=Math.max(maxStreak,streak); (streak>1?sfx.streak(streak):sfx.correct()); } else { streak=0; sfx.wrong(); }
    body.querySelector("#bStreak").textContent="серия "+streak;
    card.classList.add("reveal"); card.classList.add(right?"ok":"no");
    const truth = it.answer===vals[0]?task.leftLabel:task.rightLabel;
    card.querySelector(".verdict").innerHTML = (right?"✅ Верно — ":"❌ Это ")+ truth.replace(/^[^\wа-яА-Я]+/,'') + ". " + (it.why||"");
    if(right) xpPop(8, (window.innerWidth/2), card.getBoundingClientRect().top+20);
    setTimeout(()=>{ idx++; if(idx<items.length){ show(); }
      else { const goal=task.streakGoal||items.length; const msg = maxStreak>=goal
        ? "Серия "+maxStreak+"! Босс повержен 🏆" : "Лучшая серия: "+maxStreak;
        gradeDone(task, ok, items.length, {msg}); } }, right?900:1700);
  }
  leftBtn.onclick=()=>answer(vals[0]); rightBtn.onclick=()=>answer(vals[1]);
  show();
};

/* ---------------- HOTSPOT (найди ИИ на телефоне) ---------------- */
RENDER.hotspot=(task,body)=>{
  const need = task.spots.filter(s=>s.ai).length; let found=0;
  const wrap=document.createElement("div"); wrap.className="hot-wrap";
  const phone=document.createElement("div"); phone.className="phone";
  const scene=document.createElement("div"); scene.className="scene";
  phone.innerHTML=`<div class="notch"></div>`; phone.appendChild(scene);
  task.spots.forEach((s,i)=>{ const sp=document.createElement("div"); sp.className="spot";
    sp.style.cssText=`left:${s.x}%;top:${s.y}%;width:${s.w}%;height:${s.h}%`;
    sp.innerHTML=`<div><span class="si">${aiIcon(s.label)}</span>${s.label}</div>`;
    sp.onclick=()=>{ if(sp.classList.contains("found")||sp.classList.contains("done"))return;
      if(s.ai){ sp.classList.add("found"); sp.innerHTML=`<div><span class="si">✅</span>${s.label}<small>${s.note}</small></div>`;
        found++; sfx.coin(); xpPop(5, ...center(sp)); upd(); if(found>=need){ done(); } }
      else { sp.classList.add("miss"); sfx.wrong(); setTimeout(()=>sp.classList.remove("miss"),350);
        toast("Это не ИИ: "+s.note); }
    };
    scene.appendChild(sp); });
  wrap.appendChild(phone);
  const count=document.createElement("div"); count.className="hot-count"; count.id="hotCount";
  body.appendChild(count); body.appendChild(wrap);
  $("#task-hint").textContent="Тапай по тому, что использует ИИ. Промахи подсказывают.";
  function upd(){ count.textContent="Найдено ИИ: "+found+" / "+need; }
  function done(){ gradeDone(task, need, need, {participation:true, msg:"Все ИИ-элементы найдены"}); }
  upd();
};
function center(el){ const r=el.getBoundingClientRect(); return [r.left+r.width/2, r.top]; }
function aiIcon(label){ const map={"Подсказки текста":"⌨️","Распознавание лица":"🙂","Часы":"🕐","Лента видео":"🎬","Калькулятор":"🔢","Голосовой помощник":"🎙️"}; return map[label]||"●"; }

/* ---------------- TOKENS (разрежь фразу) ---------------- */
RENDER.tokens=(task,body)=>{
  const target=task.tokens; // целевое число кусочков
  const text=task.text; const chars=[...text];
  const out=document.createElement("div"); out.className="tok-out"; out.id="tokOut";
  const line=document.createElement("div"); line.className="tok-line";
  // строим символы с разрезами между ними
  chars.forEach((ch,i)=>{ const c=document.createElement("span"); c.className="tok-ch"; c.textContent= ch===" "?" ":ch; line.appendChild(c);
    if(i<chars.length-1){ const g=document.createElement("span"); g.className="tok-gap"; g.dataset.i=i;
      g.onclick=()=>{ g.classList.toggle("cut"); render(); }; line.appendChild(g); } });
  body.appendChild(out); body.appendChild(line);
  $("#task-hint").textContent="Тапай по разрезам. Нужно примерно "+target.length+" кусочка.";
  function render(){ const cuts=$$(".tok-gap.cut").map(g=>+g.dataset.i).sort((a,b)=>a-b);
    let pieces=[],start=0; cuts.forEach(ci=>{ pieces.push(text.slice(start,ci+1)); start=ci+1; }); pieces.push(text.slice(start));
    out.innerHTML=pieces.map(p=>`<span class="tok-piece">${p.replace(/ /g," ")}</span>`).join("");
    btn.disabled = pieces.length<2; }
  const btn=checkButton("Готово",()=>{
    const pieces = $$(".tok-piece").length;
    const okEnough = pieces>=2 && pieces<=target.length+2;
    gradeDone(task, okEnough?1:1, 1, {participation:true,
      msg:"Ты разбил на "+pieces+" токена. Так ИИ и видит текст"});
  });
  btn.disabled=true; render();
};

/* ---------------- NEXTWORD (угадай слово + вероятности) ---------------- */
RENDER.nextword=(task,body)=>{
  const rounds=task.rounds; let ri=0, ok=0;
  const rl=document.createElement("div"); rl.className="nw-round"; rl.id="nwRound";
  const pre=document.createElement("div"); pre.className="nw-prefix"; pre.id="nwPrefix";
  const opts=document.createElement("div"); opts.className="nw-opts"; opts.id="nwOpts";
  body.appendChild(rl); body.appendChild(pre); body.appendChild(opts);
  $("#task-hint").textContent="Выбери слово — потом увидишь реальные вероятности модели";
  function show(){
    const r=rounds[ri]; rl.textContent="Раунд "+(ri+1)+" из "+rounds.length;
    pre.innerHTML=r.prefix+' <span class="cursor">▮</span>';
    opts.innerHTML="";
    shuffle(r.options).forEach(o=>{ const el=document.createElement("div"); el.className="nw-opt";
      el.innerHTML=`<span>${o.w}</span><span class="pct"></span><span class="bar"></span>`;
      el.onclick=()=>pick(el,o,r); opts.appendChild(el); });
  }
  function pick(el,o,r){
    if(opts.classList.contains("locked"))return; opts.classList.add("locked");
    el.classList.add("picked");
    const max=Math.max(...r.options.map(x=>x.p));
    $$("#nwOpts .nw-opt").forEach((node,k)=>{ const data=[...node.querySelectorAll("span")];
      const w=node.querySelector("span").textContent; const opt=r.options.find(x=>x.w===w);
      node.classList.add("revealed"); node.querySelector(".pct").textContent=opt.p+"%";
      node.querySelector(".bar").style.width=opt.p+"%"; if(opt.p===max) node.classList.add("best"); });
    const right = o.w===r.answer;
    if(right){ ok++; sfx.correct(); } else { sfx.wrong(); }
    pre.innerHTML=r.prefix+' <b style="color:'+(right?'#34d399':'#fb7185')+'">'+o.w+'</b>';
    setTimeout(()=>{ ri++; if(ri<rounds.length){ opts.classList.remove("locked"); show(); }
      else gradeDone(task, ok, rounds.length, {msg:"Поймал "+ok+" из "+rounds.length+" — как настоящая модель"}); }, 2100);
  }
  show();
};

/* ---------------- FEED (покорми сеть) ---------------- */
RENDER.feed=(task,body)=>{
  let grow=0.22, fed=0; const goal=task.goal;
  const stage=document.createElement("div"); stage.className="feed-stage";
  const side=document.createElement("div"); side.className="feed-side";
  side.innerHTML=`<div class="feed-hint">Тащи примеры в сеть →</div>`;
  const cardsWrap=document.createElement("div"); cardsWrap.style.cssText="display:flex;flex-wrap:wrap;gap:9px;justify-content:center;max-width:240px";
  task.examples.forEach(ex=>{ const c=document.createElement("div"); c.className="feed-card";
    c.innerHTML=`<span class="e">${ex.e}</span><span>${ex.t}</span>`; cardsWrap.appendChild(c); });
  side.appendChild(cardsWrap);
  const target=document.createElement("div"); target.className="grow-target"; target.id="growT";
  target.innerHTML=`<canvas></canvas>`;
  stage.appendChild(side); stage.appendChild(target);
  const meter=document.createElement("div"); meter.className="grow-meter"; meter.id="growMeter";
  body.appendChild(stage); body.appendChild(meter);
  meter.textContent="рост сети: "+Math.round(grow*100)+"%  ·  скормлено 0/"+goal;
  const net=growNet(target.querySelector("canvas"), ()=>grow);
  $("#task-hint").textContent="Каждый пример делает сеть умнее";
  // drag feed cards onto target
  cardsWrap.querySelectorAll(".feed-card").forEach(fc=>{
    fc.addEventListener("pointerdown",e=>{ if(fc.classList.contains("used"))return; e.preventDefault();
      const r=fc.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;
      fc.setPointerCapture(e.pointerId); fc.classList.add("dragging");
      Object.assign(fc.style,{position:"fixed",left:r.left+"px",top:r.top+"px",width:r.width+"px",zIndex:900});
      const move=ev=>{ fc.style.left=(ev.clientX-ox)+"px"; fc.style.top=(ev.clientY-oy)+"px"; };
      const up=ev=>{ document.removeEventListener("pointermove",move); document.removeEventListener("pointerup",up);
        fc.classList.remove("dragging"); const dt=target.getBoundingClientRect();
        const inside=ev.clientX>dt.left&&ev.clientX<dt.right&&ev.clientY>dt.top&&ev.clientY<dt.bottom;
        Object.assign(fc.style,{position:"",left:"",top:"",width:"",zIndex:""});
        if(inside){ fc.classList.add("used"); fed++; grow=Math.min(1,grow+0.16); net.pulse();
          xpPop(5, ev.clientX, ev.clientY);
          meter.textContent="рост сети: "+Math.round(grow*100)+"%  ·  скормлено "+fed+"/"+goal;
          if(fed>=goal){ btn.disabled=false; mascot("Видишь? Сеть выросла. Так модель и учится ✦",3200); } }
      };
      document.addEventListener("pointermove",move); document.addEventListener("pointerup",up); });
  });
  const btn=checkButton("Готово",()=>gradeDone(task, 1,1,{participation:true, msg:"Сеть обучена на "+fed+" примерах"}));
  btn.disabled=true;
};

/* ---------------- SLIDER (данные → ум) ---------------- */
RENDER.slider=(task,body)=>{
  const st=task.stages; let i=0, maxReached=0;
  const q=document.createElement("div"); q.className="sl-q"; q.textContent=task.question;
  const lbl=document.createElement("div"); lbl.className="sl-stage-label"; lbl.id="slLabel";
  const out=document.createElement("div"); out.className="sl-out"; out.id="slOut";
  const ctl=document.createElement("div"); ctl.className="sl-control";
  ctl.innerHTML=`<span class="mono" style="font-size:11px;color:var(--on-soft)">мало</span>
    <input type="range" min="0" max="${st.length-1}" value="0" step="1" id="slRange">
    <span class="mono" style="font-size:11px;color:var(--on-soft)">много</span>`;
  body.appendChild(q); body.appendChild(lbl); body.appendChild(out); body.appendChild(ctl);
  const QCOL={"ужас":"#fb7185","так себе":"#fbbf24","умно":"#5eead4","гений":"#34d399"};
  const ROBO={"ужас":"😵","так себе":"😐","умно":"🙂","гений":"🤖"};
  function render(){ const s=st[i]; lbl.textContent=s.label;
    out.innerHTML=`<div class="robo">${ROBO[s.quality]||"🤖"}</div><div class="say">${s.out}</div>
      <div class="qual" style="color:${QCOL[s.quality]||"#5eead4"}">${s.quality}</div>`; }
  body.querySelector("#slRange").addEventListener("input",e=>{ i=+e.target.value; maxReached=Math.max(maxReached,i); render();
    btn.disabled = maxReached < st.length-1; });
  $("#task-hint").textContent="Доведи ползунок до конца — увидишь, каким умным станет ИИ";
  const btn=checkButton("Готово",()=>gradeDone(task,1,1,{participation:true,msg:"Больше данных — умнее ответ. Идея поймана"}));
  btn.disabled=true; render();
};

/* ---------------- TRAIN (обучи нейросеть: 3 ползунка → сеть + точность) ---------------- */
RENDER.train=(task,body)=>{
  const target=task.target||80;
  body.innerHTML=`<div class="panel">
    <canvas class="panel-canvas" id="trCv" style="height:170px"></canvas>
    <div class="gauge"><div class="gauge-track"><i class="gauge-fill" id="trFill"></i><span class="gauge-mark" style="left:${target}%"></span></div>
      <div class="gauge-cap"><span>точность модели</span><b id="trNum">0%</b></div></div>
    <div class="sliders" id="trSliders"></div></div>`;
  const defs=[{k:'data',label:'📦 Данные'},{k:'epochs',label:'🔁 Обучение'},{k:'size',label:'🕸️ Размер сети'}];
  const vals={data:20,epochs:30,size:40}, sl=body.querySelector('#trSliders');
  defs.forEach(d=>{ const row=document.createElement('div'); row.className='slider-row';
    row.innerHTML=`<span class="sl-label">${d.label}</span><input type="range" min="0" max="100" step="1" value="${vals[d.k]}" data-k="${d.k}"><span class="sl-val" data-v="${d.k}">${vals[d.k]}</span>`;
    sl.appendChild(row); });
  function acc(){ const d=vals.data/100,e=vals.epochs/100,s=vals.size/100;
    const a=0.08+0.52*d+0.18*e+0.22*s*d-0.35*Math.max(0,s-d-0.1); return Math.max(2,Math.min(99,Math.round(a*100))); }
  const fill=body.querySelector('#trFill'), num=body.querySelector('#trNum'); let solved=false;
  function update(){ const a=acc(); fill.style.width=a+'%';
    fill.style.background=a>=target?'linear-gradient(90deg,#34d399,#5eead4)':a>=50?'linear-gradient(90deg,#fbbf24,#f59e0b)':'linear-gradient(90deg,#fb7185,#f43f5e)';
    num.textContent=a+'%'; num.style.color=a>=target?'#34d399':a>=50?'#fbbf24':'#fb7185';
    btn.disabled=a<target; if(a>=target&&!solved){solved=true;sfx.correct();} }
  sl.addEventListener('input',e=>{ const k=e.target.dataset.k; vals[k]=+e.target.value; body.querySelector(`[data-v="${k}"]`).textContent=e.target.value; update(); });
  const cv=body.querySelector('#trCv'),ctx=cv.getContext('2d'); let W,H,DPR,nodes=[],raf,lastN=-1;
  function size(){DPR=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
  function rebuild(){ size(); const n=6+Math.round(vals.size/100*16); nodes=[]; for(let i=0;i<n;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,ph:Math.random()*6.3,c:['#5eead4','#a78bfa','#f472b6'][i%3]}); }
  function loop(t){ const n=6+Math.round(vals.size/100*16); if(n!==lastN){lastN=n;rebuild();}
    ctx.clearRect(0,0,W,H); const dataF=vals.data/100, ep=vals.epochs/100, MAXD=38+dataF*120;
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<MAXD){ctx.strokeStyle=`rgba(94,234,212,${(1-d/MAXD)*(0.18+dataF*0.55)})`;ctx.lineWidth=0.6+dataF;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
    nodes.forEach(nd=>{const r=Math.max(1.6,2+vals.size/100*3+Math.sin(t/400+nd.ph)*(0.5+ep*1.5));ctx.beginPath();ctx.arc(nd.x,nd.y,r,0,6.3);ctx.fillStyle=nd.c;ctx.globalAlpha=0.5+ep*0.5;ctx.fill();ctx.globalAlpha=1;});
    raf=requestAnimationFrame(loop); }
  rebuild(); raf=requestAnimationFrame(loop); taskCleanup=()=>cancelAnimationFrame(raf);
  $("#task-hint").textContent="Двигай ползунки и доведи точность до зелёной отметки ▮.";
  const btn=checkButton("Зафиксировать ✓",()=>gradeDone(task,1,1,{participation:true,msg:"Точность "+acc()+"% — модель обучена!"}));
  update();
};

/* ---------------- MORPH (подгони волну-сигнал под образец) ---------------- */
RENDER.morph=(task,body)=>{
  const tF=task.targetFreq||64, tA=task.targetAmp||70;
  body.innerHTML=`<div class="panel">
    <canvas class="panel-canvas" id="moCv" style="height:160px"></canvas>
    <div class="gauge"><div class="gauge-track"><i class="gauge-fill" id="moFill"></i></div>
      <div class="gauge-cap"><span>совпадение с образцом</span><b id="moNum">0%</b></div></div>
    <div class="sliders" id="moSliders"></div></div>`;
  const defs=[{k:'freq',label:'〰️ Частота'},{k:'amp',label:'📏 Амплитуда'}];
  const vals={freq:20,amp:30}, sl=body.querySelector('#moSliders');
  defs.forEach(d=>{ const row=document.createElement('div');row.className='slider-row';
    row.innerHTML=`<span class="sl-label">${d.label}</span><input type="range" min="5" max="100" step="1" value="${vals[d.k]}" data-k="${d.k}"><span class="sl-val" data-v="${d.k}">${vals[d.k]}</span>`;
    sl.appendChild(row); });
  function match(){ return Math.max(0,Math.round(100-(Math.abs(vals.freq-tF)+Math.abs(vals.amp-tA))*1.6)); }
  const fill=body.querySelector('#moFill'),num=body.querySelector('#moNum'); let solved=false;
  function update(){ const m=match(); fill.style.width=m+'%';
    fill.style.background=m>=90?'linear-gradient(90deg,#34d399,#5eead4)':'linear-gradient(90deg,#a78bfa,#5eead4)';
    num.textContent=m+'%'; num.style.color=m>=90?'#34d399':'#a78bfa'; btn.disabled=m<90; if(m>=90&&!solved){solved=true;sfx.correct();} }
  sl.addEventListener('input',e=>{const k=e.target.dataset.k;vals[k]=+e.target.value;body.querySelector(`[data-v="${k}"]`).textContent=e.target.value;update();});
  const cv=body.querySelector('#moCv'),ctx=cv.getContext('2d');let W,H,DPR,raf;
  function size(){DPR=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
  function wave(freq,amp,color,t,lw){ ctx.beginPath(); const f=0.5+freq/100*4, a=amp/100*(H/2-12);
    for(let x=0;x<=W;x+=3){ const y=H/2+Math.sin((x/W)*Math.PI*2*f+t/520)*a; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.stroke(); }
  function loop(t){ ctx.clearRect(0,0,W,H); wave(tF,tA,'rgba(255,255,255,.3)',t,5); const m=match(); wave(vals.freq,vals.amp,m>=90?'#34d399':'#5eead4',t,2.5); raf=requestAnimationFrame(loop); }
  size(); raf=requestAnimationFrame(loop); taskCleanup=()=>cancelAnimationFrame(raf); const onR=()=>size(); addEventListener('resize',onR);
  $("#task-hint").textContent="Подгони свою бирюзовую волну под белый образец.";
  const btn=checkButton("Поймал ✓",()=>{removeEventListener('resize',onR);gradeDone(task,1,1,{participation:true,msg:"Сигнал пойман — совпадение "+match()+"%!"});});
  update();
};

/* ---------------- GENERATE (ИИ генерит варианты, ползунок «креатив») ---------------- */
RENDER.generate=(task,body)=>{
  const pools=task.pools;
  body.innerHTML=`<div class="panel">
    <div class="gen-prompt">${task.prompt2||'Сгенерируй ответ'}</div>
    <div class="gen-out" id="genOut"><span class="gen-placeholder">нажми «Сгенерировать»</span></div>
    <div class="gauge"><div class="gauge-track gen-zones"><i class="gauge-knob" id="genKnob"></i></div>
      <div class="gauge-cap"><span id="genZone">креатив: в самый раз</span></div></div>
    <div class="slider-row"><span class="sl-label">🎲 Креатив</span><input type="range" min="0" max="100" step="1" value="50" id="genSlider"><span class="sl-val" id="genVal">50</span></div>
    <button class="gen-btn" id="genBtn">✨ Сгенерировать</button></div>`;
  let cre=50;
  const out=body.querySelector('#genOut'), knob=body.querySelector('#genKnob'), zone=body.querySelector('#genZone');
  const zoneOf=c=>c<28?'boring':c>72?'chaos':'good';
  function paint(){ knob.style.left=cre+'%'; const z=zoneOf(cre);
    zone.textContent=z==='boring'?'креатив: скучно':z==='chaos'?'креатив: хаос':'креатив: в самый раз';
    zone.style.color=z==='good'?'#34d399':z==='chaos'?'#fb7185':'#94a0c0'; }
  body.querySelector('#genSlider').addEventListener('input',e=>{cre=+e.target.value;body.querySelector('#genVal').textContent=cre;paint();});
  body.querySelector('#genBtn').onclick=()=>{ const z=zoneOf(cre), pool=pools[z], txt=pool[Math.random()*pool.length|0];
    out.className='gen-out '+z; out.innerHTML='<span class="gen-text">'+txt+'</span>'; sfx.blip();
    if(z==='good') btn.disabled=false; };
  $("#task-hint").textContent="Поставь креатив в зелёную середину и сгенерируй живой ответ.";
  const btn=checkButton("Оставить этот →",()=>gradeDone(task,1,1,{participation:true,msg:"Поймал золотую середину креатива!"}));
  btn.disabled=true; paint();
};

/* ============================================================
   РЕЗУЛЬТАТ
============================================================ */
function showResult(){
  stopDemo(); stopTaskViz();
  state.badge=true; save(); go("result"); sfx.win();
  // считаем "процент" как долю идеально (тут упрощённо: все задания сделаны)
  const totalTasks = L.missions.reduce((n,m)=>n+m.tasks.length,0);
  const pct = Math.round(state.doneTasks.length/totalTasks*100);
  const off=540-540*pct/100;
  setTimeout(()=>{ $("#ring").style.transition="stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)"; $("#ring").style.strokeDashoffset=off; },150);
  let n=0; const iv=setInterval(()=>{ n+=2; if(n>=pct){n=pct;clearInterval(iv);} $("#pct").textContent=n+"%"; },20);
  const stars = pct>=95?3:pct>=70?2:1;
  $("#stars").textContent="★".repeat(stars)+"☆".repeat(3-stars);
  $("#res-badge-ic").textContent=L.badge.icon; $("#res-badge-name").textContent="«"+L.badge.name+"»";
  $("#res-xp").textContent="Всего "+state.xp+" XP · уровень "+levelOf(state.xp);
  $("#res-title").textContent = pct>=95?"Блестяще!":pct>=70?"Отличный старт!":"Урок пройден!";
  $("#res-sub").textContent = "Ты понял, что такое ИИ, увидел его секрет и научился отличать его от человека. Дальше — Урок 2: как приручить творчество ИИ.";
  mascot("Поздравляю! Бейдж «"+L.badge.name+"» твой 🏅",4000);
}

/* ============================================================
   ФОНОВАЯ + РАСТУЩАЯ НЕЙРОСЕТЬ
============================================================ */
function bgNet(canvas){
  const ctx=canvas.getContext("2d"); let W,H,DPR,nodes=[];
  const C=["#5eead4","#a78bfa","#f472b6"];
  function size(){DPR=Math.min(2,devicePixelRatio||1);W=canvas.clientWidth=innerWidth;H=canvas.clientHeight=innerHeight;
    canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
  function init(){size();nodes=[];const n=Math.round(W*H/26000);
    for(let i=0;i<n;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:1.4+Math.random()*1.8,act:0,c:C[i%3],ph:Math.random()*6.3});}
  const MAXD=160; let last=0;
  function fire(nd,s,hop){nd.act=Math.max(nd.act,s);if(hop<=0)return;nodes.forEach(o=>{if(o!==nd&&Math.hypot(o.x-nd.x,o.y-nd.y)<MAXD)setTimeout(()=>fire(o,s*.6,hop-1),90);});}
  function loop(t){ if(!W){requestAnimationFrame(loop);return;}
    ctx.clearRect(0,0,W,H);
    if(t-last>1800){last=t;fire(nodes[Math.random()*nodes.length|0],1,3);}
    for(const nd of nodes){nd.x+=nd.vx;nd.y+=nd.vy;if(nd.x<3||nd.x>W-3)nd.vx*=-1;if(nd.y<3||nd.y>H-3)nd.vy*=-1;nd.act*=.96;}
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<MAXD){const al=1-d/MAXD,act=Math.max(a.act,b.act);
        ctx.strokeStyle=act>.15?`rgba(244,114,182,${.12+act*.4})`:`rgba(167,139,250,${al*.07})`;
        ctx.lineWidth=act>.15?1.1:.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
    for(const nd of nodes){const R=nd.r*(1+Math.sin(t/700+nd.ph)*.2)+nd.act*3;
      ctx.beginPath();ctx.arc(nd.x,nd.y,R,0,6.3);ctx.fillStyle=nd.act>.1?"#fff7ad":nd.c;ctx.globalAlpha=.4+nd.act*.5;ctx.fill();ctx.globalAlpha=1;}
    requestAnimationFrame(loop);}
  init();requestAnimationFrame(loop);
  addEventListener("resize",init);
}
function growNet(canvas, getGrow){
  const ctx=canvas.getContext("2d"); let W,H,DPR,nodes=[];
  function size(){DPR=Math.min(2,devicePixelRatio||1);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
  function init(){size();nodes=[];const n=16;for(let i=0;i<n;i++){const a=i/n*6.28;nodes.push({a,rad:.4+Math.random()*.5,act:0,ph:Math.random()*6.3});}}
  function loop(t){ if(!W){requestAnimationFrame(loop);return;} const grow=getGrow();
    ctx.clearRect(0,0,W,H);const cx=W/2,cy=H/2;const base=Math.min(W,H)/2-12;const R=base*(0.45+grow*0.55);
    const pts=nodes.map(nd=>{const rr=R*nd.rad*(1+Math.sin(t/700+nd.ph)*.12*(0.4+grow));return[cx+Math.cos(nd.a)*rr,cy+Math.sin(nd.a)*rr];});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);
      if(d<R*0.9){ctx.strokeStyle=`rgba(94,234,212,${(1-d/(R*0.9))*0.25*(0.4+grow)})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(...pts[i]);ctx.lineTo(...pts[j]);ctx.stroke();}}
    pts.forEach((p,i)=>{const act=nodes[i].act;nodes[i].act*=.93;const r=2+grow*3+act*4;
      if(act>.1){ctx.beginPath();ctx.arc(p[0],p[1],r+5,0,6.3);ctx.fillStyle=`rgba(255,200,120,${act*.2})`;ctx.fill();}
      ctx.beginPath();ctx.arc(p[0],p[1],r,0,6.3);ctx.fillStyle=act>.1?"#fff7ad":["#5eead4","#a78bfa"][i%2];ctx.globalAlpha=.55+grow*.4;ctx.fill();ctx.globalAlpha=1;});
    ctx.beginPath();ctx.arc(cx,cy,R*0.3,0,6.3);const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.5);
    grd.addColorStop(0,`rgba(94,234,212,${0.18+grow*0.25})`);grd.addColorStop(1,"rgba(94,234,212,0)");ctx.fillStyle=grd;ctx.fill();
    requestAnimationFrame(loop);}
  init();requestAnimationFrame(loop);
  return { pulse:()=>nodes.forEach((nd,i)=>setTimeout(()=>nd.act=1,i*25)) };
}

/* ============================================================
   РЕЖИМ УЧИТЕЛЯ
============================================================ */
function openTeacher(){
  $("#tov").classList.add("show");
  if(teacherMode){ $("#tovLock").style.display="none"; $("#tovPanel").style.display=""; buildTeacher(); return; }
  $("#tovLock").style.display=""; $("#tovPanel").style.display="none";
  $("#tovPass").value=""; $("#tovErr").textContent=""; setTimeout(()=>$("#tovPass").focus(),100);
}
function closeTeacher(){ $("#tov").classList.remove("show"); }
function tryTeacher(){
  if($("#tovPass").value.trim()===TEACHER_PASSWORD){
    teacherMode=true; try{ localStorage.setItem(TKEY,"1"); }catch(e){} applyTeacherUI();
    $("#tovLock").style.display="none"; $("#tovPanel").style.display=""; buildTeacher();
  } else { $("#tovErr").textContent="Неверный пароль"; $("#tovPass").value=""; }
}
function buildTeacher(){
  const p=$("#tovPanel"); const tb=L.teacherBrief;
  let html=`<button class="tov-close" onclick="closeTeacher()">×</button>
    <h2>Методичка · ${L.code}</h2><div class="tov-sub">${L.title} — что говорить и зачем</div>
    <div class="tov-brief"><h3>🎯 Цель урока</h3><p>${tb.aim}</p>
      <p><b style="color:var(--gold)">Крючок:</b> ${tb.bigHook}</p>
      <p><b>Ритм:</b> ${tb.rhythm}</p>
      <h3 style="margin-top:10px">Советы</h3><ul>${tb.tips.map(t=>`<li>${t}</li>`).join("")}</ul></div>
    <div class="tov-note">👩‍🏫 Памятка теперь встроена в урок: на каждом слайде и задании ты видишь подсказку «что рассказать». Ученикам она не видна.</div>
    <button class="tov-open big" onclick="teacherUnlockAll()">🔓 Открыть все миссии на карте</button>
    <button class="tov-open big danger" onclick="exitTeacher()">🚪 Выйти из режима учителя</button>`;
  L.missions.forEach((m,mi)=>{
    html+=`<div class="tov-m" ${mi===0?'':''}><div class="tov-m-head" onclick="this.parentElement.classList.toggle('open')">
      <span class="mi">${m.icon}</span><span class="tt">${m.title}</span><span class="tm">${m.teach.timing||""}</span>
      <span class="chev">▾</span></div><div class="tov-m-body">
      ${m.intro&&m.intro.slides?`<div class="tov-block"><div class="tlabel" style="color:var(--gold)">Вступление · ${m.intro.slides.length} ${m.intro.slides.length===1?'слайд':'слайда'} <button class="tov-open" onclick="openIntro(${mi})">▶ открыть слайды</button></div><p>${m.intro.slides.map(s=>'«'+s.title+'»').join(' → ')}</p></div>`:''}
      <div class="tov-block before"><div class="tlabel">До миссии — скажи</div><p>${m.teach.before}</p></div>
      <div class="tov-block after"><div class="tlabel">После миссии — подведи</div><p>${m.teach.after}</p></div>`;
    m.tasks.forEach((t,ti)=>{ const te=t.teach||{};
      html+=`<div class="tov-task"><div class="qn">${ti+1}. ${t.q} <span style="color:var(--on-dim);font-weight:400">· +${t.xp} XP · ${typeRu(t.type)}</span> <button class="tov-open" onclick="openTask(${mi},${ti})">▶ открыть</button></div>`;
      if(te.note) html+=`<div class="row"><span class="k">мысль</span><span>${te.note}</span></div>`;
      if(te.ask) html+=`<div class="row"><span class="k">спроси</span><span>${te.ask}</span></div>`;
      if(te.boss) html+=`<div class="row"><span class="k">босс</span><span>${te.boss}</span></div>`;
      if(te.answer) html+=`<div class="row"><span class="k">ответ</span><span class="ans">${te.answer}</span></div>`;
      html+=`</div>`;
    });
    html+=`</div></div>`;
  });
  p.innerHTML=html;
}
function typeRu(t){ return {sort:"сортировка",axis:"шкала",order:"порядок",match:"пары",binary:"выбор",hotspot:"поиск",tokens:"токены",nextword:"вероятности",feed:"кормёжка сети",slider:"ползунок",train:"пульт · обучение",morph:"пульт · сигнал",generate:"пульт · генерация"}[t]||t; }

/* ---------------- режим учителя (встроенная памятка) ---------------- */
let teacherMode=false;
const TKEY="neuro_teacher";
function loadTeacherMode(){ try{ return localStorage.getItem(TKEY)==="1"; }catch(e){ return false; } }
function applyTeacherUI(){ const b=$("#teachBtn"); if(b){ b.classList.toggle("tbtn-on",teacherMode); b.textContent=teacherMode?"👩‍🏫":"🔑"; b.title=teacherMode?"Режим учителя · памятка видна":"Вход для учителя"; } }
function exitTeacher(){ teacherMode=false; try{ localStorage.removeItem(TKEY); }catch(e){} applyTeacherUI(); closeTeacher();
  // перерисовать текущий экран, чтобы убрать заметки
  const sc=document.querySelector(".screen.show")?.dataset.screen;
  if(sc==="task") renderTask(); else if(sc==="intro") renderIntro();
  toast("Режим учителя выключен"); }
/* HTML встроенной заметки для задания */
function teachTaskHTML(t,isLast,m){
  const te=t.teach||{}; let rows="";
  if(te.note) rows+=`<div class="tn-row"><span class="tn-k">мысль</span><span>${te.note}</span></div>`;
  if(te.ask) rows+=`<div class="tn-row"><span class="tn-k">спроси</span><span>${te.ask}</span></div>`;
  if(te.boss) rows+=`<div class="tn-row"><span class="tn-k">босс</span><span>${te.boss}</span></div>`;
  if(te.answer) rows+=`<div class="tn-row"><span class="tn-k">ответ</span><span class="tn-ans">${te.answer}</span></div>`;
  if(isLast && m.teach && m.teach.after) rows+=`<div class="tn-row"><span class="tn-k" style="color:var(--violet)">итог</span><span>${m.teach.after}</span></div>`;
  return `<div class="tn-head">👩‍🏫 Только учителю</div>${rows}`;
}
function renderTaskTeach(task,m){
  const tt=$("#task-teach"); if(!tt) return;
  if(teacherMode){ tt.innerHTML=teachTaskHTML(task, cur.ti===m.tasks.length-1, m); tt.style.display=""; }
  else tt.style.display="none";
}
function renderIntroTeach(m){
  const it=$("#intro-teach"); if(!it) return;
  if(teacherMode){ const te=m.teach||{};
    it.innerHTML=`<div class="tn-head">👩‍🏫 Только учителю${te.timing?" · "+te.timing:""}</div>`+
      (te.before?`<div class="tn-row"><span class="tn-k">скажи</span><span>${te.before}</span></div>`:"");
    it.style.display=""; } else it.style.display="none";
}

/* учитель: открыть любое задание / слайды / разблокировать карту */
let teacherUnlock=false;
function openTask(mi,ti){ closeTeacher(); cur.mi=mi; cur.ti=ti; renderTask(); }
function openIntro(mi){ closeTeacher(); cur.mi=mi; introIx=0;
  const m=L.missions[mi]; if(m.intro&&m.intro.slides&&m.intro.slides.length) renderIntro(); else { cur.ti=0; renderTask(); } }
function teacherUnlockAll(){ teacherUnlock=true; closeTeacher(); buildMap(); toast("Все миссии открыты на карте"); }

/* ---------------- звук ---------------- */
function toggleSound(){ const on=sfx.toggle(); const mb=$("#muteBtn"); if(mb) mb.textContent= on?"🔊":"🔇"; toast(on?"Звук включён":"Звук выключен"); }

/* ============================================================
   СТАРТ
============================================================ */
function bootApp(){
  // hud
  refreshHud();
  $("#xp").textContent=state.xp; $("#lvl").textContent=levelOf(state.xp);
  $("#xpbar i").style.width=(state.xp%XP_PER_LEVEL/XP_PER_LEVEL*100)+"%";
  // hero texts
  $("#hero-title").innerHTML=`Собери свой <span class="grad">ИИ</span>`;
  $("#hero-lede").textContent="Без скучных лекций. Двигай, собирай, разбирайся — и через урок начни понимать ИИ насквозь.";
  // bg net
  bgNet($("#bgnet"));
  // teacher mode (restore)
  teacherMode=loadTeacherMode(); applyTeacherUI();
  // sound
  const mb=$("#muteBtn"); if(mb) mb.textContent = sfx.isOn()?"🔊":"🔇";
  document.addEventListener("pointerdown", ()=>sfx.unlock(), {passive:true});
  document.addEventListener("click", e=>{ if(e.target.closest(".btn,.tbtn,.node:not(.lock),.bbtn,.pick")) sfx.click(); }, true);
}
function startCourse(){ buildMap(); }
function restart(){ Object.assign(state, freshState()); save(); refreshHud(); toast("Прогресс сброшен"); go("hero"); }

document.addEventListener("DOMContentLoaded", bootApp);
