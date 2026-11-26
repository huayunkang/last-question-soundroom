(() => {
'use strict';
const $=s=>document.querySelector(s), scene=$('#scene'),book=$('#book'), key='last-question.soundroom.v1';
const defaults=()=>({v:1,ch:0,arrival:false,maximum:0,reflection:'',sealed:false});
let s=defaults(), storageOK=true;try{const t=JSON.parse(localStorage.getItem(key)||'null');if(t&&t.v===1&&Number.isInteger(t.ch)&&t.ch>=0&&t.ch<=5)s={...s,...t}}catch{storageOK=false}
if(s.ch>=4&&!['bell','letter','gap'].includes(s.policy))s.ch=3;
if(s.ch===5&&(!Array.isArray(s.mix)||s.mix.length!==3))s.ch=4;
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phases=['序幕 / 欢迎来到未来','第一章 / 所有答案','第二章 / 答案中的裂痕','第三章 / 无法替你选择','第四章 / 共同创造','终章 / 最后一个问题'];
const letter='给下一班值夜的人：我把钥匙搁在窗边的小碟上。风大的时候，它会碰到碟沿。以前我总嫌响，这星期却故意没把它收好。如果你进来发现屋里空着，别急着把什么都关掉。等钟响完，再把椅子往里推一点。有人没赶上说再见，也许只是以为明天还会来。林桥。';
const paths={
 bell:{title:'等钟声落下',desc:'钟锤落下以后，窗框还轻轻响了一会儿。舒岑把耳机摘下来：“原来最后消失的是这个。”你没有替全校选一种回忆，只替这段余音留了位置。',short:'留完整钟尾',code:'RESONANCE'},
 letter:{title:'让落款被听见',desc:'那封信没有被剪成一句漂亮的祝福。窗下有人听见末尾的“林桥”，回头望了一眼旧声房。你没有替每个人说再见，但让一个人把话说到了底。',short:'读全一封信',code:'POSTSCRIPT'},
 gap:{title:'让房间自己说话',desc:'喇叭安静下来，没有人替它解围。周迟把伸向推子的手收回来。窗外有一把椅子挪开，又有人坐下。你把这几秒交给了听的人。',short:'留一段现场空白',code:'ROOM TONE'}
};
function save(){try{localStorage.setItem(key,JSON.stringify(s))}catch{storageOK=false}}
function go(ch){if(!Number.isInteger(ch)||ch<0||ch>5)return;const previous=s.ch,anchor=Cinema.origin(previous);Sound.stop();s.ch=ch;s.maximum=Math.max(s.maximum||0,ch);s.sealed=false;save();render(true);Cinema.transit(previous,ch,s,anchor)}
const api={go,save,tone:Sound.tone,stop:Sound.stop,preview:Sound.preview,audition:Sound.audition,escape:safe};
const photo='<div class="plate" aria-hidden="true"></div>';
function opener(){return `<section class="poster cut">${photo}<div class="micro cover-slug"><i></i> 校园声音档案　/　2041</div>
<div class="titleblock"><h1>最后一个<span>问题</span></h1><div class="english" lang="en">The Last Question</div>
<p class="intro">毕业前的最后一分钟广播，<br>你想让谁的声音留下？</p><button class="hero-cta" id="enter">进入旧声房</button></div>
<div class="covercredit"><small>原创互动叙事　/　约 5–8 分钟<br>可静音体验 · 进度仅保存在本机</small><div class="lens"><b>ACOUSTIC MIRROR</b>旧声房藏品 · 集音镜</div></div></section>`}
function arrival(){return `<section class="arrival cut">${photo}<div class="framecopy"><div class="micro"><i></i> PROLOGUE　/　23:42</div><h1>今晚，<br>你值最后一班。</h1><p>2041 年，南庭大学。毕业班就要离校。旧声房的门比平时轻，门背后少了几件雨衣，桌上多出一把钥匙。</p><p>值班员周迟给你留了六十秒：午夜前，用校园广播向这一届学生告别。桌角压着一张对折的纸，你先打开了调音台。</p>
<blockquote><small>折页 · 校园档案助手</small>“今天，你想知道什么？”</blockquote><p>它认得每一份被编目的声音。这一班，你们搭档。</p><button class="goldbtn" id="begin">接过值班台</button><div class="quiet">「折页」是虚构角色，由本地预设逻辑驱动，未连接实时 AI。</div></div></section>`}
function question(){return `<section class="after cut">${photo}<div class="question"><div class="micro"><i></i> EPILOGUE　/　00:00</div><p class="ep-cue">红灯熄灭。你编的那一分钟，从出带口落了下来。</p>${Cinema.strip(s)}<p class="question-cue">折页没有给出下一条建议。它问：</p><h1><span class="phrase">如果我可以告诉你</span><span class="phrase">所有答案，</span><br><span class="phrase">你还想</span><span class="phrase">亲自寻找什么？</span></h1>
<label for="reflection">留给下一班的一句话</label><textarea id="reflection" maxlength="96" placeholder="我还想亲自寻找……">${safe(s.reflection)}</textarea>
<div class="seeds" aria-label="也可以选用一句"><button data-seed>那些没被数进来的人</button><button data-seed>一个人说完以后的回声</button><button data-seed>我愿意负责的选择</button></div><p class="quiet">最多 96 字；只保存在这台设备，不会发送给折页或服务器。</p><button class="goldbtn" id="seal" ${!s.reflection.trim()?'disabled':''}>封存我的思考卡</button></div></section>`}
function cutNote(){const [b,l,g]=s.mix;return (b>=20?'钟尾完整':'钟尾作了截取')+'，'+(l>=36?'信读到了落款':'信只读了节选')+'。最后 '+g+' 秒不补旁白。'}
function ending(){const p=paths[s.policy];return `<section class="after end-${s.policy} mood-${safe(s.chapter?.mixMood||"handoff")} cut">${photo}<div class="ending">
<div class="micro"><i></i> 值班回执 / ${p.code}</div><h1>${p.title}</h1><p>${p.desc}</p>${Cinema.strip(s,true)}
<div class="stamp">钟声 ${s.mix[0]}″　·　读信 ${s.mix[1]}″　·　现场 ${s.mix[2]}″</div><p class="quiet">${cutNote()}</p>
<div class="route-note">${s.chapter?.discovery==='scope'?'你先问了登记范围，才让折页补找纸签。':'你把两份计数放在一起，又查了回执从哪里来。'}</div><div class="myline">“${safe(s.reflection)}”</div><div class="actions"><button class="goldbtn" id="downloadCard">保存思考卡 PNG</button><button class="plainbtn" id="edit">改写这句话</button><button class="plainbtn" id="endReset">重新值班</button></div>
<details><summary id="showLetter">展开林桥的信</summary><p>${letter}</p></details><div class="quiet" id="cardstatus" role="status">本地生成，不上传。谢谢你听到最后。</div></div></section>`}
function bind(id,fn){$('#'+id)?.addEventListener('click',fn)}
function render(focus=false){
 const ch=s.ch;document.body.dataset.chapter=ch;$('#reel').textContent='SOUNDROOM　/　'+String(ch).padStart(2,'0')+' : 05';$('#phase').textContent=phases[ch];
 if(ch===0)scene.innerHTML=s.arrival?arrival():opener();else if(ch===5)scene.innerHTML=s.sealed?ending():question();else Chapters.render(ch,s,api);
 if(ch===4)Sound.preload();Sound.music(Sound.enabled&&(ch===0||ch===5));
 if(ch===0&&!s.arrival)Cinema.intro();
 bind('enter',()=>{s.arrival=true;save();Sound.tone();render(true)});bind('begin',()=>go(1));
 function update(){s.reflection=$('#reflection').value;$('#seal').disabled=!s.reflection.trim();save()}
 $('#reflection')?.addEventListener('input',update);scene.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{$('#reflection').value=b.textContent;update();Sound.tone()});
 bind('seal',()=>{if(s.reflection.trim()){s.reflection=s.reflection.trim();s.sealed=true;save();Sound.tone();render(true)}});bind('edit',()=>{s.sealed=false;save();render(true);$('#reflection').focus()});bind('downloadCard',card);bind('endReset',()=>openBook(true));
 if(focus){scene.classList.remove('scene-cut');void scene.offsetWidth;scene.classList.add('scene-cut');window.scrollTo(0,0);scene.focus({preventScroll:true})}
}
function card(){const c=document.createElement('canvas');c.width=960;c.height=1320;const x=c.getContext('2d');const p=paths[s.policy];const grd=x.createLinearGradient(0,0,960,1320);grd.addColorStop(0,'#34222f');grd.addColorStop(1,'#18171c');x.fillStyle=grd;x.fillRect(0,0,960,1320);
 x.strokeStyle='#a47c54';x.lineWidth=2;x.strokeRect(34,34,892,1252);x.save();x.beginPath();x.rect(45,45,870,300);x.clip();x.strokeStyle='#b58a5f68';for(let i=0;i<13;i++){x.beginPath();x.ellipse(778,108,240-i*12,89-i*4,-.55,0,Math.PI*2);x.stroke()}x.restore();
 const draw=(t,y,size,color='#f4e7d3',serif=false)=>{x.fillStyle=color;x.font=size+'px '+(serif?'"Songti SC","SimSun",serif':'system-ui,"Microsoft YaHei",sans-serif');x.fillText(t,76,y)};
 draw('SOUNDROOM ARCHIVE   /   2041',125,23,'#e9c190');draw('最后一个问题',224,70,'#f5e8d6',true);draw('The Last Question',273,31,'#dfb98d',true);for(let j=0;j<30;j++){x.beginPath();x.fillStyle=(j<15||j===18||j===19)?'#dbb77e':'#ad8292';x.strokeStyle='#dbc99e';let xx=76+j*12+(j>=18?12:0);if(j<18){x.arc(xx,312,3.3,0,Math.PI*2)}else{x.rect(xx-3,309,6,6)}x.fill()}draw('值班回执　/　'+p.code,371,24,'#d8aa88');draw(p.title,451,56,'#f5e8d6',true);
 draw('我还想亲自寻找——',555,28,'#eac093');let y=628,line='';x.font='36px "Songti SC","SimSun",serif';for(const char of Array.from(s.reflection.replace(/\s+/gu,' '))){if(char==='\n'||x.measureText(line+char).width>796){draw(line,y,36,'#fff0da',true);y+=54;line=''}if(char!=='\n')line+=char;if(y>955)break}if(line&&y<=970)draw(line,y,36,'#fff0da',true);
 let left=76;s.mix.forEach((v,i)=>{x.fillStyle=['#d2ad78','#bd7e85','#bcb9ad'][i];x.fillRect(left,1036,v/60*800-2,8);left+=v/60*800});draw('钟声 '+s.mix[0]+' 秒     读信 '+s.mix[1]+' 秒     现场 '+s.mix[2]+' 秒',1104,27);draw('我核对了 30 份回执，没有把它们写成全校的声音。',1170,24,'#dfcbb8');draw('南庭大学旧声房　·　毕业前最后一班',1230,22,'#caad91');
 const a=document.createElement('a');a.download='最后一个问题_我的思考卡.png';a.href=c.toDataURL('image/png');a.click();$('#cardstatus').textContent='已生成 PNG。如浏览器未下载，请打开卡片并长按保存。';if(!$('#viewCard')){const link=document.createElement('a');link.id='viewCard';link.className='plainbtn';link.href=a.href;link.target='_blank';link.rel='noopener';link.textContent='查看卡片';link.onclick=e=>{e.preventDefault();const img=new Image();img.src=a.href;img.alt='我的思考卡，可长按保存';img.style.cssText='width:100%;display:block;margin-top:16px';$('#bookbody').replaceChildren(img);book.showModal()};$('#cardstatus').after(link)}}
function openBook(confirm=false){if(!book.open)book.showModal();const el=$('#bookbody');if(confirm){el.innerHTML='<h2>重新接班？</h2><p>本机的这个故事进度和思考句会被清空。已下载的卡片不会删除。</p><div class="actions"><button class="goldbtn" id="cancelReset">保留进度</button><button class="plainbtn" id="confirmReset">清空并重开</button></div>';bind('cancelReset',()=>openBook());bind('confirmReset',()=>{const reduced=s.reduced;Sound.stop();s=defaults();s.reduced=reduced;save();book.close();render(true)});return}
 el.innerHTML='<h2>这一班留下了什么</h2><div class="notes"></div><hr><p class="fine">原创互动叙事 · 虚构校园、人物和回执。折页不调用实时模型。网页不索取麦克风、账号或位置；输入仅在本浏览器保存。静态托管平台可能为安全保留访问日志，不包含你的思考句。</p><p class="fine">'+(storageOK?'进度自动存于本浏览器；公用设备离开前可清空。':'当前浏览器不允许保存进度，本次仍可体验。')+'</p><button class="plainbtn" id="reset">清空进度并重新体验</button>';el.querySelector('.notes').textContent=Chapters.notes(s);bind('reset',()=>openBook(true))}
const mq=matchMedia('(prefers-reduced-motion: reduce)');function motion(){let on=s.reduced??mq.matches;document.documentElement.classList.toggle('reduced',on);$('#motion').setAttribute('aria-pressed',String(on));$('#motion').title=on?'减少动态效果：已开启':'减少动态效果：未开启';$('#motion').querySelector('span').textContent=on?'减动':'动效'}motion();mq.addEventListener?.('change',motion);
bind('motion',()=>{s.reduced=!document.documentElement.classList.contains('reduced');save();motion()});bind('sound',()=>{let on=Sound.set(!Sound.enabled);$('#sound').setAttribute('aria-pressed',String(on));$('#sound').querySelector('span').textContent=on?'声音开':'声音关';Sound.music(on&&(s.ch===0||s.ch===5));Sound.tone()});bind('notebook',()=>openBook());bind('closeBook',()=>book.close());
book.addEventListener('click',e=>{if(e.target===book){const r=book.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)book.close()}});
let raf=0;scene.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||mq.matches||document.documentElement.classList.contains('reduced')||raf)return;const plate=scene.querySelector('.plate');if(!plate)return;raf=requestAnimationFrame(()=>{plate.style.setProperty('--px',((e.clientX/innerWidth-.5)*10)+'px');plate.style.setProperty('--py',((e.clientY/innerHeight-.5)*7)+'px');raf=0})});
render();
})();
