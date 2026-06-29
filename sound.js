/* ============================================================
   НЕЙРО · звук
   Процедурный Web Audio — без файлов, работает офлайн.
   Короткие, мягкие, неназойливые сигналы + переключатель.
   ============================================================ */
window.sfx = (function(){
  let ctx, master, noiseBuf, enabled = load();

  function load(){ try{ const v=localStorage.getItem("neuro_sound"); return v===null ? true : v==="1"; }catch(e){ return true; } }
  function persist(){ try{ localStorage.setItem("neuro_sound", enabled?"1":"0"); }catch(e){} }

  function ensure(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      // буфер белого шума для «вжух»
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate*0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    }
    if(ctx.state==="suspended") ctx.resume();
    return true;
  }

  /* один тон с мягкой огибающей */
  function tone(f, t0, dur, o={}){
    const { type="sine", vol=0.18, glideTo=null, attack=0.006 } = o;
    const osc=ctx.createOscillator(), g=ctx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(f, t0);
    if(glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40,glideTo), t0+dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0+attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    osc.connect(g); g.connect(master); osc.start(t0); osc.stop(t0+dur+0.03);
  }
  /* последовательность нот */
  function seq(notes, base={}){
    if(!enabled || !ensure()) return;
    const t=ctx.currentTime;
    notes.forEach((n,i)=> tone(n.f, t + (n.t!=null?n.t:i*0.085), n.d||0.12, Object.assign({}, base, n.o)) );
  }
  /* шумовой свип «вжух» */
  function whooshSound(){
    if(!enabled || !ensure()) return;
    const t=ctx.currentTime;
    const src=ctx.createBufferSource(); src.buffer=noiseBuf;
    const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=0.8;
    bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(2600, t+0.22);
    const g=ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t+0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t+0.26);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t+0.3);
  }

  /* ноты (Гц) */
  const C5=523,D5=587,E5=659,F5=698,G5=784,A5=880,B5=988,C6=1047,D6=1175,E6=1319,G6=1568;

  const api = {
    unlock(){ ensure(); },
    isOn(){ return enabled; },
    toggle(){ enabled=!enabled; persist(); if(enabled){ ensure(); api.click(); } return enabled; },
    set(v){ enabled=!!v; persist(); },

    click(){ seq([{f:660,d:0.045,o:{type:"sine",vol:0.06}}]); },
    pickup(){ seq([{f:520,d:0.05,o:{type:"triangle",vol:0.07,glideTo:640}}]); },
    drop(){ seq([{f:240,d:0.09,o:{type:"sine",vol:0.12,glideTo:150}}]); },
    xp(){ seq([{f:780,d:0.13,o:{type:"sine",vol:0.10,glideTo:1180}}]); },
    coin(){ seq([{f:B5,d:0.06,o:{type:"triangle",vol:0.12}},{f:E6,t:0.05,d:0.12,o:{type:"triangle",vol:0.12}}]); },
    correct(){ seq([{f:C5,d:0.1},{f:E5,d:0.1},{f:G5,d:0.14}],{type:"triangle",vol:0.13}); },
    great(){ seq([{f:C5,d:0.1},{f:E5,d:0.1},{f:G5,d:0.1},{f:C6,d:0.18}],{type:"triangle",vol:0.13}); },
    wrong(){ seq([{f:200,d:0.18,o:{type:"sawtooth",vol:0.10,glideTo:130}}]); },
    streak(n){ const base=560+Math.min(n,8)*55; seq([{f:base,d:0.07,o:{type:"square",vol:0.06}},{f:base*1.33,t:0.06,d:0.11,o:{type:"triangle",vol:0.10}}]); },
    levelup(){ seq([{f:C5,d:0.1},{f:E5,d:0.1},{f:G5,d:0.1},{f:C6,d:0.1},{f:E6,d:0.2}],{type:"triangle",vol:0.13}); },
    win(){ seq([{f:C5,d:0.12},{f:E5,d:0.12},{f:G5,d:0.12},{f:C6,d:0.12},{f:E6,t:0.5,d:0.12},{f:G6,t:0.62,d:0.28}],{type:"triangle",vol:0.14}); },
    blip(){ seq([{f:A5,d:0.05,o:{type:"square",vol:0.05}},{f:D6,t:0.05,d:0.06,o:{type:"square",vol:0.05}}]); },
    whoosh(){ whooshSound(); }
  };
  return api;
})();
