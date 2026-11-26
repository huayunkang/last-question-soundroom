/* Perforations and splices are tied to submitted material, never a score. */
window.Cinema=(()=>{
 const group=(n,bell,kind)=>Array.from({length:n},(_,i)=>'<i class="hole '+kind+(i<bell?' voted':'')+'"></i>').join('');
 const perfs=(mix)=>mix.map((n,i)=>'<i style="flex:'+n+'" class="m'+i+'"></i>').join('');
 function strip(s,large=false){if(!s.mix)return '';return '<div class="memory-strip '+(large?'large':'')+'" aria-label="归档底片：录音回执18份，纸签12张；钟声、读信和现场的实际秒数如下。"><div class="stock"><span>NEG. 2041　/　值班底片</span><b>60 SEC</b></div><div class="negative" aria-hidden="true">'+group(18,15,'recorded')+'<u></u>'+group(12,2,'paper')+'</div><div class="stock-foot"><span>有声 18　＋　纸签 12</span><span>'+s.mix.map(n=>n+'″').join(' / ')+'</span></div><div class="lengths" aria-hidden="true">'+perfs(s.mix)+'</div></div>'}
 function reduced(){return matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('reduced')}
 function origin(ch){return document.querySelector(ch===4?"#ch-timeline":".ch-tape-fold")?.getBoundingClientRect()}
 function transit(from,to,s,start){if(reduced()||!Element.prototype.animate||!((from===2&&to===3)||(from===4&&to===5)))return;const tag=document.createElement('div');tag.className='splice-pass';tag.setAttribute('aria-hidden','true');const final=to===5;tag.innerHTML='<div class="pass-strip"><div class="pass-label">'+(final?'印出值班底片':'将核对后的回执送至编辑台')+'</div><div class="pass-holes">'+Array.from({length:30},(_,i)=>'<b class="'+(i<18?'a':'b')+'"></b>').join('')+'</div><div class="lengths">'+(final?perfs(s.mix):'<i class="m0" style="flex:17"></i><i class="m1" style="flex:13"></i>')+'</div></div>';document.body.append(tag);
 const dest=document.querySelector(final?'.memory-strip':'.ch-stage'),r=dest?.getBoundingClientRect(),w=Math.min(innerWidth-36,480);tag.style.cssText='position:fixed;top:0;left:0;width:'+w+'px;padding:0;transform-origin:0 0';const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
 const sx=start?clamp(start.x,12,innerWidth-80):12,sy=start?clamp(start.y,42,innerHeight-84):innerHeight*.65;
 const tx=r?clamp(r.x,10,innerWidth-80):20,ty=r?clamp(r.y+(final?0:r.height*.13),50,innerHeight-86):90;
 const pose=(x,y,scale,rot)=>'translate('+x+'px,'+y+'px) scale('+scale+') rotate('+rot+'deg)';
 const tscale=final&&r?clamp(r.width/w,.5,1.4):.78;
 const motion=tag.animate([{transform:pose(sx,sy,.66,-1.5),opacity:0,offset:0},{transform:pose(sx,sy,.74,-1),opacity:1,offset:.16},{transform:pose(tx,ty,tscale,0),opacity:1,offset:.78},{transform:pose(tx,ty,tscale,0),opacity:0,offset:1}],{duration:920,easing:'cubic-bezier(.27,.7,.3,1)'});motion.onfinish=()=>tag.remove();setTimeout(()=>tag.remove(),1200)}

 function intro(){if(reduced())return;const block=document.querySelector('.poster .titleblock');if(!block||!block.animate)return;block.animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'})}
 return {strip,origin,transit,intro}
})();
