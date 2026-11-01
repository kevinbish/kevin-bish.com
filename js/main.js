(function(){
  const root=document.documentElement, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------- language: window.I18N is written into each translated page by scripts/build.py ---------- */
  const LANG=root.lang||'en', DICT=(window.I18N&&window.I18N.t)||{};
  const LOCALE={en:'en-GB',fr:'fr-FR',es:'es-ES',ru:'ru-RU',ar:'ar-u-nu-latn',zh:'zh-CN',de:'de-DE',pt:'pt-PT'}[LANG]||'en-GB';
  const T=(s,...a)=>{let r=DICT[s]||s;a.forEach((v,i)=>{r=r.split('{'+i+'}').join(v);});return r;};
  const NUM=v=>Number(v).toLocaleString(LANG==='en'?'en-US':LOCALE);
  let DN=null;try{if(LANG!=='en'&&Intl.DisplayNames)DN=new Intl.DisplayNames([LOCALE],{type:'region'});}catch(e){}
  const ctry=l=>{try{return (DN&&DN.of(l[0].slice(0,2)))||l[2];}catch(e){return l[2];}};

  /* ---------- side line numbers (addLineNum, as on the original site) ---------- */
  const gut=document.getElementById('gutter');let lastKey='';
  const GI={
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    card:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.4 1.6-2 3-2s2.4.6 3 2M14 10h4M14 13.5h4"/>',
    branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9c0 5-7 4-11 8.5"/>',
    gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-5"/>',
    case:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12.5h18"/>',
    cap:'<path d="M2 9.5l10-5 10 5-10 5z"/><path d="M6 11.5v5c3.5 2.6 8.5 2.6 12 0v-5M22 9.5v5"/>',
    folder:'<path d="M3 6h6l2 2h10v11H3z"/>',
    gears:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    book:'<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5c0 3 1.5 4.5 3.5 4.5M16 6h3.5c0 3-1.5 4.5-3.5 4.5M12 13v4M8 20.5h8"/>',
    news:'<rect x="3" y="4" width="15" height="16" rx="1.5"/><path d="M18 8h3v10a2 2 0 0 1-2 2H5M6.5 8h8M6.5 12h8M6.5 16h5"/>',
    heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
    term:'<path d="M4 6l6 6-6 6M12.5 18H20"/>',
    music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    aperture:'<circle cx="12" cy="12" r="9"/><path d="M12 3l3.5 6M21 12h-7M16.5 19.8L13 14M7.5 19.8L11 14M3 12h7M7.5 4.2L11 10"/>',
    camera:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>',
    people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c3 .2 5 2.6 5 5.8"/>'
  };
  function addLineNum(){
    gut.style.height='0px';
    const h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),n=Math.ceil(h/24),sy=scrollY;
    gut.style.height=h+'px';
    const icons={};
    document.querySelectorAll('[data-gi]').forEach(el=>{const r=el.getBoundingClientRect();if(!r.height)return;
      const y=r.top+sy+Math.min(r.height,24)/2,row=Math.floor(y/24)+1;if(!icons[row])icons[row]=el.dataset.gi;});
    const key=n+'|'+JSON.stringify(icons);if(key===lastKey)return;lastKey=key;
    let out='';for(let i=1;i<=n;i++){const ic=icons[i];
      out+='<div>'+(ic?'<svg class="gi" viewBox="0 0 24 24">'+GI[ic]+'</svg>':(i%10===0?'<b>'+i+'</b>':i))+'</div>';}
    gut.innerHTML=out;
  }
  addLineNum();addEventListener('resize',addLineNum);addEventListener('load',addLineNum);
  if('ResizeObserver' in window)new ResizeObserver(addLineNum).observe(document.querySelector('main'));
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(addLineNum);

  /* ---------- editor bar ---------- */
  document.getElementById('fs').addEventListener('click',()=>{
    try{ if(document.fullscreenElement){document.exitFullscreen();} else {const p=root.requestFullscreen&&root.requestFullscreen(); if(p&&p.catch)p.catch(()=>{});} }catch(e){}
  });
  document.getElementById('toTop').addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));

  /* ---------- mode switch ---------- */
  const mN=document.getElementById('mNight'),mD=document.getElementById('mDay');
  function setMode(day,persist){root.setAttribute('data-theme',day?'light':'dark');
    mN.setAttribute('aria-pressed',!day);mD.setAttribute('aria-pressed',day);
    if(persist!==false){try{localStorage.setItem('kbMode',day?'day':'night')}catch(e){}}
    if(day&&typeof sigOn!=='undefined'&&sigOn)lightSignal(false);
    if(typeof kick==='function')kick();}
  mN.onclick=()=>setMode(false);mD.onclick=()=>setMode(true);

  /* ---------- night sky ---------- */
  const c=document.getElementById('sky'),x=c.getContext('2d');let W,H,towers=[],bats=[],t=0,running=false;
  function build(){const d=Math.min(devicePixelRatio||1,2);W=c.clientWidth;H=c.clientHeight;c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);
    let s=11;const r=()=>(s=(s*9301+49297)%233280)/233280;towers=[];let px=0;
    while(px<W){const w=22+r()*58,h=30+r()*H*.3,tw={x:px,w,h,spire:r()>.78,win:[]};for(let i=0;i<12;i++)tw.win.push({x:4+r()*(w-8),y:8+r()*(h-14),on:r()>.6});towers.push(tw);px+=w+1;}
    bats=Array.from({length:Math.round(Math.min(14,W/80))},()=>({x:Math.random()*W,y:20+Math.random()*H*.5,s:.5+Math.random(),v:.4+Math.random(),ph:Math.random()*6}));
    clouds=Array.from({length:6},(_,i)=>({x:W*(.08+i*.17),y:H*.26+(r()-.5)*H*.16,r:50+r()*60,v:.12+r()*.18}));
    const mb=document.getElementById('moon');mb.style.left=(W*.94-38)+'px';mb.style.top=(H*.08-38)+'px';}
  /* ---------- the signal ---------- */
  let clouds=[],sig=0,sigOn=false,sigTimer=0;
  const hdr=document.getElementById('top'),sigHint=document.getElementById('sigHint');
  function drawSignal(){
    const cx=W*.5,cy=Math.max(100,H*.3),rx=Math.min(170,W*.34),ry=rx*.58;
    x.save();x.globalAlpha=sig;
    clouds.forEach(cl=>{x.fillStyle='rgba(95,108,132,.30)';x.beginPath();x.ellipse(cl.x,cl.y,cl.r*1.7,cl.r*.55,0,0,7);x.fill();
      x.beginPath();x.ellipse(cl.x+cl.r*.6,cl.y-cl.r*.25,cl.r,cl.r*.45,0,0,7);x.fill();
      if(!reduce){cl.x+=cl.v;if(cl.x-cl.r*2>W)cl.x=-cl.r*2;}});
    const bx=W*.5,by=H,gr=x.createLinearGradient(bx,by,cx,cy);gr.addColorStop(0,'rgba(255,226,140,.42)');gr.addColorStop(1,'rgba(255,226,140,.10)');
    x.fillStyle=gr;x.beginPath();x.moveTo(bx-10,by);x.lineTo(cx-rx*.92,cy);x.lineTo(cx+rx*.92,cy);x.lineTo(bx+10,by);x.fill();
    const flick=reduce?1:.94+Math.sin(t*.21)*.03+Math.sin(t*.53)*.03;
    const rg=x.createRadialGradient(cx,cy,ry*.15,cx,cy,rx);rg.addColorStop(0,'rgba(255,236,160,'+(.97*flick)+')');rg.addColorStop(.72,'rgba(250,214,105,'+(.88*flick)+')');rg.addColorStop(1,'rgba(250,214,105,0)');
    x.fillStyle=rg;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7);x.fill();
    x.fillStyle='rgba(6,8,14,.93)';x.font='700 '+Math.round(rx*.4)+'px "Fira Code", Consolas, monospace';x.textAlign='center';x.textBaseline='middle';
    x.fillText('{ KB }',cx,cy+2);
    x.restore();}
  function lightSignal(on){
    if(on===undefined)on=!sigOn;
    if(on&&root.getAttribute('data-theme')==='light')setMode(false);
    sigOn=on;hdr.classList.toggle('signal',on);sigHint.hidden=!on;clearTimeout(sigTimer);
    if(on){bats.forEach(b=>{b.v=(Math.random()<.5?-1:1)*(2.5+Math.random()*3.5);b.vy=-(.6+Math.random()*1.8);});sigTimer=setTimeout(()=>lightSignal(false),12000);}
    if(reduce)sig=on?1:0;
    kick();}
  document.getElementById('moon').addEventListener('click',e=>{e.stopPropagation();lightSignal();});
  hdr.addEventListener('click',e=>{if(sigOn&&!e.target.closest('#moon'))lightSignal(false);});
  function bat(b){const f=Math.sin(t*.25+b.ph)*.6;x.save();x.translate(b.x,b.y);x.scale(b.s*6,b.s*6);x.fillStyle='#0c0c0c';x.beginPath();x.moveTo(0,0);
    x.quadraticCurveTo(-1.2,-1-f,-2.6,-.3-f*1.4);x.quadraticCurveTo(-1.9,.1,-1.6,.5);x.quadraticCurveTo(-1,.2,-.4,.5);x.lineTo(0,.2);x.lineTo(.4,.5);x.quadraticCurveTo(1,.2,1.6,.5);x.quadraticCurveTo(1.9,.1,2.6,-.3-f*1.4);x.quadraticCurveTo(1.2,-1-f,0,0);x.fill();x.restore();}
  function drawDay(){
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#dcebf8');g.addColorStop(.7,'#f3f8fd');g.addColorStop(1,'#ffffff');x.fillStyle=g;x.fillRect(0,0,W,H);
    const mx=W*.94,my=H*.08,mr=Math.min(30,W*.05);
    x.fillStyle='rgba(255,200,90,.18)';x.beginPath();x.arc(mx,my,mr*2.6,0,7);x.fill();x.fillStyle='rgba(255,196,80,.85)';x.beginPath();x.arc(mx,my,mr,0,7);x.fill();
    clouds.forEach(cl=>{x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.ellipse(cl.x,cl.y*.7,cl.r*1.5,cl.r*.42,0,0,7);x.fill();
      x.beginPath();x.ellipse(cl.x+cl.r*.5,cl.y*.7-cl.r*.22,cl.r*.8,cl.r*.38,0,0,7);x.fill();});
    towers.forEach(tw=>{const top=H-tw.h;x.fillStyle='#d3dde8';x.fillRect(tw.x,top,tw.w,tw.h);
      if(tw.spire){x.beginPath();x.moveTo(tw.x+tw.w*.3,top);x.lineTo(tw.x+tw.w/2,top-tw.h*.25);x.lineTo(tw.x+tw.w*.7,top);x.fill();}
      tw.win.forEach(w=>{x.fillStyle='rgba(255,255,255,.75)';x.fillRect(tw.x+w.x,top+w.y,2,3);});});
    const v=x.createLinearGradient(0,0,W,0);v.addColorStop(0,'rgba(255,255,255,.7)');v.addColorStop(.6,'rgba(255,255,255,.35)');v.addColorStop(1,'rgba(255,255,255,.7)');x.fillStyle=v;x.fillRect(0,0,W,H);
    const f=x.createLinearGradient(0,H*.8,0,H);f.addColorStop(0,'rgba(255,255,255,0)');f.addColorStop(1,'rgba(255,255,255,1)');x.fillStyle=f;x.fillRect(0,H*.8,W,H*.2);}
  function draw(){
    if(root.getAttribute('data-theme')==='light'){drawDay();running=false;return;}
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#161616');g.addColorStop(.65,'#232323');g.addColorStop(1,'#2b2b2b');x.fillStyle=g;x.fillRect(0,0,W,H);
    const mx=W*.94,my=H*.08,mr=Math.min(30,W*.05);x.fillStyle='rgba(220,232,245,.06)';x.beginPath();x.arc(mx,my,mr*2.6,0,7);x.fill();x.fillStyle='rgba(225,233,242,.55)';x.beginPath();x.arc(mx,my,mr,0,7);x.fill();
    [[.18,0],[.72,2.3]].forEach(([p,o])=>{const a=-Math.PI/2+Math.sin(t*.007+o)*.55,bx=W*p,by=H,L=H*1.7,gr=x.createLinearGradient(bx,by,bx+Math.cos(a)*L,by+Math.sin(a)*L);
      gr.addColorStop(0,'rgba(235,235,225,.18)');gr.addColorStop(1,'rgba(235,235,225,0)');x.fillStyle=gr;x.beginPath();x.moveTo(bx-5,by);x.lineTo(bx+Math.cos(a-.08)*L,by+Math.sin(a-.08)*L);x.lineTo(bx+Math.cos(a+.08)*L,by+Math.sin(a+.08)*L);x.lineTo(bx+5,by);x.fill();});
    if(!reduce){if(sigOn&&sig<1)sig=Math.min(1,sig+.035);if(!sigOn&&sig>0)sig=Math.max(0,sig-.03);}
    if(sig>0)drawSignal();
    bats.forEach(b=>{bat(b);if(!reduce){b.x+=b.v;b.y+=Math.sin(t*.03+b.ph)*.3+(b.vy||0);if(b.vy)b.vy*=.985;
      if(b.x>W+40||b.x<-60||b.y<-40){b.x=-40;b.y=20+Math.random()*H*.5;b.v=.4+Math.random();b.vy=0;}}});
    towers.forEach(tw=>{const top=H-tw.h;x.fillStyle='#141414';x.fillRect(tw.x,top,tw.w,tw.h);if(tw.spire){x.beginPath();x.moveTo(tw.x+tw.w*.3,top);x.lineTo(tw.x+tw.w/2,top-tw.h*.25);x.lineTo(tw.x+tw.w*.7,top);x.fill();}
      tw.win.forEach(w=>{if(w.on){x.fillStyle='rgba(255,212,120,.5)';x.fillRect(tw.x+w.x,top+w.y,2,3);}});});
    const v=x.createLinearGradient(0,0,W,0);v.addColorStop(0,'rgba(43,43,43,.55)');v.addColorStop(.6,'rgba(43,43,43,.25)');v.addColorStop(1,'rgba(43,43,43,.6)');x.fillStyle=v;x.fillRect(0,0,W,H);
    t++;if(!reduce)requestAnimationFrame(draw);else running=false;}
  function kick(){if(!running){running=true;requestAnimationFrame(draw);}}
  build();addEventListener('resize',()=>{build();kick();});
  let saved=null;try{saved=localStorage.getItem('kbMode')}catch(e){}
  let preferDay=false;try{preferDay=matchMedia('(prefers-color-scheme: light)').matches}catch(e){}
  setMode(saved?saved==='day':preferDay);kick();

  /* ---------- KPI rings ---------- */
  const R=[
    {to:116000,suf:'+',unit:T('LOCATION CODES'),lbl:T('Coding'),col:'--r1',pct:1,
     k:'UN/LOCODE',p:T('More than 116,000 location codes kept accurate and published on schedule, used by customs systems, port community systems, maritime single windows, aviation networks and sustainability reporting worldwide.')},
    {to:5,suf:'',unit:T('UN STANDARDS'),lbl:T('I.T Solutions'),col:'--r2',pct:.85,
     k:T('UN/CEFACT portfolio'),p:T('UN/LOCODE, UN/EDIFACT, UN/CCL, UN/FLUX and the UN Recommendation code lists, maintained through Data Maintenance Requests submitted by experts worldwide.')},
    {to:5,suf:'',unit:T('ISO PROJECTS'),lbl:T('Technology'),col:'--r3',pct:.7,
     k:'ISO/TC 154/JWG 9',p:T('Five ISO projects, from the Trade Data Elements Directory and the Buy-Ship-Pay model to the DLT-based electronic bill of lading and the Digital Product Passport.')},
    {to:18,suf:'+',unit:T('YEARS'),lbl:T('Project Management'),col:'--r4',pct:.8,
     k:T('track record'),p:T('From IT intern at CIBC FirstCaribbean in 2008, through research for UNDP, teaching at UWI and ICT consulting in Barbados, to UN standards work in Geneva since 2021.')}
  ];
  const host=document.getElementById('rings'),C=2*Math.PI*52;
  host.innerHTML=R.map((r,i)=>`<button class="ring" data-i="${i}" aria-pressed="${i===0}">
    <svg viewBox="0 0 130 130" aria-hidden="true"><circle class="trk" cx="65" cy="65" r="52"/>
      <circle class="arc" cx="65" cy="65" r="52" style="stroke:var(${r.col});stroke-dasharray:${C};stroke-dashoffset:${C*(1-r.pct)}"/>
      <text class="n" x="65" y="68" text-anchor="middle">${NUM(r.to)}${r.suf}</text>
      <text class="u" x="65" y="84" text-anchor="middle">${r.unit}</text></svg>
    <span class="lbl">${r.lbl}</span></button>`).join('');
  const rings=[...host.querySelectorAll('.ring')],bK=document.getElementById('bK'),bP=document.getElementById('bP');
  function pick(i){rings.forEach((b,j)=>b.setAttribute('aria-pressed',i===j));bK.textContent='"'+R[i].k+'"';bP.textContent=R[i].p;}
  rings.forEach((b,i)=>b.addEventListener('click',()=>pick(i)));pick(0);
  if(!reduce&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;io.disconnect();
      rings.forEach((b,i)=>{const arc=b.querySelector('.arc'),n=b.querySelector('.n'),r=R[i],end=C*(1-r.pct);
        arc.style.transition='none';arc.style.strokeDashoffset=C;arc.getBoundingClientRect();arc.style.transition='';arc.style.strokeDashoffset=end;
        const s=performance.now();(function step(now){const p=Math.min(1,(now-s)/1600),e=1-Math.pow(1-p,3);n.textContent=NUM(Math.round(r.to*e))+r.suf;if(p<1)requestAnimationFrame(step);})(s);});
    },{threshold:.35});io.observe(host);}

  /* ---------- timeline filter ---------- */
  const fb=[...document.querySelectorAll('.filters button')];
  fb.forEach(b=>b.addEventListener('click',()=>{fb.forEach(o=>o.setAttribute('aria-pressed',o===b));const f=b.dataset.f;
    document.querySelectorAll('#tl > li').forEach(li=>li.hidden=!(f==='all'||li.dataset.g===f));}));

  /* ================= LOCODE HUNTER ================= */
  const LOC=[
    ['CHGVA','Geneva','Switzerland'],['CHZRH','Zurich','Switzerland'],['NLRTM','Rotterdam','Netherlands'],['NLAMS','Amsterdam','Netherlands'],
    ['SGSIN','Singapore','Singapore'],['DEHAM','Hamburg','Germany'],['DEFRA','Frankfurt am Main','Germany'],['USNYC','New York','United States'],
    ['USLAX','Los Angeles','United States'],['USHOU','Houston','United States'],['USSAV','Savannah','United States'],['USSEA','Seattle','United States'],
    ['GBLON','London','United Kingdom'],['GBFXT','Felixstowe','United Kingdom'],['FRPAR','Paris','France'],['FRMRS','Marseille','France'],['FRLEH','Le Havre','France'],
    ['CNSHA','Shanghai','China'],['CNNGB','Ningbo','China'],['CNSZX','Shenzhen','China'],['HKHKG','Hong Kong','Hong Kong, China'],
    ['JPTYO','Tokyo','Japan'],['JPYOK','Yokohama','Japan'],['KRPUS','Busan','Republic of Korea'],['TWKHH','Kaohsiung','Taiwan, Province of China'],
    ['BEANR','Antwerp','Belgium'],['AEDXB','Dubai','United Arab Emirates'],['BBBGI','Bridgetown','Barbados'],['JMKIN','Kingston','Jamaica'],
    ['TTPOS','Port of Spain','Trinidad and Tobago'],['ESVLC','Valencia','Spain'],['ESBCN','Barcelona','Spain'],['ESALG','Algeciras','Spain'],
    ['ITGOA','Genoa','Italy'],['PTLIS','Lisbon','Portugal'],['GRPIR','Piraeus','Greece'],['TRIST','Istanbul','Türkiye'],['IEDUB','Dublin','Ireland'],
    ['SEGOT','Gothenburg','Sweden'],['DKCPH','Copenhagen','Denmark'],['NOOSL','Oslo','Norway'],['FIHEL','Helsinki','Finland'],['PLGDN','Gdansk','Poland'],
    ['AUSYD','Sydney','Australia'],['NZAKL','Auckland','New Zealand'],['BRSSZ','Santos','Brazil'],['ARBUE','Buenos Aires','Argentina'],
    ['CLVAP','Valparaíso','Chile'],['PECLL','Callao','Peru'],['MXVER','Veracruz','Mexico'],['CAVAN','Vancouver','Canada'],['CAMTR','Montreal','Canada'],
    ['ZADUR','Durban','South Africa'],['KEMBA','Mombasa','Kenya'],['NGLOS','Lagos','Nigeria'],['TZDAR','Dar es Salaam','United Republic of Tanzania'],
    ['MAPTM','Tanger Med','Morocco'],['EGALY','Alexandria','Egypt'],['INBOM','Mumbai','India'],['LKCMB','Colombo','Sri Lanka'],
    ['MYPKG','Port Klang','Malaysia'],['THBKK','Bangkok','Thailand'],['VNSGN','Ho Chi Minh City','Viet Nam'],['IDJKT','Jakarta','Indonesia']
  ];
  const RANKS=[[0,T('Port Clerk')],[600,T('Customs Officer')],[1500,T('National Focal Point')],[3000,T('Maintenance Team Lead')],[5000,T('Secretary of the Advisory Group')]];
  const $=id=>document.getElementById(id);
  const game=$('game'),gS=$('gStart'),gP=$('gPlay'),gO=$('gOver'),gOpts=$('gOpts'),gTime=$('gTime');
  const batSvg='<svg viewBox="0 0 60 26"><use href="#bat"/></svg>';
  let best=0;try{best=+localStorage.getItem('kbLocodeBest')||0}catch(e){}
  let st=null,lastFocus=null,raf=0;
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const rankFor=s=>RANKS.reduce((r,[min,n])=>s>=min?n:r,RANKS[0][1]);
  function show(el){[gS,gP,gO].forEach(s=>s.hidden=s!==el);}
  function openGame(){lastFocus=document.activeElement;closeTerm();game.hidden=false;$('gBest0').textContent=NUM(best);show(gS);$('gGo').focus();}
  function closeGame(){cancelAnimationFrame(raf);st=null;game.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  function start(){st={score:0,streak:0,bestStreak:0,lives:3,right:0,asked:0,deck:shuffle(LOC.slice()),busy:false};show(gP);hud();next();}
  function hud(){$('gScore').textContent=NUM(st.score);$('gStreak').textContent=st.streak;
    $('gMult').textContent='×'+mult();$('gLives').innerHTML=[0,1,2].map(i=>batSvg.replace('<svg','<svg class="'+(i<st.lives?'':'lost')+'"')).join('');}
  const mult=()=>1+Math.floor(st.streak/3)*.5;
  function next(){
    if(!st.deck.length)st.deck=shuffle(LOC.slice());
    const q=st.deck.pop();st.q=q;st.asked++;st.busy=false;
    // distractors: prefer one from the same country, rest random
    const same=LOC.filter(l=>l[2]===q[2]&&l[0]!==q[0]),others=shuffle(LOC.filter(l=>l[2]!==q[2]));
    const d=[];if(same.length)d.push(same[Math.floor(Math.random()*same.length)]);while(d.length<3)d.push(others.pop());
    const opts=shuffle([q,...d]);st.opts=opts;
    $('gCode').innerHTML='<span class="cc">'+q[0].slice(0,2)+'</span>'+q[0].slice(2);
    $('gCountry').textContent=T('// {0} = country, {1} = place. Where is it?',q[0].slice(0,2),q[0].slice(2));
    $('gFact').textContent='';
    gOpts.innerHTML=opts.map((o,i)=>`<button class="g-opt" data-i="${i}"><kbd>${i+1}</kbd><span>${o[1]}, ${ctry(o)}</span></button>`).join('');
    st.t0=performance.now();st.dur=10000;tick();}
  function tick(){cancelAnimationFrame(raf);
    (function f(now){if(!st||st.busy)return;const left=Math.max(0,1-(now-st.t0)/st.dur);gTime.style.transform='scaleX('+left+')';gTime.classList.toggle('low',left<.3);
      if(left<=0){answer(-1);return;}raf=requestAnimationFrame(f);})(performance.now());}
  function answer(i){
    if(!st||st.busy)return;st.busy=true;cancelAnimationFrame(raf);
    const q=st.q,ci=st.opts.indexOf(q),btns=[...gOpts.children];btns.forEach(b=>b.disabled=true);btns[ci].classList.add('ok');
    const left=Math.max(0,1-(performance.now()-st.t0)/st.dur);
    if(i===ci){st.streak++;st.right++;st.bestStreak=Math.max(st.bestStreak,st.streak);const pts=Math.round((100+left*100)*mult());st.score+=pts;
      $('gFact').innerHTML='<span class="v">+'+pts+'</span> '+T('{0} = {1}, {2}. {3} is the ISO 3166-1 country code.',q[0],q[1],ctry(q),q[0].slice(0,2));}
    else{st.lives--;st.streak=0;if(i>=0)btns[i].classList.add('bad');$('gCode').classList.remove('shake');void $('gCode').offsetWidth;$('gCode').classList.add('shake');
      $('gFact').innerHTML=(i<0?'<span class="in">'+T('timeout.')+'</span> ':'<span class="in">'+T('miss.')+'</span> ')+T('{0} = {1}, {2}.',q[0],q[1],ctry(q));}
    hud();setTimeout(()=>{if(!st)return;st.lives>0?next():over();},i===ci?900:1600);}
  function over(){
    const s=st.score,isNew=s>best;if(isNew){best=s;try{localStorage.setItem('kbLocodeBest',String(best))}catch(e){}}
    $('gFinal').textContent=NUM(s);$('gRank').textContent='"'+rankFor(s)+'"';$('gBest1').textContent=NUM(best);
    $('gNew').textContent=isNew&&s>0?T('// new personal best'):'';
    $('gStats').textContent='correct = '+st.right+'/'+st.asked+';  best_streak = '+st.bestStreak+';';
    $('gCopied').textContent='';show(gO);$('gAgain').focus();}
  $('gMax').onclick=()=>{const w=game.querySelector('.win'),big=w.classList.toggle('big');$('gMax').title=big?T('Restore size'):T('Enlarge');$('gMax').setAttribute('aria-label',big?T('Restore game window size'):T('Enlarge game window'));};
  $('gGo').onclick=start;$('gAgain').onclick=start;$('gClose').onclick=closeGame;
  game.addEventListener('click',e=>{if(e.target===game)closeGame();});
  gOpts.addEventListener('click',e=>{const b=e.target.closest('.g-opt');if(b)answer(+b.dataset.i);});
  $('gShare').onclick=()=>{const txt=T('I scored {0} in LOCODE Hunter ({1}). Can you name the port behind the code?',NUM(st.score),rankFor(st.score));
    const done=()=>$('gCopied').textContent=T('// copied to clipboard');
    try{navigator.clipboard.writeText(txt).then(done,()=>{$('gCopied').textContent=txt;});}catch(e){$('gCopied').textContent=txt;}};
  $('openGame').onclick=openGame;$('avatar').onclick=openGame;

  /* ================= TERMINAL ================= */
  const term=$('term'),tOut=$('tOut'),tIn=$('tIn');let hist=[],hi=0,termOpened=false;
  const SECTIONS=['skills','experience','education','projects','ict','publications','honours','featured','additional'];
  function line(txt,cls){const d=document.createElement('div');d.className=cls||'o';d.textContent=txt;tOut.appendChild(d);tOut.scrollTop=tOut.scrollHeight;return d;}
  function setTermState(st2){term.classList.toggle('min',st2==='min');term.classList.toggle('max',st2==='max');
    $('tState').textContent=st2==='min'?T('minimised · click to restore'):st2==='max'?T('maximised'):'';
    $('tMax').title=st2==='max'?T('Restore size'):T('Maximise');$('tMin').title=st2==='min'?T('Restore'):T('Minimise');
    if(st2!=='min')setTimeout(()=>tIn.focus(),30);}
  function termState(){return term.classList.contains('min')?'min':term.classList.contains('max')?'max':'normal';}
  function openTerm(){term.hidden=false;if(termState()==='min')setTermState('normal');if(!termOpened){termOpened=true;
      line('Gotham OS 2.6 (kevin_bishop.js) — tty1','hl');line(T("Type 'help' to see commands. Tab completes, ↑ recalls, Esc closes."));line(T("Window: yellow minimises, green maximises, drag the top edge to resize, double-click the title bar."));}
    setTimeout(()=>tIn.focus(),30);addLineNum();}
  function closeTerm(){if(term.hidden)return;term.hidden=true;}
  const ROLES=[['2024–now',T('Secretary, UN/LOCODE Advisory Group'),'UNECE'],['2021–now',T('Associate Information Management Officer'),'UNECE · UN/CEFACT'],
    ['2023–now',T('Secretary, ISO/TC 154/JWG 9'),'ISO'],['2019–21',T('ICT Management Specialist'),'Haigh Communications'],['2019–21',T('Teaching Assistant'),'UWI'],
    ['2013–15',T('Quantitative Research Analyst'),'UNDP'],['2012–13',T('Research Consultant'),'CPDC'],['2010–12',T('Research Assistant'),'UWI'],
    ['2010',T('Intern, Test & Dispatch Technician'),'LIME'],['2008',T('Intern, IT Technical Analyst'),'CIBC FirstCaribbean']];
  const roleLines=()=>{const t=ROLES.map(r=>r[1]),w=Math.max(...t.map(x=>x.length))+2;return ROLES.map((r,n)=>r[0].padEnd(10)+t[n].padEnd(w)+r[2]);};
  const L=(...a)=>a.join('\n');
  const FILES={
    'about.txt':L(T('Kevin Bishop. Digitization and standards specialist at UNECE / UN/CEFACT in Geneva, originally from Barbados.'),T('Secretary of UN/LOCODE and UN/EDIFACT, focal point for methodology and technology, Secretary of ISO/TC 154/JWG 9.'),T('Likes: summer, the beach, chess, coding, bad puns.')),
    'locode.txt':L(T('UN/LOCODE: the United Nations Code for Trade and Transport Locations.'),T('116,000+ five-character codes: 2 letters for the country (ISO 3166-1), 3 for the place.'),T('Used by customs, port community systems, maritime single windows, aviation and supply chains.'),T('Try: locode CHGVA')),
    'now.txt':L(T('2026–27 focus:'),T('- UN/CEFACT Plenary, Forum, Bureau and expert meetings (incl. Bureau elections)'),T('- Communications and outreach for the Digital Connectivity Unit and UN/CEFACT'),T('- ISO/TC 154/JWG 9 secretariat; liaison with ISO, WCO, IMO, FAO, UPU'),T('- Projects: Multimodal Transport data, GRID, Buy-Ship-Pay for trade finance'),T('- UN/LOCODE on the UN open-source platform')),
    'featured.txt':L(T('The Bajan Reporter (24 Jun 2012): student team wins CIBC FirstCaribbean UWI business plan contest with Bookline'),'  https://www.bajanreporter.com/2012/06/barbadian-student-team-cops-1st-prize-in-cibc-firstcaribbeans-uwi-business-plan-contest/',T('Speaker, NTFC Session D11: climate-smart trade facilitation (GSCF 2024, Bridgetown, 23 May 2024)'),'  https://unctad.org/meeting/ntfc-session-11-national-trade-facilitation-committees-involvement-pioneering-climate-smart',T('UNODC human impact story: Community Leadership in Urban Safety Governance Assessments'),'  https://www.unodc.org/unodc/en/sustainable-development-goals/human-impact-stories/community-leadership-in-urban-safety-governance-assessments.html',T('  (part of UNODCity: {0})','https://www.unodc.org/unodc/en/urban-safety/crime-prevention/unodcity/unodcity-pilots.html'),T('UNCTAD speaker profile'),'  https://unctad.org/speaker/kevin-bishop'),
    'contact.txt':'website   = kevin-bish.com\nlinkedin  = linkedin.com/in/kevinbishp\ngithub    = github.com/kevinbish\ninstagram = instagram.com/kevinbish\nfacebook  = facebook.com/kevin.bishp\nvsco      = vsco.co/kevinbish/gallery\nspotify   = Kevin Bish (open.spotify.com/user/1212889341)',
    'skills.json':'{ "standards": ["UN/LOCODE","UN/EDIFACT","UN/CCL","UN/FLUX"],\n  "code": ["Python","Java","JavaScript","PHP","SQL","Bash"],\n  "devops": ["Git","Bitbucket","Bamboo","Drupal","Confluence"],\n  "research": ["R","SPSS","STATA"] }'
  };
  const CMDS={
    help(){[['help',T('this list')],['whoami',T('who is this?')],['ls [experience]',T('list sections or roles')],['cat <file>',T('read about.txt, now.txt, featured.txt, locode.txt, contact.txt, skills.json')],
      ['cd <section>',T('jump to a section')],['locode <CODE>',T('look up a code, e.g. locode NLRTM')],['play',T('start LOCODE Hunter')],['mail',T('write Kevin a message')],['signal',T('light the sky')],
      ['social',T("all of Kevin's links")],['theme light|dark',T('switch mode')],['date',T('current date and time')],['echo <text>',T('print text')],['history',T('previous commands')],['clear',T('clear the screen')],['exit',T('close the terminal')]]
      .forEach(([c,d])=>line(c.padEnd(18)+d));line(T("…and maybe a sudo command or two."),'o');},
    whoami(){line('Kevin Bishop','hl');line(T('UN/LOCODE & UN/EDIFACT Secretary · UNECE / UN/CEFACT · Geneva (via Barbados)'));},
    ls(a){if(a[0]==='experience'||a[0]==='experience/'){roleLines().forEach(r=>line(r));return;}
      if(a[0]){line(T("ls: cannot access '{0}': try ls or ls experience",a[0]),'err');return;}
      line(SECTIONS.map(s=>s+'/').join('  '),'hl');line(Object.keys(FILES).join('  '));},
    cat(a){const f=FILES[a[0]];if(!a[0])line(T('cat: which file? try cat about.txt'),'err');else if(f)f.split('\n').forEach(l=>line(l));else line(T('cat: {0}: No such file',a[0]),'err');},
    cd(a){const s=(a[0]||'').replace(/\/$/,'');if(!s||s==='~'){closeTerm();scrollTo({top:0,behavior:'smooth'});return;}
      if(SECTIONS.includes(s)){line('→ '+s,'ok');setTimeout(()=>{closeTerm();$(s).scrollIntoView({behavior:reduce?'auto':'smooth'});},250);}else line(T('cd: {0}: No such section. Try: {1}',s,SECTIONS.join(', ')),'err');},
    locode(a){const c=(a[0]||'').toUpperCase().replace(/\s/g,'');if(!c){line(T('usage: locode <CODE>   e.g. locode SGSIN'),'err');return;}
      const hit=LOC.find(l=>l[0]===c);if(hit){line(c+'  →  '+hit[1]+', '+ctry(hit),'ok');line(T('country {0} · location {1}',c.slice(0,2),c.slice(2)));}
      else if(/^[A-Z]{2}[A-Z2-9]{3}$/.test(c))line(T("{0} is a valid-looking code, but not in this page's demo set. The full code list (116,000+ entries) is published by UNECE.",c));
      else line(T('locode: "{0}" is not a code. Format: 2-letter country + 3-character place, e.g. BBBGI',c),'err');},
    play(){line(T('launching locode_hunter.exe…'),'ok');setTimeout(openGame,300);},
    mail(){line(T('opening compose_message()…'),'ok');setTimeout(openMail,300);},
    signal(){line('signal.lit = true;','ok');closeTerm();scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(()=>lightSignal(true),reduce?0:450);},
    theme(a){const v=(a[0]||'').toLowerCase();if(v==='day'||v==='light'){setMode(true);line('theme = "light";','ok');}else if(v==='night'||v==='dark'){setMode(false);line('theme = "dark";','ok');}else line('usage: theme light | theme dark','err');},
    date(){line(new Date().toString());},
    echo(a){line(a.join(' '));},
    history(){hist.forEach((h,i)=>line(String(i+1).padStart(3)+'  '+h));},
    clear(){tOut.textContent='';},
    exit(){closeTerm();},
    sudo(a){const s=a.join(' ').toLowerCase();
      if(s==='hire kevin'){line(T('[sudo] password for recruiter: ********'));line(T('Access granted. Opening secure channel…'),'ok');FILES['contact.txt'].split('\n').forEach(l=>line(l,'hl'));}
      else line(T('Nice try. This incident will be reported to the Advisory Group.'),'err');},
    social(){FILES['contact.txt'].split('\n').forEach(l=>line(l,'hl'));},
    batman(){line(T("I'm not saying Kevin is Batman. I'm saying nobody has seen them in the same room."),'hl');},
    rm(a){line(a.join(' ').includes('-rf')?T('rm: permission denied. The codes stay up.'):T('rm: permission denied'),'err');}
  };
  CMDS.message=CMDS.mail;CMDS.contact=CMDS.mail;CMDS.locate=CMDS.locode;CMDS.man=CMDS.help;CMDS['?']=CMDS.help;
  function run(raw){const v=raw.trim();line(v,'cmd');if(!v)return;hist.push(v);hi=hist.length;
    const [c,...a]=v.split(/\s+/),fn=CMDS[c.toLowerCase()];if(fn)fn(a);else line(T("{0}: command not found. Type 'help'.",c),'err');}
  $('tForm').addEventListener('submit',e=>{e.preventDefault();run(tIn.value);tIn.value='';});
  tIn.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){if(hi>0){hi--;tIn.value=hist[hi];}e.preventDefault();}
    else if(e.key==='ArrowDown'){if(hi<hist.length-1){hi++;tIn.value=hist[hi];}else{hi=hist.length;tIn.value='';}e.preventDefault();}
    else if(e.key==='Tab'){e.preventDefault();const parts=tIn.value.split(' ');
      const pool=parts.length===1?Object.keys(CMDS):parts[0]==='cd'?SECTIONS:parts[0]==='cat'?Object.keys(FILES):parts[0]==='ls'?['experience']:[];
      const last=parts[parts.length-1],m=pool.filter(p=>p.startsWith(last));
      if(m.length===1){parts[parts.length-1]=m[0];tIn.value=parts.join(' ')+(parts.length===1?' ':'');}else if(m.length>1)line(m.join('  '));}
    else if(e.key==='Escape'){closeTerm();}});
  term.addEventListener('click',e=>{if(!e.target.closest('button'))tIn.focus();});
  $('tClose').onclick=e=>{e.stopPropagation();closeTerm();};
  $('tMin').onclick=e=>{e.stopPropagation();setTermState(termState()==='min'?'normal':'min');};
  $('tMax').onclick=e=>{e.stopPropagation();setTermState(termState()==='max'?'normal':'max');};
  $('tBar').addEventListener('click',e=>{if(termState()==='min'&&!e.target.closest('button'))setTermState('normal');});
  $('tBar').addEventListener('dblclick',e=>{if(e.target.closest('button'))return;setTermState(termState()==='max'?'normal':'max');});
  (function(){const g=$('tGrip');let drag=false;
    g.addEventListener('pointerdown',e=>{drag=true;g.setPointerCapture(e.pointerId);term.classList.add('dragging');setTermState('normal');e.preventDefault();});
    g.addEventListener('pointermove',e=>{if(!drag)return;const hgt=Math.max(140,Math.min(innerHeight-60,innerHeight-e.clientY));term.style.height=hgt+'px';});
    const end=()=>{drag=false;term.classList.remove('dragging');};g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);})();
  $('openTerm').onclick=()=>term.hidden||termState()==='min'?openTerm():closeTerm();

  /* ---------- compose_message(): a console that builds a ready-to-send email (mailto) ---------- */
  const mail=$('mail'),mForm=$('mForm'),mNames=['mName','mEmail','mSubject','mBody'];
  /* the address is assembled here so it is not sitting in the page text for scrapers */
  const MAIL_TO=['kevin.bish','live.com'].join('@');
  let mOpenedAt=0,mFocusBack=null,mSent=false,mMsg='';
  const mErr=$('mErr');
  function mReset(){mForm.reset();mErr.textContent='';$('mCompose').hidden=false;$('mSent').hidden=true;$('mAfter').hidden=true;$('mCopied').textContent='';$('mLog').innerHTML='';mail.firstElementChild.classList.remove('sending');mSent=false;}
  function openMail(){mFocusBack=document.activeElement;closeTerm();mReset();mail.hidden=false;mOpenedAt=Date.now();$('mName').focus();}
  function closeMail(){mail.hidden=true;if(mFocusBack&&mFocusBack.focus)mFocusBack.focus();}
  const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));
  async function mLine(text,cls){const d=document.createElement('div');if(cls)d.className=cls;$('mLog').append(d);
    if(reduce){d.textContent=text;return;}
    for(let i=1;i<=text.length;i++){d.textContent=text.slice(0,i);await wait(14);}}
  mForm.addEventListener('submit',async e=>{
    e.preventDefault();if(mSent)return;
    const name=$('mName').value.trim(),email=$('mEmail').value.trim(),subj=$('mSubject').value.trim(),body=$('mBody').value.trim();
    mErr.textContent='';
    if(!name){mErr.textContent=T('// name is required');$('mName').focus();return;}
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){mErr.textContent=T('// that reply_to does not look like an email address');$('mEmail').focus();return;}
    if(body.length<5){mErr.textContent=T('// say a little more in the body');$('mBody').focus();return;}
    mSent=true;
    /* trap field and timing: for bots. A real visitor needs more than a couple of seconds to fill this in. */
    const bot=$('mTrap').value!==''||Date.now()-mOpenedAt<2500;
    $('mCompose').hidden=true;$('mSent').hidden=false;mail.firstElementChild.classList.add('sending');
    await mLine(T('> validating message… ok'),'ok');
    await mLine(T('> encrypting signal… ok'),'ok');
    mMsg=body+'\n\n— '+name+(email?' <'+email+'>':'');
    if(bot){await mLine(T('> signal dropped.'));mail.firstElementChild.classList.remove('sending');$('mAfter').hidden=false;return;}
    await mLine(T('> opening your mail app…'),'hl');
    const a=document.createElement('a');
    a.href='mailto:'+MAIL_TO+'?subject='+encodeURIComponent(subj||T('Message from kevin-bish.com'))+'&body='+encodeURIComponent(mMsg);
    document.body.append(a);a.click();a.remove();
    await wait(500);
    mail.firstElementChild.classList.remove('sending');
    await mLine(T('// if your mail app did not open, copy the message and the address and send it from any email.'));
    $('mAfter').hidden=false;$('mCopyMsg').focus();});
  async function mCopy(text,label){let ok=false;try{await navigator.clipboard.writeText(text);ok=true;}catch(e){}
    $('mCopied').textContent=ok?T('// {0} copied',label):T('// could not copy automatically: {0}',text);}
  $('mCopyMsg').onclick=()=>mCopy(mMsg,T('message'));
  $('mCopyTo').onclick=()=>mCopy(MAIL_TO,T('address'));
  $('mClose').onclick=closeMail;$('mCancel').onclick=closeMail;$('mDone').onclick=closeMail;
  mail.addEventListener('click',e=>{if(e.target===mail)closeMail();});
  mail.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.stopPropagation();closeMail();return;}
    if(e.key==='Tab'){const f=[...mail.querySelectorAll('button,input:not(.trap),textarea,a[href]')].filter(x=>!x.hidden&&x.offsetParent!==null);
      if(!f.length)return;const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });

  /* hero action links */
  document.querySelectorAll('.act').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.act;
    if(a==='play')openGame();else if(a==='signal')lightSignal(true);else if(a==='mail')openMail();else openTerm();}));

  /* global keys */
  document.addEventListener('keydown',e=>{
    const typing=/input|textarea|select/i.test(e.target.tagName);
    if(!game.hidden){
      if(e.key==='Escape'){closeGame();return;}
      if(st&&!gP.hidden&&/^[1-4]$/.test(e.key)){answer(+e.key-1);e.preventDefault();}
      return;}
    if(e.key==='Escape'){if(!term.hidden)closeTerm();else if(sigOn)lightSignal(false);return;}
    if(!typing&&(e.key==='`'||e.key==='~')){e.preventDefault();term.hidden||termState()==='min'?openTerm():closeTerm();}
  });
  /* ---------- last signal: latest commit on main, from the public GitHub API ---------- */
  (function(){
    const el=document.getElementById('stamp'); if(!el) return;
    const KEY='lastSignal.v1', TTL=10*60*1000;
    function show(c){
      const d=new Date(c.date);
      document.getElementById('stampDate').dateTime=c.date;
      document.getElementById('stampDate').textContent=d.toLocaleDateString(LOCALE,{day:'numeric',month:'short',year:'numeric'}).toUpperCase()+' '+d.toLocaleTimeString(LOCALE,{hour:'2-digit',minute:'2-digit'})+' '+(Intl.DateTimeFormat().resolvedOptions().timeZone||'');
      document.getElementById('stampSha').textContent=T('COMMIT {0}',c.sha.slice(0,7));
      const a=document.getElementById('stampLink'); a.href=c.url; a.title=c.msg;
      a.setAttribute('aria-label',T('Last signal: {0}, {1}',document.getElementById('stampDate').textContent,document.getElementById('stampSha').textContent));
      el.hidden=false;
      if(reduce) return;
      prime();
      if('IntersectionObserver' in window){
        const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();decode();}},{threshold:.9});
        io.observe(el);
      } else decode();
      el.addEventListener('mouseenter',decode);
    }

    /* decipher effect: characters resolve left to right out of scrambled glyphs */
    const CH='ABCDEF0123456789#$%&*?<>/', TICK=36;
    let segs=null, running=false;
    function grab(){
      if(segs) return segs;
      segs=[el.querySelector('.st-k'),document.getElementById('stampDate'),document.getElementById('stampSha')].map(e=>({e,t:e.textContent}));
      return segs;
    }
    function frame(tick,at){
      let k=0;
      grab().forEach(s=>{
        let h='';
        for(const ch of s.t){
          const live=/[\p{L}\p{N}]/u.test(ch), i=k++;
          h+= !live||tick>=at[i] ? ch : '<i class="u">'+CH[Math.random()*CH.length|0]+'</i>';
        }
        s.e.innerHTML=h;
      });
    }
    function lock(on){grab().forEach(s=>{s.e.classList.toggle('dec',on); s.e.style.minWidth=on?s.w+'px':'';});}
    function prime(){ frame(0,grab().flatMap(s=>[...s.t].map(()=>1e9))); }
    function decode(){
      if(running) return; running=true;
      /* measure the real text at its final size (fonts are loaded by now), then hold that width while it scrambles */
      grab().forEach(s=>{s.e.textContent=s.t; s.e.classList.remove('dec'); s.e.style.minWidth=''; s.w=s.e.getBoundingClientRect().width;});
      lock(true);
      const n=grab().reduce((a,s)=>a+[...s.t].length,0);
      const at=Array.from({length:n},(_,i)=>Math.round(i*.55+Math.random()*5)+3);
      let tick=0;
      const id=setInterval(()=>{
        frame(tick++,at);
        if(tick>Math.max(...at)+1){
          clearInterval(id);
          grab().forEach(s=>{s.e.textContent=s.t;}); lock(false); running=false;
        }
      },TICK);
    }
    try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null'); if(s&&Date.now()-s.t<TTL){show(s.c);return;}}catch(e){}
    fetch('https://api.github.com/repos/kevinbish/kevin-bish.com/commits/main',{headers:{Accept:'application/vnd.github+json'}})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(j=>{const c={sha:j.sha,date:j.commit.committer.date,url:j.html_url,msg:j.commit.message.split('\n')[0]};
        try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),c}));}catch(e){}
        show(c);})
      .catch(()=>{});
  })();
  /* ---------- music card: link to Spotify; with data-embed set, the player loads only after a click ---------- */
  (function(){
    const m=document.getElementById('music'); if(!m) return;
    const play=m.querySelector('.m-play'), frame=document.getElementById('musicFrame'), sub=document.getElementById('musicSub');
    const embed=m.dataset.embed||'';
    const ok=/^https:\/\/open\.spotify\.com\/embed\/(playlist|album|artist|track|show|episode)\/[A-Za-z0-9]+(\?[\w=&%-]*)?$/.test(embed);
    if(ok){ sub.textContent=T('// my playlist: click to load the Spotify player');
      play.title=T('Play my playlist (nothing loads from Spotify until you click)'); }
    play.addEventListener('mouseenter',()=>m.classList.add('playing'));
    play.addEventListener('mouseleave',()=>m.classList.remove('playing'));
    play.addEventListener('click',e=>{
      if(!ok) return;                       /* no embed configured: the link opens the Spotify profile */
      e.preventDefault();
      const f=document.createElement('iframe');
      f.src=embed; f.title='Spotify player'; f.height='352'; f.setAttribute('allowfullscreen','');
      f.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      const x=document.createElement('button'); x.type='button'; x.className='m-close'; x.textContent='close_player();';
      x.addEventListener('click',()=>{frame.hidden=true; frame.textContent=''; m.classList.remove('open','playing'); play.focus();});
      /* fallback in case the embedded player does not load in a visitor's browser */
      const o=document.createElement('a'); o.className='m-close'; o.href=m.dataset.open||m.dataset.profile; o.target='_blank'; o.rel='noopener'; o.textContent='open_in_spotify();';
      frame.textContent=''; frame.append(f,x,document.createTextNode(' '),o); frame.hidden=false; m.classList.add('open','playing');
    });
  })();
  /* ---------- language menu: close on outside click or Escape ---------- */
  (function(){const d=document.querySelector('.lang');if(!d)return;
    document.addEventListener('click',e=>{if(d.open&&!d.contains(e.target))d.open=false;});
    d.addEventListener('keydown',e=>{if(e.key==='Escape'&&d.open){d.open=false;d.querySelector('summary').focus();e.stopPropagation();}});})();

  /* ---------- printing: open every <details> so the full text is on paper, then put them back ---------- */
  (function(){
    const was=new Set();
    const open=()=>document.querySelectorAll('details:not([open])').forEach(d=>{was.add(d);d.open=true;});
    const restore=()=>{was.forEach(d=>{d.open=false;});was.clear();};
    addEventListener('beforeprint',open);addEventListener('afterprint',restore);
    const mq=matchMedia('print');
    if(mq.addEventListener) mq.addEventListener('change',e=>e.matches?open():restore());
  })();
})();
