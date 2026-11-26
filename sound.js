/* No microphone, streaming service or network synthesis. Every voice and tone is local. */
window.Sound = (() => {
  let ctx, master, bus, enabled=false, live=false, generation=0, timer, melody, phrase, samples, raw, sequence, finish;
  const C = window.AudioContext || window.webkitAudioContext;
  function init() {
    if(!C) throw new Error('Audio unavailable');
    if(!ctx){ctx=new C();master=ctx.createGain();master.gain.value=enabled?.64:0;master.connect(ctx.destination)}
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    return ctx;
  }
  function level(){if(master)master.gain.setTargetAtTime(enabled?.64:0,ctx.currentTime,.025)}
  function osc(out,f,t,d,a,type='sine'){let o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(a,t+.012);g.gain.exponentialRampToValueAtTime(.00001,t+d);o.connect(g).connect(out);o.start(t);o.stop(t+d+.03);o.onended=()=>{o.disconnect();g.disconnect()}}
  function tone(kind='button'){if(!enabled||live)return;try{init();let t=ctx.currentTime+.015;osc(master,kind==='bell'?523.25:kind==='letter'?330:kind==='gap'?196:440,t,.28,.074);osc(master,659.25,t+.07,.24,.023)}catch{}}
  function music(on){clearInterval(melody);melody=null;if(phrase){phrase.disconnect();phrase=null}if(!on||!enabled||live)return;
    init();phrase=ctx.createGain();phrase.gain.value=.54;phrase.connect(master);
    function bar(){if(!phrase||!enabled)return;let t=ctx.currentTime+.02;[146.83,220,293.66,329.63].forEach((f,i)=>osc(phrase,f,t+[0,1.4,3.4,6][i],3.6,.052))}
    bar();melody=setInterval(bar,12500)}
  function set(on){enabled=!!on;if(enabled){try{init()}catch{enabled=false}}level();return enabled}
  function load(){if(!raw)raw=new Promise((ok,no)=>{if(window.LETTER_MP3){ok();return}let s=document.createElement('script');s.src='assets/voice.js';s.onload=ok;s.onerror=()=>{raw=null;no(Error('voice offline'))};document.head.append(s)});return raw}
  async function decoded(){await load();if(!samples)samples=ctx.decodeAudioData(Uint8Array.from(atob(window.LETTER_MP3),c=>c.charCodeAt(0)).buffer).catch(e=>{samples=null;throw e});return samples}
  function stop(){generation++;clearTimeout(timer);live=false;finish=null;if(sequence)for(const n of sequence){try{n.stop()}catch{}}
    sequence=[];if(bus){bus.disconnect();bus=null}}
  async function preview(mix,onEnd){
    stop();music(false);init();const token=generation;let voice=await decoded();if(token!==generation)return;live=true;finish=onEnd;sequence=[];bus=ctx.createGain();bus.connect(master);
    let t=ctx.currentTime+.04;const [b,l,gap]=mix;const tail=ctx.createGain();tail.connect(bus);tail.gain.setValueAtTime(1,t);tail.gain.setTargetAtTime(.0001,t+b-.1,.02);
    let bellEnd=Math.min(b,20);[196,392.7,518.1,808,1148.3,1561].forEach((f,i)=>osc(tail,f,t,Math.max(.4,bellEnd*[1,.81,.57,.32,.20,.09][i]),[.34,.15,.09,.06,.044,.037][i]));
    let v=ctx.createBufferSource(),vg=ctx.createGain();v.buffer=voice;v.connect(vg).connect(bus);vg.gain.value=.98;vg.gain.setTargetAtTime(.0001,t+b+Math.min(l,36)-.075,.018);v.start(t+b,0,Math.min(voice.duration,l));sequence.push(v);
    // Small, deterministic room tone; no score over the promised empty interval.
    const buf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),a=buf.getChannelData(0);let acc=0,seed=4081;for(let i=0;i<a.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;acc=.981*acc+.019*(seed/2147483648-1);a[i]=acc}
    let n=ctx.createBufferSource(),ng=ctx.createGain();n.buffer=buf;n.loop=true;n.connect(ng).connect(bus);ng.gain.setValueAtTime(.065,t);ng.gain.setTargetAtTime(.24,t+b+l,.09);ng.gain.setTargetAtTime(.0001,t+60-.15,.035);n.start(t);n.stop(t+60);sequence.push(n);
    timer=setTimeout(()=>{const cb=finish;stop();cb?.()},60050)
  }
  async function audition(id,onEnd){
    stop();music(false);init();const token=generation;const v=id==='letter'?await decoded():null;
    if(token!==generation)return;live=true;sequence=[];bus=ctx.createGain();bus.connect(master);let t=ctx.currentTime+.025;
    if(id==='bell'){[196,392.7,518.1,808].forEach((f,i)=>osc(bus,f,t,3.4-i*.7,[.29,.14,.09,.045][i]))}
    else if(id==='letter'){let a=ctx.createBufferSource();a.buffer=v;a.connect(bus);a.start(t,0,3.52);sequence.push(a)}
    else{let n=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),a=n.getChannelData(0),last=0,seed=41;for(let i=0;i<a.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;last=last*.982+.018*(seed/2147483648-1);a[i]=last*.27}let node=ctx.createBufferSource();node.buffer=n;node.loop=true;node.connect(bus);node.start(t);node.stop(t+3.6);sequence.push(node)}
    bus.gain.setTargetAtTime(.0001,t+3.45,.025);timer=setTimeout(()=>{stop();onEnd?.()},3625)
  }
  return {set,tone,stop,music,preview,audition,preload:()=>load().catch(()=>{}),get enabled(){return enabled}}
})();
