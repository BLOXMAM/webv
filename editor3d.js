// editor3d.js — استوديو مباشر: العالم + صانع النماذج (تشكيل/نحت) + ربط الهيكل + تصميم الحركات
import*as K from './kit3d.js';
const THU='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const H={move:'اضغط أي مجسم لتحديده واسحبه لتحريكه. اسحب الخلفية لتدوير الكاميرا، وبإصبعين للتقريب والتدوير.',rot:'اسحب المجسم يمينًا ويسارًا ليدور.',scale:'اسحب المجسم للأعلى للتكبير وللأسفل للتصغير.',
sculpt:'اضغط على المجسم وحرّك لنحته. الحلقة الصفراء هي الفرشاة. «سحب حر» يسحب الجزء كالطين، والبقية تعمل ما دمت ضاغطًا.',
rig:'اضغط جزءًا ثم اختر العظمة التي يتحرك معها. حرّك النقاط الحمراء (محاور الدوران) إلى المفاصل: الكتف والورك والرقبة.',
anim:'اختر حركة، حرّك الزمن، ثم دوّر العظام (اسحب جزءًا أو استخدم المنزلقات) واضغط «ثبّت إطارًا». الحركة تُشغَّل في القصة باسمها.'};
const r3=x=>Math.round(x*1e3)/1e3,D2R=Math.PI/180;
const deg=P=>{const R={};for(const b in P)R[b]=b=='y'?+P.y.toFixed(3):P[b].map(x=>+(x/D2R).toFixed(1));return R},rad=P=>{const R={};for(const b in P)R[b]=b=='y'?P.y:P[b].map(x=>x*D2R);return R};
export async function open(c){const{D,h,toast}=c,model=c.model,isM=!!model,sc=c.sc;let TH;try{TH=await import(THU)}catch(e){return toast('تعذّر تحميل محرك 3D')}
if(isM){model.parts=model.parts||[];model.anims=model.anims||{}}
const cv=h('canvas',{style:'width:100%;height:min(52vh,480px);border-radius:12px;touch-action:none;background:#000;display:block'}),mt=h('div',{class:'row'}),tb=h('div',{class:'row'}),hint=h('p',{class:'mu',style:'margin:2px 0'}),pal=h('div',{class:'row',style:'overflow-x:auto;flex-wrap:nowrap'}),cp=h('div'),
d=c.dlg(h('h3',{},isM?'🧱 صانع النماذج والشخصيات':'🏗 استوديو العالم'),mt,tb,hint,cv,pal,cp,h('div',{class:'row'},h('button',{onclick:()=>d.close()},'تم')));d.style.width='min(98vw,900px)';
let r;try{r=new TH.WebGLRenderer({canvas:cv,antialias:true})}catch(e){d.close();return toast('المتصفح لا يدعم WebGL')}
r.shadowMap.enabled=true;const cam=new TH.PerspectiveCamera(45,1,.1,300),gm=K.gmap(TH),Mt=K.mat(TH,gm,!isM),tg=new TH.Vector3(0,isM?.9:1,0),ray=new TH.Raycaster(),pts=new Map();
let S,bx,ring,EV=null,fxs=[],PV=null,pvm=false,tlEl=null,RG=null,rigs=[],mkrs={},snapOn=false,tool='move',ed3='shape',sel=null,yaw=.6,pit=.35,dist=isM?4.5:14,ax='y',vert=false,brush='grab',rad0=.3,str=.6,sym=true,ruler=false,items=[],stack=[],mode=null,st=null,raf,addA=Object.keys(D.actors||{})[0]||'',
clip=Object.keys(model?model.anims:{})[0]||'',T=0,play=false,pose={},bone='armR',pvb='body',tsl,tlab,psl=[],ysl,last=0;
const Bt=(t,on,f)=>h('button',{class:'g s'+(on?' on':''),onclick:f},t),L=(t,x)=>h('label',{class:'L'},t,x),
Rg=(t,v,f,mn,mx,s)=>{const i=h('input',{type:'range',min:mn,max:mx,step:s,value:v,oninput:e=>f(+e.target.value)}),l=L(t,i);l.i=i;return l},
Co=(t,v,f)=>L(t,h('input',{type:'color',style:'width:48px;height:36px;padding:2px',value:v,oninput:e=>f(e.target.value)})),
clampD=()=>dist=Math.max(1.5,Math.min(80,dist)),cl=()=>model.anims[clip],
sync=it=>{const o=it.o,g=it.g;g.position.set(...(o.pos||[0,0,0]));if(isM){g.rotation.set(...(o.rot||[0,0,0]).map(x=>x*D2R));g.scale.set(...(o.sc||[1,1,1]))}else{g.rotation.y=(o.rot||0)*D2R;g.scale.setScalar(o.scale||1)}},
hl=()=>{if(bx){S.remove(bx);bx.geometry.dispose()}bx=null;const it=sel&&items.find(x=>x.o==sel);if(it){bx=new TH.BoxHelper(it.g,0xffd24a);S.add(bx)}},
rb=()=>{S&&K.free(S);S=new TH.Scene();bx=null;RG=null;rigs=[];mkrs={};EV=K.stage(TH,S,isM?{preset:'day',ground:'#4a5064'}:sc.env,Mt);if(!isM)K.setShadows(r,S,{...(sc.env.shadow||{}),q:Math.min((sc.env.shadow||{}).q??3,3)});items=[];fxs=[];if(!isM)[].concat(sc.env.weather||[]).forEach(w=>{const f=K.mkParticles(TH,{...w,scale:.6});fxs.push(f);S.add(f.o)});const md=D.models||{};
ring=new TH.Mesh(new TH.RingGeometry(.92,1,48),new TH.MeshBasicMaterial({color:0xffd24a,side:2,depthTest:false,transparent:true,opacity:.9}));ring.visible=false;ring.renderOrder=9;S.add(ring);
if(isM){S.add(new TH.GridHelper(10,20,0x888888,0x555555));
 if(ed3=='anim'){RG=K.mkRig(TH,model,Mt);S.add(RG.o);RG.meshes.forEach((m,i)=>items.push({o:model.parts[i],g:m}))}
 else{const g=K.mkModel(TH,model,Mt);S.add(g);g.children.forEach((m,i)=>items.push({o:model.parts[i],g:m}));
  if(ed3=='rig'){const pv={...K.PIV,...(model.piv||{})};K.BONES.forEach(([b])=>{const m=new TH.Mesh(new TH.SphereGeometry(.05,10,8),new TH.MeshBasicMaterial({color:b==pvb?0xffd24a:0xff5555,depthTest:false}));m.renderOrder=9;m.position.set(...pv[b]);S.add(m);mkrs[b]=m})}}
 if(ruler){const P=K.mkChar(TH,{},Mt);P.o.position.x=1.3;S.add(P.o)}}
else{const gr=new TH.GridHelper(40,40,0x777777,0x444444);gr.position.y=.01;S.add(gr);
 sc.props.forEach(p=>{let o;if(p.t=='fx'){const f=K.mkParticles(TH,{...p,scale:.6});fxs.push(f);o=f.o}else if(p.t=='scroller')o=K.mkScroller(TH,{...p,speed:0},Mt).o;else o=p.m?K.mkModel(TH,md[p.m]||{},Mt):K.mkProp(TH,p,Mt);
if(p.t=='fx'||p.t=='scroller'||(p.k=='light'&&!p.vis))o.add(new TH.Mesh(new TH.SphereGeometry(.25,8,6),new TH.MeshBasicMaterial({color:0xffd24a,wireframe:true,depthTest:false,userData:{outlineParameters:{visible:false}}})));S.add(o);const it={o:p,g:o};sync(it);items.push(it)});
 for(const k in sc.cast){const q=sc.cast[k],A=D.actors[k]||{},mm=A.cm&&md[A.cm];let o;
  if(mm&&(mm.rig||(mm.parts||[]).some(p=>p.b))){const R=K.mkRig(TH,mm,Mt);rigs.push(R);o=R.o}else if(mm)o=K.mkModel(TH,mm,Mt);else{const R=K.mkChar(TH,A.look||{top:A.color},Mt);rigs.push(R);o=R.o}
  S.add(o);const it={o:q,g:o,k};sync(it);items.push(it)}}
if(sel&&!items.some(x=>x.o==sel))sel=null;hl()},
snap=()=>{stack.push(JSON.stringify(isM?model.parts:[sc.props,sc.cast]));stack.length>25&&stack.shift()},
undo=()=>{const s=stack.pop();if(!s)return toast('لا يوجد ما يُتراجع عنه');const v=JSON.parse(s);if(isM)model.parts.splice(0,1e9,...v);else{sc.props.splice(0,1e9,...v[0]);for(const k in sc.cast)delete sc.cast[k];Object.assign(sc.cast,v[1])}sel=null;rb();panel()},
del=()=>{const it=sel&&items.find(x=>x.o==sel);if(!it)return toast('حدّد مجسمًا أولًا');snap();if(it.k)delete sc.cast[it.k];else{const a=isM?model.parts:sc.props;a.splice(a.indexOf(sel),1)}sel=null;rb();panel()},
dup=()=>{const it=sel&&items.find(x=>x.o==sel);if(!it||it.k)return toast('حدّد مجسمًا لتكراره');snap();const n=JSON.parse(JSON.stringify(sel)),a=isM?model.parts:sc.props;n.pos=n.pos||[0,0,0];n.pos[0]+=.4;a.push(n);sel=n;rb();panel()},
editMesh=async o=>{let mod;try{mod=await import('./modeler.js')}catch(e){return toast('تعذّر تحميل المصمم — ارفع modeler.js بجانب الصفحة')}
 const bk=JSON.stringify(o);mod.openModeler({part:o,TH,toast,title:'🧊 تحرير: '+(K.SHAPES[o.s]||'مجسم'),done:(p,cancelled)=>{if(!cancelled){stack.push(JSON.stringify(isM?model.parts.map(q=>q==o?JSON.parse(bk):q):[sc.props,sc.cast]));}rb();panel()}})},
toMesh=o=>{snap();let m=K.primFromPart(o);if(!m){m=K.MO.fromGeometry(K.partGeo(TH,o));K.orientOutward(m)}o.mesh=m.toJSON();o.s='mesh';delete o.v;o.mats=[{c:o.c||'#c9a46a'}];o.mods=o.mods||{};rb();panel();editMesh(o)},
add=x=>{snap();const p=[+tg.x.toFixed(1),0,+tg.z.toFixed(1)],o=isM?{s:x,pos:[0,.7,0],rot:[0,0,0],sc:[.5,.5,.5],c:'#c9a46a'}:x.startsWith('m:')?{m:x.slice(2),pos:p,rot:0,scale:1}:x.startsWith('light:')?{k:'light',lt:x.slice(6),pos:[p[0],2.5,p[2]],c:'#ffe3b0',i:x=='light:dir'?1.2:2,dist:12,angle:35,aim:[0,-1,0],vis:true,rot:0,scale:1}:x.startsWith('fx:')?{t:'fx',type:x.slice(3),pos:p,rot:0,scale:1}:x=='scroll:road'?{t:'scroller',pos:[0,0,0],speed:0,rot:0,scale:1}:{k:x,pos:p,rot:0,scale:1};if(o.s=='mesh'){o.mesh=K.prim('cube',{size:1}).toJSON();o.mats=[{c:'#c9a46a'}];o.mods={}}(isM?model.parts:sc.props).push(o);sel=o;rb();panel();if(o.s=='mesh')editMesh(o)},
starter=()=>{snap();K.STARTER().forEach(p=>model.parts.push(p));model.rig=true;sel=null;rb();panel();toast('شخصية جاهزة: عدّلها وانحتها ثم جرّب تبويب «حركة»')},
mir=()=>{const o=sel;if(!isM||!o)return toast('حدّد جزءًا لعمل نسخة متناظرة');snap();o.pos=o.pos||[0,0,0];o.rot=o.rot||[0,0,0];const n=JSON.parse(JSON.stringify(o));n.pos[0]=-n.pos[0];n.rot=[o.rot[0],-o.rot[1],-o.rot[2]];if(n.s=='mesh'){const m=n.mesh;for(let i=0;i<m.v.length;i+=3)m.v[i]=-m.v[i];m.f=m.f.map(f=>f.slice().reverse());if(m.cr&&!Array.isArray(m.cr)){}}
if(o.b)n.b=o.b=='armR'?'armL':o.b=='armL'?'armR':o.b=='legR'?'legL':o.b=='legL'?'legR':o.b;
if(o.v&&o.v.length){const g=K.partGeo(TH,{s:o.s}),b=g.userData.base,key=(x,y,z)=>[x,y,z].map(t=>Math.round(t*1e3)).join(),mp=new Map();for(let i=0;i<b.length/3;i++){const k=key(b[3*i],b[3*i+1],b[3*i+2]);(mp.get(k)||mp.set(k,[]).get(k)).push(i)}const nv=[];for(let k=0;k<o.v.length;k+=4){const i=o.v[k];(mp.get(key(-b[3*i],b[3*i+1],b[3*i+2]))||[]).forEach(j=>nv.push(j,-o.v[k+1],o.v[k+2],o.v[k+3]))}n.v=nv;g.dispose()}
model.parts.push(n);sel=n;rb();panel()},
nm=it=>{const o=it.o;return it.k?'🎭 '+((D.actors[it.k]||{}).name||it.k):isM?K.SHAPES[o.s]+(o.b?' ['+K.BONES.find(x=>x[0]==o.b)[1]+']':''):o.m?'🧱 '+((D.models[o.m]||{}).name||o.m):o.t=='fx'?'🌧 '+o.type:o.t=='scroller'?'🛣 طريق متكرر':o.k=='light'?'💡 ضوء '+(o.lt||'point'):K.KINDS[o.k]||o.k},
focus=()=>{const it=sel&&items.find(x=>x.o==sel);it&&tg.setFromMatrixPosition(it.g.matrixWorld)},
setTool=k=>{tool=k;ax=k=='scale'?'a':k=='rot'?'y':ax;ring.visible=false;hint.textContent=H[k];tbar();panel()},
setMode=k=>{ed3=k;play=false;sel=null;if(k=='anim'){tool='move';ax='x';if(!clip)clip=Object.keys(model.anims)[0]||'';setT(0)}hint.textContent=H[k=='shape'?tool:k];rb();mtab();tbar();palette();panel()},
mtab=()=>isM&&mt.replaceChildren(...[['shape','🧱 تشكيل ونحت'],['rig','🦴 ربط الهيكل'],['anim','🎬 حركة']].map(([k,t])=>Bt(t,ed3==k,()=>setMode(k)))),
tbar=()=>{const z=[Bt('🎯 تركيز',0,focus),Bt('＋',0,()=>{dist/=1.3;clampD()}),Bt('－',0,()=>{dist*=1.3;clampD()})];if(ed3=='anim')return tb.replaceChildren(...z);if(ed3=='rig')return tb.replaceChildren(Bt('↩ تراجع',0,undo),...z);
tb.replaceChildren(...[['move','✋ تحريك'],['rot','🔄 تدوير'],['scale','⤢ حجم'],...(isM?[['sculpt','🖌 نحت']]:[])].map(([k,t])=>Bt(t,tool==k,()=>setTool(k))),Bt('↩ تراجع',0,undo),Bt('⧉ تكرار',0,dup),...(isM?[Bt('⇋ نسخ متناظر',0,mir)]:[]),Bt('🧲 مغناطيس',snapOn,()=>{snapOn=!snapOn;tbar()}),Bt('🗑 حذف',0,del),...z)},
LP=[['light:point','💡 ضوء نقطي'],['light:spot','🔦 كشاف'],['light:dir','☀ ضوء موجّه'],['fx:rain','🌧 مطر'],['fx:snow','❄ ثلج'],['fx:dust','🌫 غبار'],['fx:smoke','💨 دخان'],['fx:fire','🔥 نار'],['fx:flame','🔥 لهب'],['fx:torch','🔦 شعلة'],['fx:inferno','🌋 جحيم'],['fx:blacksmoke','🌑 دخان أسود'],['fx:steam','♨ بخار'],['fx:embers','🟠 جمر'],['fx:explosion','💥 انفجار'],['fx:sparks','✨ شرر'],['scroll:road','🛣 طريق متكرر']],
palette=()=>{pal.hidden=ed3!='shape';pal.replaceChildren(...(isM?[...Object.entries(K.SHAPES)]:[...Object.entries(K.KINDS),...LP,...Object.entries(D.models||{}).map(([i,m])=>['m:'+i,'🧱 '+(m.name||i)])]).map(([k,t])=>h('button',{class:'s',style:'flex:none',onclick:()=>add(k)},'＋ '+t)),...(isM?[h('button',{class:'k s',style:'flex:none',onclick:starter},'🧍 شخصية جاهزة')]:[]))},
// ---- الحركة ----
setT=t=>{const c=clip&&cl();T=Math.max(0,Math.min(c?c.d:1,t));pose=c&&(c.k||[]).length?deg(K.sample(c,T)):{};syncUI()},
pb=b=>pose[b]||(pose[b]=[0,0,0]),
syncUI=()=>{tsl&&(tsl.value=T);tlab&&(tlab.textContent=T.toFixed(2)+' ث');psl.forEach((s,i)=>s.value=pb(bone)[i]);ysl&&(ysl.value=pose.y||0)},
autoKey=()=>{const c=cl();if(!c)return;const k=c.k.find(x=>Math.abs(x.t-T)<.03);if(k)k.p=JSON.parse(JSON.stringify(pose))},
mkClip=(name,src)=>{name=(name||'').trim();if(!name)return;if(model.anims[name])return toast('الاسم مستخدم');const d=K.BUILTIN[src]||1,c={d,l:1,k:[]};if(src){const n=Math.max(4,Math.round(d*8));for(let i=0;i<n;i++){const t=d*i/n;c.k.push({t:+t.toFixed(2),p:deg(K.procPose(src,t))})}}model.anims[name]=c;clip=name;setT(0);panel()},
animPanel=()=>{const X=[],names=Object.keys(model.anims),c=clip&&cl();psl=[];
const sel1=h('select',{onchange:e=>{clip=e.target.value;play=false;setT(0);panel()}});names.forEach(n=>{const o=h('option',{value:n},n);if(n==clip)o.selected=true;sel1.append(o)});
const src=h('select',{onchange:e=>{if(e.target.value){const n=prompt('اسم الحركة (مثال: '+e.target.value+')',e.target.value);n&&mkClip(n,e.target.value)}}},h('option',{value:''},'＋ من حركة جاهزة…'),...Object.keys(K.BUILTIN).map(k=>h('option',{value:k},k)));
X.push(h('div',{class:'row'},names.length?sel1:h('span',{class:'mu'},'لا حركات بعد'),h('button',{class:'s',onclick:()=>{const n=prompt('اسم الحركة الجديدة (يُستعمل في القصة)','dance');n&&mkClip(n)}},'＋ حركة فارغة'),src,c?h('button',{class:'g s',onclick:()=>{if(confirm('حذف الحركة؟')){delete model.anims[clip];clip=Object.keys(model.anims)[0]||'';setT(0);panel()}}},'🗑'):''));
if(!c){X.push(h('p',{class:'mu'},'ابدأ بحركة جاهزة (مشي، تلويح…) وعدّلها، أو اصنع حركتك من الصفر. الحركة المسمّاة مثل الجاهزة (walk مثلًا) تحلّ محلها في القصة.'));return X}
tlab=h('span',{class:'mu'},'');tsl=h('input',{type:'range',min:0,max:c.d,step:.01,value:T,style:'flex:1',oninput:e=>{play=false;setT(+e.target.value)}});
X.push(h('div',{class:'row'},L('المدة (ث)',h('input',{type:'number',min:.2,step:.1,value:c.d,style:'width:80px',onchange:e=>{c.d=Math.max(.2,+e.target.value||1);setT(Math.min(T,c.d));panel()}})),L('تكرار',h('input',{type:'checkbox',style:'width:auto',checked:c.l!==0,onchange:e=>c.l=e.target.checked?1:0})),h('span',{class:'mu'},'الاسم في القصة: «'+clip+'»')));
X.push(h('div',{class:'row'},Bt(play?'⏸ إيقاف':'▶ تشغيل',play,()=>{play=!play;if(!play)setT(T);panel()}),tsl,tlab,h('button',{class:'k s',onclick:()=>{const p=JSON.parse(JSON.stringify(pose)),k=c.k.find(x=>Math.abs(x.t-T)<.03);k?k.p=p:c.k.push({t:+T.toFixed(2),p});panel()}},'◆ ثبّت إطارًا')));
X.push(h('div',{class:'row'},...c.k.sort((a,b)=>a.t-b.t).map(k=>h('span',{class:'chip',style:'cursor:pointer'+(Math.abs(k.t-T)<.03?';border-color:var(--ac)':''),onclick:()=>{play=false;setT(k.t);panel()}},'◆ '+k.t.toFixed(2),h('b',{style:'margin-inline-start:6px',onclick:e=>{e.stopPropagation();c.k.splice(c.k.indexOf(k),1);panel()}},'✕'))),c.k.length?'':h('span',{class:'mu'},'لا إطارات: حرّك العظام ثم اضغط «ثبّت إطارًا» عند أزمنة مختلفة (مثلًا 0 و0.5 و1).')));
X.push(h('div',{class:'row'},...K.BONES.map(([b,t])=>Bt(t,bone==b,()=>{bone=b;panel()}))));
const R=['X','Y','Z'].map((n,i)=>{const s=Rg('دوران '+n,pb(bone)[i],v=>{pb(bone)[i]=v;autoKey()},-180,180,1);psl.push(s.i);return s});ysl=h('input',{type:'range',min:-.6,max:.4,step:.01,value:pose.y||0,oninput:e=>{pose.y=+e.target.value;autoKey()}});
X.push(h('div',{class:'row'},...R,L('ارتفاع الجسم',ysl),h('button',{class:'g s',onclick:()=>{pose={};autoKey();syncUI()}},'تصفير')));
return X},
// ---- الهيكل ----
rigPanel=()=>{const X=[],o=sel&&items.find(x=>x.o==sel)?sel:null;
X.push(h('div',{class:'card sub'},h('b',{},o?'العظمة التي يتحرك معها الجزء المحدد:':'اضغط جزءًا في المشهد لتحديده'),o?h('div',{class:'row'},...K.BONES.map(([b,t])=>Bt(t,(o.b||'')==b,()=>{snap();o.b=b;model.rig=true;rb();panel()}))):''));
const pv=(model.piv=model.piv||{});X.push(h('div',{class:'card sub'},h('b',{},'محاور الدوران (النقاط الحمراء)'),h('div',{class:'row'},...K.BONES.map(([b,t])=>Bt(t,pvb==b,()=>{pvb=b;rb();panel()}))),h('div',{class:'row'},...[0,1,2].map(i=>Rg('XYZ'[i],(pv[pvb]||K.PIV[pvb])[i],v=>{pv[pvb]=pv[pvb]||[...K.PIV[pvb]];pv[pvb][i]=v;mkrs[pvb]&&mkrs[pvb].position.set(...pv[pvb])},-1,2,.01)))));
X.push(h('p',{class:'mu'},'الرأس عند الرقبة، والذراع عند الكتف، والساق عند الورك. ثم انتقل إلى «حركة».'));return X},
Sl=(o,cur,f)=>{const x=h('select',{onchange:e=>f(e.target.value)});o.forEach(([v,t])=>{const e=h('option',{value:v},t);if(v==cur)e.selected=true;x.append(e)});return x},
Ck=(t,v,f)=>L(t,h('input',{type:'checkbox',style:'width:auto',checked:!!v,onchange:e=>f(e.target.checked)})),
TEX=[['','بلا خامة'],['checker','رقعة'],['stripes','خطوط'],['dots','نقاط'],['grid','شبكة'],['bricks','طوب'],['planks','خشب'],['noise','حبيبات']],
matRow=o=>{const mt=(o.mat=o.mat||{});return h('div',{class:'row'},Co('توهج',mt.e||'#000000',v=>{mt.e=v;rb()}),Rg('شدة التوهج',mt.ei??1,v=>{mt.ei=v;rb()},0,4,.1),Rg('الشفافية',mt.op??1,v=>{mt.op=v;rb()},.05,1,.05),L('خامة',Sl(TEX,mt.tex||'',v=>{mt.tex=v||undefined;rb()})),Ck('زجاج',mt.glass,v=>{mt.glass=v;rb()}))},
jsIn=(t,o,k)=>L(t,h('textarea',{class:'tx',style:'font:12px monospace;direction:ltr;min-height:56px',oninput:e=>{try{o[k]=JSON.parse(e.target.value||'null')||undefined;e.target.style.borderColor='';rb()}catch(x){e.target.style.borderColor='var(--rd)'}}},o[k]?JSON.stringify(o[k]):'')),
partExtra=it=>{const o=it.o,X=[o.s=='mesh'?h('div',{class:'row'},h('button',{class:'k',onclick:()=>editMesh(o)},'✏ تحرير الشبكة (نمذجة حرة)')):h('div',{class:'row'},h('button',{onclick:()=>toMesh(o)},'🧊 حوّل إلى شبكة حرة لأنحتها وأعدّلها')),...(o.s=='mesh'?[h('p',{class:'mu'},'الألوان والمواد من داخل «تحرير الشبكة» ← تبويب مواد.')]:[matRow(o)])];
X.push(h('div',{class:'row'},L('وظيفة في الوجه',Sl([['','عادي'],['eye','عين (ترمش)'],['mouth','فم (يتكلم)']],o.f||'',v=>{o.f=v||undefined}))));
if(o.s=='rbox')X.push(Rg('استدارة الحواف',o.r||.12,v=>{o.r=v;rb()},.02,.45,.01));
if(o.s=='extrude')X.push(Rg('العمق',o.d||.3,v=>{o.d=v;rb()},.05,1.5,.05),Rg('حافة مشطوفة',o.bv||0,v=>{o.bv=v;rb()},0,.1,.01));
if(o.s=='ring')X.push(Rg('الفتحة',o.ir||.5,v=>{o.ir=v;rb()},.1,.9,.05));
if(o.s=='tube')X.push(Rg('السماكة',o.rad||.06,v=>{o.rad=v;rb()},.01,.3,.01));
if(['lathe','extrude','tube'].includes(o.s)){X.push(jsIn(o.s=='lathe'?'مقطع المخرطة [[نصف القطر،الارتفاع],…]':o.s=='tube'?'نقاط المسار [[x,y,z],…]':'محيط الشكل [[x,y],…]',o,'pts'));if(o.s=='extrude')X.push(jsIn('فتحات (تفريغ) [[[x,y],…],…]',o,'holes'))}
return X},
itemExtra=it=>{const o=it.o,X=[],pr=o.t||it.k?null:1;if(it.k)return X;
X.push(h('div',{class:'row'},L('معرّف (للخط الزمني والربط)',h('input',{value:o.id||'',placeholder:'مثال: car',style:'width:120px',onchange:e=>{o.id=e.target.value.trim()||undefined}}))));
if(o.k=='light'){const a=o.aim||[0,-1,0];X.push(h('div',{class:'row'},Co('اللون',o.c||'#ffffff',v=>{o.c=v;rb()}),Rg('الشدة',o.i??1,v=>{o.i=v;rb()},0,6,.1),Rg('المدى',o.dist??10,v=>{o.dist=v;rb()},0,60,1),...(o.lt=='spot'?[Rg('زاوية الكشاف',o.angle||35,v=>{o.angle=v;rb()},5,90,1)]:[]),...(o.lt!='point'?[Rg('اتجاه x',a[0],v=>{o.aim=[v,a[1],a[2]];rb()},-1,1,.05),Rg('اتجاه z',a[2],v=>{o.aim=[a[0],a[1],v];rb()},-1,1,.05)]:[]),Ck('ظل',o.shadow,v=>{o.shadow=v;rb()}),Ck('كرة مرئية',o.vis,v=>{o.vis=v;rb()})));return X}
if(o.t=='fx'){X.push(h('div',{class:'row'},Co('اللون',o.c||'#ffffff',v=>{o.c=v;rb()}),Rg('الكمية',o.n||400,v=>{o.n=v;rb()},20,2000,20),Rg('رياح x',(o.wind||[0,0,0])[0],v=>{o.wind=[v,0,(o.wind||[0,0,0])[2]];rb()},-6,6,.5)));return X}
if(o.t=='scroller'){X.push(h('div',{class:'row'},Rg('السرعة (وحدة/ث)',o.speed||0,v=>{o.speed=v},0,40,.5),Rg('عرض الطريق',(o.road||{}).w||6,v=>{o.road={...(o.road||{}),w:v};rb()},3,14,.5),Co('الأرض',o.ground||'#4a5a3a',v=>{o.ground=v;rb()})),h('p',{class:'mu'},'السرعة تسري عند التشغيل (المعاينة أو القصة)؛ وغيّرها أثناء القصة من الخط الزمني بإجراء scroll.'));return X}
X.push(matRow(o),h('div',{class:'row'},L('حركة مستمرة',Sl([['','ثابت'],['spin','دوران'],['bob','طفو'],['sway','تمايل']],(o.motion||{}).type||'',v=>{o.motion=v?{type:v,speed:90,amp:v=='bob'?.2:5}:undefined})),Ck('دمج للأداء (للثابت فقط)',o.merge,v=>{o.merge=v||undefined;rb()}),Ck('مستويات تفاصيل LOD',!!o.lod,v=>{o.lod=v?[0,25,70]:undefined;rb()})));
return X},
envPanel=()=>{const E=sc.env,sh=(E.shadow=E.shadow||{}),sk=E.sky,pr=K.PRE[E.preset||'night']||K.PRE.night,sn=E.sun||{},dr=sn.dir||[3,6,4],hm=E.hemi||{};
const wt=(E.weather&&E.weather[0]||{}).type||'',au=(sc.audio||[])[0]||{};
return h('details',{},h('summary',{},'🌅 السماء والضباب والظلال والطقس والصوت'),
h('div',{class:'row'},Ck('سماء متدرجة',!!sk,v=>{E.sky=v?{top:'#0a1030',mid:'#5a6aa8',bottom:'#1a1c2a',stars:500,moon:{dir:[-.5,.6,-1],size:5,c:'#e6ecff'}}:undefined;rb();panel()}),
...(sk?[Co('أعلى',sk.top,v=>{sk.top=v;rb()}),Co('الأفق',sk.mid,v=>{sk.mid=v;rb()}),Co('أسفل',sk.bottom,v=>{sk.bottom=v;rb()}),Rg('نجوم',sk.stars||0,v=>{sk.stars=v;rb()},0,1500,50),Ck('شمس',!!sk.sun,v=>{sk.sun=v?{dir:[.6,.5,-1],size:6,c:'#fff3c4'}:undefined;rb()}),Ck('قمر',!!sk.moon,v=>{sk.moon=v?{dir:[-.5,.6,-1],size:5,c:'#e6ecff'}:undefined;rb()})]:[])),
h('div',{class:'row'},Co('لون الضباب',E.fogc||'#6674b8',v=>{E.fogc=v;rb()}),Rg('كثافة الضباب',+E.fog||0,v=>{E.fog=v;rb()},0,.1,.005)),
h('div',{class:'row'},Rg('شدة الشمس',sn.i??pr[4],v=>{E.sun={...sn,i:v};rb()},0,4,.1),Rg('اتجاه الشمس °',Math.round(Math.atan2(dr[2],dr[0])*180/Math.PI),v=>{const a=v*Math.PI/180;E.sun={...(E.sun||{}),dir:[Math.cos(a)*6,dr[1],Math.sin(a)*6]};rb()},-180,180,5),Rg('الإضاءة العامة',hm.i??pr[2],v=>{E.hemi={...hm,i:v};rb()},0,3,.1)),
h('div',{class:'row'},Ck('ظلال',sh.on!==false,v=>{sh.on=v;rb()}),L('جودة الظل',Sl([['1','منخفضة'],['2','متوسطة'],['3','عالية'],['4','عالية جدًا']],String(sh.q??3),v=>{sh.q=+v;rb()}))),
h('div',{class:'row'},L('طقس',Sl([['','بلا'],['rain','مطر'],['snow','ثلج'],['dust','غبار']],wt,v=>{E.weather=v?[{type:v}]:undefined;rb()})),L('صوت الأجواء',Sl([['','بلا'],['rain','مطر'],['wind','ريح'],['fire','نار'],['hum','طنين']],au.synth||'',v=>{sc.audio=v?[{synth:v,vol:au.vol??.4,id:'amb'}]:undefined})),Rg('مستوى الصوت',au.vol??.4,v=>{if(sc.audio&&sc.audio[0])sc.audio[0].vol=v},0,1,.05)),
h('div',{class:'row'},Ck('استمرارية: تبقى عناصر المشهد السابق بحالتها (موضع/ربط/حركة)',sc.continue,v=>{sc.continue=v||undefined})))},
togglePv=()=>{if(pvm){PV&&PV.dispose();PV=null;pvm=false}else{try{PV=new K.World(TH,r,{scene:new TH.Scene(),camera:new TH.PerspectiveCamera(40,1,.1,300),data:D,toon:true,quality:'low',dof:true});PV.loadScene(sc);pvm=true}catch(e){PV=null;console.warn(e);toast('تعذّرت المعاينة')}}panel()},
tlPanel=()=>{tlEl&&tlEl.stop&&tlEl.stop();const f=v=>+v.toFixed(2),ids=[...Object.keys(sc.cast||{}),...sc.props.map(p=>p.id).filter(Boolean)],i0=ids[0]||'id',i1=ids[1]||'car',at=()=>PV?+PV.dir.t.toFixed(1):0;
const T=[['🎥 كاميرا (من الزاوية الحالية)',()=>({a:'cam',pos:cam.position.toArray().map(f),look:tg.toArray().map(f),fov:45,blend:1.5})],['🎥 كاميرا تتبّع',()=>({a:'cam',follow:i0,off:[0,2,6],lag:.4,fov:45})],['🎥 هزّ الكاميرا',()=>({a:'shake',amp:.15,f:14,d:2})],['🚶 تحريك',()=>({a:'move',id:i0,to:[2,0,0],mode:'rel',dur:2,ease:'inout',face:true,anim:'walk',end:'idle'})],['🔗 ربط (ركوب)',()=>({a:'attach',id:i0,to:i1,pos:[0,.5,0],anim:'sit'})],['🔓 فكّ ربط',()=>({a:'detach',id:i0})],['🧍 حركة',()=>({a:'anim',id:i0,n:'wave'})],['🗣 تكلّم',()=>({a:'speak',id:i0,dur:3})],['👀 نظر',()=>({a:'look',id:i0,target:i1})],['✋ IK (يد على هدف)',()=>({a:'ik',id:i0,limb:'armR',target:i1+'.wheel'})],['💡 ضوء',()=>({a:'light',id:i1,i:3,dur:1})],['🛣 سرعة الطريق',()=>({a:'scroll',id:i1,speed:12,dur:2})],['🔊 صوت',()=>({a:'sound',synth:'engine',vol:.4,id:'eng'})],['🌦 بيئة',()=>({a:'env',set:{fog:.05}})],['😮 تعبير وجه',()=>({a:'expr',id:i0,n:'scared',w:1,dur:.4})],['🙌 إيماءة',()=>({a:'gesture',id:i0,n:'coverFace',dur:2.5})],['🤚 اليدان',()=>({a:'hands',id:i0,n:'fist',l:'fist'})],['🎞 مؤثرات الشاشة (post)',()=>({a:'post',set:{bloom:.6,vignette:.45,saturation:.85},dur:1})],['🎨 مظهر سينمائي',()=>({a:'grade',set:{look:'telltale'},dur:1.5})],['⬛ تعتيم/ظهور',()=>({a:'fade',to:1,dur:1.5})],['⚪ وميض',()=>({a:'flash',i:1,dur:.5,color:[1,.8,.5]})],['🎬 شريطان سينمائيان',()=>({a:'bars',to:.1,dur:1})],['🌐 أفق ومَيَلان',()=>({a:'horizon',roll:25,pitch:-10,dur:3})],['💨 قذف الأغراض',()=>({a:'fling',id:i1,vel:[0,3,-2],spin:[90,0,40],dur:2.5,floor:0})],['🌫 جوّ عام',()=>({a:'ambient',hemi:{i:.3,c:'#ff6a3a'},sun:{i:.4,c:'#ff8a50'},dur:2})],['🔇 كتم الصوت',()=>({a:'muffle',f:400,dur:3})],['🎚 مستوى الصوت',()=>({a:'master',v:.6,dur:1})],['🐢 حركة بطيئة',()=>({a:'slow',to:.3,back:1,dur:2})],['➕ إنشاء عنصر',()=>({a:'spawn',id:'x1',spec:{k:'suitcase',pos:[0,1,0]}})],['➖ إزالة عنصر',()=>({a:'remove',id:i1})],['⚡ عند ظهور نص','ON']];
const x=h('details',{open:pvm||(sc.timeline||[]).length>0},h('summary',{},'⏱ الخط الزمني والمعاينة'));
x.append(h('div',{class:'row'},Bt(pvm?'⏹ إنهاء المعاينة':'▶ معاينة المشهد',pvm,togglePv),h('span',{class:'mu'},'تشغيل المشهد كما في القصة: حركة، كاميرا، أضواء، طقس، صوت')));
x.append(h('div',{class:'row'},...T.map(([t,fn])=>h('button',{class:'g s',onclick:()=>{sc.timeline=sc.timeline||[];sc.timeline.push(fn=='ON'?{on:'text:b0',do:[{a:'anim',id:i0,n:'talk'}]}:{at:at(),do:[fn()]});panel()}},'＋ '+t))));
tlEl=K.timelineUI(h,PV||{paused:true,dir:{t:0,notify(){}},seek(){}},sc,{});x.append(tlEl);
x.append(h('p',{class:'mu'},'المعرّفات المتاحة: '+(ids.join('، ')||'لا شيء بعد — أعطِ المجسم «معرّفًا» من لوحته')+' · المرساة: «معرّف.اسم» (تُعرَّف في anchors). الأحداث المرتبطة بالنص: على النص اكتب id في الكتلة ثم on:\'text:id\'.'));return x},
panel=()=>{const it=sel&&items.find(x=>x.o==sel),X=[];
if(isM&&ed3=='anim'){cp.replaceChildren(...animPanel());return}
if(isM&&ed3=='rig'){cp.replaceChildren(...rigPanel());return}
if(isM&&!model.parts.length){cp.replaceChildren(h('div',{class:'card sub'},h('h3',{},'ابدأ من هنا'),h('div',{class:'row'},h('button',{class:'k',onclick:starter},'🧍 شخصية جاهزة (قابلة للنحت والتحريك)'),h('button',{onclick:()=>add('sphere')},'⚪ كرة طين فارغة')),h('p',{class:'mu'},'يمكنك لاحقًا إضافة أي شكل من الشريط وتلوينه ونحته.')));return}
if(tool=='sculpt')X.push(h('div',{class:'row'},...[['grab','✊ سحب حر'],['pull','⬆ بروز'],['push','⬇ ضغط'],['smooth','〰 تنعيم']].map(([k,t])=>Bt(t,brush==k,()=>{brush=k;panel()})),Rg('حجم الفرشاة',rad0,v=>rad0=v,.08,.8,.01),Rg('القوة',str,v=>str=v,.1,1,.05),L('تناظر',h('input',{type:'checkbox',style:'width:auto',checked:sym,onchange:e=>sym=e.target.checked}))));
if(tool=='move')X.push(Bt('↕ تحريك للأعلى/الأسفل بدل الأرض',vert,()=>{vert=!vert;panel()}));
if(isM&&(tool=='rot'||tool=='scale'))X.push(h('div',{class:'row'},...[['x','محور X'],['y','محور Y'],['z','محور Z'],...(tool=='scale'?[['a','الكل']]:[])].map(([k,t])=>Bt(t,ax==k,()=>{ax=k;panel()}))));
if(it&&!it.k&&it.o.s!='mesh'&&!(it.o.k=='light'||it.o.t)){const key=isM?'c':'color';X.push(Co('لون المحدد',it.o[key]||'#c9a46a',v=>{it.o[key]=v;rb()}))}
if(it)X.push(...(isM?partExtra(it):itemExtra(it)));
X.push(h('details',{},h('summary',{},'📋 العناصر ('+items.length+')'),h('div',{class:'row'},...items.map((x,i)=>Bt((i+1)+'. '+nm(x),x.o==sel,()=>{sel=x.o;hl();panel()})))));
if(isM)X.push(h('div',{class:'row'},Bt('👤 مقياس الإنسان',ruler,()=>{ruler=!ruler;rb();panel()})));
else{const op=(o,cur,f)=>{const x=h('select',{onchange:e=>f(e.target.value)});o.forEach(([v,t])=>{const e=h('option',{value:v},t);if(v==cur)e.selected=true;x.append(e)});return x};
X.push(h('details',{},h('summary',{},'⚙ البيئة والشخصيات والكاميرا'),h('div',{class:'row'},L('الإضاءة',op([['night','ليل'],['day','نهار'],['inside','داخلي']],sc.env.preset||'night',v=>{sc.env.preset=v;rb()})),Rg('الضباب',sc.env.fog||0,v=>{sc.env.fog=v;rb()},0,.1,.005),Co('الأرض',sc.env.ground||'#3b4054',v=>{sc.env.ground=v;rb()})),
h('div',{class:'row'},op(Object.entries(D.actors||{}).map(([k,a])=>[k,a.name||k]),addA,v=>addA=v),h('button',{class:'s',onclick:()=>{if(!addA)return toast('أضف شخصية أولًا');snap();sc.cast[addA]=sc.cast[addA]||{pos:[+tg.x.toFixed(1),0,+tg.z.toFixed(1)],rot:0};rb()}},'＋ شخصية في المشهد')),
h('button',{class:'k',onclick:()=>{const f=v=>+v.toFixed(2);sc.cams=sc.cams||{};const id='c'+(Object.keys(sc.cams).length+1);sc.cams[id]={pos:cam.position.toArray().map(f),target:tg.toArray().map(f),fov:45};toast('حُفظت الزاوية كلقطة «'+id+'»')}},'🎥 احفظ الزاوية الحالية كلقطة كاميرا')))}
if(!isM)X.push(envPanel(),tlPanel());cp.replaceChildren(...X)},
setRay=e=>{const b=cv.getBoundingClientRect();ray.setFromCamera(new TH.Vector2((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1),cam)},
pick=()=>{const hs=ray.intersectObjects(items.map(i=>i.g),true);if(!hs.length)return null;let o=hs[0].object;while(o&&!items.some(i=>i.g==o))o=o.parent;const it=items.find(i=>i.g==o);return it&&{it,h:hs[0]}},
ground=y=>ray.ray.intersectPlane(new TH.Plane(new TH.Vector3(0,1,0),-y),new TH.Vector3()),
pd=()=>{const[a,b]=[...pts.values()];return[Math.hypot(a[0]-b[0],a[1]-b[1]),(a[0]+b[0])/2,(a[1]+b[1])/2]},
fin=m=>{K.smoothN(m.geometry);m.geometry.attributes.position.needsUpdate=true;m.geometry.computeBoundingSphere()},
// ---- النحت: ثابت ومتوقَّع (فرشاة بحجم عالمي، زمن حقيقي، اتجاه على سطح المجسم) ----
gather=(m,lp)=>{const a=m.geometry.attributes.position,M=new Map(),R=rad0/((m.scale.x+m.scale.y+m.scale.z)/3),run=(c,s)=>{for(let i=0;i<a.count;i++){if(M.has(i))continue;const q=Math.hypot(a.getX(i)-c.x,a.getY(i)-c.y,a.getZ(i)-c.z)/R;if(q<1)M.set(i,{w:(1-q*q)**2,s})}};run(lp,1);if(sym)run(new TH.Vector3(-lp.x,lp.y,lp.z),-1);return M},
stroke=(p,dt)=>{const m=p.it.g,dd=st.dd,a=m.geometry.attributes.position,b=m.geometry.userData.base,n=m.geometry.attributes.normal,M=gather(m,m.worldToLocal(p.h.point.clone()));if(!M.size)return;let av=[0,0,0];
if(brush=='smooth'){M.forEach((v,i)=>{for(let k=0;k<3;k++)av[k]+=dd[3*i+k]});av=av.map(x=>x/M.size)}
M.forEach((v,i)=>{if(brush=='smooth'){const f=Math.min(1,str*dt*10*v.w);for(let k=0;k<3;k++)dd[3*i+k]+=(av[k]-dd[3*i+k])*f}else{const t=(brush=='push'?-1:1)*str*dt*1.6*v.w;dd[3*i]+=n.getX(i)*t;dd[3*i+1]+=n.getY(i)*t;dd[3*i+2]+=n.getZ(i)*t}a.setXYZ(i,b[3*i]+dd[3*i],b[3*i+1]+dd[3*i+1],b[3*i+2]+dd[3*i+2])});fin(m)},
grabMove=e=>{setRay(e);const t=new TH.Vector3();if(!ray.ray.intersectPlane(st.pl,t))return;const m=st.it.g,dl=m.worldToLocal(t).sub(st.lp0),a=m.geometry.attributes.position,b=m.geometry.userData.base,dd=st.dd;
st.M.forEach((v,i)=>{dd[3*i]=st.d0[3*i]+v.s*dl.x*v.w;dd[3*i+1]=st.d0[3*i+1]+dl.y*v.w;dd[3*i+2]=st.d0[3*i+2]+dl.z*v.w;a.setXYZ(i,b[3*i]+dd[3*i],b[3*i+1]+dd[3*i+1],b[3*i+2]+dd[3*i+2])});fin(m)},
ringAt=p=>{ring.visible=!!p&&tool=='sculpt'&&ed3=='shape';if(!ring.visible)return;const n=p.h.face.normal.clone().transformDirection(p.it.g.matrixWorld);ring.position.copy(p.h.point);ring.lookAt(p.h.point.clone().add(n));ring.scale.setScalar(rad0)},
drag=e=>{const o=st.it.o,dx=e.clientX-st.x,dy=e.clientY-st.y,sn=(v,u)=>snapOn?Math.round(v/u)*u:v;
if(st.anim){const i='xyz'.indexOf(ax);pb(bone)[i]=Math.max(-180,Math.min(180,Math.round(st.r0[i]+dx*.6)));autoKey();syncUI();return}
if(!st.sn&&Math.abs(dx)+Math.abs(dy)>2){snap();st.sn=1}
if(tool=='move'){if(vert)o.pos[1]=+(st.p0[1]-dy*dist*.0025).toFixed(2);else{setRay(e);const t=ground(st.p0[1]);if(t){o.pos[0]=+sn(t.x+st.off[0],.25).toFixed(2);o.pos[2]=+sn(t.z+st.off[1],.25).toFixed(2)}}}
else if(tool=='rot'){if(isM){const i='xyz'.indexOf(ax);o.rot[i]=+sn(st.r0[i]+dx*.6,15).toFixed(1)}else o.rot=+sn(st.r0+dx*.6,15).toFixed(1)}
else if(tool=='scale'){const f=sn(Math.max(.05,1-dy*.006),.05);if(isM)o.sc=st.s0.map((v,i)=>ax=='a'||'xyz'[i]==ax?+(v*f).toFixed(3):v);else if(!st.it.k)o.scale=+(st.s0*f).toFixed(3)}
sync(st.it)};
cv.onpointerdown=e=>{if(PV)return;cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size==2){mode='pinch';st=pd();return}
setRay(e);const p=pick();if(!p){mode='orb';st={moved:0};return}
const o=p.it.o;if(sel!=o){sel=o;hl();panel()}
if(ed3=='rig'){mode='orb';st={moved:0,hit:1};return}
if(ed3=='anim'){bone=o.b&&K.BONES.some(x=>x[0]==o.b)?o.b:'body';panel();syncUI();st={it:p.it,x:e.clientX,y:e.clientY,anim:1,r0:[...pb(bone)]};mode='drag';return}
o.pos=o.pos||[0,0,0];if(isM){o.rot=o.rot||[0,0,0];o.sc=o.sc||[1,1,1]}
if(tool=='sculpt'&&isM&&o.s=='mesh'){toast('هذا المجسم شبكة حرة — اضغط «تحرير الشبكة» للنحت المتقدم');return}
if(tool=='sculpt'&&isM){snap();const m=p.it.g,n=m.geometry.attributes.position.count,dd=new Float32Array(3*n),v=o.v||[];for(let k=0;k<v.length;k+=4){const i=v[k];dd[3*i]=v[k+1];dd[3*i+1]=v[k+2];dd[3*i+2]=v[k+3]}K.smoothN(m.geometry);st={it:p.it,dd,e};mode='sculpt';
 if(brush=='grab'){st.lp0=m.worldToLocal(p.h.point.clone());st.M=gather(m,st.lp0);st.d0=dd.slice();st.pl=new TH.Plane().setFromNormalAndCoplanarPoint(cam.getWorldDirection(new TH.Vector3()),p.h.point)}ringAt(p)}
else{const t=ground(o.pos[1]);st={it:p.it,x:e.clientX,y:e.clientY,p0:[...o.pos],r0:isM?[...o.rot]:(o.rot||0),s0:isM?[...o.sc]:(o.scale||1),off:t?[o.pos[0]-t.x,o.pos[2]-t.z]:[0,0]};mode='drag'}};
cv.onpointermove=e=>{const q=pts.get(e.pointerId);if(!q){if(tool=='sculpt'&&ed3=='shape'&&isM&&!pts.size){setRay(e);ringAt(pick())}return}const dx=e.clientX-q[0],dy=e.clientY-q[1];pts.set(e.pointerId,[e.clientX,e.clientY]);
if(mode=='pinch'){if(pts.size==2){const n=pd();dist*=st[0]/n[0];yaw-=(n[1]-st[1])*.008;pit=Math.max(-.2,Math.min(1.45,pit+(n[2]-st[2])*.006));st=n;clampD()}}
else if(mode=='orb'){yaw-=dx*.008;pit=Math.max(-.2,Math.min(1.45,pit+dy*.006));st.moved+=Math.abs(dx)+Math.abs(dy)}
else if(mode=='drag')drag(e);
else if(mode=='sculpt'){st.e=e;if(brush=='grab')grabMove(e)}};
cv.onpointerup=cv.onpointercancel=e=>{pts.delete(e.pointerId);if(mode=='sculpt'){const v=[],dd=st.dd;for(let i=0;i<dd.length/3;i++)if(Math.abs(dd[3*i])+Math.abs(dd[3*i+1])+Math.abs(dd[3*i+2])>5e-4)v.push(i,r3(dd[3*i]),r3(dd[3*i+1]),r3(dd[3*i+2]));st.it.o.v=v.length?v:undefined;if(e.pointerType!='mouse')ring.visible=false}else if(mode=='orb'&&st.moved<6&&!st.hit){sel=null;hl();panel()}if(!pts.size)mode=null};
cv.onwheel=e=>{e.preventDefault();dist*=1+e.deltaY*.001;clampD()};
const loop=t=>{raf=requestAnimationFrame(loop);const now=t/1000,dt=Math.min(.05,now-last);last=now;const w=cv.clientWidth,hh=cv.clientHeight;if(cv.width!=w||cv.height!=hh){r.setSize(w,hh,false);cam.aspect=w/hh;cam.updateProjectionMatrix()}
if(RG){const c=clip&&cl();if(play&&c&&c.k.length){T+=dt;if(T>c.d){if(c.l===0){T=c.d;play=false;panel()}else T%=c.d}RG.apply(K.sample(c,T));tsl&&(tsl.value=T);tlab&&(tlab.textContent=T.toFixed(2)+' ث')}else RG.apply(rad(pose))}
rigs.forEach(P=>P.tick(now));fxs.forEach(f=>f.update(dt,cam.position,cv.height/(2*Math.tan(cam.fov*Math.PI/360))));EV&&EV.update(cam,now);
if(mode=='sculpt'&&brush!='grab'&&st.e){setRay(st.e);const p=pick();if(p&&p.it==st.it)stroke(p,dt);ringAt(p)}
cam.position.set(tg.x+Math.sin(yaw)*Math.cos(pit)*dist,tg.y+Math.sin(pit)*dist,tg.z+Math.cos(yaw)*Math.cos(pit)*dist);cam.lookAt(tg);bx&&bx.update();if(PV){const pw=cv.clientWidth,ph=cv.clientHeight;if(PV.cam.aspect!=pw/ph){PV.cam.aspect=pw/ph;PV.cam.updateProjectionMatrix()}if(!PV.paused)PV.update(dt);PV.render()}else r.render(S,cam)};
d.addEventListener('close',()=>{cancelAnimationFrame(raf);PV&&PV.dispose();tlEl&&tlEl.stop&&tlEl.stop();K.free(S);r.dispose();gm.dispose();c.done&&c.done()});
d.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||ed3!='shape')return;const k=e.key.toLowerCase(),T2={g:'move',r:'rot',s:'scale'};if(k=='delete'||k=='backspace'){e.preventDefault();del()}else if((e.ctrlKey||e.metaKey)&&k=='z'){e.preventDefault();undo()}else if(T2[k])setTool(T2[k])});
if(isM&&!model.parts.length)tool='sculpt';rb();hint.textContent=H[tool];mtab();tbar();palette();panel();raf=requestAnimationFrame(loop)}
