/* ============================================================
   НЕЙРО · интерактивные демо для слайдов
   DEMOS[name](container) -> { stop } для очистки rAF/слушателей.
   ============================================================ */
window.DEMOS = (function(){

  /* ---------- 1. Живая нейросеть: тапни — побежит импульс ---------- */
  function neuralPlayground(box){
    box.innerHTML = `<canvas class="demo-canvas" style="height:190px"></canvas>
      <div class="demo-hint">тапни по сети — пусти импульс ✦</div>`;
    const cv=box.querySelector("canvas"), ctx=cv.getContext("2d");
    let W,H,DPR,nodes=[],raf,fires=0;
    const C=["#5eead4","#a78bfa","#f472b6"];
    function size(){DPR=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
    function init(){size();nodes=[];const n=Math.max(12,Math.round(W/26));
      for(let i=0;i<n;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:2+Math.random()*2.2,act:0,c:C[i%3],ph:Math.random()*6.3});}
    const MAXD=110;
    function fire(nd,s,hop){nd.act=Math.max(nd.act,s);if(hop<=0)return;nodes.forEach(o=>{if(o!==nd&&Math.hypot(o.x-nd.x,o.y-nd.y)<MAXD)setTimeout(()=>fire(o,s*.62,hop-1),70);});}
    function loop(t){
      ctx.clearRect(0,0,W,H);
      for(const nd of nodes){nd.x+=nd.vx;nd.y+=nd.vy;if(nd.x<4||nd.x>W-4)nd.vx*=-1;if(nd.y<4||nd.y>H-4)nd.vy*=-1;nd.act*=.95;}
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<MAXD){const al=1-d/MAXD,act=Math.max(a.act,b.act);
          ctx.strokeStyle=act>.15?`rgba(244,114,182,${.22+act*.5})`:`rgba(167,139,250,${al*.16})`;ctx.lineWidth=act>.15?1.3:.6;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
      for(const nd of nodes){const R=nd.r*(1+Math.sin(t/600+nd.ph)*.18)+nd.act*4;
        if(nd.act>.1){ctx.beginPath();ctx.arc(nd.x,nd.y,R+6,0,6.3);ctx.fillStyle=`rgba(244,114,182,${nd.act*.16})`;ctx.fill();}
        ctx.beginPath();ctx.arc(nd.x,nd.y,R,0,6.3);ctx.fillStyle=nd.act>.1?"#fff7ad":nd.c;ctx.globalAlpha=.55+nd.act*.45;ctx.fill();ctx.globalAlpha=1;}
      raf=requestAnimationFrame(loop);
    }
    function tap(e){const r=cv.getBoundingClientRect();let near=nodes[0],min=1e9;
      for(const nd of nodes){const d=Math.hypot(nd.x-(e.clientX-r.left),nd.y-(e.clientY-r.top));if(d<min){min=d;near=nd;}}
      if(near){fire(near,1,3); if(window.sfx)sfx.blip(); fires++;
        if(fires===3) box.querySelector(".demo-hint").textContent="видишь? сигнал бежит по связям — так «думает» сеть";}}
    cv.addEventListener("pointerdown",tap);
    const onResize=()=>init();
    init();raf=requestAnimationFrame(loop);addEventListener("resize",onResize);
    return {stop(){cancelAnimationFrame(raf);removeEventListener("resize",onResize);}};
  }

  /* ---------- 2. Живой токенизатор: печатаешь — видишь токены ---------- */
  function tokenize(text){
    const out=[]; const re=/(\s+|[.,!?;:—()«»"]+|[^\s.,!?;:—()«»"]+)/g; let m;
    while((m=re.exec(text))!==null){
      let chunk=m[0];
      if(/^[^\s.,!?;:—()«»"]+$/.test(chunk) && chunk.length>4){
        for(let i=0;i<chunk.length;i+=3) out.push(chunk.slice(i,i+3));
      } else out.push(chunk);
    }
    return out.filter(t=>t.length);
  }
  function tokenizer(box){
    box.innerHTML = `<div class="demo-tok">
      <input class="demo-input" maxlength="60" value="Привет, как у тебя дела?" />
      <div class="tok-chips" id="tokChips"></div>
      <div class="demo-hint">печатай свой текст — смотри, как ИИ режет его на токены ✦ <b id="tokCount"></b></div>
    </div>`;
    const inp=box.querySelector(".demo-input"), chips=box.querySelector("#tokChips"), cnt=box.querySelector("#tokCount");
    function render(){
      const toks=tokenize(inp.value);
      chips.innerHTML=toks.map(t=>{
        const sp=/^\s+$/.test(t); const disp=t.replace(/ /g,"␣");
        return `<span class="tok-chip${sp?' sp':''}">${disp||"␣"}</span>`;
      }).join("");
      cnt.textContent="· "+toks.length+" токенов";
    }
    inp.addEventListener("input",render); render();
    return {stop(){}};
  }

  /* ---------- 3. Песочница предсказания: веди ИИ по словам ---------- */
  const PRED={
    "": [["Я",34],["Кот",30],["Сегодня",22],["Мама",14]],
    "я":[["люблю",38],["хочу",30],["вижу",18],["думаю",14]],
    "кот":[["сидит",38],["спит",30],["прыгнул",20],["мяукнул",12]],
    "сегодня":[["солнечно",34],["дождь",28],["праздник",22],["холодно",16]],
    "мама":[["готовит",36],["сказала",30],["купила",20],["спит",14]],
    "люблю":[["пить",30],["играть",28],["рисовать",24],["читать",18]],
    "хочу":[["есть",34],["спать",30],["гулять",22],["мороженое",14]],
    "пить":[["чай",52],["кофе",33],["сок",13],["компот",2]],
    "сидит":[["на",46],["тихо",24],["дома",18],["рядом",12]],
    "на":[["окне",30],["диване",28],["столе",24],["крыше",18]],
    "чай":[["с",40],["утром",30],["вкусный",20],[".",10]],
    "_def":[["и",30],["потом",26],["очень",24],[".",20]]
  };
  function predictor(box){
    box.innerHTML = `<div class="demo-pred">
      <div class="pred-sentence" id="predS"><span class="cursor">▮</span></div>
      <div class="pred-sug" id="predSug"></div>
      <button class="pred-reset" id="predReset">↺ сначала</button>
      <div class="demo-hint">ты — нейросеть. выбирай следующее слово и смотри на вероятности ✦</div>
    </div>`;
    const S=box.querySelector("#predS"), SUG=box.querySelector("#predSug");
    let words=[];
    function last(){ return words.length? words[words.length-1].toLowerCase().replace(/[.,!?]/g,""):""; }
    function draw(){
      S.innerHTML = words.map(w=>`<span class="pw">${w}</span>`).join(" ") + (done()?' <b class="pred-done">✓ готово</b>':' <span class="cursor">▮</span>');
      if(done()){ SUG.innerHTML=`<div class="pred-fin">Так ИИ и пишет — по словечку, каждый раз выбирая вероятное.</div>`; return; }
      const opts=(PRED[last()]||PRED["_def"]).slice().sort((a,b)=>b[1]-a[1]);
      SUG.innerHTML=opts.map(([w,p])=>`<button class="pred-opt" data-w="${w}"><span class="pw-l">${w==="."?"⏹ точка":w}</span><span class="pred-bar" style="width:${p}%"></span><span class="pred-pct">${p}%</span></button>`).join("");
      SUG.querySelectorAll(".pred-opt").forEach(b=>b.onclick=()=>pick(b.dataset.w));
    }
    function done(){ return words.length && words[words.length-1]==="."; }
    function pick(w){ words.push(w); if(window.sfx)sfx.click(); draw(); }
    box.querySelector("#predReset").onclick=()=>{ words=[]; if(window.sfx)sfx.blip(); draw(); };
    draw();
    return {stop(){}};
  }

  /* ---------- 4. Облако vs твой ноут (+ выключить Wi-Fi) ---------- */
  function localVsCloud(box){
    box.innerHTML = `<div class="lvc">
      <div class="lvc-toggle">
        <button class="lvc-opt active" data-mode="cloud">☁️ Облако</button>
        <button class="lvc-opt" data-mode="local">💻 На ноуте</button>
      </div>
      <div class="lvc-scene" data-mode="cloud" data-net="on">
        <div class="lvc-node lvc-device">💻<small>твой ноут</small></div>
        <div class="lvc-track"><i class="pkt"></i><i class="pkt"></i><i class="pkt"></i></div>
        <div class="lvc-node lvc-cloud">☁️<small>чужой сервер</small></div>
      </div>
      <div class="lvc-status" id="lvcStatus"></div>
      <button class="lvc-wifi" id="lvcWifi">📴 Выключить Wi-Fi</button>
    </div>`;
    const scene=box.querySelector(".lvc-scene"), status=box.querySelector("#lvcStatus"), wifi=box.querySelector("#lvcWifi");
    let mode="cloud", net="on";
    function update(){
      scene.dataset.mode=mode; scene.dataset.net=net;
      box.querySelectorAll(".lvc-opt").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
      wifi.textContent = net==="on" ? "📴 Выключить Wi-Fi" : "📶 Включить Wi-Fi";
      if(mode==="cloud"){
        status.className="lvc-status cloud";
        status.innerHTML = net==="on"
          ? "🌐 Данные уходят на чужой сервер. Нужен интернет."
          : "❌ Связи нет — облачный ИИ молчит.";
      } else {
        status.className="lvc-status local";
        status.innerHTML = net==="on"
          ? "🔒 Работает прямо на ноуте. Только твоё."
          : "✦ Wi-Fi выключен — а твой ИИ всё равно отвечает!";
      }
    }
    box.querySelectorAll(".lvc-opt").forEach(b=>b.onclick=()=>{ mode=b.dataset.mode; if(window.sfx)sfx.click(); update(); });
    wifi.onclick=()=>{ net = net==="on"?"off":"on"; if(window.sfx)(net==="off"?sfx.wrong:sfx.correct)(); update(); };
    update();
    return {stop(){}};
  }

  return { neuralPlayground, tokenizer, predictor, localVsCloud };
})();
