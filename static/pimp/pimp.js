(function(){var l=document.createElement("link");l.rel="stylesheet";l.href="/static/pimp/pimp.css?v=14";document.head.appendChild(l)})();
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,MOB=matchMedia('(max-width:700px)').matches;
function el(t,a,h){var e=document.createElement(t);for(var k in a)e.setAttribute(k,a[k]);if(h)e.innerHTML=h;return e}
// intro
if(!RM&&!sessionStorage.getItem('pxIntro')){var it=el('div',{id:'px-intro'},'<div class="px-logo">SHAMEGRIN</div><div class="px-bar"><i></i></div>');document.body.appendChild(it);sessionStorage.setItem('pxIntro','1');setTimeout(function(){it.classList.add('px-done');setTimeout(function(){it.remove()},700)},1250)}
document.body.appendChild(el('div',{id:'px-scan'}));
// social bar
var s=el('nav',{id:'px-social','aria-label':'Social links'});
[['https://www.tiktok.com/@shamegrin','TT','TikTok'],['https://soundcloud.com/shamegrin','SC','SoundCloud'],['https://www.youtube.com/@SHAMEGRIN','YT','YouTube']].forEach(function(x){s.appendChild(el('a',{href:x[0],target:'_blank',rel:'noopener','aria-label':x[2],title:x[2]},x[1]))});
document.body.appendChild(s);
// glitch headings
document.querySelectorAll('h2.sg-neon-h, section.section > h2, section.section .container > h2').forEach(function(h){if(h.querySelector('*:not(br):not(span)'))return;h.setAttribute('data-text',h.textContent.trim());h.classList.add('px-glitch')});
// EQ in hero + parallax
var hero=document.getElementById('hero');
if(hero){var eq=el('div',{id:'px-eq','aria-hidden':'true'});var n=MOB?18:32;for(var i=0;i<n;i++){var b=el('span');b.style.animationDuration=(0.45+Math.random()*0.9).toFixed(2)+'s';b.style.animationDelay=(-Math.random()).toFixed(2)+'s';eq.appendChild(b)}
var tgt=hero.querySelector('.hero-title');(tgt&&tgt.parentNode||hero).appendChild(eq);
if(!RM&&!MOB){var kids=[].slice.call(hero.children);var tick=false;addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){var y=scrollY;if(y<innerHeight*1.2)kids.forEach(function(k,j){k.style.transform='translate3d(0,'+(y*(0.12+j*0.06)).toFixed(1)+'px,0)'});tick=false})},{passive:true})}}
// spotlight + gallery sections
var anchor=document.getElementById('latest')||document.getElementById('music');
var spot=el('section',{'class':'section',id:'px-spotlight','aria-label':'Vinyl spotlight'},'<h2 class="px-sec-h px-glitch" data-text="Vinyl Spotlight">Vinyl Spotlight</h2><div id="px-spot"><div class="px-tilt"><img src="/static/img/shamegrin-vinyl-jacket.jpg" alt="SHAMEGRIN vinyl jacket" loading="lazy"></div><div><h3 style="color:#b6ff00;font-size:1.6rem;margin:0 0 8px">Press it. Spin it. Own it.</h3><p>Limited SHAMEGRIN vinyl, pressed on demand through ElasticStage. Every copy made for one fan.</p><a class="px-btn" href="/buy/">Get the vinyl</a></div><div class="px-tilt"><img src="/static/img/shamegrin-vinyl.jpg" alt="SHAMEGRIN vinyl record" loading="lazy"></div></div>');
if(anchor)anchor.parentNode.insertBefore(spot,anchor.nextSibling);
var imgs=['anime-star','mountains','fall','wolf','oblivion','tired','stutter-boys-cover','shamegrin-vinyl-jacket'];
var gal=el('section',{'class':'section',id:'px-gallery','aria-label':'Gallery'},'<h2 class="px-sec-h px-glitch" data-text="Gallery">Gallery</h2><div class="px-grid">'+imgs.map(function(n){return '<button type="button" aria-label="Open '+n.replace(/-/g,' ')+'"><img src="/static/img/'+n+'.jpg" alt="'+n.replace(/-/g,' ')+'" loading="lazy"></button>'}).join('')+'</div>');
var ref=document.getElementById('news')||document.getElementById('connect');
if(ref)ref.parentNode.insertBefore(gal,ref);else document.body.appendChild(gal);
var lb=el('div',{id:'px-lb',role:'dialog','aria-label':'Image viewer'},'<img alt="">');document.body.appendChild(lb);
gal.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var im=b.querySelector('img');lb.firstChild.src=im.src;lb.firstChild.alt=im.alt;lb.classList.add('px-open')});
lb.addEventListener('click',function(){lb.classList.remove('px-open')});addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('px-open')});
// tilt
if(!RM&&!MOB)document.querySelectorAll('.px-tilt').forEach(function(t){t.addEventListener('mousemove',function(e){var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform='perspective(800px) rotateY('+(x*18)+'deg) rotateX('+(-y*18)+'deg) scale(1.03)'});t.addEventListener('mouseleave',function(){t.style.transform=''})});
// spinning vinyl player
var v=el('div',{id:'px-vinyl'},'<div class="px-player"></div><div style="position:relative"><span class="px-label">▶ The single</span><button class="px-disc" type="button" aria-label="Play The Stutter Boys and the ShameGrin"></button></div>');document.body.appendChild(v);
v.querySelector('.px-disc').addEventListener('click',function(){var p=v.querySelector('.px-player');if(v.classList.toggle('px-on')){p.innerHTML='<iframe title="The Stutter Boys and the ShameGrin" style="border-radius:12px" src="https://open.spotify.com/embed/track/2oBPAv1iYkRicSpOuAH6w2?utm_source=generator" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';v.querySelector('.px-label').textContent='■ Stop'}else{p.innerHTML='';v.querySelector('.px-label').textContent='▶ The single'}});
// scroll reveal
if(!RM&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('px-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});document.querySelectorAll('section.section').forEach(function(sec){if(sec.getBoundingClientRect().top>innerHeight){sec.classList.add('px-rv');io.observe(sec)}})}
// cursor trail
if(!RM&&!MOB&&matchMedia('(pointer:fine)').matches){var c=el('canvas',{id:'px-trail','aria-hidden':'true'});document.body.appendChild(c);var x=c.getContext('2d'),P=[],run=false;function sz(){c.width=innerWidth;c.height=innerHeight}sz();addEventListener('resize',sz);
addEventListener('mousemove',function(e){P.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*1.2,vy:(Math.random()-.5)*1.2,l:1});if(P.length>40)P.splice(0,P.length-40);if(!run){run=true;requestAnimationFrame(f)}},{passive:true});
function f(){x.clearRect(0,0,c.width,c.height);x.globalCompositeOperation='lighter';for(var k=P.length-1;k>=0;k--){var p=P[k];p.x+=p.vx;p.y+=p.vy;p.l-=.035;if(p.l<=0){P.splice(k,1);continue}x.fillStyle='rgba(182,255,0,'+(p.l*.8)+')';x.beginPath();x.arc(p.x,p.y,3*p.l+1,0,6.283);x.fill()}if(P.length)requestAnimationFrame(f);else run=false}}
})();
(function(){var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,FINE=matchMedia('(pointer:fine)').matches;
var pr=document.createElement('div');pr.id='px-prog';document.body.appendChild(pr);
var tp=document.createElement('button');tp.id='px-top';tp.type='button';tp.setAttribute('aria-label','Back to top');tp.textContent='↑';document.body.appendChild(tp);
tp.addEventListener('click',function(){scrollTo({top:0,behavior:RM?'auto':'smooth'})});
var tk=false;addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){var h=document.documentElement.scrollHeight-innerHeight;pr.style.width=(h>0?scrollY/h*100:0)+'%';tp.classList.toggle('px-show',scrollY>innerHeight);tk=false})},{passive:true});
var hero=document.getElementById('hero');
if(hero&&!RM&&FINE){var g=document.createElement('div');g.id='px-glow';hero.insertBefore(g,hero.firstChild);hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();hero.style.setProperty('--gx',(e.clientX-r.left)+'px');hero.style.setProperty('--gy',(e.clientY-r.top)+'px')})}
if(!RM&&FINE)document.querySelectorAll('.px-btn, #hero a[class*="btn"]').forEach(function(b){b.classList.add('px-mag');b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)'});b.addEventListener('mouseleave',function(){b.style.transform=''})});
})();
(function(){var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function sec(id,label,h,html){var s=document.createElement('section');s.className='section';s.id=id;s.setAttribute('aria-label',label);s.innerHTML=(h?'<h2 class="px-sec-h px-glitch" data-text="'+h+'">'+h+'</h2>':'')+html;return s}
function after(ref,n){if(ref&&ref.parentNode)ref.parentNode.insertBefore(n,ref.nextSibling);else document.body.appendChild(n)}
var T=[['the-stutter-boys-and-the-shamegrin','stutter-boys-cover','The Stutter Boys and the ShameGrin'],['the-wolf-that-stays-caged','wolf','The Wolf That Stays Caged'],['anime-star','anime-star','Anime Star'],['fall-into-the-ground','fall','Fall Into the Ground'],['oblivion-home-no-more','oblivion','Oblivion (Home No More)'],['the-mountains-still-call-to-me','mountains','The Mountains Still Call to Me'],['tired-of-this-world','tired','Tired of This World']];
var feat=sec('px-feat','Featured tracks','Featured Tracks','<div class="px-fgrid">'+T.map(function(t){return '<a class="px-card" href="/music/'+t[0]+'/"><img src="/static/img/'+t[1]+'.jpg" alt="'+t[2]+' cover" loading="lazy"><span><b>▶ LISTEN</b>'+t[2]+'</span></a>'}).join('')+'</div>');
after(document.getElementById('px-spotlight'),feat);
var nv=document.querySelectorAll('#videos a[href*="youtube.com/watch"]').length;
var st=sec('px-statsec','Stats','','<div id="px-stats"><div><b data-n="'+T.length+'">0</b><i>Tracks</i></div><div><b data-n="'+(nv||6)+'">0</b><i>Videos</i></div><div><b data-n="1">0</b><i>Vinyl pressing</i></div><div><b data-n="100" data-s="%">0</b><i>Independent</i></div></div>');
after(feat,st);
function count(b){var n=+b.dataset.n,s=b.dataset.s||'';if(RM){b.textContent=n+s;return}var t0=performance.now();(function f(t){var p=Math.min((t-t0)/1400,1);b.textContent=Math.round(n*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(t0)}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.querySelectorAll('b[data-n]').forEach(count);io.disconnect()}})});io.observe(st)}else st.querySelectorAll('b[data-n]').forEach(count);
var Q=['No face. Just sound.','Dark emo rap for people who smile while they’re breaking.','Everyone has a scar.','Dragged through heaven and hell.','After the fire, the grin stays.'];
var q=sec('px-quotesec','Quotes','','<div id="px-quotes" aria-live="polite">'+Q.map(function(x,i){return '<p'+(i?'':' class="px-cur"')+'>“'+x+'”</p>'}).join('')+'</div>');
after(st,q);var qi=0,ps=q.querySelectorAll('p');setInterval(function(){if(document.hidden)return;ps[qi].classList.remove('px-cur');qi=(qi+1)%ps.length;ps[qi].classList.add('px-cur')},4000);
var u=encodeURIComponent('https://shamegrin.com/'),tx=encodeURIComponent('SHAMEGRIN — dark emo rap. No face. Just sound.');
var sh=sec('px-sharesec','Share','Spread the Grin','<div id="px-share"><a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url='+u+'&text='+tx+'">Share on X</a><a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='+u+'">Facebook</a><a target="_blank" rel="noopener" href="https://www.reddit.com/submit?url='+u+'&title='+tx+'">Reddit</a><a href="sms:?&body='+tx+'%20'+u+'">Text it</a><button type="button" id="px-copy">Copy link</button></div>');
var ref=document.getElementById('signup')||document.getElementById('connect');if(ref)ref.parentNode.insertBefore(sh,ref);else document.body.appendChild(sh);
document.getElementById('px-copy').addEventListener('click',function(e){var b=e.target;var done=function(){b.textContent='Copied ✓';setTimeout(function(){b.textContent='Copy link'},1800)};if(navigator.share&&matchMedia('(pointer:coarse)').matches){navigator.share({title:'SHAMEGRIN',url:'https://shamegrin.com/'}).catch(function(){})}else if(navigator.clipboard)navigator.clipboard.writeText('https://shamegrin.com/').then(done,done);else done()});
})();
(function(){
document.addEventListener('visibilitychange',function(){document.documentElement.classList.toggle('px-hidden',document.hidden)});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('px-vis',e.isIntersecting)})});document.querySelectorAll('#px-eq,.px-glitch').forEach(function(n){io.observe(n)})}
var c=document.getElementById('px-trail');if(c){var x=c.getContext('2d');x.shadowBlur=0;Object.defineProperty(x,'shadowBlur',{set:function(){},get:function(){return 0}});}
})();
(function(){var C=['stutter-boys-cover','wolf','fall','mountains','oblivion','tired','anime-star'],n=0;
function fb(img){if(img.dataset.pxFb)return;img.dataset.pxFb=1;img.removeAttribute('srcset');img.src='/static/img/'+C[(n++)%C.length]+'.jpg';img.style.objectFit='cover'}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&/ytimg|youtube/.test(t.src))fb(t)},true);
function scan(){document.querySelectorAll('img').forEach(function(i){if(/ytimg|youtube/.test(i.src)&&i.complete&&(i.naturalWidth===0||i.naturalWidth<=120))fb(i)})}
addEventListener('load',function(){scan();setTimeout(scan,2500)});
})();
(function(){var v=document.getElementById("px-vinyl"),h=document.getElementById("hero");if(!v||!h)return;var t=false;function u(){v.classList.toggle("px-shown",h.getBoundingClientRect().bottom<80);t=false}addEventListener("scroll",function(){if(!t){t=true;requestAnimationFrame(u)}},{passive:true});u()})();
