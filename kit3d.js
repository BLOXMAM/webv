// kit3d.js — محرك تصميم الشخصيات والعالم (يعتمد على three فقط، بلا روابط ولا ملفات نماذج)
// ====== v2: وُسِّع المحرك (23 نقطة). كل ما كان يعمل سابقًا ما زال يعمل بنفس الواجهة؛ الجديد في آخر الملف. التوثيق: kit3d_v2_readme.md ======
export const LOOK={h:1,w:1,skin:'#e8b890',hair:'short',hc:'#3a2a1e',top:'#4a6fa5',bot:'#2b2f3a',shoe:'#1a1a1a',eye:'#2a1c10',acc:'none',ac:'#c0392b',tt:'tee'};
export const OPT={hair:[['bald','أصلع'],['short','قصير'],['long','طويل'],['bun','كعكة'],['cap','قبعة']],acc:[['none','بلا'],['glasses','نظارة'],['beard','لحية'],['scarf','وشاح']],tt:[['tee','قميص'],['coat','معطف']]};
export const ANIMS=[['idle','وقوف'],['talk','كلام'],['walk','مشي'],['wave','تلويح'],['point','إشارة'],['sad','حزن'],['sit','جلوس']];
export const KINDS={house:'بيت',tree:'شجرة',lamp:'عمود إنارة',table:'طاولة',chair:'كرسي',sofa:'أريكة',bed:'سرير',wall:'جدار',door:'باب',fence:'سياج',road:'طريق',car:'سيارة',rock:'صخرة',crate:'صندوق'};
export const PRE={night:[0x0b1020,0x6674b8,.7,0xaabbff,1],day:[0x9ec7f0,0xffffff,1,0xfff0cc,2.2],inside:[0x251c14,0xffd9a8,.7,0xffc27a,1.6]};

export const free=o=>o&&o.traverse(m=>{m.geometry&&m.geometry.dispose();[].concat(m.material||[]).forEach(x=>{x.map&&x.map.dispose();x.dispose()})});
export const gmap=TH=>{const t=new TH.DataTexture(new Uint8Array([80,160,255]),3,1,TH.RedFormat);t.minFilter=t.magFilter=TH.NearestFilter;t.needsUpdate=true;return t};
export const mat=(TH,gm,toon)=>(c,o)=>{const m=toon?new TH.MeshToonMaterial({color:c,gradientMap:gm}):new TH.MeshStandardMaterial({color:c,roughness:.8});if(toon)m.onBeforeCompile=RIMP;o&&skinMat(TH,m,o);return m};
const mk=(TH,M,par)=>(geo,c,p,r)=>{const m=new TH.Mesh(geo,M(c));p&&m.position.set(...p);r&&m.rotation.set(...r);m.castShadow=m.receiveShadow=true;par.add(m);return m};

// إضاءة + سماء + أرضية (تُستخدم في المعاينة؛ المشغّل له نسخته نفسها)

// ---------- الشخصية ----------
export function mkChar0(TH,l,M){
l={...LOOK,...l};const g=new TH.Group(),rig=new TH.Group();g.add(rig);const B=mk(TH,M,rig),w=l.w,
pv=(p,par=rig)=>{const o=new TH.Group();o.position.set(...p);par.add(o);return o},
leg=[-1,1].map(s=>{const p=pv([s*.1*w,.86,0]),k=mk(TH,M,p);k(new TH.CylinderGeometry(.07*w,.06*w,.8,10),l.bot,[0,-.4,0]);k(new TH.BoxGeometry(.12*w,.07,.22),l.shoe,[0,-.83,.05]);return p}),
to=B(new TH.CapsuleGeometry(.17*w,.4,4,12),l.top,[0,1.15,0]);to.scale.z=.72;
if(l.tt=='coat')B(new TH.CylinderGeometry(.19*w,.27*w,.5,14),l.top,[0,.8,0]).scale.z=.75;
const arm=[-1,1].map(s=>{const p=pv([s*(.23*w+.06),1.4,0]),k=mk(TH,M,p);k(new TH.CylinderGeometry(.05,.045,.55,8),l.top,[0,-.27,0]);k(new TH.SphereGeometry(.05,10,8),l.skin,[0,-.58,0]);return p}),
hd=pv([0,1.63,0]),H=mk(TH,M,hd);H(new TH.SphereGeometry(.13,18,14),l.skin).scale.y=1.12;H(new TH.CylinderGeometry(.04,.045,.1,8),l.skin,[0,-.14,0]);
const ey=[-1,1].map(s=>H(new TH.SphereGeometry(.018,8,6),l.eye,[s*.047,.015,.118])),mo=H(new TH.BoxGeometry(.05,.012,.01),'#6b2d2d',[0,-.05,.125]),
cap=()=>new TH.SphereGeometry(.14,18,12,0,6.283,0,1.25);
if(l.hair!='bald'&&l.hair!='cap')H(cap(),l.hc,[0,.015,-.005]);
if(l.hair=='long')H(new TH.BoxGeometry(.25,.34,.08),l.hc,[0,-.1,-.09]);
if(l.hair=='bun')H(new TH.SphereGeometry(.06,10,8),l.hc,[0,.15,-.06]);
if(l.hair=='cap'){H(cap(),l.ac,[0,.03,0]);H(new TH.BoxGeometry(.2,.015,.12),l.ac,[0,.04,.13])}
if(l.acc=='glasses')[-1,1].forEach(s=>H(new TH.TorusGeometry(.03,.006,6,14),'#222',[s*.047,.017,.128]));
if(l.acc=='beard')H(new TH.SphereGeometry(.133,16,10,0,6.283,1.9,1.2),l.hc,[0,0,.005]);
if(l.acc=='scarf')B(new TH.TorusGeometry(.12,.04,8,16),l.ac,[0,1.52,0],[Math.PI/2,0,0]);
g.scale.setScalar(+l.h||1);
let an='idle',spk=false;const ph=Math.random()*3,bn={body:rig,head:hd,armL:arm[0],armR:arm[1],legL:leg[0],legR:leg[1]};hd.rotation.order='YXZ';
const R={o:g,G:bn,ik:{},look:null,set:n=>an=n,get:()=>an,speak:v=>spk=v!==false,tick:null};
R.tick=t=>{const P=procPose(an,t);for(const k in bn)bn[k].rotation.set(...(P[k]||[0,0,0]));rig.position.y=P.y||0;mo.scale.y=spk?.4+Math.abs(Math.sin(t*11))*2.2:(P.mouth||1);ey.forEach(e=>e.scale.y=((t+ph)%4)<.12?.1:1);to.scale.y=1+Math.sin(t*1.8)*.012;if(R.look||Object.keys(R.ik).length){g.updateWorldMatrix(true,true);if(R.look)doLook(TH,hd,R.look,1);ikApply(TH,bn,{},R.ik)}};return R}

// ---------- المجسمات ----------
function mkProp0(TH,p,M){
if(KITS[p.k]){const o=KITS[p.k](TH,p,M);if(o)return o}
const g=new TH.Group(),B=mk(TH,M,g),bx=(x,y,z)=>new TH.BoxGeometry(x,y,z),cy=(a,b,h,n=10)=>new TH.CylinderGeometry(a,b,h,n),c=p.color,k=p.k;
if(k=='house'){B(bx(4,2.6,4),c||'#c9b79c',[0,1.3,0]);B(new TH.ConeGeometry(3.1,1.5,4),'#8a4b3a',[0,3.35,0],[0,.785,0]);B(bx(.9,1.6,.08),'#4a3022',[0,.8,2.02]);[-1.3,1.3].forEach(x=>B(bx(.7,.7,.08),'#9fc4e8',[x,1.6,2.02]))}
else if(k=='tree'){B(cy(.15,.2,1.4),'#5b3e28',[0,.7,0]);B(new TH.ConeGeometry(1,2.2,8),c||'#2f6b3a',[0,2.2,0]);B(new TH.ConeGeometry(.8,1.7,8),c||'#2f6b3a',[0,3.1,0])}
else if(k=='lamp'){B(cy(.05,.06,3.2),'#333',[0,1.6,0]);B(new TH.SphereGeometry(.18,12,10),c||'#ffe9a8',[0,3.3,0]).userData.glow=1;if(!p.nolight){const L=new TH.PointLight(0xffd9a0,1.2,9);L.position.set(0,3.2,0);g.add(L)}}
else if(k=='table'){B(bx(1.4,.08,.8),c||'#8a5a35',[0,.75,0]);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(bx(.07,.75,.07),c||'#8a5a35',[a*.62,.37,b*.32]))}
else if(k=='chair'){B(bx(.45,.06,.45),c||'#7a5230',[0,.45,0]);B(bx(.45,.5,.06),c||'#7a5230',[0,.72,-.2]);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(bx(.05,.45,.05),c||'#7a5230',[a*.2,.22,b*.2]))}
else if(k=='sofa'){B(bx(2,.45,.9),c||'#7a4a5a',[0,.35,0]);B(bx(2,.55,.25),c||'#7a4a5a',[0,.8,-.35]);[-1,1].forEach(s=>B(bx(.25,.35,.9),c||'#7a4a5a',[s*.9,.6,0]))}
else if(k=='bed'){B(bx(2,.35,1.2),'#6b4a2e',[0,.3,0]);B(bx(1.9,.2,1.1),c||'#d8d4e8',[0,.55,0]);B(bx(.5,.12,.9),'#fff',[-.7,.7,0])}
else if(k=='wall')B(bx(4,2.6,.2),c||'#b8b0a0',[0,1.3,0]);
else if(k=='door'){B(bx(1,2.1,.1),c||'#5a3a22',[0,1.05,0]);B(new TH.SphereGeometry(.05,8,6),'#d4af37',[.35,1,.07])}
else if(k=='fence'){for(let i=-2;i<=2;i++)B(bx(.1,1,.1),c||'#9a7b52',[i*.5,.5,0]);[.35,.75].forEach(y=>B(bx(2.2,.08,.05),c||'#9a7b52',[0,y,0]))}
else if(k=='road'){B(bx(3,.03,12),c||'#2b2d33',[0,.015,0]);[-4,0,4].forEach(z=>B(bx(.1,.035,1),'#eee',[0,.02,z]))}
else if(k=='car'){B(bx(3.8,.7,1.7),c||'#b23a3a',[0,.65,0]);B(bx(2,.6,1.5),'#222a38',[-.2,1.25,0]);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(cy(.38,.38,.3,14),'#111',[a*1.2,.38,b*.85],[Math.PI/2,0,0]))}
else if(k=='rock')B(new TH.DodecahedronGeometry(.7,0),c||'#7a7d85',[0,.5,0]).scale.y=.75;
else B(bx(.8,.8,.8),c||'#a8794a',[0,.4,0]);
return g}

export function mkProp(TH,p,M){if(p.k=='light')return mkLight(TH,p);const g=mkProp0(TH,p,M);
g.traverse(m=>{if(!m.isMesh)return;if(p.mat)skinMat(TH,m.material,p.mat);const gl=m.userData.glow||p.glow;if(gl&&m.material.color){m.material.emissive=new TH.Color(typeof p.glow=='string'?p.glow:m.material.color);m.material.emissiveIntensity=p.gi??1.2;m.material.needsUpdate=true}});
if(p.merge)mergeStatic(TH,g);return g}

// ---------- نماذج المستخدم (أشكال أساسية + نحت) ----------
export const SHAPES={sphere:'كرة',box:'مكعب',cyl:'أسطوانة',cone:'مخروط',torus:'حلقة',cap:'كبسولة',rbox:'مكعب مدوّر',lathe:'مخرطة',extrude:'بثق (مع فتحات)',tube:'أنبوب على مسار',plane:'سطح',ring:'قرص مجوّف',mesh:'شبكة حرة'};
const unit=(TH,g)=>{g.computeBoundingBox();const b=g.boundingBox,s=b.getSize(new TH.Vector3()),c=b.getCenter(new TH.Vector3());g.translate(-c.x,-c.y,-c.z);const m=Math.max(s.x,s.y,s.z)||1;g.scale(1/m,1/m,1/m);return g};
const shapeOf=(TH,pts,holes)=>{const S=new TH.Shape(pts.map(q=>new TH.Vector2(q[0],q[1])));(holes||[]).forEach(h=>S.holes.push(new TH.Path(h.map(q=>new TH.Vector2(q[0],q[1])))));return S};
export function smoothN(g){g.computeVertexNormals();const a=g.attributes.position,n=g.attributes.normal,M=new Map(),k=i=>Math.round(a.getX(i)*1e4)+'_'+Math.round(a.getY(i)*1e4)+'_'+Math.round(a.getZ(i)*1e4);
for(let i=0;i<a.count;i++){const q=k(i);let s=M.get(q);if(!s)M.set(q,s=[0,0,0]);s[0]+=n.getX(i);s[1]+=n.getY(i);s[2]+=n.getZ(i)}
for(let i=0;i<a.count;i++){const s=M.get(k(i)),l=Math.hypot(s[0],s[1],s[2])||1;n.setXYZ(i,s[0]/l,s[1]/l,s[2]/l)}n.needsUpdate=true}
export function partGeo(TH,p){const s=p.s;let g;
if(s=='box')g=new TH.BoxGeometry(1,1,1,8,8,8);else if(s=='cyl')g=new TH.CylinderGeometry(.5,.5,1,24,8);else if(s=='cone')g=new TH.ConeGeometry(.5,1,24,8);else if(s=='torus')g=new TH.TorusGeometry(.35,.15,12,32);else if(s=='cap')g=new TH.CapsuleGeometry(.3,.4,10,24);
else if(s=='rbox'){const r=Math.min(.45,p.r||.12),w=1-2*r;g=unit(TH,new TH.ExtrudeGeometry(shapeOf(TH,[[-w/2,-w/2],[w/2,-w/2],[w/2,w/2],[-w/2,w/2]]),{depth:w,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:5,curveSegments:1}))}
else if(s=='lathe')g=unit(TH,new TH.LatheGeometry((p.pts||[[.02,-.5],[.35,-.5],[.45,-.1],[.25,.2],[.15,.5]]).map(q=>new TH.Vector2(q[0],q[1])),32));
else if(s=='extrude'){const d=p.d||.3,bv=p.bv||0;g=unit(TH,new TH.ExtrudeGeometry(shapeOf(TH,p.pts||[[-.5,-.5],[.5,-.5],[.5,.5],[0,.8],[-.5,.5]],p.holes),{depth:d,bevelEnabled:bv>0,bevelSize:bv,bevelThickness:bv,bevelSegments:3,curveSegments:12}))}
else if(s=='tube')g=unit(TH,new TH.TubeGeometry(new TH.CatmullRomCurve3((p.pts||[[-.5,0,0],[-.2,.3,0],[.2,-.3,0],[.5,0,0]]).map(q=>new TH.Vector3(q[0],q[1],q[2]))),48,p.rad||.06,10,false));
else if(s=='plane')g=new TH.PlaneGeometry(1,1,8,8);else if(s=='ring')g=new TH.RingGeometry(.5*(p.ir||.5),.5,32,4);
else g=new TH.IcosahedronGeometry(.5,6);
g.userData.base=Float32Array.from(g.attributes.position.array);if(p.v&&p.v.length)applyV(g,p.v);else if(!s||s=='sphere')smoothN(g);return g}
// النحت: p.v = إزاحات متفرقة [فهرس الرأس،dx،dy،dz،...] فوق الشكل الأصلي
export function applyV(g,v){const a=g.attributes.position;a.array.set(g.userData.base);for(let k=0;k<v.length;k+=4){const i=v[k];if(i<a.count){a.array[3*i]+=v[k+1];a.array[3*i+1]+=v[k+2];a.array[3*i+2]+=v[k+3]}}a.needsUpdate=true;smoothN(g);g.computeBoundingSphere()}
export function mkPart(TH,p,M){const o=p.s=='mesh'?mkMeshPart(TH,p,M,skinMat):new TH.Mesh(partGeo(TH,p),M(p.c||'#c9a46a'));if(p.s=='plane'||p.s=='ring')o.material.side=2;if(p.mat&&!Array.isArray(o.material))skinMat(TH,o.material,p.mat);o.position.set(...(p.pos||[0,0,0]));o.rotation.set(...(p.rot||[0,0,0]).map(x=>x*Math.PI/180));o.scale.set(...(p.sc||[1,1,1]));o.castShadow=o.receiveShadow=true;return o}
export function mkModel(TH,m,M){const g=new TH.Group();(m.parts||[]).forEach(p=>g.add(mkPart(TH,p,M)));return g}

// ---------- الهيكل العظمي والحركات ----------
export const BONES=[['body','الجسم'],['head','الرأس'],['armR','ذراع يمين'],['armL','ذراع يسار'],['legR','ساق يمين'],['legL','ساق يسار'],
['spine','العمود الفقري'],['neck','الرقبة'],['elbowR','مرفق يمين'],['elbowL','مرفق يسار'],['handR','يد يمين'],['handL','يد يسار'],['fingR','أصابع يمين'],['fingL','أصابع يسار'],['kneeR','ركبة يمين'],['kneeL','ركبة يسار'],['footR','قدم يمين'],['footL','قدم يسار'],['jaw','فك']];
export const BP={spine:'body',neck:'spine',head:'neck',jaw:'head',armR:'spine',armL:'spine',elbowR:'armR',elbowL:'armL',handR:'elbowR',handL:'elbowL',fingR:'handR',fingL:'handL',legR:'body',legL:'body',kneeR:'legR',kneeL:'legL',footR:'kneeR',footL:'kneeL'};
export const PIV={body:[0,.95,0],spine:[0,1.1,0],neck:[0,1.45,0],head:[0,1.5,0],jaw:[0,1.58,.04],armR:[.3,1.4,0],armL:[-.3,1.4,0],elbowR:[.3,1.12,0],elbowL:[-.3,1.12,0],handR:[.3,.85,0],handL:[-.3,.85,0],fingR:[.3,.8,0],fingL:[-.3,.8,0],legR:[.1,.9,0],legL:[-.1,.9,0],kneeR:[.1,.5,0],kneeL:[-.1,.5,0],footR:[.1,.1,0],footL:[-.1,.1,0]};
export const BUILTIN={idle:4,talk:2,walk:1.05,wave:.7,point:1,sad:1,sit:1};
const sn=Math.sin,ab=Math.abs;
// وضعيات جاهزة (راديان) — نفسها تُستعمل للشخصية الجاهزة وللنماذج المربوطة
function procPose0(an,t){const P={};
if(an=='idle'){P.head=[0,sn(t*.5)*.1,0];P.armL=[0,0,-.05];P.armR=[0,0,.05]}
else if(an=='talk'){P.head=[sn(t*3)*.06,sn(t*.9)*.1,0];P.armR=[-.6+sn(t*3.3)*.35,0,.15];P.mouth=.5+ab(sn(t*11))*2.5}
else if(an=='walk'){const a=sn(t*6);P.legL=[a*.6,0,0];P.legR=[-a*.6,0,0];P.armL=[-a*.5,0,0];P.armR=[a*.5,0,0];P.y=ab(a)*.04}
else if(an=='wave'){P.armR=[0,0,2.6+sn(t*9)*.25];P.head=[0,0,.06]}
else if(an=='point'){P.armR=[-1.55,0,.05];P.head=[0,-.15,0]}
else if(an=='sad'){P.head=[.45,0,0];P.body=[.1,0,0];P.armL=[.1,0,0];P.armR=[.1,0,0]}
else if(an=='sit'){P.y=-.44;P.legL=[-1.55,0,0];P.legR=[-1.55,0,0]}
return P}
// يضيف المرفق والركبة والعمود الفقري للوضعيات الجاهزة (الشخصية الجاهزة تتجاهل ما لا تملكه)
export function procPose(an,t){const P=procPose0(an,t),a=sn(t*6);
if(an=='walk'){P.kneeL=[Math.max(0,-a),0,0];P.kneeR=[Math.max(0,a),0,0];P.elbowL=[-.5,0,0];P.elbowR=[-.5,0,0];P.spine=[0,a*.08,0]}
else if(an=='talk')P.elbowR=[-.9+sn(t*3.3)*.3,0,0];
else if(an=='wave')P.elbowR=[0,0,sn(t*9)*.5];
else if(an=='sit'){P.kneeL=[1.5,0,0];P.kneeR=[1.5,0,0]}
return P}
// قراءة حركة مصممة: c={d:المدة,l:تكرار(0=مرة واحدة),k:[{t,p:{عظمة:[x,y,z] بالدرجات,y:ارتفاع}}]} → راديان
export function sample(c,t){const d=c.d||1,ks=[...(c.k||[])].sort((x,y)=>x.t-y.t),R={},D=Math.PI/180,loop=c.l!==0;if(!ks.length)return R;t=loop?((t%d)+d)%d:Math.min(t,d);
let A,B,u;if(t<ks[0].t){if(!loop)return conv(ks[0].p);A=ks[ks.length-1];B=ks[0];const ta=A.t-d;u=(t-ta)/((B.t-ta)||1)}
else{let i=0;while(i<ks.length-1&&ks[i+1].t<=t)i++;A=ks[i];if(i==ks.length-1){if(!loop)return conv(A.p);B=ks[0];u=(t-A.t)/((B.t+d-A.t)||1)}else{B=ks[i+1];u=(t-A.t)/((B.t-A.t)||1)}}
u=(1-Math.cos(Math.PI*Math.max(0,Math.min(1,u))))/2;const L=(a,b)=>a+(b-a)*u;
new Set([...Object.keys(A.p),...Object.keys(B.p)]).forEach(b=>{if(b=='y')R.y=L(A.p.y||0,B.p.y||0);else R[b]=[0,1,2].map(i=>L((A.p[b]||[])[i]||0,(B.p[b]||[])[i]||0)*D)});return R}
const conv=p=>{const R={};for(const b in p)R[b]=b=='y'?p[b]:p[b].map(x=>x*Math.PI/180);return R};
export function mkRig(TH,m,M){const o=new TH.Group(),pv={...PIV,...(m.piv||{})},G={};BONES.forEach(([b])=>G[b]=new TH.Group());
G.body.position.set(...pv.body);o.add(G.body);BONES.slice(1).forEach(([b])=>{const P=BP[b],q=pv[P];G[b].position.set(pv[b][0]-q[0],pv[b][1]-q[1],pv[b][2]-q[2]);G[P].add(G[b])});G.head.rotation.order=G.neck.rotation.order='YXZ';
const meshes=(m.parts||[]).map(p=>{const b=G[p.b]?p.b:'body',q=mkPart(TH,p,M);q.position.set(...(p.pos||[0,0,0]).map((v,i)=>v-pv[b][i]));G[b].add(q);return q}),eyes=[],mouths=[];
meshes.forEach((q,i)=>{const f=m.parts[i].f;if(f=='eye')eyes.push([q,q.scale.y]);if(f=='mouth')mouths.push([q,q.scale.y])});
let an='idle',t0=null,spk=false;const ph=Math.random()*3,apply=P=>{BONES.forEach(([b])=>G[b].rotation.set(...(P[b]||[0,0,0])));G.body.position.y=pv.body[1]+(P.y||0)};
const R={o,G,meshes,pv,ik:{},look:null,apply,set:n=>{an=n;t0=null},get:()=>an,speak:v=>spk=v!==false,
tick:t=>{if(t0==null)t0=t;const c=(m.anims||{})[an],P=c&&(c.k||[]).length?sample(c,t-t0):procPose(an,t);apply(P);
 const sp=spk||P.mouth>1;mouths.forEach(([q,b])=>q.scale.y=b*(sp?.4+Math.abs(Math.sin(t*11))*2:1));eyes.forEach(([q,b])=>q.scale.y=b*(((t+ph)%3.7)<.12?.1:1));
 if(R.look||Object.keys(R.ik).length){o.updateWorldMatrix(true,true);if(R.look){doLook(TH,G.neck,R.look,.4);doLook(TH,G.head,R.look,.6)}ikApply(TH,G,pv,R.ik)}}};return R}
// شخصية جاهزة قابلة للتعديل والنحت والتحريك
export const STARTER=()=>{const P=(s,pos,sc,c,b)=>({s,pos,rot:[0,0,0],sc,c,b}),sk='#e8b890';return[P('cap',[0,1.15,0],[.7,.6,.6],'#4a6fa5','body'),P('sphere',[0,1.62,0],[.26,.3,.26],sk,'head'),P('sphere',[.06,1.65,.115],[.04,.04,.04],'#222222','head'),P('sphere',[-.06,1.65,.115],[.04,.04,.04],'#222222','head'),
P('cyl',[.3,1.1,0],[.1,.6,.1],'#4a6fa5','armR'),P('cyl',[-.3,1.1,0],[.1,.6,.1],'#4a6fa5','armL'),P('cyl',[.1,.45,0],[.14,.9,.14],'#2b2f3a','legR'),P('cyl',[-.1,.45,0],[.14,.9,.14],'#2b2f3a','legL')]};


// =====================================================================
// ================== الإصدار 2 — إضافات المحرك (v2) ====================
// =====================================================================
const OL={outlineParameters:{visible:false}},D2R=Math.PI/180,EASE={linear:t=>t,in:t=>t*t,out:t=>1-(1-t)*(1-t),inout:t=>t*t*(3-2*t)};
const rotOf=r=>Array.isArray(r)?r.map(x=>x*D2R):[0,(r||0)*D2R,0];

// ---------- (8,17,18) المواد: توهج + شفافية + خامات ----------
const TC=new Map();
export function mkTex(TH,o){
 let t;if(o.img){t=new TH.TextureLoader().load(o.img)}
 else{const key=[o.tex,o.tc,o.tc2].join('|');let c=TC.get(key);
  if(!c){const n=128;c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),k=o.tex;x.fillStyle=o.tc||'#ffffff';x.fillRect(0,0,n,n);x.fillStyle=o.tc2||'#7a7a7a';
   if(k=='checker'){x.fillRect(0,0,n/2,n/2);x.fillRect(n/2,n/2,n/2,n/2)}
   else if(k=='stripes')for(let i=0;i<n;i+=32)x.fillRect(i,0,16,n);
   else if(k=='dots'){for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(16+i*32,16+j*32,8,0,7);x.fill()}}
   else if(k=='grid'){x.fillRect(0,0,n,4);x.fillRect(0,0,4,n)}
   else if(k=='bricks'){for(let r=0;r<8;r++){const y=r*16;x.fillRect(0,y,n,2);for(let q=(r%2)*16;q<n;q+=32)x.fillRect(q,y,2,16)}}
   else if(k=='fabric'){x.globalAlpha=.5;for(let i=0;i<n;i+=3){x.fillRect(i,0,1,n);x.fillRect(0,i,n,1)}x.globalAlpha=.25;for(let i=0;i<1400;i++)x.fillRect(Math.random()*n,Math.random()*n,2,2);x.globalAlpha=1}
   else if(k=='carpet'){for(let i=0;i<2600;i++){x.globalAlpha=.15+Math.random()*.4;x.fillRect(Math.random()*n,Math.random()*n,2,2)}x.globalAlpha=1}
   else if(k=='leather'){x.globalAlpha=.3;for(let i=0;i<260;i++){x.beginPath();x.arc(Math.random()*n,Math.random()*n,2+Math.random()*5,0,7);x.fill()}x.globalAlpha=1}
   else if(k=='metal'){x.globalAlpha=.3;for(let i=0;i<n;i+=2){x.fillRect(0,i,n,1+Math.random()*1.5)}x.globalAlpha=1}
   else if(k=='wood'){for(let i=0;i<n;i+=2){x.globalAlpha=.1+Math.random()*.3;x.fillRect(0,i+Math.sin(i*.3)*2,n,1+Math.random()*2)}x.globalAlpha=.35;for(let i=0;i<8;i++){x.beginPath();x.arc(Math.random()*n,Math.random()*n,3+Math.random()*8,0,7);x.stroke()}x.globalAlpha=1}
   else if(k=='tiles'){x.fillRect(0,0,n,3);x.fillRect(0,0,3,n);x.fillRect(0,n/2,n,3);x.fillRect(n/2,0,3,n)}
   else if(k=='concrete'){for(let i=0;i<900;i++){x.globalAlpha=Math.random()*.25;x.beginPath();x.arc(Math.random()*n,Math.random()*n,2+Math.random()*10,0,7);x.fill()}x.globalAlpha=1}
   else if(k=='paper'){x.globalAlpha=.12;for(let i=0;i<3000;i++)x.fillRect(Math.random()*n,Math.random()*n,1,1);x.globalAlpha=1}
   else if(k=='wallpaper'){for(let i=0;i<n;i+=16){x.globalAlpha=.4;x.fillRect(i,0,6,n)}x.globalAlpha=.5;for(let j=0;j<n;j+=32)for(let i=8;i<n;i+=32){x.beginPath();x.arc(i+((j/32)%2)*16,j+16,4,0,7);x.fill()}x.globalAlpha=1}
   else if(k=='planks'){for(let i=0;i<n;i+=21){x.globalAlpha=.25+Math.random()*.4;x.fillRect(i,0,2,n)}x.globalAlpha=1}
   else{for(let i=0;i<1800;i++){x.globalAlpha=Math.random()*.45;x.fillRect(Math.random()*n,Math.random()*n,3,3)}x.globalAlpha=1}
   TC.set(key,c)}
  t=new TH.CanvasTexture(c)}
 t.wrapS=t.wrapT=TH.RepeatWrapping;if(o.rep)t.repeat.set(o.rep[0],o.rep[1]);t.colorSpace=TH.SRGBColorSpace;t.needsUpdate=true;return t}
// o: {e:لون التوهج, ei:شدته, op:الشفافية 0-1, glass:true, tex:'checker|stripes|dots|grid|bricks|planks|noise', tc,tc2, rep:[x,y], img:رابط/data-url, metal, rough, side:2}
export function skinMat(TH,m,o){
 if(o.glass){o={op:.3,metal:.1,rough:.05,...o}}
 if(o.e){m.emissive=new TH.Color(o.e);m.emissiveIntensity=o.ei??1}
 if(o.op!=null&&o.op<1){m.transparent=true;m.opacity=o.op;m.depthWrite=o.op>.6}
 if(o.tex||o.img){m.map=mkTex(TH,o);if(o.tc&&!o.keepColor&&m.color)m.color.set('#ffffff')}
 if(o.metal!=null&&'metalness' in m)m.metalness=o.metal;if(o.rough!=null&&'roughness' in m)m.roughness=o.rough;
 if(o.side==2)m.side=2;m.needsUpdate=true;return m}

// ---------- (5,6,7) الأضواء المستقلة والظلال ----------
// l: {lt:'point|spot|dir|amb|hemi', c, c2(أرض الهيمي), i, dist, decay, angle(درجة), pen, aim:[x,y,z], shadow:true, area, vis:true(كرة مرئية)}
export function mkLight(TH,l){
 const g=new TH.Group(),t=l.lt||'point',c=l.c||'#ffffff',i=l.i??1;let L;
 if(t=='spot'){L=new TH.SpotLight(c,i,l.dist??0,(l.angle??35)*D2R,l.pen??.3,l.decay??2);L.target.position.set(...(l.aim||[0,-1,0]));g.add(L.target)}
 else if(t=='dir'){L=new TH.DirectionalLight(c,i);L.target.position.set(...(l.aim||[0,-1,0]));g.add(L.target);const a=l.area||8;Object.assign(L.shadow.camera,{left:-a,right:a,top:a,bottom:-a,near:.1,far:a*6})}
 else if(t=='amb')L=new TH.AmbientLight(c,i);
 else if(t=='hemi')L=new TH.HemisphereLight(c,l.c2||'#222233',i);
 else L=new TH.PointLight(c,i,l.dist??10,l.decay??2);
 L.userData.sh=t=='dir'?l.shadow!==false:!!l.shadow;g.add(L);g.userData.light=L;
 if(l.vis)g.add(new TH.Mesh(new TH.SphereGeometry(.12,10,8),new TH.MeshBasicMaterial({color:c,userData:OL})));
 return g}
// o: {on:true, q:0..4 (0=بلا,1=256,2=512,3=1024,4=2048), soft:true}
export function setShadows(r,root,o){o=o||{};const q=Math.max(0,Math.min(4,o.q??2)),n=[0,256,512,1024,2048][q],on=o.on!==false&&q>0,was=r.shadowMap.enabled;
 r.shadowMap.enabled=on;r.shadowMap.type=o.soft===false?1:2;
 root.traverse(l=>{if(l.isLight&&l.shadow){l.castShadow=on&&(l.isDirectionalLight?l.userData.sh!==false:l.userData.sh===true);if(n&&l.shadow.mapSize.x!=n){l.shadow.mapSize.set(n,n);if(l.shadow.map){l.shadow.map.dispose();l.shadow.map=null}}}});
 if(was!=on)root.traverse(m=>{m.material&&[].concat(m.material).forEach(x=>x.needsUpdate=true)})}

// ---------- (9) السماء: تدرج + نجوم + شمس/قمر ----------
// k: {top,mid,bottom, stars:عدد, sun:{dir,c,size}, moon:{dir,c,size}}
export function mkSky(TH,k){
 const g=new TH.Group(),C=x=>new TH.Color(x);
 const mt=new TH.ShaderMaterial({userData:OL,side:1,depthWrite:false,depthTest:false,fog:false,uniforms:{top:{value:C(k.top||'#1a2a5a')},mid:{value:C(k.mid||k.bottom||'#8aa4d8')},bot:{value:C(k.bottom||k.mid||'#2a3050')}},
 vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,mid,bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.?mix(mid,top,pow(h,.55)):mix(mid,bot,pow(-h,.4));gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'});
 const dome=new TH.Mesh(new TH.SphereGeometry(100,24,16),mt);dome.renderOrder=-10;dome.frustumCulled=false;g.add(dome);
 const disc=(o,def,ro)=>{const m=new TH.Mesh(new TH.SphereGeometry(o.size||4,16,12),new TH.MeshBasicMaterial({userData:OL,color:o.c||def,fog:false,depthTest:false,depthWrite:false}));m.position.set(...(o.dir||[0,.5,-1])).normalize().multiplyScalar(80);m.renderOrder=ro;m.frustumCulled=false;g.add(m)};
 if(k.sun)disc(k.sun,'#fff3c4',-8);if(k.moon)disc(k.moon,'#e6ecff',-8);
 let st=null;if(k.stars>0){const n=Math.min(2500,k.stars|0),a=new Float32Array(n*3);for(let i=0;i<n;i++){const u=Math.random()*6.283,y=Math.random()*.95+.05,r=Math.sqrt(1-y*y)*90;a[3*i]=Math.cos(u)*r;a[3*i+1]=y*90;a[3*i+2]=Math.sin(u)*r}
  const G=new TH.BufferGeometry();G.setAttribute('position',new TH.BufferAttribute(a,3));st=new TH.Points(G,new TH.PointsMaterial({userData:OL,color:'#ffffff',size:1.6,sizeAttenuation:false,fog:false,depthTest:false,depthWrite:false,transparent:true,opacity:k.starOp??.9}));st.renderOrder=-9;st.frustumCulled=false;g.add(st)}
 return{o:g,update:(cam,t)=>{g.position.copy(cam.position);if(st)st.rotation.y=t*.004}}}

// ---------- الإضاءة العامة (6) + الضباب المستقل (10) — متوافقة مع القديم ----------
// E: {preset, ground, sky:{...}, fog:{c,d,near,far}|رقم, hemi:{sky,ground,i}, sun:{c,i,dir:[x,y,z]}, amb:{c,i}, shadow:{on,q,soft,area}, lights:[مواصفات mkLight + pos], weather:[...]}
export function stage(TH,s,E,M){E=E||{};const q=PRE[E.preset]||PRE.night,H={objs:[],upd:[]},add=o=>{s.add(o);H.objs.push(o);return o},sk=E.sky,F=E.fog;
 s.background=new TH.Color(sk?(sk.bottom||sk.mid||q[0]):q[0]);s.fog=null;
 if(F&&typeof F=='object'){const fc=F.c||(sk&&(sk.mid||sk.bottom))||q[0];if(F.near!=null&&F.far!=null)s.fog=new TH.Fog(fc,F.near,F.far);else if(F.d>0)s.fog=new TH.FogExp2(fc,+F.d)}else if(F>0)s.fog=new TH.FogExp2(E.fogc||q[0],+F);
 const hm=E.hemi||{},sn=E.sun||{},sh=E.shadow||{},hl=add(new TH.HemisphereLight(hm.sky||q[1],hm.ground||0x222233,hm.i??q[2])),d=add(new TH.DirectionalLight(sn.c||q[3],sn.i??q[4]));
 d.position.set(...(sn.dir||(sk&&sk.sun&&sk.sun.dir?sk.sun.dir.map(x=>x*10):[3,6,4])));d.castShadow=sh.on!==false;const a=sh.area||8,n=[0,256,512,1024,2048][sh.q??3];
 Object.assign(d.shadow.camera,{left:-a,right:a,top:a,bottom:-a,near:.5,far:a*6});d.shadow.camera.updateProjectionMatrix();d.shadow.bias=-.0006;d.shadow.normalBias=.025;if(n)d.shadow.mapSize.set(n,n);
 if(E.amb)add(new TH.AmbientLight(E.amb.c||'#ffffff',E.amb.i??.3));
 if(E.ground!==false){const g=add(new TH.Mesh(new TH.CircleGeometry(E.groundR||40,48),M(E.ground||(E.preset=='day'?'#8a9a72':'#3b4054'))));g.rotation.x=-Math.PI/2;g.receiveShadow=true;g.userData.isGround=1}
 (E.lights||[]).forEach(l=>{const o=add(mkLight(TH,l));o.position.set(...(l.pos||[0,0,0]))});
 if(sk){H.sky=mkSky(TH,sk);add(H.sky.o);H.upd.push(H.sky.update)}
 H.sun=d;H.hemi=hl;H.update=(cam,t)=>H.upd.forEach(f=>f(cam,t));return H}

// ---------- (11) الطقس والجسيمات ----------
// type: rain|snow|dust (حجم يتبع الكاميرا) — smoke|fire|sparks (باعث من موضع الكائن). خيارات: n,c,s,op,v,wind:[x,y,z],box,life,spread,grav,grow
const PK={rain:{n:1400,box:[26,16,26],v:[0,-20,0],c:'#a9c1ff',op:.55,line:1},snow:{n:800,box:[26,14,26],v:[0,-1.5,0],c:'#ffffff',op:.9,s:.09,sway:.8},dust:{n:260,box:[22,8,22],v:[.4,.05,0],c:'#d8c9a3',op:.35,s:.07,sway:.5},
 smoke:{n:90,em:1,life:4,v:[0,.9,0],spread:.35,c:'#8a8a8a',op:.5,s:.7,grow:2.2},fire:{n:70,em:1,life:1,v:[0,1.8,0],spread:.3,c:'#ff8a2a',op:.9,s:.5,grow:-.6,add:1},sparks:{n:60,em:1,life:1.2,v:[0,3,0],spread:1.6,c:'#ffd27a',op:1,s:.12,grav:-6,add:1}};
export function mkParticles(TH,o){if(o.v3!==false&&FXTYPES.includes(o.type)){const f=mkFX3(TH,o,o.toon);if(f)return{o:f.o,update:dt=>f.update(dt),fx:f}}
 const k={...PK[o.type||'rain'],...o},n=Math.max(1,Math.round(k.n*(o.scale||1))),g=new TH.Group(),P=new Float32Array(n*3),V=new Float32Array(n*3),Lf=new Float32Array(n),Ag=new Float32Array(n),A=new Float32Array(n),S=new Float32Array(n),
 box=k.box||[20,10,20],em=!!k.em,w=k.wind||[0,0,0],life=k.life||1,R=Math.random;
 const spawn=(i,f)=>{const j=3*i;if(em){P[j]=(R()-.5)*.2;P[j+1]=0;P[j+2]=(R()-.5)*.2;V[j]=(R()-.5)*k.spread+k.v[0];V[j+1]=k.v[1]*(.7+R()*.6);V[j+2]=(R()-.5)*k.spread+k.v[2];Lf[i]=life*(.7+R()*.3);Ag[i]=f?R()*Lf[i]:0}
  else{P[j]=(R()-.5)*box[0];P[j+1]=(R()-.5)*box[1];P[j+2]=(R()-.5)*box[2];const m=.8+R()*.4;V[j]=k.v[0]*m;V[j+1]=k.v[1]*m;V[j+2]=k.v[2]*m;A[i]=k.op;S[i]=(k.s||.1)*(.6+R()*.8)}};
 for(let i=0;i<n;i++)spawn(i,true);let mt,pts,lp,LP;
 if(k.line){LP=new TH.BufferAttribute(new Float32Array(n*6),3);LP.setUsage(35048);const G=new TH.BufferGeometry();G.setAttribute('position',LP);lp=new TH.LineSegments(G,new TH.LineBasicMaterial({userData:OL,color:k.c,transparent:true,opacity:k.op,depthWrite:false,fog:false}));lp.frustumCulled=false;g.add(lp)}
 else{const G=new TH.BufferGeometry(),pa=new TH.BufferAttribute(P,3),aa=new TH.BufferAttribute(A,1),sa=new TH.BufferAttribute(S,1);[pa,aa,sa].forEach(x=>x.setUsage(35048));G.setAttribute('position',pa);G.setAttribute('a',aa);G.setAttribute('s',sa);
  mt=new TH.ShaderMaterial({userData:OL,transparent:true,depthWrite:false,fog:false,blending:k.add?2:1,uniforms:{col:{value:new TH.Color(k.c)},px:{value:700}},
  vertexShader:'attribute float a,s;varying float vA;uniform float px;void main(){vA=a;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=max(1.,s*px/-mv.z);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 col;varying float vA;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(col,vA*smoothstep(.5,.0,r));\n#include <colorspace_fragment>\n}'});
  pts=new TH.Points(G,mt);pts.frustumCulled=false;g.add(pts)}
 let t=0;const update=(dt,c,px)=>{dt=Math.min(dt,.1);t+=dt;if(mt)mt.uniforms.px.value=px||700;
  for(let i=0;i<n;i++){const j=3*i;
   if(em){Ag[i]+=dt;if(Ag[i]>=Lf[i])spawn(i);const u=Ag[i]/Lf[i];V[j+1]+=(k.grav||0)*dt;P[j]+=(V[j]+w[0])*dt;P[j+1]+=(V[j+1]+w[1])*dt;P[j+2]+=(V[j+2]+w[2])*dt;A[i]=k.op*(1-u)*(u<.1?u*10:1);S[i]=Math.max(.02,k.s*(1+(k.grow||0)*u))}
   else{P[j]+=(V[j]+w[0])*dt+(k.sway?Math.sin(t*1.3+i)*k.sway*dt:0);P[j+1]+=(V[j+1]+w[1])*dt;P[j+2]+=(V[j+2]+w[2])*dt;
    if(c)for(let a=0;a<3;a++){const q=P[j+a]-c.getComponent(a);P[j+a]=c.getComponent(a)+q-box[a]*Math.floor((q+box[a]/2)/box[a])}}
   if(lp){const l=LP.array,st=k.streak||.05;l[6*i]=P[j];l[6*i+1]=P[j+1];l[6*i+2]=P[j+2];l[6*i+3]=P[j]-(V[j]+w[0])*st;l[6*i+4]=P[j+1]-(V[j+1]+w[1])*st;l[6*i+5]=P[j+2]-(V[j+2]+w[2])*st}}
  if(lp)LP.needsUpdate=true;else{const G=pts.geometry;G.attributes.position.needsUpdate=G.attributes.a.needsUpdate=G.attributes.s.needsUpdate=true}};
 return{o:g,update}}

// ---------- (3) العالم المتكرر (scroll لانهائي) ----------
// o: {len:24, n:4, speed, dir:1 (يتحرك نحو +z ⇒ المركبة تسير نحو -z), road:{w,c}, ground:'#..', items:[{k:'tree',gap:6,off:7,jit:2,scale:[.8,1.4],side:-1|1,rare:0..1}], seed}
export function mkScroller(TH,o,M){
 const len=o.len||24,n=Math.max(3,o.n||4),rw=o.road&&o.road.w||6,g=new TH.Group(),ch=[];let seed=o.seed||7;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const items=o.items||[{k:'tree',gap:6,off:7,jit:2,scale:[.8,1.4]},{k:'lamp',gap:12,off:4}];
 const build=()=>{const c=new TH.Group(),B=mk(TH,M,c);
  B(new TH.BoxGeometry(o.groundW||80,.02,len+.02),o.ground||'#4a5a3a',[0,0,0]);B(new TH.BoxGeometry(rw,.04,len+.02),(o.road&&o.road.c)||'#2b2d33',[0,.01,0]);
  for(let z=-len/2;z<len/2;z+=4)B(new TH.BoxGeometry(.12,.045,1.6),'#eeeeee',[0,.012,z+1]);
  items.forEach(it=>{const gap=it.gap||6;for(let z=-len/2;z<len/2;z+=gap)[-1,1].forEach(s=>{if(it.side&&it.side!=s)return;if(it.rare&&R()>it.rare)return;
   const p=mkProp(TH,{k:it.k,color:it.color,nolight:true},M),jt=it.jit||0;p.position.set(s*(rw/2+(it.off||6)+(R()-.5)*jt),0,z+(R()-.5)*jt);
   p.scale.setScalar(it.scale?it.scale[0]+R()*(it.scale[1]-it.scale[0]):1);p.rotation.y=it.k=='lamp'?(s>0?-1:1)*Math.PI/2:R()*6.28;c.add(p)})});
  return mergeStatic(TH,c)};
 for(let i=0;i<n;i++){const c=build();c.position.z=(i-(n-1)/2)*len;g.add(c);ch.push(c)}
 const S={o:g,speed:o.speed||0,dir:o.dir??1,update(dt){const d=S.speed*dt*S.dir;for(const c of ch){c.position.z+=d;if(S.dir>0&&c.position.z>n/2*len)c.position.z-=n*len;else if(S.dir<0&&c.position.z<-n/2*len)c.position.z+=n*len}}};return S}

// ---------- (20) الأداء: دمج + نسخ متعددة + LOD + جودة ----------
export function mergeStatic(TH,root){
 root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),grp=new Map();
 root.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||m.isSkinnedMesh||Array.isArray(m.material))return;const t=m.material,key=[t.type,t.color.getHex(),t.emissive?t.emissive.getHex()+':'+t.emissiveIntensity:'',t.opacity,t.map?t.map.uuid:'',t.side].join('|');let a=grp.get(key);if(!a)grp.set(key,a=[]);a.push(m)});
 const cat=A=>{const o=new Float32Array(A.reduce((s,a)=>s+a.length,0));let k=0;A.forEach(a=>{o.set(a,k);k+=a.length});return o};
 grp.forEach(ms=>{if(ms.length<2)return;const P=[],N=[],U=[];
  ms.forEach(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(inv.clone().multiply(m.matrixWorld));P.push(g.attributes.position.array);N.push(g.attributes.normal.array);U.push(g.attributes.uv?g.attributes.uv.array:new Float32Array(g.attributes.position.count*2))});
  const G=new TH.BufferGeometry();G.setAttribute('position',new TH.BufferAttribute(cat(P),3));G.setAttribute('normal',new TH.BufferAttribute(cat(N),3));G.setAttribute('uv',new TH.BufferAttribute(cat(U),2));
  const o=new TH.Mesh(G,ms[0].material);o.castShadow=o.receiveShadow=true;root.add(o);ms.forEach((m,i)=>{m.parent.remove(m);m.geometry.dispose();if(i)m.material.dispose()})});
 return root}
const toM=(TH,s)=>{if(s.isMatrix4)return s;const sc=s.scale||1;return new TH.Matrix4().compose(new TH.Vector3(...(s.pos||[0,0,0])),new TH.Quaternion().setFromEuler(new TH.Euler(0,(s.rot||0)*D2R,0)),Array.isArray(sc)?new TH.Vector3(...sc):new TH.Vector3(sc,sc,sc))};
// نسخ متعددة: كل مجسم كتلة رسم واحدة (غابة من 500 شجرة = نداء رسم واحد لكل مادة)
export function mkInstanced(TH,proto,list){const g=new TH.Group(),Ms=list.map(s=>toM(TH,s));proto.updateMatrixWorld(true);const inv=proto.matrixWorld.clone().invert();
 proto.traverse(m=>{if(!m.isMesh)return;const im=new TH.InstancedMesh(m.geometry,m.material,Ms.length),rel=inv.clone().multiply(m.matrixWorld);Ms.forEach((M,i)=>im.setMatrixAt(i,new TH.Matrix4().multiplyMatrices(M,rel)));im.castShadow=im.receiveShadow=true;im.frustumCulled=false;g.add(im)});return g}
// مستويات تفاصيل: قريب كامل / متوسط مدموج / بعيد صندوق واحد. p.lod=[0,25,70]
export function mkLODProp(TH,p,M){const near=mkProp(TH,p,M),mid=mergeStatic(TH,mkProp(TH,{...p,nolight:true},M)),b=new TH.Box3().setFromObject(near),s=b.getSize(new TH.Vector3()),c=b.getCenter(new TH.Vector3()),far=new TH.Mesh(new TH.BoxGeometry(s.x,s.y,s.z),M(p.color||'#777777')),f=new TH.Group(),l=new TH.LOD(),d=p.lod||[0,25,70];
 far.position.copy(c);f.add(far);l.addLevel(near,d[0]);l.addLevel(mid,d[1]);l.addLevel(f,d[2]);return l}
export const isMobile=()=>typeof navigator!='undefined'&&/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
export function quality(r,lv){lv=lv||(isMobile()?'low':'high');const Q={low:{pr:1,sh:2,fx:.35,dof:false},med:{pr:1.5,sh:2,fx:.7,dof:false},high:{pr:2,sh:3,fx:1,dof:true}}[lv]||{pr:1,sh:2,fx:.5,dof:false};
 r&&r.setPixelRatio(Math.min(typeof devicePixelRatio=='number'?devicePixelRatio:1,Q.pr));return{lv,...Q,post:lv=='low'?'lite':'full'}}

// ---------- (12,14) نظر + أطراف IK ----------
function vecOf(TH,t,out){if(t.isObject3D)return t.getWorldPosition(out);if(t.isVector3)return out.copy(t);return out.set(t[0],t[1],t[2])}
function doLook(TH,head,tg,k){const p=head.parent;if(!p)return;const v=vecOf(TH,tg,new TH.Vector3());p.worldToLocal(v).sub(head.position);
 head.rotation.y+=Math.max(-1.1,Math.min(1.1,Math.atan2(v.x,v.z)))*k;head.rotation.x+=Math.max(-.6,Math.min(.6,-Math.atan2(v.y,Math.hypot(v.x,v.z))))*k}
export const LIMB={armR:['armR','elbowR','handR'],armL:['armL','elbowL','handL'],legR:['legR','kneeR','footR'],legL:['legL','kneeL','footL']};
function ik2(TH,G,pv,ch,tp,pole,w){
 const[a,b,c]=ch,A=G[a],B=G[b],par=A.parent,Vc=TH.Vector3,Q=TH.Quaternion,cl=x=>Math.max(-1,Math.min(1,x));
 const t=par.worldToLocal(tp.clone()).sub(A.position),dir=t.clone().normalize();
 if(!B){A.quaternion.slerp(new Q().setFromUnitVectors(new Vc(0,-1,0),dir),w);return}
 const s=new Vc(...pv[a]),e=new Vc(...pv[b]),h=new Vc(...pv[c]),l1=s.distanceTo(e),l2=e.distanceTo(h),d=Math.min(Math.max(t.length(),Math.abs(l1-l2)+1e-3),l1+l2-1e-3);
 const rest=e.clone().sub(s).normalize(),n=new Vc().crossVectors(dir,new Vc(...pole));if(n.lengthSq()<1e-6)n.set(1,0,0);n.normalize();
 const ang=Math.acos(cl((l1*l1+d*d-l2*l2)/(2*l1*d))),gam=Math.acos(cl((l1*l1+l2*l2-d*d)/(2*l1*l2))),u=dir.clone().applyAxisAngle(n,ang),qU=new Q().setFromUnitVectors(rest,u),
 qE=new Q().setFromAxisAngle(n.clone().applyQuaternion(qU.clone().invert()),-(Math.PI-gam));
 A.quaternion.slerp(qU,w);B.quaternion.slerp(qE,w)}
function ikApply(TH,G,pv,ik){for(const k in ik){const e=ik[k],ch=LIMB[k];if(!e||!e.t||!ch||!G[ch[0]])continue;ik2(TH,G,pv,ch,vecOf(TH,e.t,new TH.Vector3()),e.pole||(k[0]=='a'?[0,0,-1]:[0,0,1]),e.w??1)}}

// ---------- (15) الكاميرا: تتبع + مسار + اهتزاز + دمج ----------
// set({pos,look,fov} | {follow:id,off:[x,y,z],rel:true,lag:.3,lookAt:id,lo:[0,1,0]} | {path:[[x,y,z]..],dur,loop,look|lookAt} , blend:ثواني, shake:{amp,f,d}, dof:{focus:رقم|id,range,blur})
export class CamRig{
 constructor(TH,cam,w){this.TH=TH;this.c=cam;this.w=w;this.p=new TH.Vector3(0,2,8);this.l=new TH.Vector3(0,1,0);this.fov=cam.fov;this.s={};this.t=0;this.sh=null;this.bl=null;this.dofs=null}
 set(s){const TH=this.TH;s=s||{};this.bl=s.blend>0?{t:0,d:s.blend,p:this.p.clone(),l:this.l.clone(),f:this.fov}:null;this.s={...s};this.t=0;this.cur=s.path?new TH.CatmullRomCurve3(s.path.map(a=>new TH.Vector3(...a)),false,'catmullrom',.3):null;if(s.shake)this.shake(s.shake.amp,s.shake.f,s.shake.d);this.dofs=s.dof||null}
 shake(a,f,d){this.sh={a:a||.1,f:f||14,d:d??1.5,t:0}}
 update(dt){const TH=this.TH,s=this.s,W=this.w,V=TH.Vector3;this.t+=dt;let tp,tl;const tg=s.follow&&W.get(s.follow);
  if(this.cur){tp=this.cur.getPointAt(s.loop?(this.t/(s.dur||5))%1:Math.min(1,this.t/(s.dur||5)))}
  else if(tg){const off=new V(...(s.off||[0,2,6]));if(s.rel!==false)off.applyQuaternion(tg.getWorldQuaternion(new TH.Quaternion()));tp=tg.getWorldPosition(new V()).add(off)}
  else tp=new V(...(s.pos||[0,2,8]));
  const la=s.lookAt&&W.get(s.lookAt)||tg;if(la&&!s.look)tl=la.getWorldPosition(new V()).add(new V(...(s.lo||[0,1,0])));else tl=new V(...(s.look||[0,1,0]));
  if(s.lag>0){const a=1-Math.exp(-dt/s.lag);this.p.lerp(tp,a);this.l.lerp(tl,a)}else{this.p.copy(tp);this.l.copy(tl)}
  const dp=this.p.clone(),dl=this.l.clone();let fv=s.fov||50;
  if(this.bl){this.bl.t+=dt;const u=EASE.inout(Math.min(1,this.bl.t/this.bl.d));dp.lerpVectors(this.bl.p,this.p,u);dl.lerpVectors(this.bl.l,this.l,u);fv=this.bl.f+(fv-this.bl.f)*u;if(u>=1)this.bl=null}
  this.fov=this.bl||Math.abs(this.fov-fv)<.01?fv:this.fov+(fv-this.fov)*(1-Math.exp(-dt*6));
  if(this.sh){const h=this.sh;h.t+=dt;const k=h.a*Math.exp(-h.d*h.t);dp.x+=Math.sin(h.t*h.f)*k;dp.y+=Math.sin(h.t*h.f*1.3+1)*k;dl.x+=Math.sin(h.t*h.f*.7+2)*k;if(k<.0005)this.sh=null}
  const c=this.c;c.position.copy(dp);c.lookAt(dl);if(Math.abs(c.fov-this.fov)>.01){c.fov=this.fov;c.updateProjectionMatrix()}}}
// عمق الميدان (تمرير ثانٍ بلا مكتبات خارجية؛ يتعطل على الجودة المنخفضة)
export class DOF{
 constructor(TH,r){this.r=r;this.v=new TH.Vector2();this.rt=new TH.WebGLRenderTarget(4,4,{minFilter:TH.LinearFilter,magFilter:TH.LinearFilter});this.rt.depthTexture=new TH.DepthTexture(4,4);
  this.m=new TH.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tc:{value:this.rt.texture},td:{value:this.rt.depthTexture},f:{value:8},rg:{value:6},bl:{value:1},nr:{value:.1},fr:{value:400},px:{value:new TH.Vector2()}},
  vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:'uniform sampler2D tc,td;uniform float f,rg,bl,nr,fr;uniform vec2 px;varying vec2 u;float lz(float d){return nr*fr/(fr-d*(fr-nr));}void main(){float z=lz(texture2D(td,u).x);float c=clamp(abs(z-f)/rg,0.,1.)*bl*5.;vec4 s=texture2D(tc,u);float w=1.;for(int i=0;i<14;i++){float a=float(i)*2.3999632;float r=sqrt((float(i)+.5)/14.)*c;s+=texture2D(tc,u+vec2(cos(a),sin(a))*r*px);w+=1.;}gl_FragColor=s/w;\n#include <colorspace_fragment>\n}'});
  this.s=new TH.Scene();const q=new TH.Mesh(new TH.PlaneGeometry(2,2),this.m);q.frustumCulled=false;this.s.add(q);this.c=new TH.OrthographicCamera(-1,1,1,-1,0,1)}
 render(S,cam,o){const r=this.r,w=r.getDrawingBufferSize(this.v),W=w.x|0,H=w.y|0,u=this.m.uniforms;
  if(this.rt.width!=W||this.rt.height!=H){this.rt.setSize(W,H);this.rt.depthTexture.image.width=W;this.rt.depthTexture.image.height=H}
  u.f.value=o.focus;u.rg.value=o.range;u.bl.value=o.blur;u.nr.value=cam.near;u.fr.value=cam.far;u.px.value.set(1/W,1/H);
  r.setRenderTarget(this.rt);r.render(S,cam);r.setRenderTarget(null);r.render(this.s,this.c)}
 dispose(){this.rt.dispose();this.m.dispose()}}

// ---------- (22) الصوت المكاني ----------
// play(id,{synth:'rain|wind|engine|fire|hum' | url, vol, loop, at:Object3D (مكاني 3D), ref, max, rate})
export class Audio3D{
 constructor(){this.c=null;this.m=new Map();this.B=new Map()}
 init(){try{if(!this.c){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;this.c=new A();this.out=this.c.createGain();this.out.connect(this.c.destination)}if(this.c.state=='suspended')this.c.resume();return this.c}catch(e){return null}}
 _ns(){const c=this.c;if(!this.nb){const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=b}const s=c.createBufferSource();s.buffer=this.nb;s.loop=true;return s}
 _syn(k,o){const c=this.c,out=c.createGain(),ctl={},F=(t,f,q)=>{const x=c.createBiquadFilter();x.type=t;x.frequency.value=f;if(q)x.Q.value=q;return x};
  if(k=='rain'){const s=this._ns(),f=F('highpass',1200);s.connect(f);f.connect(out);s.start();ctl.stop=()=>s.stop()}
  else if(k=='wind'){const s=this._ns(),f=F('bandpass',420,.8),l=c.createOscillator(),lg=c.createGain();l.frequency.value=.15;lg.gain.value=250;l.connect(lg);lg.connect(f.frequency);s.connect(f);f.connect(out);s.start();l.start();ctl.stop=()=>{s.stop();l.stop()}}
  else if(k=='fire'){const s=this._ns(),f=F('lowpass',700),l=c.createOscillator(),lg=c.createGain();l.type='sawtooth';l.frequency.value=7;lg.gain.value=.5;const g2=c.createGain();g2.gain.value=.6;l.connect(lg);lg.connect(g2.gain);s.connect(f);f.connect(g2);g2.connect(out);s.start();l.start();ctl.stop=()=>{s.stop();l.stop()}}
  else if(k=='engine'){const a=c.createOscillator(),b=c.createOscillator(),f=F('lowpass',500);a.type='sawtooth';b.type='square';a.connect(f);b.connect(f);f.connect(out);const set=r=>{a.frequency.value=38+r*55;b.frequency.value=19+r*27.5};set(o.rate||1);a.start();b.start();ctl.rate=set;ctl.stop=()=>{a.stop();b.stop()}}
  else{const a=c.createOscillator();a.frequency.value=110;a.connect(out);a.start();ctl.stop=()=>a.stop()}
  return{n:out,ctl}}
 async _buf(u){let p=this.B.get(u);if(!p){p=fetch(u).then(r=>r.arrayBuffer()).then(b=>this.c.decodeAudioData(b));this.B.set(u,p)}return p}
 async play(id,o){if(!this.init())return;this.stop(id);const c=this.c,g=c.createGain();g.gain.value=o.vol??.5;let src,ctl={};
  try{if(o.synth){const s=this._syn(o.synth,o);src=s.n;ctl=s.ctl}else if(o.url){const s=c.createBufferSource();s.buffer=await this._buf(o.url);s.loop=o.loop!==false;s.playbackRate.value=o.rate||1;s.start();src=s;ctl.stop=()=>s.stop();ctl.rate=r=>s.playbackRate.value=r}else return}catch(e){return}
  src.connect(g);let pan=null;if(o.at){pan=c.createPanner();pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=o.ref||2;pan.maxDistance=o.max||60;pan.rolloffFactor=o.roll??1.2;g.connect(pan);pan.connect(this.out)}else g.connect(this.out);
  this.m.set(id,{g,pan,at:o.at,ctl,keep:!!o.keep})}
 set(id,o){const e=this.m.get(id);if(!e)return;if(o.vol!=null)e.g.gain.value=o.vol;if(o.rate!=null&&e.ctl.rate)e.ctl.rate(o.rate)}
 stop(id){const e=this.m.get(id);if(!e)return;try{e.ctl.stop&&e.ctl.stop()}catch(x){}try{e.g.disconnect();e.pan&&e.pan.disconnect()}catch(x){}this.m.delete(id)}
 stopAll(keep){[...this.m.keys()].forEach(k=>{if(!(keep&&this.m.get(k).keep))this.stop(k)})}
 update(cam){const c=this.c;if(!c)return;const v=this._v||(this._v=cam.position.clone()),L=c.listener,p=cam.position,sp=(P,x,y,z)=>{if(P.positionX){P.positionX.value=x;P.positionY.value=y;P.positionZ.value=z}else P.setPosition(x,y,z)};
  sp(L,p.x,p.y,p.z);cam.getWorldDirection(v);if(L.forwardX){L.forwardX.value=v.x;L.forwardY.value=v.y;L.forwardZ.value=v.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0}else L.setOrientation(v.x,v.y,v.z,0,1,0);
  this.m.forEach(e=>{if(e.pan&&e.at){e.at.getWorldPosition(v);sp(e.pan,v.x,v.y,v.z)}})}}

// ---------- (16) المخرج: خط زمني مربوط بالنص والاختيارات ----------
// حدث: {id, at:ثانية | after:'id' | on:'text:معرّف' | 'choice:معرّف=قيمة' | 'scene' | 'moved:id', delay, rep, do:[إجراء|إجراءات]}
// إجراء: {a:'move|attach|detach|anim|ik|look|speak|set|show|hide|light|env|cam|shake|scroll|fx|sound|motion|say', id, ..., dt:تأخير}
export class Director{
 constructor(w){this.w=w;this.q=[];this.ev=[];this.t=0;this.done=new Map()}
 load(tl){this.t=0;this.q=[];this.done.clear();this.ev=(tl||[]).map((e,i)=>({id:'e'+i,...e,fired:0}));this.ev.forEach(e=>{if(e.on=='scene')this.q.push({at:e.delay||0,e});else if(!e.on&&!e.after)this.q.push({at:e.at||0,e})})}
 notify(type,id,val){const k=type+':'+id,k2=k+'='+val;this.ev.forEach(e=>{if(e.on&&e.on!='scene'&&(e.on==k||e.on==k2||e.on==type+':*')&&(e.rep||!e.fired))this.q.push({at:this.t+(e.delay||0),e})});this.update(0)}
 later(s,fn){this.q.push({at:this.t+s,fn})}
 update(dt){this.t+=dt;for(let g=0;g<40;g++){const r=this.q.filter(x=>x.at<=this.t+1e-9);if(!r.length)return;this.q=this.q.filter(x=>x.at>this.t+1e-9);r.sort((a,b)=>a.at-b.at).forEach(x=>x.fn?x.fn():this.fire(x.e))}}
 fire(e){if(e.fired&&!e.rep)return;e.fired++;this.done.set(e.id,this.t);[].concat(e.do||[]).forEach(a=>a.dt?this.later(a.dt,()=>this.run(a)):this.run(a));this.ev.forEach(x=>{if(x.after==e.id)this.q.push({at:this.t+(x.delay||0),e:x})})}
 run(a){const w=this.w;switch(a.a){
  case'move':w.move(a.id,a);break;case'attach':w.attach(a.id,a.to,a);break;case'detach':w.detach(a.id);break;case'anim':w.play(a.id,a.n);break;
  case'ik':w.ik(a.id,a.limb,a.target,a);break;case'look':w.look(a.id,a.target);break;case'speak':w.speak(a.id,a.on!==false,a.dur);break;
  case'set':w.set(a.id,a);break;case'show':w.show(a.id,true);break;case'hide':w.show(a.id,false);break;case'light':w.light(a.id,a);break;
  case'env':w.setEnv({...w.envSpec,...a.set});break;case'cam':w.rig.set(a);break;case'shake':w.rig.shake(a.amp,a.f,a.d);break;
  case'scroll':w.scroll(a.id,a.speed,a.dur);break;case'fx':w.fx(a.id,a);break;case'sound':w.sound(a);break;case'motion':w.addAnim(a.id,a);break;
  case'say':this.onSay&&this.onSay(a);break;case'emit':this.notify('custom',a.name);break;default:w.extra&&w.extra(a)}}}

// ---------- (1,2,4,21) العالم: كيانات + ربط + حركة + استمرارية ----------
export class World{
 constructor(TH,r,o){o=o||{};this.TH=TH;this.r=r;this.o=o;this.gm=o.gm||gmap(TH);this.M=o.M||mat(TH,this.gm,o.toon!==false);this.S=o.scene||new TH.Scene();this.cam=o.camera||new TH.PerspectiveCamera(o.fov||50,1,.1,400);
  this.E=new Map();this.tw=[];this.an=[];this.t=0;this.paused=false;this.mute=false;this.fxW=[];this.envSpec={};this.audio=o.audio||new Audio3D();this.q=quality(r,o.quality);if(o.dof!=null)this.q.dof=o.dof;
  this.rig=new CamRig(TH,this.cam,this);this.dir=new Director(this)}
 get(id){const e=this.E.get(id);return e&&e.o}
 resize(w,h){this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
 px(){return this.r.domElement.height/(2*Math.tan(this.cam.fov*D2R/2))}
 // البيئة (ضوء/سماء/ضباب/ظلال/طقس)
 setEnv(E){E=E||{};this.envSpec=E;if(this.env)this.env.objs.forEach(o=>{this.S.remove(o);free(o)});this.fxW.forEach(i=>this.remove(i));this.fxW=[];
  this.env=stage(this.TH,this.S,E,this.M);setShadows(this.r,this.S,{...(E.shadow||{}),q:Math.min((E.shadow&&E.shadow.q)??3,this.q.sh)});
  [].concat(E.weather||[]).forEach((w,i)=>{const id='wx'+i;this.spawn(id,{...w,t:'fx',env:true});this.fxW.push(id)})}
 _prop(s){const D=this.o.data||{},mm=s.m&&(D.models||{})[s.m],TH=this.TH,M=this.M;
  if(mm&&(mm.rig||(mm.parts||[]).some(p=>p.b))){const R=mkRig(TH,mm,M);return{o:R.o,rig:R}}
  if(mm)return{o:mkModel(TH,mm,M)};if(s.inst)return{o:mkInstanced(TH,mkProp(TH,s,M),s.inst)};return{o:s.lod?mkLODProp(TH,s,M):mkProp(TH,s,M)}}
 spawn(id,s){const TH=this.TH,D=this.o.data||{},md=D.models||{};let o,rig=null,up=null,sc=null;s={t:s.k=='light'?'light':'prop',...s};const fx0=this.o.factory&&(s.t=='char'||s.asset)?this.o.factory(id,s):null;
  if(fx0){o=fx0.o;rig=fx0.rig||null}
  else if(s.t=='char'){const A=(D.actors||{})[s.actor||id]||{},mm=A.cm&&md[A.cm];if(mm&&(mm.rig||(mm.parts||[]).some(p=>p.b))){rig=mkRig(TH,mm,this.M);o=rig.o}else if(mm)o=mkModel(TH,mm,this.M);else{rig=mkChar(TH,A.look||{top:A.color},this.M);o=rig.o}}
  else if(s.t=='light')o=mkLight(TH,s);
  else if(s.t=='scroller'){sc=mkScroller(TH,s,this.M);o=sc.o;up=dt=>sc.update(dt)}
  else if(s.t=='fx'){const f=mkParticles(TH,{...s,scale:this.q.fx,toon:s.toon??this.o.toon!==false});o=f.o;up=(dt,c,px)=>f.update(dt,c,px)}
  else{const p=this._prop(s);o=p.o;rig=p.rig||null}
  if(s.t=='char'&&!fx0){const A2=(D.actors||{})[s.actor||id];if(A2&&A2.scale)o.scale.multiplyScalar(A2.scale)}
  o.position.set(...(s.pos||[0,0,0]));o.rotation.set(...rotOf(s.rot));if(Array.isArray(s.scale))o.scale.set(...s.scale);else if(s.scale)o.scale.multiplyScalar(s.scale);
  if(s.hidden)o.visible=false;o.userData.id=id;(s.outside?this._H():this.S).add(o);const e={o,rig,up,sc,spec:s,type:s.t};this.E.set(id,e);
  for(const n in s.anchors||{}){const a=new TH.Object3D();a.position.set(...s.anchors[n]);a.userData.id=id+'.'+n;o.add(a);this.E.set(id+'.'+n,{o:a,anchor:true,spec:{},type:'anchor'})}
  if(s.anim&&rig)rig.set(s.anim);[].concat(s.motion||[]).forEach(m=>this.addAnim(id,m));return e}
 remove(id){const e=this.E.get(id);if(!e)return;for(const[k,x]of this.E)if(!x.anchor&&x.o.parent===e.o)this.S.attach(x.o);
  for(const k of[...this.E.keys()])if(k.startsWith(id+'.'))this.E.delete(k);e.o.parent&&e.o.parent.remove(e.o);free(e.o);this.E.delete(id);this.tw=this.tw.filter(x=>!x.k.endsWith(':'+id));this.an=this.an.filter(x=>!x.k.startsWith(id+':'))}
 // تحميل مشهد. sc.continue:true أو ['id',..] ⇒ تبقى هذه الكيانات بحالتها الحالية (موضع/ربط/حركة) بدل العودة للوضع الأول. e.persist:true ⇒ لا تُحذف أبدًا.
 loadScene(sc){sc=sc||{};const want=new Map(),cn=sc.continue===true?true:Array.isArray(sc.continue)?new Set(sc.continue):null;
  (sc.props||[]).forEach((p,i)=>want.set(p.id||'p'+i,p));for(const k in sc.cast||{})want.set(k,{...sc.cast[k],t:'char',actor:k});
  for(const[id,e]of[...this.E])if(!e.anchor&&!e.spec.env&&!want.has(id)&&!e.spec.persist)this.remove(id);
  if(sc.env||!cn)this.setEnv(sc.env||{});
  const fresh=[];for(const[id,s]of want){const old=this.E.get(id),keep=old&&!s.reset&&(old.spec.persist||cn===true||(cn&&cn.has(id)));if(keep)continue;if(old)this.remove(id);this.spawn(id,s);fresh.push(id)}
  fresh.forEach(id=>{const s=want.get(id);if(s.parent)this.attach(id,s.parent,{pos:s.pos||[0,0,0],rot:s.rot,keep:false})});
  this.cams=sc.cams||{};const tl=this._conv(sc.timeline);
  if(sc.cam)this.rig.set(sc.cam);else if(!cn||sc.cams){const k0=((sc.timeline||[]).find(e=>e.cam&&!(e.t>0))||{}).cam||Object.keys(this.cams)[0],c=this._cs(k0,0)||{pos:[0,1.5,4.5],look:[0,1.2,0],fov:40};this.rig.set(c);this.rig.fov=c.fov||40}
  this.audio.stopAll(true);if(!this.mute)(sc.audio||[]).forEach(a=>this.sound(a));this.dir.load(tl);this.dir.notify('scene','start')}
 _cs(n,b){const c=(this.cams||{})[n];if(!c)return null;const{target,...r}=c;return{...r,look:c.follow?c.look:(c.look||target),fov:+c.fov||40,blend:+b||0}}
 // يحوّل الصيغة القديمة {t,cam,actor,anim,move} إلى أحداث المخرج
 _conv(tl){return(tl||[]).map(e=>{if(e.do||e.on||e.after||e.at!=null||!(e.cam||e.actor))return e;const d=[];if(e.cam){const c=this._cs(e.cam,e.blend);c&&d.push({a:'cam',...c})}
  if(e.actor){if(e.anim)d.push({a:'anim',id:e.actor,n:e.anim});if(Array.isArray(e.move))d.push({a:'move',id:e.actor,to:e.move,dur:+e.dur||1.5,face:true,anim:'walk',end:'idle'})}return{...(e.id?{id:e.id}:{}),at:+e.t||0,do:d}})}
 clear(){for(const id of[...this.E.keys()])if(this.E.has(id)&&!id.includes('.'))this.remove(id);this.tw=[];this.an=[];this.audio.stopAll();this.dir.load([]);if(this.env){this.env.objs.forEach(o=>{this.S.remove(o);free(o)});this.env=null}}
 // ربط: الابن يتحرك مع الأب. keep (افتراضي) يحفظ مكانه العالمي؛ مع pos/rot يصبح الإزاحة المحلية. to='car.seat' (مرساة) مقبول
 attach(c,p,o){o=o||{};const C=this.get(c),P=p?this.get(p):this.S;if(!C||!P)return;for(let q=P;q;q=q.parent)if(q===C)return;
  if(o.keep!==false&&!o.pos&&!o.rot)P.attach(C);else{P.add(C);C.position.set(...(o.pos||[0,0,0]));C.rotation.set(...rotOf(o.rot))}
  const e=this.E.get(c);if(e&&e.rig&&o.anim)e.rig.set(o.anim)}
 detach(c){const C=this.get(c);C&&this.S.attach(C)}
 // حركة: {to|path, mode:'abs'|'rel', dur | speed, ease:'linear|in|out|inout', loop:'repeat|pingpong', face:true, rot:درجات, anim:'walk', end:'idle'}
 _tw(k,f,done){this.tw=this.tw.filter(x=>x.k!=k);this.tw.push({k,f,done})}
 move(id,s){const o=this.get(id);if(!o)return;const TH=this.TH,V=a=>new TH.Vector3(...a),rel=s.mode=='rel',p0=o.position.clone(),tg=a=>rel?p0.clone().add(V(a)):V(a),pts=[p0,...(s.path?s.path.map(tg):[tg(s.to||[0,0,0])])],
  cur=pts.length>2?new TH.CatmullRomCurve3(pts,false,'catmullrom',.3):new TH.LineCurve3(pts[0],pts[1]),len=cur.getLength()||1e-3,dur=s.dur||(s.speed?len/s.speed:1),ez=EASE[s.ease||(s.speed?'linear':'inout')]||EASE.linear,
  r0=[o.rotation.x,o.rotation.y,o.rotation.z],rt=s.rot==null?null:Array.isArray(s.rot)?s.rot.map((x,i)=>x*D2R+(rel?r0[i]:0)):[r0[0],s.rot*D2R+(rel?r0[1]:0),r0[2]],tmp=new TH.Vector3(),e0=this.E.get(id);let t=0,dn=1;
  if(s.anim&&e0&&e0.rig)e0.rig.set(s.anim);
  this._tw('move:'+id,dt=>{t+=dt*dn;let u=t/dur;if(s.loop=='pingpong'){if(u>=1){u=1;dn=-1}else if(u<=0&&dn<0){u=0;dn=1}}else if(s.loop=='repeat'&&u>=1){t-=dur;u-=1}
   const k=Math.min(1,Math.max(0,u)),e=ez(k);cur.getPointAt(Math.min(1,e),o.position);
   if(s.face){cur.getTangentAt(Math.min(.999,Math.max(.001,e)),tmp);if(tmp.lengthSq()>0)o.rotation.y=Math.atan2(tmp.x,tmp.z)+(dn<0?Math.PI:0)}
   if(rt)o.rotation.set(r0[0]+(rt[0]-r0[0])*e,r0[1]+(rt[1]-r0[1])*e,r0[2]+(rt[2]-r0[2])*e);return!s.loop&&t>=dur},
   ()=>{const e=this.E.get(id);if(e&&e.rig){if(s.end)e.rig.set(s.end);else if(s.anim=='walk')e.rig.set('idle')}this.dir.notify('moved',id)})}
 // حركة مستمرة للمجسمات: {type:'spin|bob|sway|flicker', axis, speed(°/ث), amp, freq, off:true}
 addAnim(id,m){const o=this.get(id);if(!o)return;this.an=this.an.filter(x=>x.k!=id+':'+m.type);if(m.off)return;const ax=m.axis||'y',b=o.position.y,r0=o.rotation[ax],L=o.userData.light,i0=L&&L.intensity,t0=Math.random()*6;
  const f=m.type=='spin'?dt=>{o.rotation[ax]+=(m.speed||90)*D2R*dt}:m.type=='bob'?(dt,t)=>{o.position.y=b+Math.sin(t*(m.freq||1)*6.283)*(m.amp||.2)}:m.type=='sway'?(dt,t)=>{o.rotation[ax]=r0+Math.sin(t*(m.freq||.5)*6.283)*(m.amp||5)*D2R}:m.type=='flicker'&&L?(dt,t)=>{L.intensity=i0*(1+(Math.sin(t*23+t0)*.5+Math.sin(t*37)*.5)*(m.amp||.2))}:null;f&&this.an.push({k:id+':'+m.type,f})}
 play(id,n){const e=this.E.get(id);e&&e.rig&&e.rig.set(n)}
 _res(t){return typeof t=='string'?this.get(t):t}
 ik(id,limb,target,o){const e=this.E.get(id);if(!e||!e.rig||!e.rig.ik)return;if(target==null||target===false)delete e.rig.ik[limb];else e.rig.ik[limb]={t:this._res(target),pole:(o||{}).pole,w:(o||{}).w??1}}
 look(id,t){const e=this.E.get(id);if(e&&e.rig)e.rig.look=t==null?null:this._res(t)}
 speak(id,on,dur){const e=this.E.get(id);if(!e||!e.rig||!e.rig.speak)return;e.rig.speak(on);if(on&&dur)this.dir.later(dur,()=>e.rig.speak(false))}
 set(id,a){const o=this.get(id);if(!o)return;if(a.pos)o.position.set(...a.pos);if(a.rot!=null)o.rotation.set(...rotOf(a.rot));if(a.scale!=null)Array.isArray(a.scale)?o.scale.set(...a.scale):o.scale.setScalar(a.scale)}
 show(id,v){const o=this.get(id);if(o)o.visible=v}
 light(id,a){const o=this.get(id),L=o&&o.userData.light;if(!L)return;const d=a.dur||0,TH=this.TH;
  if(a.i!=null)d?(()=>{const f=L.intensity;let t=0;this._tw('li:'+id,dt=>{t+=dt;L.intensity=f+(a.i-f)*Math.min(1,t/d);return t>=d})})():L.intensity=a.i;
  if(a.c)d?(()=>{const f=L.color.clone(),to=new TH.Color(a.c);let t=0;this._tw('lc:'+id,dt=>{t+=dt;L.color.lerpColors(f,to,Math.min(1,t/d));return t>=d})})():L.color.set(a.c)}
 scroll(id,sp,dur){const e=this.E.get(id);if(!e||!e.sc)return;if(!dur){e.sc.speed=sp;return}const f=e.sc.speed;let t=0;this._tw('sc:'+id,dt=>{t+=dt;e.sc.speed=f+(sp-f)*Math.min(1,t/dur);return t>=dur})}
 fx(id,a){const o=this.get(id);if(o)o.visible=a.on!==false}
 sound(a){if(this.mute)return;this.audio.play(a.id||a.synth||a.url,{...a,at:a.at?this._res(a.at):null})}
 snapshot(){const a={};for(const[id,e]of this.E){if(e.anchor||e.spec.env)continue;const o=e.o;a[id]={spec:e.spec,p:o.position.toArray(),r:[o.rotation.x,o.rotation.y,o.rotation.z],s:o.scale.toArray(),par:o.parent&&o.parent.userData.id||null,anim:e.rig?e.rig.get():null,vis:o.visible,sp:e.sc?e.sc.speed:null}}return{t:this.t,e:a,env:this.envSpec}}
 restore(sn){for(const[id,e]of[...this.E])if(!e.anchor&&!e.spec.env&&!sn.e[id])this.remove(id);if(sn.env)this.setEnv(sn.env);
  for(const id in sn.e){const d=sn.e[id];let e=this.E.get(id)||this.spawn(id,d.spec),o=e.o;o.position.fromArray(d.p);o.rotation.set(...d.r);o.scale.fromArray(d.s);o.visible=d.vis;if(d.anim&&e.rig)e.rig.set(d.anim);if(d.sp!=null&&e.sc)e.sc.speed=d.sp}
  for(const id in sn.e){const d=sn.e[id],o=this.get(id),P=d.par?this.get(d.par):this.S;P&&o.parent!==P&&P.add(o)}}
 // معاينة: اذهب لزمن t في المشهد (يعيد تحميله ويقدّمه بخطوات 1/30)
 seek(sc,t,base){this.mute=true;if(base)this.restore(base);this.loadScene(sc);const n=Math.round(t*30);for(let i=0;i<n;i++)this.update(1/30);this.mute=false}
 update(dt){dt=Math.min(dt,.1)*(this.timeScale??1);this._dt=dt;this.t+=dt;this.dir.update(dt);
  for(let i=this.tw.length-1;i>=0;i--){const w=this.tw[i];if(w.f(dt)){this.tw.splice(i,1);w.done&&w.done()}}
  this.an.forEach(a=>a.f(dt,this.t));this.S.updateMatrixWorld(true);const px=this.px();
  for(const e of this.E.values()){if(e.rig)e.rig.tick(this.t);if(e.up)e.up(dt,this.cam.position,px)}
  this.rig.update(dt);this.cam.updateMatrixWorld();this.env&&this.env.update(this.cam,this.t);this.audio.update(this.cam)}
 render(){const d=this.rig.dofs;if(d&&d.on!==false&&(this.q.dof||d.force)){this.dof=this.dof||new DOF(this.TH,this.r);let f=d.focus;if(typeof f=='string'){const o=this.get(f);f=o?o.getWorldPosition(new this.TH.Vector3()).distanceTo(this.cam.position):8}this.dof.render(this.S,this.cam,{focus:f||8,range:d.range||6,blur:d.blur||1})}else this.r.render(this.S,this.cam)}
 dispose(){free(this.S);this.audio.stopAll();this.dof&&this.dof.dispose()}}

// ---------- (23) واجهة الخط الزمني المرئي للمحرر ----------
// h = دالة بناء العناصر نفسها في المحرر. يرجع عنصرًا فيه: تشغيل/إيقاف، شريط تمرير، أحداث قابلة للسحب، أزرار إطلاق الأحداث المرتبطة بالنص، وتحرير JSON للحدث المحدد.
export function timelineUI(h,w,sc,o){o=o||{};const tl=sc.timeline=sc.timeline||[],dur=()=>Math.max(5,sc.dur||0,...tl.map(e=>(e.at||0)+1));let raf,base=o.base||null;
 const lab=h('span',{class:'mu'},'0.0s'),ta=h('textarea',{style:'width:100%;height:90px;direction:ltr;display:none'}),trg=h('div',{class:'row'}),
 lane=h('div',{style:'position:relative;height:56px;background:rgba(0,0,0,.25);border-radius:8px;margin:6px 0;touch-action:none'}),
 sl=h('input',{type:'range',min:0,max:5,step:.1,value:0,style:'width:100%',oninput:e=>{w.paused=true;w.seek(sc,+e.target.value,base);lab.textContent=(+e.target.value).toFixed(1)+'s';pb.textContent='▶'}}),
 pb=h('button',{class:'g s',onclick:()=>{w.paused=!w.paused;pb.textContent=w.paused?'▶':'⏸'}},'⏸');
 let sel=-1;const apply=h('button',{class:'g s',style:'display:none',onclick:()=>{try{tl[sel]=JSON.parse(ta.value);o.onEdit&&o.onEdit();draw()}catch(e){ta.style.outline='2px solid #e55'}}},'تطبيق');
 const show=i=>{sel=i;ta.style.display=apply.style.display='';ta.style.outline='';ta.value=JSON.stringify(tl[i],null,1)};
 function draw(){const D=dur();sl.max=D;lane.replaceChildren();trg.replaceChildren();
  tl.forEach((e,i)=>{const act=[].concat(e.do||[])[0]||{};
   if(e.on||e.after){trg.append(h('button',{class:'g s',onclick:()=>{show(i);if(e.on&&e.on!='scene'){const[a,b]=e.on.split(':'),[id,v]=(b||'').split('=');w.dir.notify(a,id,v)}}},(e.on?'⚡ '+e.on:'↳ بعد '+e.after)+' · '+(act.a||'')));return}
   const c=h('div',{style:'position:absolute;top:6px;height:44px;min-width:14px;padding:2px 4px;border-radius:6px;background:#ffd24a;color:#000;font-size:11px;overflow:hidden;white-space:nowrap;cursor:grab;left:'+((e.at||0)/D*100)+'%',title:JSON.stringify(e)},(act.a||'•')+(act.id?' '+act.id:''));
   c.onpointerdown=ev=>{c.setPointerCapture(ev.pointerId);show(i);c.onpointermove=x=>{const r=lane.getBoundingClientRect();e.at=Math.max(0,Math.round((x.clientX-r.left)/r.width*D*10)/10);c.style.left=(e.at/D*100)+'%'};c.onpointerup=()=>{c.onpointermove=c.onpointerup=null;o.onEdit&&o.onEdit();draw()}};lane.append(c)})}
 draw();const tick=()=>{if(!w.paused){sl.value=Math.min(w.dir.t,+sl.max);lab.textContent=w.dir.t.toFixed(1)+'s'}raf=requestAnimationFrame(tick)};tick();
 const el=h('div',{},h('div',{class:'row'},pb,sl,lab),lane,trg,ta,apply);el.stop=()=>cancelAnimationFrame(raf);el.redraw=draw;return el}

export function mkChar(TH,l,M){return(l&&l.v===1)?mkChar0(TH,l,M):mkHuman(TH,l||{},M)}

// ======================= mesh.js — شبكة مضلّعات حرّة (Poly mesh) =======================
// نفس الكود يعمل داخل المحرر وفي اللاعب: p={s:'mesh',mesh:{v,f,fm,vc,cr,ff},mods:{mx,my,mz,sub,solid,sa,arr},mats:[...]}
// الوجوه تُخزَّن كمصفوفات فهارس (رباعيات/مثلثات/مضلّعات)، الاتجاه عكس عقارب الساعة = الوجه الأمامي.
const EK=4194304,ek=(a,b)=>a<b?a*EK+b:b*EK+a,dk=k=>[Math.floor(k/EK),k%EK];
export const MESH_EK=ek,MESH_DK=dk;
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul3=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 crs3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len3=a=>Math.hypot(a[0],a[1],a[2]),nrm3=a=>{const l=len3(a)||1;return[a[0]/l,a[1]/l,a[2]/l]},lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export class PMesh{
 constructor(v,f,fm,vc){this.v=v||[];this.f=f||[];this.fm=fm||this.f.map(()=>0);this.vc=vc||null;this.cr=new Map();this.ff=new Set();this.uv=null;this.uvSig=0;this.sm=new Set()}
 get nv(){return this.v.length/3}
 pos(i){return[this.v[3*i],this.v[3*i+1],this.v[3*i+2]]}
 setPos(i,p){this.v[3*i]=p[0];this.v[3*i+1]=p[1];this.v[3*i+2]=p[2]}
 addV(p,c){this.v.push(p[0],p[1],p[2]);if(this.vc)this.vc.push(...(c||[1,1,1]));return this.nv-1}
 col(i){return this.vc?[this.vc[3*i],this.vc[3*i+1],this.vc[3*i+2]]:[1,1,1]}
 addF(f,mat){this.f.push(f);this.fm.push(mat||0);return this.f.length-1}
 clone(){const m=new PMesh(this.v.slice(),this.f.map(x=>x.slice()),this.fm.slice(),this.vc&&this.vc.slice());m.cr=new Map(this.cr);m.ff=new Set(this.ff);m.sm=new Set(this.sm);if(this.uv){m.uv=this.uv.map(x=>x.slice());m.uvSig=this.uvSig}return m}
 enableColors(c){if(!this.vc){this.vc=[];for(let i=0;i<this.nv;i++)this.vc.push(...(c||[1,1,1]))}}
 toJSON(){const r=x=>Math.round(x*1e4)/1e4,o={v:this.v.map(r),f:this.f.map(x=>x.slice())};if(this.fm.some(x=>x))o.fm=this.fm.slice();
  if(this.vc){let s='';for(let i=0;i<this.vc.length;i++)s+=Math.max(0,Math.min(255,Math.round(this.vc[i]*255))).toString(16).padStart(2,'0');o.vc=s}
  if(this.cr.size)o.cr=[...this.cr].map(([k,s])=>[...dk(k),s]);if(this.ff.size)o.ff=[...this.ff];if(this.sm.size)o.sm=[...this.sm].map(k=>dk(k));if(uvOK(this)){o.uv=this.uv.map(f=>f.map(x=>Math.round(x*1e4)/1e4));o.us=this.uvSig}return o}
 static fromJSON(d){d=d||{};const m=new PMesh((d.v||[]).slice(),(d.f||[]).map(x=>x.slice()),d.fm?d.fm.slice():null);if(d.vc){m.vc=[];for(let i=0;i<d.vc.length;i+=2)m.vc.push(parseInt(d.vc.substr(i,2),16)/255)}
  (d.cr||[]).forEach(([a,b,s])=>m.cr.set(ek(a,b),s));(d.ff||[]).forEach(i=>m.ff.add(i));(d.sm||[]).forEach(([a,b])=>m.sm.add(ek(a,b)));if(d.uv){m.uv=d.uv.map(x=>x.slice());m.uvSig=d.us||0}return m}}
export const uvSigOf=m=>{let h=7;for(const f of m.f){h=(h*31+f.length)|0;for(const v of f)h=(h*31+v)|0}return h};
export const uvOK=m=>!!(m.uv&&m.uv.length==m.f.length&&m.uvSig==uvSigOf(m)&&m.uv.every((u,i)=>u.length==2*m.f[i].length));
// ---------- هندسة أساسية ----------
export function faceN(m,f){let nx=0,ny=0,nz=0;const n=f.length,v=m.v;for(let i=0;i<n;i++){const a=f[i]*3,b=f[(i+1)%n]*3;nx+=(v[a+1]-v[b+1])*(v[a+2]+v[b+2]);ny+=(v[a+2]-v[b+2])*(v[a]+v[b]);nz+=(v[a]-v[b])*(v[a+1]+v[b+1])}return[nx,ny,nz]}
export const faceNormal=(m,f)=>nrm3(faceN(m,f));
export const faceArea=(m,f)=>len3(faceN(m,f))/2;
export function faceCenter(m,f){let x=0,y=0,z=0;for(const i of f){x+=m.v[3*i];y+=m.v[3*i+1];z+=m.v[3*i+2]}const n=f.length;return[x/n,y/n,z/n]}
export function topo(m){const E=new Map();m.f.forEach((f,fi)=>{for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length],k=ek(a,b);let e=E.get(k);if(!e)E.set(k,e={a:Math.min(a,b),b:Math.max(a,b),fs:[]});e.fs.push(fi)}});return E}
export function vertFaces(m){const V=Array.from({length:m.nv},()=>[]);m.f.forEach((f,fi)=>f.forEach(i=>V[i].push(fi)));return V}
export function vertNeighbors(m){const N=Array.from({length:m.nv},()=>new Set());m.f.forEach(f=>{for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];N[a].add(b);N[b].add(a)}});return N}
export function bbox(m){let a=[1e9,1e9,1e9],b=[-1e9,-1e9,-1e9];for(let i=0;i<m.nv;i++)for(let k=0;k<3;k++){a[k]=Math.min(a[k],m.v[3*i+k]);b[k]=Math.max(b[k],m.v[3*i+k])}return m.nv?{min:a,max:b}:{min:[0,0,0],max:[0,0,0]}}
// حذف الرؤوس غير المستعملة وإعادة الترقيم
export function compact(m){const used=new Uint8Array(m.nv);m.f.forEach(f=>f.forEach(i=>used[i]=1));const map=new Int32Array(m.nv).fill(-1);let n=0;const v=[],vc=m.vc?[]:null;
 for(let i=0;i<m.nv;i++)if(used[i]){map[i]=n++;v.push(m.v[3*i],m.v[3*i+1],m.v[3*i+2]);if(vc)vc.push(m.vc[3*i],m.vc[3*i+1],m.vc[3*i+2])}
 m.v=v;m.vc=vc;m.f=m.f.map(f=>f.map(i=>map[i]));const cr=new Map();m.cr.forEach((s,k)=>{const[a,b]=dk(k);if(map[a]>=0&&map[b]>=0)cr.set(ek(map[a],map[b]),s)});m.cr=cr;return map}
// إزالة التكرار المتتالي والوجوه المنحلّة
export function cleanFaces(m){const nf=[],nm=[],ff=new Set(),old=m.ff;m.f.forEach((f,fi)=>{const g=[];for(let i=0;i<f.length;i++)if(f[i]!==f[(i+1)%f.length])g.push(f[i]);else if(f.length===2){}
 while(g.length>2&&g[0]===g[g.length-1])g.pop();if(g.length>=3&&new Set(g).size>=3){if(old.has(fi))ff.add(nf.length);nf.push(g);nm.push(m.fm[fi])}});m.f=nf;m.fm=nm;m.ff=ff}
// ---------- مجسّمات أولية ----------
function grid(m,nx,nz,fx,fz,y){const id=[];for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)id.push(m.addV([fx(i/nx),y??0,fz(j/nz)]));return id}
export function prim(type,o){o=o||{};const m=new PMesh(),s=o.size??1;const F=(...a)=>m.addF(a);
 if(type=='cube'){const h=s/2;[[-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h],[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h]].forEach(p=>m.addV(p));
  F(4,5,6,7);F(1,0,3,2);F(7,6,2,3);F(0,1,5,4);F(5,1,2,6);F(0,4,7,3)}
 else if(type=='plane'||type=='grid'){const nx=o.nx||1,nz=o.nz||1,w=(o.w??s),d=(o.d??s);const id=grid(m,nx,nz,t=>(t-.5)*w,t=>(t-.5)*d);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=id[j*(nx+1)+i],b=a+1,c=b+nx+1,e=a+nx+1;F(a,e,c,b)}}
 else if(type=='circle'){const n=o.n||16,r=(o.r??s/2);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;m.addV([Math.cos(a)*r,0,-Math.sin(a)*r])}
  if(o.fill=='fan'){const c=m.addV([0,0,0]);for(let i=0;i<n;i++)F(c,i,(i+1)%n)}else if(o.fill!='none')m.addF([...Array(n).keys()].reverse())}
 else if(type=='cylinder'||type=='cone'){const n=o.n||16,r=(o.r??s/2),h=o.h??s,hs=o.hs||1,r2=type=='cone'?(o.r2??0):(o.r2??r),rows=hs+1;const tip=type=='cone'&&r2===0;
  for(let j=0;j<rows;j++){if(tip&&j==rows-1)break;const t=j/hs,rr=r+(r2-r)*t,y=-h/2+h*t;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;m.addV([Math.cos(a)*rr,y,-Math.sin(a)*rr])}}
  const R=tip?rows-1:rows;for(let j=0;j<R-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=(j+1)*n+(i+1)%n,d=(j+1)*n+i;F(a,b,c,d)}
  if(tip){const t=m.addV([0,h/2,0]);for(let i=0;i<n;i++)F((R-1)*n+i,(R-1)*n+(i+1)%n,t);if(o.caps!=='none')m.addF([...Array(n).keys()])}
  else if(o.caps!=='none'){const top=[],bot=[];for(let i=0;i<n;i++){top.push((R-1)*n+i);bot.push(i)}
   if(o.caps=='fan'){const c1=m.addV([0,h/2,0]),c0=m.addV([0,-h/2,0]);for(let i=0;i<n;i++){F(top[i],top[(i+1)%n],c1);F(bot[(i+1)%n],bot[i],c0)}}else{m.addF(top.slice().reverse());m.addF(bot)}}
  // الأضلاع الجانبية: الترتيب (a,b,c,d) يُعدَّل لاحقًا بـ orient
 }
 else if(type=='sphere'){const seg=o.seg||16,ring=o.ring||10,r=(o.r??s/2);const top=m.addV([0,r,0]);const rows=[];for(let j=1;j<ring;j++){const p=j/ring*Math.PI,row=[];for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2;row.push(m.addV([Math.cos(a)*Math.sin(p)*r,Math.cos(p)*r,-Math.sin(a)*Math.sin(p)*r]))}rows.push(row)}const bot=m.addV([0,-r,0]);
  for(let i=0;i<seg;i++)F(top,rows[0][(i+1)%seg],rows[0][i]);for(let j=0;j<rows.length-1;j++)for(let i=0;i<seg;i++)F(rows[j][i],rows[j][(i+1)%seg],rows[j+1][(i+1)%seg],rows[j+1][i]);const L=rows[rows.length-1];for(let i=0;i<seg;i++)F(L[i],L[(i+1)%seg],bot)}
 else if(type=='cubesphere'){const n=o.n||4,r=(o.r??s/2);const c=prim('grid',{nx:n,nz:n,w:2,d:2});// ستة وجوه شبكية ثم إسقاط على الكرة
  const faces=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,1,0],[0,0,-1]],[[0,1,0],[0,0,-1],[1,0,0]],[[0,-1,0],[0,0,1],[1,0,0]],[[0,0,1],[0,1,0],[-1,0,0]],[[0,0,-1],[0,1,0],[1,0,0]]];
  const key=p=>p.map(x=>Math.round(x*1e4)).join(','),mp=new Map();const vid=p=>{const k=key(p);if(!mp.has(k))mp.set(k,m.addV(p));return mp.get(k)};
  faces.forEach(([nrm,u,w])=>{const g=[];for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const a=i/n*2-1,b=j/n*2-1;let p=[nrm[0]+u[0]*a+w[0]*b,nrm[1]+u[1]*a+w[1]*b,nrm[2]+u[2]*a+w[2]*b];const l=len3(p);g.push(vid(mul3(p,r/l)))}
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=g[j*(n+1)+i],b=g[j*(n+1)+i+1],cc=g[(j+1)*(n+1)+i+1],d=g[(j+1)*(n+1)+i];m.addF([a,b,cc,d])}})}
 else if(type=='torus'){const seg=o.seg||20,rg=o.ring||10,R=o.R??s/2,r=o.r??s/6;for(let j=0;j<rg;j++){const b=j/rg*Math.PI*2;for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,rr=R+Math.cos(b)*r;m.addV([Math.cos(a)*rr,Math.sin(b)*r,-Math.sin(a)*rr])}}
  for(let j=0;j<rg;j++)for(let i=0;i<seg;i++){const a=j*seg+i,b=j*seg+(i+1)%seg,c=((j+1)%rg)*seg+(i+1)%seg,d=((j+1)%rg)*seg+i;F(a,b,c,d)}}
 else if(type=='ico'){const t=(1+Math.sqrt(5))/2,r=(o.r??s/2),vs=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];vs.forEach(p=>m.addV(mul3(nrm3(p),r)));
  [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]].forEach(f=>F(...f))}
 if(['cylinder','cone','sphere','cube','torus','ico','cubesphere'].includes(type))orientOutward(m);
 return m}

// شبكة نظيفة (رباعيات) تطابق أبعاد الأجزاء الجاهزة: تُستعمل عند التحويل إلى شبكة حرة
export function primFromPart(p){const t=p.s;let m=null;
 if(t=='box')m=prim('cube',{size:1});
 else if(t=='sphere'||!t)m=prim('cubesphere',{n:6,r:.5});
 else if(t=='cyl')m=prim('cylinder',{n:24,r:.5,h:1,hs:2});
 else if(t=='cone')m=prim('cone',{n:24,r:.5,h:1,hs:2});
 else if(t=='torus')m=prim('torus',{seg:24,ring:12,R:.35,r:.15});
 else if(t=='plane')m=prim('plane',{nx:4,nz:4,w:1,d:1});
 else if(t=='cap'){m=prim('sphere',{seg:20,ring:12,r:.3});for(let i=0;i<m.nv;i++){const y=m.v[3*i+1];if(y>1e-6)m.v[3*i+1]+=.2;else if(y<-1e-6)m.v[3*i+1]-=.2}}
 else if(t=='lathe'){const pts=(p.pts||[[.02,-.5],[.35,-.5],[.45,-.1],[.25,.2],[.15,.5]]),N=24;m=new PMesh();const rg=pts.map(([r,y])=>{const a=[];for(let i=0;i<N;i++){const q=i/N*Math.PI*2;a.push(m.addV([Math.cos(q)*r,y,-Math.sin(q)*r]))}return a});
  for(let k=0;k<rg.length-1;k++)for(let i=0;i<N;i++){const j=(i+1)%N;m.addF([rg[k][i],rg[k][j],rg[k+1][j],rg[k+1][i]])}
  m.addF(rg[0].slice().reverse());m.addF(rg[rg.length-1].slice());orientOutward(m)}
 if(m&&p.v&&p.v.length)return null;return m}
// ---------- اتّساق الاتجاه وتوجيه الوجوه للخارج ----------
export function orientConsistent(m){const E=topo(m),vis=new Uint8Array(m.f.length),flipped=new Uint8Array(m.f.length);
 const adj=m.f.map(()=>[]);E.forEach(e=>{if(e.fs.length==2){adj[e.fs[0]].push(e.fs[1]);adj[e.fs[1]].push(e.fs[0])}});
 const dir=(f,a,b)=>{for(let i=0;i<f.length;i++)if(f[i]==a&&f[(i+1)%f.length]==b)return 1;return 0};
 const comps=[];for(let s=0;s<m.f.length;s++){if(vis[s])continue;const comp=[s];vis[s]=1;for(let q=0;q<comp.length;q++){const fi=comp[q],f=m.f[fi];for(const gi of adj[fi]){if(vis[gi])continue;const g=m.f[gi];let shared=null;for(let i=0;i<f.length&&!shared;i++){const a=f[i],b=f[(i+1)%f.length];if(g.includes(a)&&g.includes(b)&&(dir(g,a,b)||dir(g,b,a)))shared=[a,b]}
   if(shared){const d1=dir(f,shared[0],shared[1])?1:0,fl1=flipped[fi],d2=dir(g,shared[0],shared[1])?1:0;// بعد قلب f تنعكس جهتها
    const eff1=fl1?1-d1:d1;if(eff1===d2)flipped[gi]=1}vis[gi]=1;comp.push(gi)}}comps.push(comp)}
 comps.forEach(c=>{c.forEach(fi=>{if(flipped[fi])m.f[fi].reverse()})});return comps}
export function orientOutward(m){const comps=orientConsistent(m);comps.forEach(c=>{let vol=0;c.forEach(fi=>{const f=m.f[fi];const p0=m.pos(f[0]);for(let i=1;i<f.length-1;i++){vol+=dot3(p0,crs3(m.pos(f[i]),m.pos(f[i+1])))/6}});if(vol<0)c.forEach(fi=>m.f[fi].reverse())});
 const fixc=new Set(m.ff);return m}
// ---------- تثليث (للعرض) ----------
export function triangulate(m,f){const n=f.length;if(n===3)return[[f[0],f[1],f[2]]];if(n===4){const a=m.pos(f[0]),b=m.pos(f[1]),c=m.pos(f[2]),d=m.pos(f[3]);// اختر القطر الأقصر/الأكثر تسطّحًا
  return len3(sub3(a,c))<=len3(sub3(b,d))?[[f[0],f[1],f[2]],[f[0],f[2],f[3]]]:[[f[0],f[1],f[3]],[f[1],f[2],f[3]]]}
 const N=faceN(m,f),ax=Math.abs(N[0])>Math.abs(N[1])&&Math.abs(N[0])>Math.abs(N[2])?0:Math.abs(N[1])>Math.abs(N[2])?1:2,u=(ax+1)%3,w=(ax+2)%3,sg=N[ax]<0?-1:1;
 const P=f.map(i=>[m.v[3*i+u]*sg,m.v[3*i+w]]);const idx=f.map((_,i)=>i),out=[];let guard=0;const cr=(a,b,c)=>(P[b][0]-P[a][0])*(P[c][1]-P[a][1])-(P[b][1]-P[a][1])*(P[c][0]-P[a][0]);
 while(idx.length>3&&guard++<500){let ear=-1;for(let k=0;k<idx.length;k++){const a=idx[(k+idx.length-1)%idx.length],b=idx[k],c=idx[(k+1)%idx.length];if(cr(a,b,c)<=1e-12)continue;let ok=true;for(const q of idx){if(q==a||q==b||q==c)continue;const d1=cr(a,b,q),d2=cr(b,c,q),d3=cr(c,a,q);if(d1>=0&&d2>=0&&d3>=0){ok=false;break}}if(ok){ear=k;break}}
  if(ear<0)ear=0;const a=idx[(ear+idx.length-1)%idx.length],b=idx[ear],c=idx[(ear+1)%idx.length];out.push([f[a],f[b],f[c]]);idx.splice(ear,1)}
 if(idx.length==3)out.push([f[idx[0]],f[idx[1]],f[idx[2]]]);return out}
// ---------- تقسيم السطح Catmull-Clark (مع تجعيد crease) ----------
export function subsurfOnce(m){const E=topo(m),nv=m.nv,hasC=!!m.vc;const out=new PMesh([],[],[],hasC?[]:null);
 for(let i=0;i<nv;i++)out.addV(m.pos(i),m.col(i));
 const fp=m.f.map((f,fi)=>out.addV(faceCenter(m,f),(()=>{if(!hasC)return;let r=0,g=0,b=0;f.forEach(i=>{r+=m.vc[3*i];g+=m.vc[3*i+1];b+=m.vc[3*i+2]});return[r/f.length,g/f.length,b/f.length]})()));
 const ep=new Map(),epos=new Map();E.forEach((e,k)=>{const A=m.pos(e.a),B=m.pos(e.b),sharp=m.cr.get(k)||0;let p;
  if(e.fs.length==2&&sharp<=0){const c1=out.pos(fp[e.fs[0]]),c2=out.pos(fp[e.fs[1]]);p=[(A[0]+B[0]+c1[0]+c2[0])/4,(A[1]+B[1]+c1[1]+c2[1])/4,(A[2]+B[2]+c1[2]+c2[2])/4]}else p=lerp3(A,B,.5);
  const ca=m.col(e.a),cb=m.col(e.b);ep.set(k,out.addV(p,hasC?lerp3(ca,cb,.5):null))});
 // مواضع الرؤوس القديمة
 const VF=vertFaces(m),VE=Array.from({length:nv},()=>[]);E.forEach((e,k)=>{VE[e.a].push(k);VE[e.b].push(k)});
 for(let v=0;v<nv;v++){const P=m.pos(v),fs=VF[v],es=VE[v];if(!fs.length)continue;const crease=es.filter(k=>{const e=E.get(k);return e.fs.length!=2||(m.cr.get(k)||0)>0});let np;
  if(crease.length>=3)np=P;else if(crease.length==2){const o=crease.map(k=>{const e=E.get(k);return e.a==v?e.b:e.a});const A=m.pos(o[0]),B=m.pos(o[1]);np=[(6*P[0]+A[0]+B[0])/8,(6*P[1]+A[1]+B[1])/8,(6*P[2]+A[2]+B[2])/8]}
  else if(crease.length==1&&false)np=P;else{const n=fs.length;let F=[0,0,0],R=[0,0,0];fs.forEach(fi=>{const c=out.pos(fp[fi]);F=add3(F,c)});F=mul3(F,1/n);es.forEach(k=>{const e=E.get(k),o=m.pos(e.a==v?e.b:e.a);R=add3(R,mul3(add3(P,o),.5))});R=mul3(R,1/es.length);
   if(crease.length==1){np=P}else np=[(F[0]+2*R[0]+(n-3)*P[0])/n,(F[1]+2*R[1]+(n-3)*P[1])/n,(F[2]+2*R[2]+(n-3)*P[2])/n]}
  out.setPos(v,np)}
 const ff=new Set(),hu=uvOK(m),ouv=hu?[]:null;m.f.forEach((f,fi)=>{const n=f.length;let cu=0,cv=0;if(hu){const U=m.uv[fi];for(let i=0;i<n;i++){cu+=U[2*i];cv+=U[2*i+1]}cu/=n;cv/=n}for(let i=0;i<n;i++){const v=f[i],nx=f[(i+1)%n],pv=f[(i+n-1)%n];const idx=out.addF([v,ep.get(ek(v,nx)),fp[fi],ep.get(ek(pv,v))],m.fm[fi]);if(m.ff.has(fi))ff.add(idx);if(hu){const U=m.uv[fi],a=U[2*i],b=U[2*i+1],c=U[2*((i+1)%n)],d=U[2*((i+1)%n)+1],e=U[2*((i+n-1)%n)],g=U[2*((i+n-1)%n)+1];ouv.push([a,b,(a+c)/2,(b+d)/2,cu,cv,(a+e)/2,(b+g)/2])}}});out.ff=ff;if(hu){out.uv=ouv;out.uvSig=uvSigOf(out)}m.sm.forEach(()=>{});
 m.cr.forEach((s,k)=>{if(s<=1)return;const[a,b]=dk(k),e=ep.get(k);out.cr.set(ek(a,e),s-1);out.cr.set(ek(e,b),s-1)});return out}
export function subsurf(m,lv,cap){let r=m;for(let i=0;i<lv;i++){let n=0;r.f.forEach(f=>n+=f.length);if(n>(cap||250000))break;r=subsurfOnce(r)}return r}
// ---------- معدّلات ----------
export function mirrorMesh(m,ax,eps){eps=eps??1e-4;const out=m.clone(),n=m.nv,map=new Int32Array(n);for(let i=0;i<n;i++){if(Math.abs(m.v[3*i+ax])<eps){map[i]=i;out.v[3*i+ax]=0}else{const p=m.pos(i);p[ax]=-p[ax];map[i]=out.addV(p,m.col(i))}}
 const nf=m.f.length,hu=uvOK(m);for(let fi=0;fi<nf;fi++){out.addF(m.f[fi].map(i=>map[i]).reverse(),m.fm[fi]);if(hu){const U=m.uv[fi],r=[];for(let i=U.length/2-1;i>=0;i--)r.push(U[2*i],U[2*i+1]);out.uv.push(r)}if(m.ff.has(fi))out.ff.add(out.f.length-1)}m.cr.forEach((s,k)=>{const[a,b]=dk(k);out.cr.set(ek(map[a],map[b]),s)});if(hu)out.uvSig=uvSigOf(out);else out.uv=null;return out}
export function solidify(m,t){const out=m.clone();out.uv=null;const n=m.nv,N=Array.from({length:n},()=>[0,0,0]);m.f.forEach(f=>{const fn=faceN(m,f);f.forEach(i=>N[i]=add3(N[i],fn))});const map=[];
 for(let i=0;i<n;i++){const nn=nrm3(N[i]);map.push(out.addV(sub3(m.pos(i),mul3(nn,t)),m.col(i)))}
 const nf=m.f.length;for(let fi=0;fi<nf;fi++)out.addF(m.f[fi].map(i=>map[i]).reverse(),m.fm[fi]);
 const E=topo(m);E.forEach(e=>{if(e.fs.length==1){const f=m.f[e.fs[0]];for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];if(ek(a,b)==ek(e.a,e.b)){out.addF([b,a,map[a],map[b]],m.fm[e.fs[0]])}}}});return out}
export function arrayMesh(m,count,off){const out=m.clone();for(let c=1;c<count;c++){const base=out.nv;for(let i=0;i<m.nv;i++)out.addV([m.v[3*i]+off[0]*c,m.v[3*i+1]+off[1]*c,m.v[3*i+2]+off[2]*c],m.col(i));m.f.forEach((f,fi)=>{out.addF(f.map(i=>i+base),m.fm[fi]);if(uvOK(m))out.uv.push(m.uv[fi].slice())})}if(uvOK(m))out.uvSig=uvSigOf(out);else out.uv=null;return out}
export function applyMods(m,md){md=md||{};let r=m;if(md.arr&&md.arr.n>1)r=arrayMesh(r,md.arr.n,md.arr.o||[1,0,0]);if(md.mx)r=mirrorMesh(r,0);if(md.my)r=mirrorMesh(r,1);if(md.mz)r=mirrorMesh(r,2);if(md.solid)r=solidify(r,md.solid);if(md.sub)r=subsurf(r,Math.min(3,md.sub));return r}
// ---------- شبكة العرض (BufferGeometry) ----------
export function meshGeo(TH,m,o){o=o||{};const sa=Math.cos((o.sa??50)*Math.PI/180),nm=o.mats||1;const tris=[],P=m.v;
 const fn=m.f.map(f=>faceN(m,f)),fu=fn.map(nrm3),VF=vertFaces(m);
 const byMat=Array.from({length:Math.max(nm,1+Math.max(0,...m.fm))},()=>[]);m.f.forEach((f,fi)=>{triangulate(m,f).forEach(t=>byMat[m.fm[fi]||0].push([t,fi]))});
 let count=0;byMat.forEach(a=>count+=a.length);const tf=[];byMat.forEach(a=>a.forEach(x=>tf.push(x[1])));const pos=new Float32Array(count*9),nor=new Float32Array(count*9),uv=new Float32Array(count*6),col=m.vc?new Float32Array(count*9):null;let w=0;const groups=[];
 const smoothN=(vi,fi)=>{if(m.ff.has(fi)||sa>=1)return fu[fi];const base=fu[fi];let x=0,y=0,z=0;for(const gj of VF[vi]){const u=fu[gj];if(m.ff.has(gj))continue;if(dot3(u,base)>=sa-1e-6){const a=fn[gj];x+=a[0];y+=a[1];z+=a[2]}}const l=Math.hypot(x,y,z);return l>1e-12?[x/l,y/l,z/l]:base};
 const us=o.uvs||1,HU=uvOK(m);byMat.forEach((arr,mi)=>{const st=w;arr.forEach(([t,fi])=>{const N=fu[fi],ax=Math.abs(N[0])>=Math.abs(N[1])&&Math.abs(N[0])>=Math.abs(N[2])?0:Math.abs(N[1])>=Math.abs(N[2])?1:2;
  for(let k=0;k<3;k++){const vi=t[k],n=smoothN(vi,fi);pos[3*w]=P[3*vi];pos[3*w+1]=P[3*vi+1];pos[3*w+2]=P[3*vi+2];nor[3*w]=n[0];nor[3*w+1]=n[1];nor[3*w+2]=n[2];
   if(HU){const ci=m.f[fi].indexOf(vi),U=m.uv[fi];uv[2*w]=U[2*ci];uv[2*w+1]=U[2*ci+1]}else{const a=ax==0?P[3*vi+2]:P[3*vi],b=ax==1?P[3*vi+2]:P[3*vi+1];uv[2*w]=a*us;uv[2*w+1]=b*us}if(col){col[3*w]=m.vc[3*vi];col[3*w+1]=m.vc[3*vi+1];col[3*w+2]=m.vc[3*vi+2]}w++}});
  if(w>st)groups.push([st,w-st,mi])});
 const g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(pos,3));g.setAttribute('normal',new TH.BufferAttribute(nor,3));g.setAttribute('uv',new TH.BufferAttribute(uv,2));if(col)g.setAttribute('color',new TH.BufferAttribute(col,3));
 groups.forEach(([s,c,mi])=>g.addGroup(s,c,mi));g.userData.tf=tf;g.computeBoundingSphere();g.computeBoundingBox();return g}
// الجزء كاملًا: p={mesh,mods,mats,sa,uvs} → THREE.Mesh بمواد متعددة
export const TEXLIVE=new WeakMap(),TEXC=new WeakMap();
// خامة الجزء: نسخة حيّة من المحرر إن وُجدت، وإلا الصورة النهائية المخزّنة p.tex.final
export function texFor(TH,tex){const lv=TEXLIVE.get(tex);if(lv&&lv.TH===TH)return lv.t;const c=TEXC.get(tex);if(c&&c.TH===TH&&c.src===tex.final)return c.t;if(!tex.final||typeof Image=='undefined')return null;
 const im=new Image(),ph=document.createElement('canvas');ph.width=ph.height=2;const px=ph.getContext('2d');px.fillStyle='#c8c0b4';px.fillRect(0,0,2,2);const t=new TH.Texture(ph);t.colorSpace=TH.SRGBColorSpace;t.anisotropy=4;t.needsUpdate=true;im.onload=()=>{t.image=im;t.needsUpdate=true};im.src=tex.final;TEXC.set(tex,{TH,t,src:tex.final});return t}
export function mkMeshPart(TH,p,M,skin){const base=PMesh.fromJSON(p.mesh),md=p.mods||{},r=applyMods(base,md),mats=p.mats&&p.mats.length?p.mats:[{c:p.c||'#c9a46a'}];
 const g=meshGeo(TH,r,{sa:p.sa??md.sa??50,mats:mats.length,uvs:p.uvs||1}),hv=!!r.vc,tx=p.tex&&uvOK(r)?texFor(TH,p.tex):null;
 const arr=mats.map(q=>{const m=M(hv&&q.vc!==false?(q.cw?q.c:'#ffffff'):(q.c||'#c9a46a'));if(hv&&q.vc!==false){m.vertexColors=true;if(q.cw&&q.c)m.color.set(q.c)}const o={...q};delete o.c;if(skin)skin(TH,m,o);if(q.side==2||q.dbl)m.side=2;if(tx&&q.tp!==false){m.vertexColors=false;m.color.set(q.cw&&q.c?q.c:'#ffffff');m.map=tx}return m});
 const o=new TH.Mesh(g,arr.length>1?arr:arr[0]);o.userData.pmesh=true;if(arr.length&&arr.every(m=>m.transparent&&m.opacity<.7))o.userData.outlineParameters={visible:false};return o}
// ======================= uv.js — فك UV تلقائي (Smart Project) + حزم الجزر =======================
// يملأ m.uv (مصفوفة لكل وجه: u,v لكل زاوية) و m.uvSig. الجزر تنفصل بزاوية الانحناء وبحواف الفصل m.sm.
export function unwrapUV(m,o){o=o||{};const ang=Math.cos((o.angle??60)*Math.PI/180),pad=o.margin??.008,nf=m.f.length;
 if(!nf){m.uv=[];m.uvSig=uvSigOf(m);return{islands:0,util:0}}
 const E=topo(m),fn=m.f.map(f=>faceN(m,f)),fu=fn.map(nrm3),area=fn.map(a=>len3(a)/2),seam=m.sm||new Set();
 const adj=Array.from({length:nf},()=>[]);E.forEach((e,k)=>{if(e.fs.length==2&&!seam.has(k)){adj[e.fs[0]].push(e.fs[1]);adj[e.fs[1]].push(e.fs[0])}});
 const isl=new Int32Array(nf).fill(-1),order=[...Array(nf).keys()].sort((a,b)=>area[b]-area[a]),islands=[],adjA=Math.cos(Math.min(o.angle??60,70)*Math.PI/180);
 for(const s of order){if(isl[s]>=0)continue;const id=islands.length,fs=[s];isl[s]=id;let n=mul3(fu[s],area[s]+1e-12);const q=[s];let qi=0;
  while(qi<q.length){const f=q[qi++];for(const g of adj[f]){if(isl[g]>=0)continue;if(dot3(nrm3(n),fu[g])>=ang&&dot3(fu[f],fu[g])>=adjA){isl[g]=id;fs.push(g);n=add3(n,mul3(fu[g],area[g]+1e-12));q.push(g)}}}
  islands.push({fs,n:nrm3(n)})}
 // إسقاط كل جزيرة على مستواها وتدويرها لأصغر مستطيل
 const uvs=m.f.map(f=>new Array(f.length*2));const rects=[];
 islands.forEach((I,ii)=>{const cn=I.n,a=Math.abs(cn[1])<.9?[0,1,0]:[1,0,0],t1=nrm3(crs3(cn,a)),t2=crs3(cn,t1);
  const pts=[];I.fs.forEach(fi=>m.f[fi].forEach(v=>pts.push([dot3(m.pos(v),t1),dot3(m.pos(v),t2)])));
  let best=1e30,ba=0;for(let d=0;d<90;d+=5){const c=Math.cos(d*Math.PI/180),s=Math.sin(d*Math.PI/180);let x0=1e30,y0=1e30,x1=-1e30,y1=-1e30;for(const p of pts){const x=p[0]*c-p[1]*s,y=p[0]*s+p[1]*c;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}const ar=(x1-x0)*(y1-y0);if(ar<best){best=ar;ba=d}}
  const c=Math.cos(ba*Math.PI/180),s=Math.sin(ba*Math.PI/180);let x0=1e30,y0=1e30,x1=-1e30,y1=-1e30;const P2=(v)=>{const p=[dot3(m.pos(v),t1),dot3(m.pos(v),t2)];return[p[0]*c-p[1]*s,p[0]*s+p[1]*c]};
  I.fs.forEach(fi=>m.f[fi].forEach(v=>{const p=P2(v);x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}));
  let w=x1-x0,h=y1-y0,swap=false;if(h>w){swap=true;[w,h]=[h,w]}
  // اجعل العرض ≥ الارتفاع ليسهل الحزم (تدوير 90° مع الحفاظ على الاتجاه)
  const tf=p=>{let x=p[0]-x0,y=p[1]-y0;if(swap){const nx=h0(y1-y0)-y;return[nx,x]}return[x,y]};const h0=v=>v;
  I.fs.forEach(fi=>m.f[fi].forEach((v,ci)=>{const q=tf(P2(v));uvs[fi][2*ci]=q[0];uvs[fi][2*ci+1]=q[1]}));
  rects.push({i:ii,w:Math.max(w,1e-6),h:Math.max(h,1e-6),x:0,y:0})});
 // حزم رفّي: نبحث عن أكبر مقياس يتّسع داخل [0,1]
 const order2=rects.slice().sort((a,b)=>b.h-a.h);
 const pack=sc=>{let x=pad,y=pad,rh=0;for(const r of order2){const W=r.w*sc,H=r.h*sc;if(W+2*pad>1)return false;if(x+W+pad>1){x=pad;y+=rh+pad;rh=0}r.x=x;r.y=y;x+=W+pad;rh=Math.max(rh,H);if(y+H+pad>1)return false}return y+rh+pad<=1};
 let lo=0,hi=1;let tot=0;rects.forEach(r=>tot+=r.w*r.h);hi=Math.sqrt(1/Math.max(tot,1e-9))*2;for(let it=0;it<28;it++){const mid=(lo+hi)/2;if(pack(mid))lo=mid;else hi=mid}
 pack(lo);const sc=lo;
 islands.forEach((I,ii)=>{const r=rects[ii];I.fs.forEach(fi=>{const U=uvs[fi];for(let k=0;k<U.length;k+=2){U[k]=r.x+U[k]*sc;U[k+1]=r.y+U[k+1]*sc}})});
 m.uv=uvs;m.uvSig=uvSigOf(m);let used=0;rects.forEach(r=>used+=r.w*r.h*sc*sc);return{islands:islands.length,util:used}}
// ======================= texpaint.js — الرسم على الخامة بطبقات (بدون DOM، يعمل في المتصفح و node) =======================
// طبقة = {n,o,v,b,d:Uint8ClampedArray RGBA غير مضروب}. الفرشاة ثلاثية الأبعاد: تُرسَم على كل التكسلات القريبة من نقطة الضربة
// في الفضاء (فتعبر حدود الجزر بلا فجوات). التراجع بلقطة الطبقة قبل الضربة.
export const TEX_BLENDS=[['n','عادي'],['m','ضرب'],['s','تفتيح (Screen)'],['o','تراكب'],['a','إضافة']];
const bf={n:(d,s)=>s,m:(d,s)=>d*s,s:(d,s)=>1-(1-d)*(1-s),o:(d,s)=>d<.5?2*d*s:1-2*(1-d)*(1-s),a:(d,s)=>Math.min(1,d+s)};
export class TexPaint{
 constructor(m,size){this.size=size||1024;this.layers=[];this.out=new Uint8ClampedArray(this.size*this.size*4);this.undo=[];this.setMesh(m);this.sa=new Uint8Array(this.size*this.size);this.stroke=null}
 // ---- هندسة: مثلثات بإحداثيات UV وأبعاد 3D ----
 setMesh(m){const S=this.size,T=[];this.m=m;m.f.forEach((f,fi)=>{const U=m.uv[fi],N=nrm3(faceN(m,f));triangulate(m,f).forEach(t=>{const c=t.map(v=>f.indexOf(v)),P=t.map(v=>m.pos(v)),Q=c.map(k=>[U[2*k]*S,(1-U[2*k+1])*S]);
   const cen=[(P[0][0]+P[1][0]+P[2][0])/3,(P[0][1]+P[1][1]+P[2][1])/3,(P[0][2]+P[1][2]+P[2][2])/3];let rad=0;P.forEach(p=>rad=Math.max(rad,len3(sub3(p,cen))));
   const den=(Q[1][1]-Q[2][1])*(Q[0][0]-Q[2][0])+(Q[2][0]-Q[1][0])*(Q[0][1]-Q[2][1]);
   if(Math.abs(den)<1e-9)return;T.push({P,Q,N,cen,rad,den,fi,t,c})})});this.T=T;this.buildCover()}
 // تغطية: أي تكسلات تقع داخل مثلثات؛ وخريطة تمديد (dilation) لما حولها لمنع الخطوط عند الحواف
 raster(tr,fn){const S=this.size,{Q,den}=tr;const x0=Math.max(0,Math.floor(Math.min(Q[0][0],Q[1][0],Q[2][0])-1)),x1=Math.min(S-1,Math.ceil(Math.max(Q[0][0],Q[1][0],Q[2][0])+1)),y0=Math.max(0,Math.floor(Math.min(Q[0][1],Q[1][1],Q[2][1])-1)),y1=Math.min(S-1,Math.ceil(Math.max(Q[0][1],Q[1][1],Q[2][1])+1));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=x+.5,py=y+.5;const w0=((Q[1][1]-Q[2][1])*(px-Q[2][0])+(Q[2][0]-Q[1][0])*(py-Q[2][1]))/den,w1=((Q[2][1]-Q[0][1])*(px-Q[2][0])+(Q[0][0]-Q[2][0])*(py-Q[2][1]))/den,w2=1-w0-w1;
   if(w0>=-.002&&w1>=-.002&&w2>=-.002)fn(x,y,w0,w1,w2)}}
 buildCover(){const S=this.size,cov=new Uint8Array(S*S);this.T.forEach(tr=>this.raster(tr,(x,y)=>{cov[y*S+x]=1}));this.cov=cov;
  const dil=new Int32Array(S*S).fill(-1);for(let i=0;i<S*S;i++)if(cov[i])dil[i]=i;
  for(let pass=0;pass<4;pass++){const add=[];for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=y*S+x;if(dil[i]>=0)continue;let src=-1;for(let dy=-1;dy<=1&&src<0;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=S||Y>=S)continue;const j=Y*S+X;if(dil[j]>=0){src=dil[j];break}}if(src>=0)add.push(i,src)}for(let k=0;k<add.length;k+=2)dil[add[k]]=add[k+1]}
  this.dil=dil}
 // ---- طبقات ----
 addLayer(name,fill,at){const L={n:name||'طبقة '+(this.layers.length+1),o:1,v:1,b:'n',d:new Uint8ClampedArray(this.size*this.size*4)};if(fill){const c=fill;for(let i=0;i<L.d.length;i+=4){L.d[i]=c[0];L.d[i+1]=c[1];L.d[i+2]=c[2];L.d[i+3]=c[3]??255}}
  if(at==null)this.layers.push(L);else this.layers.splice(at,0,L);return L}
 mergeDown(i){if(i<=0)return;const a=this.layers[i-1],b=this.layers[i];const keep=this.layers;this.layers=[a,b];const tmp=this.size*this.size;
  // اجمع الطبقتين في a بحساب المزج
  const o=new Uint8ClampedArray(tmp*4);this.compose(0,0,this.size,this.size,o,true);a.d.set(o);a.o=1;a.b='n';keep.splice(i,1);this.layers=keep}
 fill(L,c){for(let i=0;i<L.d.length;i+=4){L.d[i]=c[0];L.d[i+1]=c[1];L.d[i+2]=c[2];L.d[i+3]=c[3]??255}}
 clear(L){L.d.fill(0)}
 // ---- دمج الطبقات في الخرج النهائي (ضمن مستطيل) ----
 compose(x0,y0,x1,y1,out,noDil){const S=this.size,o=out||this.out;x0=Math.max(0,x0);y0=Math.max(0,y0);x1=Math.min(S,x1);y1=Math.min(S,y1);const Ls=this.layers.filter(l=>l.v);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*S+x)*4;let r=0,g=0,b=0,a=0;
   for(const L of Ls){const d=L.d,sa=d[i+3]/255*L.o;if(sa<=0)continue;const sr=d[i]/255,sg=d[i+1]/255,sb=d[i+2]/255,f=bf[L.b]||bf.n;let cr=sr,cg=sg,cb=sb;if(a>0&&L.b!='n'){cr=(1-a)*sr+a*f(r,sr);cg=(1-a)*sg+a*f(g,sg);cb=(1-a)*sb+a*f(b,sb)}
    const na=sa+a*(1-sa);r=(cr*sa+r*a*(1-sa))/na;g=(cg*sa+g*a*(1-sa))/na;b=(cb*sa+b*a*(1-sa))/na;a=na}
   o[i]=r*255;o[i+1]=g*255;o[i+2]=b*255;o[i+3]=255}
  if(!noDil){const dil=this.dil;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const k=y*S+x,s=dil[k];if(s>=0&&s!==k){const i=k*4,j=s*4;o[i]=o[j];o[i+1]=o[j+1];o[i+2]=o[j+2]}}}}
 composeAll(){this.compose(0,0,this.size,this.size)}
 // ---- الضربة ----
 begin(li,erase){const L=this.layers[li];if(!L)return false;this.stroke={li,erase:!!erase,base:L.d.slice(),rect:null,color:[0,0,0],op:1};this.sa.fill(0);return true}
 // c: [r,g,b] 0-255 · op: شفافية الضربة الكلية · hard: 0..1 · flow: قوة كل لمسة
 dab(hit,N,R,hard,c,op,flow,front,rectOut){const st=this.stroke;if(!st)return null;st.color=c;st.op=op;const S=this.size,sa=this.sa;let dx0=S,dy0=S,dx1=-1,dy1=-1;const R2=R*R;
  for(const tr of this.T){const d=len3(sub3(tr.cen,hit));if(d>R+tr.rad)continue;if(front&&N&&dot3(tr.N,N)<=.12)continue;
   this.raster(tr,(x,y,w0,w1,w2)=>{const px=w0*tr.P[0][0]+w1*tr.P[1][0]+w2*tr.P[2][0],py=w0*tr.P[0][1]+w1*tr.P[1][1]+w2*tr.P[2][1],pz=w0*tr.P[0][2]+w1*tr.P[1][2]+w2*tr.P[2][2];
    const ex=px-hit[0],ey=py-hit[1],ez=pz-hit[2],q=ex*ex+ey*ey+ez*ez;if(q>=R2)return;const t=Math.sqrt(q)/R;let a=t<=hard?1:1-(t-hard)/(1-hard+1e-6);a=a*a*(3-2*Math.max(0,Math.min(1,a)));a*=flow;const v=Math.round(a*255),k=y*S+x;
    if(v>sa[k]){sa[k]=v;if(x<dx0)dx0=x;if(x>dx1)dx1=x;if(y<dy0)dy0=y;if(y>dy1)dy1=y}})}
  if(dx1<0)return null;const rc=[dx0,dy0,dx1+1,dy1+1];this.applyRect(rc);if(!st.rect)st.rect=rc.slice();else{st.rect[0]=Math.min(st.rect[0],rc[0]);st.rect[1]=Math.min(st.rect[1],rc[1]);st.rect[2]=Math.max(st.rect[2],rc[2]);st.rect[3]=Math.max(st.rect[3],rc[3])}
  this.compose(rc[0]-4,rc[1]-4,rc[2]+4,rc[3]+4);return rc}
 // طبّق الضربة الحالية على الطبقة داخل مستطيل: الناتج = f(لقطة البداية، قناع الضربة) فهو عديم التراكم
 applyRect(rc){const st=this.stroke,L=this.layers[st.li],S=this.size,sa=this.sa,base=st.base,d=L.d,c=st.color,op=st.op;
  for(let y=rc[1];y<rc[3];y++)for(let x=rc[0];x<rc[2];x++){const k=y*S+x,s=sa[k];if(!s)continue;const i=k*4,A=s/255*op;
   if(st.erase){d[i]=base[i];d[i+1]=base[i+1];d[i+2]=base[i+2];d[i+3]=base[i+3]*(1-A)}
   else{const ba=base[i+3]/255,ra=A+ba*(1-A);if(ra<=0)continue;d[i]=(c[0]*A+base[i]*ba*(1-A))/ra;d[i+1]=(c[1]*A+base[i+1]*ba*(1-A))/ra;d[i+2]=(c[2]*A+base[i+2]*ba*(1-A))/ra;d[i+3]=ra*255}}}
 end(){const st=this.stroke;this.stroke=null;if(!st||!st.rect)return false;this.undo.push({li:st.li,data:st.base,rect:st.rect});const cap=this.size>1024?6:14;while(this.undo.length>cap)this.undo.shift();return true}
 undoOne(){const u=this.undo.pop();if(!u)return false;const L=this.layers[u.li];if(L){L.d.set(u.data);const r=u.rect;this.compose(r[0]-4,r[1]-4,r[2]+4,r[3]+4)}return true}
 // نقل تلوين الرؤوس إلى طبقة (إسقاط ألوان الرؤوس على الخامة)
 bakeVC(L){const m=this.m;if(!m.vc)return false;const S=this.size,d=L.d;this.T.forEach(tr=>{const cs=tr.t.map(v=>[m.vc[3*v],m.vc[3*v+1],m.vc[3*v+2]]);this.raster(tr,(x,y,w0,w1,w2)=>{const i=(y*S+x)*4;d[i]=255*(w0*cs[0][0]+w1*cs[1][0]+w2*cs[2][0]);d[i+1]=255*(w0*cs[0][1]+w1*cs[1][1]+w2*cs[2][1]);d[i+2]=255*(w0*cs[0][2]+w1*cs[1][2]+w2*cs[2][2]);d[i+3]=255})});return true}
 sample(u,v){const S=this.size,x=Math.max(0,Math.min(S-1,Math.floor(u*S))),y=Math.max(0,Math.min(S-1,Math.floor((1-v)*S))),i=(y*S+x)*4;return[this.out[i],this.out[i+1],this.out[i+2]]}}

// ======================= meshops.js — عمليات التحرير على PMesh =======================
// كل عملية تعدّل الشبكة في مكانها وتُرجع الاختيار الجديد {v:Set,f:Set,e:Set}
const bisect=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const cp=m=>m; // تلميح للقارئ: العمليات تعمل في المكان
const key=ek;
export const MO={};
// ---------- مساعدات الاختيار ----------
MO.facesToVerts=(m,fs)=>{const s=new Set();fs.forEach(fi=>m.f[fi].forEach(i=>s.add(i)));return s};
MO.vertsToFaces=(m,vs)=>{const s=new Set();m.f.forEach((f,fi)=>{if(f.every(i=>vs.has(i)))s.add(fi)});return s};
MO.vertsToEdges=(m,vs)=>{const s=new Set();m.f.forEach(f=>{for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];if(vs.has(a)&&vs.has(b))s.add(key(a,b))}});return s};
MO.edgesToVerts=(es)=>{const s=new Set();es.forEach(k=>{const[a,b]=MESH_DK(k);s.add(a);s.add(b)});return s};
MO.facesToEdges=(m,fs)=>{const s=new Set();fs.forEach(fi=>{const f=m.f[fi];for(let i=0;i<f.length;i++)s.add(key(f[i],f[(i+1)%f.length]))});return s};
MO.edgesToFaces=(m,es)=>{const s=new Set();m.f.forEach((f,fi)=>{let all=true;for(let i=0;i<f.length;i++)if(!es.has(key(f[i],f[(i+1)%f.length]))){all=false;break}if(all)s.add(fi)});return s};
MO.boundaryEdges=(m,fs)=>{const E=topo(m),r=[];E.forEach((e,k)=>{const n=e.fs.filter(fi=>fs.has(fi)).length;if(n==1)r.push(k)});return r};
MO.growFaces=(m,fs)=>{const vs=MO.facesToVerts(m,fs),r=new Set(fs);m.f.forEach((f,fi)=>{if(f.some(i=>vs.has(i)))r.add(fi)});return r};
MO.linkedFaces=(m,fi0)=>{const E=topo(m),adj=m.f.map(()=>[]);E.forEach(e=>{e.fs.forEach(a=>e.fs.forEach(b=>{if(a!=b)adj[a].push(b)}))});const s=new Set([fi0]),q=[fi0];while(q.length){const x=q.pop();adj[x].forEach(y=>{if(!s.has(y)){s.add(y);q.push(y)}})}return s};
MO.linkedVerts=(m,v0)=>{const N=vertNeighbors(m),s=new Set([v0]),q=[v0];while(q.length){const x=q.pop();N[x].forEach(y=>{if(!s.has(y)){s.add(y);q.push(y)}})}return s};
// حلقة حواف (edge loop) تمرّ عبر حافة: تتبّع الحافة المقابلة في الرؤوس ذات التكافؤ 4
MO.edgeLoop=(m,k0)=>{const E=topo(m),VE=Array.from({length:m.nv},()=>[]);E.forEach((e,k)=>{VE[e.a].push(k);VE[e.b].push(k)});const res=new Set([k0]);
 const step=(v,k)=>{// من الرأس v عبر الحافة k نبحث عن الحافة المستمرة
  const es=VE[v];if(es.length!=4)return null;const e=E.get(k);// الحافة المقابلة هي التي لا تشترك بوجه مع k
  const fk=new Set(e.fs);const opp=es.filter(x=>x!=k&&!E.get(x).fs.some(f=>fk.has(f)));return opp.length==1?opp[0]:null};
 for(const start of E.get(k0)?[E.get(k0).a,E.get(k0).b]:[]){let v=start,k=k0,guard=0;while(guard++<10000){const nk=step(v,k);if(nk==null||res.has(nk))break;res.add(nk);const e=E.get(nk);v=e.a==v?e.b:e.a;k=nk}}return res};
// حلقة الحواف المتوازية (ring) عبر الرباعيات
MO.edgeRing=(m,k0)=>{const E=topo(m),res=[];const seen=new Set();const walk=(k,fi0)=>{let cur=k,fi=fi0,guard=0;const out=[];while(guard++<10000){const e=E.get(cur);const f=m.f[fi];if(f.length!=4)break;let i=0;for(;i<4;i++)if(key(f[i],f[(i+1)%4])==cur)break;if(i==4)break;const ok=key(f[(i+2)%4],f[(i+3)%4]);if(seen.has(ok))break;seen.add(ok);out.push(ok);const e2=E.get(ok);const nf=e2.fs.find(x=>x!=fi);if(nf==null)break;fi=nf;cur=ok}return out};
 seen.add(k0);const e0=E.get(k0);const r=[k0];e0.fs.forEach(fi=>walk(k0,fi).forEach(x=>r.push(x)));return new Set(r)};
// ---------- بثق (Extrude) ----------
MO.extrudeFaces=(m,fs,opt)=>{opt=opt||{};fs=new Set(fs);if(!fs.size)return{v:new Set(),f:new Set(),e:new Set()};const E=topo(m);
 if(opt.individual){const nv=new Set(),nf=new Set();[...fs].forEach(fi=>{const r=MO.extrudeFaces(m,[fi],{});r.v.forEach(x=>nv.add(x));r.f.forEach(x=>nf.add(x))});return{v:nv,f:nf,e:MO.facesToEdges(m,nf)}}
 const bnd=new Set();E.forEach((e,k)=>{if(e.fs.filter(fi=>fs.has(fi)).length==1)bnd.add(k)});const dup=new Map();
 bnd.forEach(k=>{const e=E.get(k);[e.a,e.b].forEach(i=>{if(!dup.has(i))dup.set(i,m.addV(m.pos(i),m.col(i)))})});
 const sides=[];fs.forEach(fi=>{const f=m.f[fi],n=f.length;for(let i=0;i<n;i++){const a=f[i],b=f[(i+1)%n];if(bnd.has(key(a,b)))sides.push([a,b,fi])}});
 const nvs=new Set(dup.values());fs.forEach(fi=>{m.f[fi]=m.f[fi].map(i=>dup.has(i)?dup.get(i):i);m.f[fi].forEach(i=>nvs.add(i))});
 sides.forEach(([a,b,fi])=>{m.addF([a,b,dup.get(b),dup.get(a)],m.fm[fi])});
 return{v:nvs,f:new Set(fs),e:MO.facesToEdges(m,fs)}};
MO.extrudeEdges=(m,es)=>{const dup=new Map(),nvs=new Set(),nf=new Set();es.forEach(k=>{const[a,b]=MESH_DK(k);[a,b].forEach(i=>{if(!dup.has(i))dup.set(i,m.addV(m.pos(i),m.col(i)))});
  // الاتجاه: ضد وجه الحافة الأصلي إن وُجد
  let ord=[a,b];for(const f of m.f){for(let i=0;i<f.length;i++){if(f[i]==a&&f[(i+1)%f.length]==b){ord=[b,a];break}if(f[i]==b&&f[(i+1)%f.length]==a){ord=[a,b];break}}}
  nf.add(m.addF([ord[0],ord[1],dup.get(ord[1]),dup.get(ord[0])]))});dup.forEach(v=>nvs.add(v));return{v:nvs,f:nf,e:new Set([...es].map(k=>{const[a,b]=MESH_DK(k);return key(dup.get(a),dup.get(b))}))}};
MO.extrudeVerts=(m,vs)=>{const nvs=new Set();vs.forEach(i=>{const n=m.addV(m.pos(i),m.col(i));nvs.add(n);m.cr.delete(key(i,n))});const E=[];// حافة جديدة (خط): نمثّلها بوجه منحلّ غير مدعوم؛ نبقي فقط الرأس
 return{v:nvs,f:new Set(),e:new Set()}};
// ---------- إدخال (Inset) ----------
MO.insetFaces=(m,fs,d,opt)=>{opt=opt||{};fs=new Set(fs);if(!fs.size)return{v:new Set(),f:new Set(),e:new Set()};
 const groups=opt.individual?[...fs].map(x=>new Set([x])):[fs];const nf=new Set(),nvs=new Set();
 groups.forEach(g=>{const E=topo(m),bnd=new Set();E.forEach((e,k)=>{if(e.fs.filter(fi=>g.has(fi)).length==1)bnd.add(k)});
  const inw=new Map();// رأس -> مجموع الاتجاهات الداخلية
  g.forEach(fi=>{const f=m.f[fi],n=faceNormal(m,f);for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];if(!bnd.has(key(a,b)))continue;const dv=nrm3(crs3(n,sub3(m.pos(b),m.pos(a))));[a,b].forEach(v=>{const c=inw.get(v)||[0,0,0];inw.set(v,add3(c,dv))})}});
  const r=MO.extrudeFaces(m,[...g],{});
  // الرؤوس الحدودية المكرَّرة هي الأحدث: نحسب خريطة القديم→الجديد من الوجوه
  g.forEach(fi=>{const f=m.f[fi];f.forEach(v=>{});});
  const oldNew=new Map();
  // استخرج المطابقة: كل رأس قديم له نسخة تحتوي نفس الموضع تمامًا وتنتمي لوجه محدد
  const posKey=i=>m.v[3*i].toFixed(5)+','+m.v[3*i+1].toFixed(5)+','+m.v[3*i+2].toFixed(5);
  const byPos=new Map();r.v.forEach(i=>{const k=posKey(i);(byPos.get(k)||byPos.set(k,[]).get(k)).push(i)});
  inw.forEach((dir,v)=>{const k=posKey(v),c=byPos.get(k);if(!c)return;const nv=c.find(i=>i!==v);if(nv==null)return;const l2=dir[0]*dir[0]+dir[1]*dir[1]+dir[2]*dir[2];const s=d*2/Math.max(l2,.5);m.v[3*nv]+=dir[0]*s;m.v[3*nv+1]+=dir[1]*s;m.v[3*nv+2]+=dir[2]*s;});
  if(opt.depth){const n=[0,0,0];g.forEach(fi=>{const q=faceNormal(m,m.f[fi]);n[0]+=q[0];n[1]+=q[1];n[2]+=q[2]});const nn=nrm3(n);r.v.forEach(i=>{m.v[3*i]+=nn[0]*opt.depth;m.v[3*i+1]+=nn[1]*opt.depth;m.v[3*i+2]+=nn[2]*opt.depth})}
  r.f.forEach(x=>nf.add(x));r.v.forEach(x=>nvs.add(x))});
 return{v:nvs,f:nf,e:MO.facesToEdges(m,nf)}};
// ---------- تقسيم ----------
function insertOnEdges(m,ins,skipFaces){// ins: Map(edgeKey -> [vertex ids ordered from a(min)->b(max)])
 m.f.forEach((f,fi)=>{if(skipFaces&&skipFaces.has(fi))return;const g=[];for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];g.push(a);const k=key(a,b),arr=ins.get(k);if(arr){const lo=Math.min(a,b);g.push(...(a==lo?arr:arr.slice().reverse()))}}m.f[fi]=g})}
MO.subdivideFaces=(m,fs,cuts)=>{cuts=cuts||1;let cur=new Set(fs);for(let c=0;c<cuts;c++){const E=topo(m),ins=new Map(),mid=new Map();const ed=MO.facesToEdges(m,cur);
  ed.forEach(k=>{const e=E.get(k);if(!e)return;const id=m.addV(bisect(m.pos(e.a),m.pos(e.b),.5),m.vc?bisect(m.col(e.a),m.col(e.b),.5):null);mid.set(k,id);ins.set(k,[id]);const s=m.cr.get(k);if(s)m.cr.set(key(e.a,id),s)});
  insertOnEdges(m,ins);const nsel=new Set(),nf=[],nm=[];const ff=new Set();
  m.f.forEach((f,fi)=>{if(!cur.has(fi)){if(m.ff.has(fi))ff.add(nf.length);nf.push(f);nm.push(m.fm[fi]);return}
   // f الآن تحتوي نقاط المنتصف مضافة بين الرؤوس: نعيد بناء الأصلية
   const orig=[],mids=[];for(const v of f){if([...mid.values()].includes(v))mids.push(v);else orig.push(v)}
   const n=orig.length,ctr=m.addV(MO.cen(m,orig),m.vc?MO.avgCol(m,orig):null);
   // ترتيب: orig[i], mid(i,i+1), ...
   const seq=f,N=seq.length;for(let i=0;i<N;i++){const v=seq[i];if(mids.includes(v))continue;
    const pm=seq[(i+N-1)%N],nx=seq[(i+1)%N];if(mids.includes(pm)&&mids.includes(nx)){if(m.ff.has(fi))ff.add(nf.length);nsel.add(nf.length);nf.push([v,nx,ctr,pm]);nm.push(m.fm[fi])}}
   if(!seq.some(v=>mids.includes(v))){const t=[...orig];nf.push(t);nm.push(m.fm[fi])}});
  m.f=nf;m.fm=nm;m.ff=ff;cur=nsel}return{v:new Set(),f:cur,e:new Set()}};
MO.cen=(m,vs)=>{let x=0,y=0,z=0;vs.forEach(i=>{x+=m.v[3*i];y+=m.v[3*i+1];z+=m.v[3*i+2]});const n=vs.length||vs.size||1;return[x/n,y/n,z/n]};
MO.avgCol=(m,vs)=>{let x=0,y=0,z=0;vs.forEach(i=>{x+=m.vc[3*i];y+=m.vc[3*i+1];z+=m.vc[3*i+2]});const n=vs.length||1;return[x/n,y/n,z/n]};
MO.subdivideEdges=(m,es,cuts)=>{cuts=cuts||1;const E=topo(m),ins=new Map(),nvs=new Set();es.forEach(k=>{const e=E.get(k);if(!e)return;const ids=[];for(let c=1;c<=cuts;c++){const t=c/(cuts+1);ids.push(m.addV(bisect(m.pos(e.a),m.pos(e.b),t),m.vc?bisect(m.col(e.a),m.col(e.b),t):null));nvs.add(ids[ids.length-1])}ins.set(k,ids)});insertOnEdges(m,ins);return{v:nvs,f:new Set(),e:new Set()}};
// ---------- قصّ الحلقة Loop cut ----------
MO.loopCut=(m,k0,cuts,ratio)=>{cuts=cuts||1;ratio=ratio??.5;const E=topo(m);if(!E.get(k0))return null;const e0=E.get(k0);
 // تتبّع الحلقة في الاتجاهين: نخزّن لكل حافة (L,R,face)
 const ringEdges=new Map();// key -> {L,R}
 const seenF=new Set();const walk=(fi0,L,R)=>{let fi=fi0,l=L,r=R,guard=0,steps=[];while(guard++<100000){if(seenF.has(fi))break;const f=m.f[fi];if(f.length!=4)break;const k=key(l,r);
   const i=f.indexOf(l),j=f.indexOf(r);if(i<0||j<0)break;const n=4;let L2,R2;if((i+1)%n==j){R2=f[(j+1)%n];L2=f[(i+n-1)%n]}else if((j+1)%n==i){L2=f[(i+1)%n];R2=f[(j+n-1)%n]}else break;
   steps.push({fi,l,r,L2,R2});seenF.add(fi);if(!ringEdges.has(k))ringEdges.set(k,{L:l,R:r});const k2=key(L2,R2),e2=E.get(k2);if(!e2)break;const nf=e2.fs.find(x=>x!=fi);ringEdges.set(k2,ringEdges.get(k2)||{L:L2,R:R2});if(nf==null)break;if(steps.some(s=>s.fi==nf))break;fi=nf;l=L2;r=R2}return steps};
 ringEdges.set(k0,{L:e0.a,R:e0.b});const s1=e0.fs.length?walk(e0.fs[0],e0.a,e0.b):[];const s2=e0.fs.length>1?walk(e0.fs[1],e0.a,e0.b):[];
 const faces=new Map();s1.concat(s2).forEach(s=>faces.set(s.fi,s));if(!faces.size)return null;
 // رؤوس جديدة على كل حافة في الحلقة (نبدأ بالحواف المذكورة)
 const edgeNew=new Map();const mk=(k)=>{if(edgeNew.has(k))return edgeNew.get(k);const{L,R}=ringEdges.get(k);const ids=[];for(let c=1;c<=cuts;c++){const t=cuts==1?ratio:c/(cuts+1);ids.push(m.addV(bisect(m.pos(L),m.pos(R),t),m.vc?bisect(m.col(L),m.col(R),t):null))}edgeNew.set(k,{L,R,ids});return edgeNew.get(k)};
 const nf=[],nm=[],ff=new Set(),newFaces=new Set(),newVerts=new Set();
 m.f.forEach((f,fi)=>{const s=faces.get(fi);if(!s){nf.push(f);nm.push(m.fm[fi]);if(m.ff.has(fi))ff.add(nf.length-1);return}
  const A=mk(key(s.l,s.r)),B=mk(key(s.L2,s.R2));const idsA=A.L==s.l?A.ids:A.ids.slice().reverse(),idsB=B.L==s.L2?B.ids:B.ids.slice().reverse();idsA.forEach(x=>newVerts.add(x));idsB.forEach(x=>newVerts.add(x));
  const chainA=[s.l,...idsA,s.r],chainB=[s.L2,...idsB,s.R2],N0=faceN(m,f);
  for(let c=0;c<=cuts;c++){let q=[chainA[c],chainA[c+1],chainB[c+1],chainB[c]];const nn=faceN(m,q);if(nn[0]*N0[0]+nn[1]*N0[1]+nn[2]*N0[2]<0)q=q.reverse();newFaces.add(nf.length);nf.push(q);nm.push(m.fm[fi]);if(m.ff.has(fi))ff.add(nf.length-1)}});
 m.f=nf;m.fm=nm;m.ff=ff;
 // إصلاح T-junction للوجوه غير الحلقية المجاورة
 const ins=new Map();edgeNew.forEach((v,k)=>{const lo=Math.min(v.L,v.R);ins.set(k,v.L==lo?v.ids:v.ids.slice().reverse())});
 const skip=new Set([...newFaces]);insertOnEdges(m,ins,skip);
 // الحواف الجديدة (الحلقة) كاختيار
 const es=new Set();newFaces.forEach(fi=>{const f=m.f[fi];for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];if(newVerts.has(a)&&newVerts.has(b))es.add(key(a,b))}});return{v:newVerts,f:new Set(),e:es}};
// ---------- حذف ودمج ----------
MO.deleteFaces=(m,fs)=>{const keep=[],km=[],ff=new Set();m.f.forEach((f,fi)=>{if(!fs.has(fi)){if(m.ff.has(fi))ff.add(keep.length);keep.push(f);km.push(m.fm[fi])}});m.f=keep;m.fm=km;m.ff=ff;compact(m);return{v:new Set(),f:new Set(),e:new Set()}};
MO.deleteVerts=(m,vs)=>MO.deleteFaces(m,new Set(m.f.map((f,i)=>f.some(x=>vs.has(x))?i:-1).filter(i=>i>=0)));
MO.deleteEdges=(m,es)=>MO.deleteFaces(m,new Set(m.f.map((f,i)=>{for(let j=0;j<f.length;j++)if(es.has(key(f[j],f[(j+1)%f.length])))return i;return -1}).filter(i=>i>=0)));
MO.mergeVerts=(m,vs,mode)=>{vs=[...vs];if(vs.length<2)return{v:new Set(vs),f:new Set(),e:new Set()};const target=mode=='first'?vs[0]:null,c=target==null?MO.cen(m,vs):m.pos(target),t=target==null?vs[0]:target;
 m.setPos(t,c);const set=new Set(vs);m.f=m.f.map(f=>f.map(i=>set.has(i)?t:i));cleanFaces(m);const cr=new Map();m.cr.forEach((s,k)=>{let[a,b]=MESH_DK(k);a=set.has(a)?t:a;b=set.has(b)?t:b;if(a!=b)cr.set(key(a,b),s)});m.cr=cr;const map=compact(m);return{v:new Set([map[t]]),f:new Set(),e:new Set()}};
MO.weld=(m,dist)=>{dist=dist||1e-4;const H=new Map(),map=new Int32Array(m.nv),q=1/dist;for(let i=0;i<m.nv;i++){const k=Math.round(m.v[3*i]*q)+','+Math.round(m.v[3*i+1]*q)+','+Math.round(m.v[3*i+2]*q);if(H.has(k))map[i]=H.get(k);else{H.set(k,i);map[i]=i}}
 let changed=0;for(let i=0;i<m.nv;i++)if(map[i]!=i)changed++;if(!changed)return 0;m.f=m.f.map(f=>f.map(i=>map[i]));const cr=new Map();m.cr.forEach((s,k)=>{const[a,b]=MESH_DK(k);if(map[a]!=map[b])cr.set(key(map[a],map[b]),s)});m.cr=cr;cleanFaces(m);compact(m);return changed};
MO.dissolveEdges=(m,es)=>{let changed=true,guard=0;while(changed&&guard++<1000){changed=false;const E=topo(m);for(const k of es){const e=E.get(k);if(!e||e.fs.length!=2)continue;const[fa,fb]=e.fs,A=m.f[fa],B=m.f[fb];const a=e.a,b=e.b;
   const ia=A.findIndex((v,i)=>(v==a&&A[(i+1)%A.length]==b)||(v==b&&A[(i+1)%A.length]==a));if(ia<0)continue;const s=A[ia],t=A[(ia+1)%A.length];// A: s->t
   const pathA=[];for(let i=1;i<=A.length;i++)pathA.push(A[(ia+i)%A.length]);// t ... s
   const ib=B.indexOf(t);const pathB=[];for(let i=2;i<B.length;i++){pathB.push(B[(ib+i)%B.length])}
   const merged=pathA.concat(pathB);const nf=[];const nm=[],ff=new Set();m.f.forEach((f,fi)=>{if(fi==fb)return;if(fi==fa){if(m.ff.has(fi))ff.add(nf.length);nf.push(merged);nm.push(m.fm[fa]);return}if(m.ff.has(fi))ff.add(nf.length);nf.push(f);nm.push(m.fm[fi])});m.f=nf;m.fm=nm;m.ff=ff;changed=true;es.delete(k);break}}
 cleanFaces(m);compact(m);return{v:new Set(),f:new Set(),e:new Set()}};
MO.dissolveVerts=(m,vs)=>{vs.forEach(v=>{const fs=m.f.map((f,i)=>f.includes(v)?i:-1).filter(i=>i>=0);if(fs.length<2)return;
  // دمج الوجوه حول الرأس: نبني حلقة الجيران بالترتيب
  const ring=[];const edges=[];fs.forEach(fi=>{const f=m.f[fi],i=f.indexOf(v);edges.push([f[(i+1)%f.length],f[(i+f.length-1)%f.length],fi,f,i])});
  let cur=edges[0],seq=[],used=new Set([0]);let guard=0;// سلسلة: next -> prev
  const f0=cur[3],i0=cur[4];for(let k=1;k<f0.length;k++)seq.push(f0[(i0+k)%f0.length]);let tail=cur[1];let ok=true;
  while(used.size<edges.length&&guard++<100){const nxt=edges.findIndex((e,ix)=>!used.has(ix)&&e[0]==tail);if(nxt<0){ok=false;break}used.add(nxt);const e=edges[nxt];const f=e[3],i=e[4];const part=[];for(let k=2;k<f.length;k++)part.push(f[(i+k)%f.length]);seq.pop();for(const p of[f[(i+1)%f.length]].concat([]))void p;
   // نحذف الأخير (tail) ونضيف مسار الوجه التالي
   seq.push(tail);for(let k=2;k<f.length;k++)seq.push(f[(i+k)%f.length]);tail=e[1];seq=seq.filter((x,ix)=>!(x==tail&&ix<seq.length-1&&false))}
  if(!ok)return;const mat=m.fm[fs[0]];const ng=[];seq.forEach(x=>{if(!ng.length||ng[ng.length-1]!=x)ng.push(x)});if(ng[0]==ng[ng.length-1])ng.pop();const fsSet=new Set(fs);const nf=[],nm=[];m.f.forEach((f,fi)=>{if(!fsSet.has(fi)){nf.push(f);nm.push(m.fm[fi])}});if(new Set(ng).size>=3){nf.push(ng);nm.push(mat)}m.f=nf;m.fm=nm;m.ff=new Set()});
 cleanFaces(m);compact(m);return{v:new Set(),f:new Set(),e:new Set()}};
// ---------- ملء، جسر، قلب ----------
MO.orderLoops=(m,es)=>{// حواف مختارة -> سلاسل مرتبة [{verts,closed}]
 const adj=new Map();es.forEach(k=>{const[a,b]=MESH_DK(k);(adj.get(a)||adj.set(a,[]).get(a)).push(b);(adj.get(b)||adj.set(b,[]).get(b)).push(a)});const seen=new Set(),res=[];
 const starts=[...adj.keys()].sort((x,y)=>adj.get(x).length-adj.get(y).length);// الأطراف أولًا
 starts.forEach(s=>{if(seen.has(s))return;const chain=[s];seen.add(s);let cur=s,closed=false;for(;;){const nx=adj.get(cur).find(x=>!seen.has(x));if(nx==null){closed=chain.length>2&&adj.get(cur).includes(s);break}chain.push(nx);seen.add(nx);cur=nx}res.push({verts:chain,closed})});return res};
MO.fill=(m,es)=>{const loops=MO.orderLoops(m,es).filter(l=>l.closed),nf=new Set();const E=topo(m);loops.forEach(l=>{let v=l.verts;// الاتجاه: عكس اتجاه الوجه المجاور
  const k=key(v[0],v[1]),e=E.get(k);let rev=false;if(e&&e.fs.length==1){const f=m.f[e.fs[0]];for(let i=0;i<f.length;i++)if(f[i]==v[0]&&f[(i+1)%f.length]==v[1])rev=true;else if(f[i]==v[1]&&f[(i+1)%f.length]==v[0])rev=false;if(rev)v=v.slice().reverse()}
  nf.add(m.addF(v.slice()))});return{v:new Set(),f:nf,e:new Set()}};
MO.makeFace=(m,vs)=>{vs=[...vs];if(vs.length<3)return null;// رتّب حول المركز في مستوى متوسط
 const c=MO.cen(m,vs),N=[0,0,0];const p=vs.map(i=>sub3(m.pos(i),c));for(let i=0;i<p.length;i++){const q=crs3(p[i],p[(i+1)%p.length]);N[0]+=q[0];N[1]+=q[1];N[2]+=q[2]}
 let n=nrm3(N);if(len3(N)<1e-9)n=[0,1,0];const u=nrm3(Math.abs(n[1])<.9?crs3(n,[0,1,0]):crs3(n,[1,0,0])),w=crs3(n,u);const ord=vs.map((i,ix)=>({i,a:Math.atan2(dot3(p[ix],w),dot3(p[ix],u))})).sort((x,y)=>x.a-y.a).map(x=>x.i);return{v:new Set(),f:new Set([m.addF(ord)]),e:new Set()}};
MO.bridge=(m,es)=>{const loops=MO.orderLoops(m,es);if(loops.length<2)return null;let A=loops[0],B=loops[1];const n=A.verts.length;if(B.verts.length!=n)return null;const closed=A.closed&&B.closed;
 const D=(a,b)=>len3(sub3(m.pos(a),m.pos(b)));let best=1e18,bo=0,bd=1;for(const dir of[1,-1])for(let o=0;o<(closed?n:1);o++){let s=0;for(let i=0;i<n;i++){const j=dir==1?(i+o)%n:((o-i)%n+n)%n;s+=D(A.verts[i],B.verts[j])}if(s<best){best=s;bo=o;bd=dir}}
 const nf=new Set(),cnt=closed?n:n-1;for(let i=0;i<cnt;i++){const i2=(i+1)%n,j=bd==1?(i+bo)%n:((bo-i)%n+n)%n,j2=bd==1?(i2+bo)%n:((bo-i2)%n+n)%n;nf.add(m.addF([A.verts[i],A.verts[i2],B.verts[j2],B.verts[j]]))}orientConsistent(m);return{v:new Set(),f:nf,e:new Set()}};
MO.flip=(m,fs)=>{fs.forEach(fi=>m.f[fi].reverse())};
MO.recalc=(m)=>{orientOutward(m)};
// تقسيم وجه بين رأسين غير متجاورين
MO.connect=(m,vs)=>{const nf=[],nm=[],ff=new Set();let did=false;m.f.forEach((f,fi)=>{const sel=f.map((v,i)=>vs.has(v)?i:-1).filter(i=>i>=0);const keepIt=()=>{if(m.ff.has(fi))ff.add(nf.length);nf.push(f);nm.push(m.fm[fi])};
  if(sel.length!=2||f.length<4)return keepIt();const[i,j]=sel;if((j-i+f.length)%f.length==1||(i-j+f.length)%f.length==1)return keepIt();
  const A=[],B=[];for(let k=i;;k=(k+1)%f.length){A.push(f[k]);if(k==j)break}for(let k=j;;k=(k+1)%f.length){B.push(f[k]);if(k==i)break}nf.push(A,B);nm.push(m.fm[fi],m.fm[fi]);did=true});m.f=nf;m.fm=nm;m.ff=ff;return{v:new Set(vs),f:new Set(),e:new Set()}};
// ---------- لف (Spin/Lathe) ----------
MO.spin=(m,es,opt)=>{opt=opt||{};const axis=opt.axis||1,steps=opt.steps||16,ang=(opt.angle??360)*Math.PI/180,c=opt.center||[0,0,0];const loops=MO.orderLoops(m,es);if(!loops.length)return null;const full=Math.abs(opt.angle??360)>=359.99;
 const rot=(p,a)=>{const q=sub3(p,c);const u=(axis+1)%3,w=(axis+2)%3,cu=Math.cos(a),sn=Math.sin(a);const r=[0,0,0];r[axis]=q[axis];r[u]=q[u]*cu-q[w]*sn;r[w]=q[u]*sn+q[w]*cu;return add3(r,c)};const nf=new Set(),nvs=new Set();
 loops.forEach(l=>{const rings=[l.verts];const cnt=full?steps:steps+1;for(let s=1;s<cnt;s++){const row=l.verts.map(v=>{const n=m.addV(rot(m.pos(v),ang*s/steps),m.col(v));nvs.add(n);return n});rings.push(row)}
  const R=rings.length;for(let s=0;s<(full?R:R-1);s++){const A=rings[s],B=rings[(s+1)%R];const L=l.closed?A.length:A.length-1;for(let i=0;i<L;i++){const i2=(i+1)%A.length;nf.add(m.addF([A[i],A[i2],B[i2],B[i]]))}}});
 if(full)MO.weld(m,1e-5);orientOutward(m);return{v:new Set(),f:new Set(),e:new Set()}};
// ---------- تنعيم الرؤوس / تحويلات ----------
MO.smoothVerts=(m,vs,f,iters)=>{const N=vertNeighbors(m),E=topo(m),bd=new Set();E.forEach(e=>{if(e.fs.length!=2){bd.add(e.a);bd.add(e.b)}});f=f??.5;for(let it=0;it<(iters||1);it++){const np=new Map();vs.forEach(i=>{if(bd.has(i)||!N[i].size)return;let x=0,y=0,z=0;N[i].forEach(j=>{x+=m.v[3*j];y+=m.v[3*j+1];z+=m.v[3*j+2]});const n=N[i].size;np.set(i,[m.v[3*i]+(x/n-m.v[3*i])*f,m.v[3*i+1]+(y/n-m.v[3*i+1])*f,m.v[3*i+2]+(z/n-m.v[3*i+2])*f])});np.forEach((p,i)=>m.setPos(i,p))}};
MO.vertexNormals=(m)=>{const N=Array.from({length:m.nv},()=>[0,0,0]);m.f.forEach(f=>{const n=faceN(m,f);f.forEach(i=>{N[i][0]+=n[0];N[i][1]+=n[1];N[i][2]+=n[2]})});return N.map(nrm3)};
MO.transform=(m,vs,fn)=>{vs.forEach(i=>{const p=fn(m.pos(i),i);m.setPos(i,p)})};
// ---------- من BufferGeometry إلى PMesh ----------
MO.fromGeometry=(geo,eps)=>{eps=eps||1e-4;const g=geo.index?geo.toNonIndexed():geo,a=g.attributes.position,m=new PMesh(),H=new Map(),q=1/eps;const id=i=>{const x=a.getX(i),y=a.getY(i),z=a.getZ(i),k=Math.round(x*q)+','+Math.round(y*q)+','+Math.round(z*q);if(!H.has(k))H.set(k,m.addV([x,y,z]));return H.get(k)};
 for(let i=0;i<a.count;i+=3){const t=[id(i),id(i+1),id(i+2)];if(t[0]!=t[1]&&t[1]!=t[2]&&t[0]!=t[2])m.addF(t)}return MO.quadify(m)};
MO.quadify=(m,tol)=>{tol=tol??.995;const E=topo(m),used=new Set(),nf=[],nm=[];const cand=[];E.forEach((e,k)=>{if(e.fs.length!=2)return;const[a,b]=e.fs;if(m.f[a].length!=3||m.f[b].length!=3)return;const na=faceNormal(m,m.f[a]),nb=faceNormal(m,m.f[b]);const d=na[0]*nb[0]+na[1]*nb[1]+na[2]*nb[2];if(d<tol)return;cand.push([d,e])});
 cand.sort((x,y)=>y[0]-x[0]);cand.forEach(([d,e])=>{const[a,b]=e.fs;if(used.has(a)||used.has(b))return;const A=m.f[a],B=m.f[b];const ia=A.findIndex((v,i)=>(v==e.a&&A[(i+1)%3]==e.b)||(v==e.b&&A[(i+1)%3]==e.a));const s=A[ia],t=A[(ia+1)%3],ua=A[(ia+2)%3],ub=B.find(x=>x!=s&&x!=t);const quad=[s,ub,t,ua];// s->ub->t->ua
  // محدّب؟
  const N=faceN(m,quad);let ok=true;for(let i=0;i<4;i++){const p=m.pos(quad[i]),q=m.pos(quad[(i+1)%4]),r=m.pos(quad[(i+2)%4]);const c=crs3(sub3(q,p),sub3(r,q));if(dot3(c,N)<=0){ok=false;break}}if(!ok)return;
  // ترتيب s->t->... الاتجاه الأصلي لـ A: s,t,ua  =>  الرباعي الصحيح: s,t,ub,ua
  used.add(a);used.add(b);nf.push([s,t,ub,ua]);nm.push(m.fm[a])});
 m.f.forEach((f,fi)=>{if(!used.has(fi)){nf.push(f);nm.push(m.fm[fi])}});m.f=nf;m.fm=nm;m.ff=new Set();return m};

// =====================================================================
// ============ الإصدار 3 — المعالجة اللاحقة السينمائية (Post) ===========
// =====================================================================
// تمريرة واحدة بعد رسم المشهد إلى هدف عائم (HalfFloat + MSAA): توهج Bloom متعدد المستويات، عمق ميدان حقيقي (يعمل مع الخطوط الخارجية)،
// تدرّج لوني (حرارة/صبغة/تباين/تشبّع/رفع الظلال)، تظليل حواف Vignette، زيغ لوني، حبيبات فيلم، ملمس لوحة مرسومة، شريطا السينما، تلاشٍ/وميض/نبض ألم/ضبابية.
// كل ما سبق قابل للتدريج الزمني من الخط الزمني بإجراء {a:'post', ..., dur}.
export const POST_DEF={exposure:1,bloom:.35,bloomTh:.82,bloomRad:1,contrast:1,saturation:1,temperature:0,tint:0,vignette:.28,vignetteSoft:.55,grain:.025,aberration:.0008,bars:0,fade:0,fadeColor:[0,0,0],flash:0,flashColor:[1,1,1],blur:0,pulse:0,pulseColor:[.75,0,0],paint:0,lift:[0,0,0],gain:[1,1,1],dof:0,focus:8,range:6,dofBlur:1};
export const POST_ALIAS={dof:null};
const VS='varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}';
export class Post{
 constructor(TH,r,o){o=o||{};this.TH=TH;this.r=r;this.v=new TH.Vector2();this.on=o.on!==false;this.lite=!!o.lite;this.P=JSON.parse(JSON.stringify(POST_DEF));this.set(o.params||{});this.t=0;
  const hf=TH.HalfFloatType;let rt;
  try{rt=new TH.WebGLRenderTarget(4,4,{type:hf,minFilter:TH.LinearFilter,magFilter:TH.LinearFilter,samples:this.lite?0:4,depthTexture:new TH.DepthTexture(4,4)})}catch(e){rt=new TH.WebGLRenderTarget(4,4,{type:hf,depthTexture:new TH.DepthTexture(4,4)})}
  this.rt=rt;this.fs=new TH.Scene();this.fq=new TH.Mesh(new TH.PlaneGeometry(2,2),null);this.fq.frustumCulled=false;this.fs.add(this.fq);this.fc=new TH.OrthographicCamera(-1,1,1,-1,0,1);
  const T=n=>({value:n}),mat=(fs,u)=>new TH.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:u,vertexShader:VS,fragmentShader:fs});
  this.mBright=mat('uniform sampler2D tc;uniform float th,kn;varying vec2 u;void main(){vec3 c=texture2D(tc,u).rgb;if(any(isnan(c))||any(isinf(c)))c=vec3(0.);c=min(c,vec3(64.));float b=max(c.r,max(c.g,c.b));float s=clamp((b-th+kn)/(2.*kn+1e-4),0.,1.);s=s*s*kn;float w=max(b-th,s)/max(b,1e-4);gl_FragColor=vec4(c*w,1.);}',{tc:T(null),th:T(.8),kn:T(.5)});
  this.mBlur=mat('uniform sampler2D tc;uniform vec2 d;varying vec2 u;void main(){vec3 c=texture2D(tc,u).rgb*.2270270;c+=texture2D(tc,u+d*1.3846154).rgb*.3162162;c+=texture2D(tc,u-d*1.3846154).rgb*.3162162;c+=texture2D(tc,u+d*3.2307692).rgb*.0702703;c+=texture2D(tc,u-d*3.2307692).rgb*.0702703;gl_FragColor=vec4(c,1.);}',{tc:T(null),d:T(new TH.Vector2())});
  const N=this.lite?3:5,wts=[1,.9,.75,.55,.4].slice(0,N);this.N=N;this.mp=[];this.mt=[];
  for(let i=0;i<N;i++){const mk=()=>new TH.WebGLRenderTarget(4,4,{type:hf,minFilter:TH.LinearFilter,magFilter:TH.LinearFilter});this.mp.push(mk());this.mt.push(mk())}
  const cu={tc:T(null),td:T(null),texel:T(new TH.Vector2()),nr:T(.1),fr:T(400),time:T(0),asp:T(1),
   exposure:T(1),bloom:T(.35),con:T(1),sat:T(1),temp:T(0),tint:T(0),vig:T(.28),vigs:T(.55),grain:T(.02),ca:T(.0008),bars:T(0),fade:T(0),fadec:T(new TH.Vector3()),flash:T(0),flashc:T(new TH.Vector3(1,1,1)),blur:T(0),pulse:T(0),pulsec:T(new TH.Vector3(.75,0,0)),paint:T(0),pt:T(null),lift:T(new TH.Vector3()),gain:T(new TH.Vector3(1,1,1)),
   dof:T(0),focus:T(8),range:T(6),dblur:T(1),bw:T(wts)};for(let i=0;i<5;i++)cu['b'+i]=T(null);
  const bl=[0,1,2,3,4].map(i=>i<N?'bb+=texture2D(b'+i+',uv).rgb*bw['+i+'];':'').join('');wts.push(0,0,0,0,0);wts.length=5;
  this.mFinal=mat(`
uniform sampler2D tc,td,pt,b0,b1,b2,b3,b4;uniform vec2 texel;uniform float nr,fr,time,asp,exposure,bloom,con,sat,temp,tint,vig,vigs,grain,ca,bars,fade,flash,blur,pulse,paint,dof,focus,range,dblur;uniform vec3 fadec,flashc,pulsec,lift,gain;uniform float bw[5];varying vec2 u;
float lz(float d){return nr*fr/(fr-d*(fr-nr));}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 samp(vec2 uv){vec3 c=texture2D(tc,uv).rgb;if(any(isnan(c))||any(isinf(c)))c=vec3(0.);return c;}
vec3 tone(vec3 c){vec3 k=vec3(.62);vec3 hi=k+(1.-k)*tanh((max(c,k)-k)/(1.-k));return mix(c,hi,step(k,c));}
void main(){vec2 uv=u;vec2 cc=uv-.5;
 float coc=0.;if(dof>.5){float z=lz(texture2D(td,uv).x);coc=clamp((abs(z-focus)-range*.25)/range,0.,1.)*dblur*5.;}
 vec3 c;
 if(coc>.05||blur>.001){float rr=max(coc,blur*6.);vec3 s=samp(uv);float w=1.;for(int i=0;i<16;i++){float a=float(i)*2.3999632;float r=sqrt((float(i)+.5)/16.)*rr;s+=samp(uv+vec2(cos(a),sin(a))*r*texel*1.6);w+=1.;}c=s/w;}
 else{float k=ca*(.4+dot(cc,cc)*3.);c=vec3(samp(uv+cc*k).r,samp(uv).g,samp(uv-cc*k).b);}
 vec3 bb=vec3(0.);${bl}
 c+=bb*bloom;
 c*=exposure;
 c=c*vec3(1.+temp*.12+tint*.04,1.-tint*.08,1.-temp*.12+tint*.04);
 c=c*gain+lift*(1.-c);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,sat);c=(c-.18)*con+.18;c=max(c,0.);
 c=tone(c);
 float vv=1.-smoothstep(.95-vigs,.95,length(cc*vec2(asp>1.?1.:asp,asp>1.?1./asp:1.))*1.15);c*=mix(1.,vv,vig*1.6);
 if(pulse>.001){float p=smoothstep(.15,.75,length(cc)*1.3);c=mix(c,pulsec,clamp(p*pulse,0.,.95));}
 if(paint>.001){vec3 pv=texture2D(pt,uv*vec2(asp*2.2,2.2)).rgb;c*=1.+(pv.r-.5)*paint*.5;c=mix(c,c*pv.gbr*1.35,paint*.18);}
 if(grain>0.){c+=(h21(uv*vec2(1731.,911.)+time)-.5)*grain;}
 c=mix(c,fadec,clamp(fade,0.,1.));c+=flashc*clamp(flash,0.,1.);
 float bt=bars*.5;float bm=step(bt,uv.y)*step(uv.y,1.-bt);if(bars>0.)c*=bm;
 c=clamp(c,0.,1.);gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
}`,cu);this.cu=cu;
  // ملمس لوحة مرسومة (ضربات فرشاة + ورق)
  try{const n=256,cv=document.createElement('canvas');cv.width=cv.height=n;const x=cv.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,n,n);
   for(let i=0;i<900;i++){const a=Math.random()*3.14,l=8+Math.random()*30,px=Math.random()*n,py=Math.random()*n;x.strokeStyle='rgba('+[128+(Math.random()*90-45)|0,128+(Math.random()*90-45)|0,128+(Math.random()*90-45)|0]+','+(.05+Math.random()*.12)+')';x.lineWidth=2+Math.random()*5;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
   const t=new TH.CanvasTexture(cv);t.wrapS=t.wrapT=TH.RepeatWrapping;t.colorSpace=TH.NoColorSpace;cu.pt.value=t;this.pt=t}catch(e){}
  this.size(4,4)}
 set(o){const P=this.P,A={exposure:'exposure',bloom:'bloom',bloomTh:'bloomTh',bloomRad:'bloomRad',contrast:'contrast',saturation:'saturation',temperature:'temperature',tint:'tint',vignette:'vignette',vignetteSoft:'vignetteSoft',grain:'grain',aberration:'aberration',bars:'bars',fade:'fade',fadeColor:'fadeColor',flash:'flash',flashColor:'flashColor',blur:'blur',pulse:'pulse',pulseColor:'pulseColor',paint:'paint',lift:'lift',gain:'gain'};
  for(const k in o){if(k=='dof'){const d=o.dof;if(d===false||d==null||d===0)P.dof=0;else if(typeof d=='object'){P.dof=d.on===false?0:1;if(d.focus!=null)P.focusSpec=d.focus;if(d.range!=null)P.range=d.range;if(d.blur!=null)P.dofBlur=d.blur}else P.dof=1}else if(A[k]){const v=o[k];P[A[k]]=Array.isArray(v)?v.map(x=>+x):typeof v=='string'?this._col(v):+v}}return this}
 _col(s){const c=new this.TH.Color(s);return[c.r,c.g,c.b]}
 size(W,H){const rt=this.rt;if(rt.width!=W||rt.height!=H){rt.setSize(W,H);rt.depthTexture.image.width=W;rt.depthTexture.image.height=H;rt.depthTexture.needsUpdate=true}
  for(let i=0;i<this.N;i++){const w=Math.max(2,W>>(i+1)),h=Math.max(2,H>>(i+1));for(const q of[this.mp[i],this.mt[i]])if(q.width!=w||q.height!=h)q.setSize(w,h)}}
 _pass(m,tg){this.fq.material=m;this.r.setRenderTarget(tg);this.r.render(this.fs,this.fc)}
 // draw: دالة ترسم المشهد على الهدف الحالي (مثلًا outline.render أو renderer.render)
 render(draw,cam,focusDist,dt){const r=this.r,TH=this.TH,w=r.getDrawingBufferSize(this.v),W=w.x|0,H=w.y|0;this.size(W,H);this.t+=dt||.016;const P=this.P,u=this.cu,pa=r.autoClear;
  r.setRenderTarget(this.rt);r.clear();draw();
  const bloomOn=P.bloom>.001;
  if(bloomOn){const bm=this.mBright.uniforms;bm.tc.value=this.rt.texture;bm.th.value=P.bloomTh;bm.kn.value=.5;this._pass(this.mBright,this.mp[0]);
   for(let i=0;i<this.N;i++){const bu=this.mBlur.uniforms,rd=P.bloomRad*(1+i*.3);
    if(i)this._copy(this.mp[i-1],this.mp[i]);
    bu.tc.value=this.mp[i].texture;bu.d.value.set(rd/this.mp[i].width,0);this._pass(this.mBlur,this.mt[i]);
    bu.tc.value=this.mt[i].texture;bu.d.value.set(0,rd/this.mp[i].height);this._pass(this.mBlur,this.mp[i])}}
  u.tc.value=this.rt.texture;u.td.value=this.rt.depthTexture;u.texel.value.set(1/W,1/H);u.asp.value=W/H;u.time.value=this.t%100;u.nr.value=cam.near;u.fr.value=cam.far;
  u.exposure.value=P.exposure;u.bloom.value=bloomOn?P.bloom:0;u.con.value=P.contrast;u.sat.value=P.saturation;u.temp.value=P.temperature;u.tint.value=P.tint;u.vig.value=P.vignette;u.vigs.value=P.vignetteSoft;u.grain.value=P.grain;u.ca.value=P.aberration;u.bars.value=P.bars;u.fade.value=P.fade;u.fadec.value.set(...P.fadeColor);u.flash.value=P.flash;u.flashc.value.set(...P.flashColor);u.blur.value=P.blur;u.pulse.value=P.pulse;u.pulsec.value.set(...P.pulseColor);u.paint.value=P.paint;u.lift.value.set(...P.lift);u.gain.value.set(...P.gain);
  u.dof.value=P.dof;u.focus.value=focusDist||P.focus;u.range.value=P.range;u.dblur.value=P.dofBlur;for(let i=0;i<5;i++)u['b'+i].value=i<this.N?this.mp[i].texture:this.mp[0].texture;
  this._pass(this.mFinal,null);r.autoClear=pa}
 _copy(a,b){const m=this._cm||(this._cm=new this.TH.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tc:{value:null}},vertexShader:VS,fragmentShader:'uniform sampler2D tc;varying vec2 u;void main(){gl_FragColor=texture2D(tc,u);}'}));m.uniforms.tc.value=a.texture;this._pass(m,b)}
 dispose(){this.rt.dispose();this.mp.concat(this.mt).forEach(x=>x.dispose());[this.mBright,this.mBlur,this.mFinal,this._cm].forEach(m=>m&&m.dispose());this.pt&&this.pt.dispose()}}

// =====================================================================
// ============ الإصدار 3 — المؤثرات البصرية الحقيقية (FX3) ==============
// =====================================================================
// نار بألسنة لهب حقيقية (شكل + اضطراب + تدرّج حرارة)، دخان بحواف متآكلة، شرر ممتد مع الحركة، موجة صدمة، انفجار متعدد الطبقات مع ضوء وميضي.
// نمط toon (افتراضي مع المظهر الكرتوني): حواف حادّة وثلاث درجات لونية؛ نمط soft: توهج ناعم إضافي.
// الأنواع: fire|flame|torch|inferno|smoke|blacksmoke|steam|embers|sparks|explosion  (القديمة fire/smoke/sparks ترتقي تلقائيًا؛ للرجوع للقديم: v3:false)
// خيارات: n,s,life,v,spread,grav(طفو),wind,c/c2/c3,op,grow,r(نصف قطر المنبع),k(الشدة 0-2),light:{c,i,dist,flicker},once,world,toon
const NOISE='float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}';
const FXV='attribute vec3 off;attribute vec3 vel;attribute vec4 d;uniform float world,kind,asp,anc;varying vec2 vUv;varying vec4 vD;'+
'void main(){vUv=uv;vD=d;vec4 mv=(world>.5?viewMatrix:modelViewMatrix)*vec4(off,1.);float sc=world>.5?1.:length(modelMatrix[0].xyz);vec2 c=position.xy;float sz=d.x*sc;'+
'if(kind>1.5&&kind<2.5){vec3 vv=((world>.5?viewMatrix:modelViewMatrix)*vec4(vel,0.)).xyz;vec2 dir=normalize(vv.xy+1e-5);float ln=min(length(vv.xy)*.07,1.6)+.35;c=vec2(position.x*ln,position.y*.2);c=vec2(dot(c,vec2(dir.x,-dir.y)),dot(c,vec2(dir.y,dir.x)));mv.xy+=c*sz;}'+
'else{float cs=cos(d.y),sn=sin(d.y);c=vec2(c.x*asp*0.+c.x,c.y*asp);if(anc>.5)c.y+=.5*asp;c=vec2(c.x*cs-c.y*sn,c.x*sn+c.y*cs);mv.xy+=c*sz;}gl_Position=projectionMatrix*mv;}';
const FXF=NOISE+'uniform float kind,time,op,toon,age0;uniform vec3 c1,c2,c3;varying vec2 vUv;varying vec4 vD;'+
'void main(){vec2 p=vUv*2.-vec2(1.);float y=vUv.y,u=vD.z,sd=vD.w*17.3;float fade=smoothstep(0.,.08,u)*(1.-smoothstep(.5,1.,u));vec3 col=c1;float a=0.;'+
'if(kind<.5){float wid=mix(.9,.02,pow(y,.62))*(1.+.4*sin(y*3.14159));float n=fbm(vec2(p.x*1.3+sd,y*1.9-time*2.4+sd))-.5;float x=p.x+(n*.7+sin(time*2.3+sd*9.)*.3)*y*y*1.3;float dd=abs(x)/wid;a=1.-smoothstep(.5,1.,dd);a*=smoothstep(0.,.1,y)*(1.-.55*smoothstep(.8,1.,y));'+
' float core=(1.-smoothstep(0.,.7,dd))*(1.-y*.75);float heat=clamp(core*1.25+(1.-u)*.3,0.,1.);float hb=toon>.5?floor(heat*3.+.35)/3.:heat;col=mix(c3,c2,smoothstep(.12,.52,hb));col=mix(col,c1,smoothstep(.55,.95,hb));fade=smoothstep(0.,.1,u)*(1.-smoothstep(.55,1.,u));if(toon>.5)a=smoothstep(.45,.55,a);}'+
'else if(kind<1.5){float r=length(p);float n=fbm(p*1.6+sd+time*.15);a=1.-smoothstep(.3+n*.45,.98,r);float lm=p.y*.55+n-.38;col=toon>.5?mix(c2,c1,step(0.,lm)):mix(c2,c1,smoothstep(-.4,.5,lm));if(toon>.5)a=smoothstep(.42,.5,a)*.95;}'+
'else if(kind<2.5){a=smoothstep(1.,.15,abs(p.x))*smoothstep(1.,.05,abs(p.y)*1.2);col=mix(c1,c2,u);fade=1.-smoothstep(.6,1.,u);}'+
'else if(kind<3.5){float r=length(p);float rr=.2+u*.8;a=smoothstep(.1*(1.-u)+.02,0.,abs(r-rr))*(1.-u);col=c1;fade=1.;}'+
'else if(kind<4.5){float r=length(p);a=pow(clamp(1.-r,0.,1.),2.2);col=mix(c1,c2,r);fade=1.-smoothstep(.4,1.,u);}'+
'else{float r=length(p);float n=fbm(p*2.+sd)-.5;float rr=r+n*.45;a=1.-smoothstep(.55,.9,rr);float heat=clamp(1.-rr*1.1+(1.-u)*.35,0.,1.);float hb=toon>.5?floor(heat*3.+.3)/3.:heat;col=mix(c3,c2,smoothstep(.1,.5,hb));col=mix(col,c1,smoothstep(.5,.95,hb));if(toon>.5)a=smoothstep(.45,.52,a);fade=smoothstep(0.,.04,u)*(1.-smoothstep(.72,1.,u));}'+
'a*=fade*op;if(a<.004)discard;gl_FragColor=vec4(col,a);\n#include <colorspace_fragment>\n}';
export const FXTYPES=['fire','flame','torch','inferno','smoke','blacksmoke','steam','embers','sparks','explosion'];
const KIND={flame:0,smoke:1,spark:2,ring:3,glow:4,ball:5};
const hx=(TH,c)=>{const q=new TH.Color(c);return new TH.Vector3(q.r,q.g,q.b)};
function layer(TH,L,toon,root,k0){
 const n=Math.max(1,Math.round(L.n)),geo=new TH.InstancedBufferGeometry(),q=new TH.PlaneGeometry(1,1);geo.index=q.index;geo.attributes.position=q.attributes.position;geo.attributes.uv=q.attributes.uv;
 const OF=new TH.InstancedBufferAttribute(new Float32Array(n*3),3),VE=new TH.InstancedBufferAttribute(new Float32Array(n*3),3),DA=new TH.InstancedBufferAttribute(new Float32Array(n*4),4);[OF,VE,DA].forEach(a=>a.setUsage(35048));
 geo.setAttribute('off',OF);geo.setAttribute('vel',VE);geo.setAttribute('d',DA);geo.instanceCount=n;
 const blend=L.blend||(toon&&L.kind!='spark'&&L.kind!='glow'&&L.kind!='ring'?'normal':'add'),
 mt=new TH.ShaderMaterial({userData:OL,transparent:true,depthWrite:false,fog:false,blending:blend=='add'?2:1,vertexShader:FXV,fragmentShader:FXF,side:2,
  uniforms:{world:{value:L.world?1:0},kind:{value:KIND[L.kind]},asp:{value:L.asp||1},anc:{value:L.anchor=='bottom'?1:0},time:{value:0},op:{value:L.op??1},toon:{value:toon?1:0},c1:{value:hx(TH,L.c1)},c2:{value:hx(TH,L.c2||L.c1)},c3:{value:hx(TH,L.c3||L.c2||L.c1)}}});
 const mesh=new TH.Mesh(geo,mt);mesh.frustumCulled=false;mesh.renderOrder=L.ro??5;root.add(mesh);
 const P=new Float32Array(n*3),V=new Float32Array(n*3),A=new Float32Array(n),Lf=new Float32Array(n),S0=new Float32Array(n),Ro=new Float32Array(n),Rv=new Float32Array(n),Sd=new Float32Array(n),dead=new Uint8Array(n),R=Math.random;
 let K=k0??1,t=0,once=!!L.once,fin=false;const life=L.life||1,v=L.v||[0,1,0],sp=L.spread??.3,r0=L.r??.1,rad=L.radial,sj=L.sj??.35,g=L.buoy??0,dr=L.drag??0,wd=L.wind||[0,0,0],dl=L.delay||0,s0=L.s0??.5,s1=L.s1??s0,pw=L.pw??1,wob=L.wob??0;
 const spawn=(i,pre)=>{const j=3*i,a=R()*6.2832,rr=Math.sqrt(R())*r0;
  let ox=Math.cos(a)*rr,oy=(R()-.5)*(L.h||0),oz=Math.sin(a)*rr;
  if(L.world&&root.parent){root.updateWorldMatrix(true,false);const p=new TH.Vector3(ox,oy,oz).applyMatrix4(root.matrixWorld);ox=p.x;oy=p.y;oz=p.z}
  P[j]=ox;P[j+1]=oy;P[j+2]=oz;
  if(rad){const th=R()*6.2832,ph=Math.acos(2*R()-1),sp2=rad[0]+R()*(rad[1]-rad[0]);V[j]=Math.sin(ph)*Math.cos(th)*sp2;V[j+1]=Math.abs(Math.cos(ph))*sp2*(L.up??1)+(v[1]||0);V[j+2]=Math.sin(ph)*Math.sin(th)*sp2}
  else{V[j]=v[0]+(R()-.5)*2*sp;V[j+1]=v[1]*(.75+R()*.5);V[j+2]=v[2]+(R()-.5)*2*sp;if(L.world&&root.parent){const q=new TH.Vector3(V[j],V[j+1],V[j+2]).transformDirection(root.matrixWorld).multiplyScalar(Math.hypot(V[j],V[j+1],V[j+2]));V[j]=q.x;V[j+1]=q.y;V[j+2]=q.z}}
  Lf[i]=life*(.7+R()*.6);A[i]=pre?R()*Lf[i]:0;S0[i]=s0*(1-sj+R()*sj*2);Ro[i]=L.kind=='flame'?(R()-.5)*(L.lean??.25):R()*6.28;Rv[i]=(R()-.5)*(L.rv??.6);Sd[i]=R();dead[i]=0};
 const reset=()=>{t=0;fin=false;for(let i=0;i<n;i++){spawn(i,!once);if(once){A[i]=-dl-R()*(L.stag??.12);}}};reset();
 const update=dt=>{t+=dt;mt.uniforms.time.value=(mt.uniforms.time.value+dt)%1000;let alive=0;
  for(let i=0;i<n;i++){const j=3*i;
   if(dead[i]){if(!once&&K>.02&&R()<K*dt*n/life*.8)spawn(i,false);else{DA.array[4*i]=0;continue}}
   A[i]+=dt;if(A[i]<0){DA.array[4*i]=0;alive++;continue}
   if(A[i]>=Lf[i]){if(once){dead[i]=1;DA.array[4*i]=0;continue}if(R()<K)spawn(i,false);else{dead[i]=1;DA.array[4*i]=0;continue}}
   alive++;const u=A[i]/Lf[i],dm=1-Math.min(1,dr*dt);V[j]*=dm;V[j+1]=V[j+1]*dm+g*dt;V[j+2]*=dm;
   const w=wob?Math.sin(t*3+Sd[i]*30)*wob:0;P[j]+=(V[j]+wd[0]+w)*dt;P[j+1]+=(V[j+1]+wd[1])*dt;P[j+2]+=(V[j+2]+wd[2]+w*.7)*dt;
   OF.array[j]=P[j];OF.array[j+1]=P[j+1];OF.array[j+2]=P[j+2];VE.array[j]=V[j]+wd[0];VE.array[j+1]=V[j+1]+wd[1];VE.array[j+2]=V[j+2]+wd[2];
   Ro[i]+=Rv[i]*dt*(L.kind=='flame'?.3:1);const sz=(s0==s1?S0[i]:S0[i]*(1+(s1/s0-1)*Math.pow(u,pw)))*(L.kind=='flame'||L.kind=='ball'?(.4+.6*Math.min(1,K)):1);
   DA.array[4*i]=sz;DA.array[4*i+1]=Ro[i];DA.array[4*i+2]=u;DA.array[4*i+3]=Sd[i]}
  if(once&&!alive)fin=true;OF.needsUpdate=VE.needsUpdate=DA.needsUpdate=true};
 return{update,reset,setK:k=>K=k,get done(){return fin},mt,mesh,dispose:()=>{geo.dispose();mt.dispose()}}}
// مواصفات الطبقات لكل نوع. o = خيارات المستخدم
function presets(type,o,toon){
 const s=o.s??.6,life=o.life,n=o.n,c=o.c,v=o.v,sp=o.spread,gr=o.grav,wi=o.wind,grow=o.grow,op=o.op,r=o.r,W=!!o.world,lt=c3=>c3;
 const F=(sc,nn,ex)=>({kind:'flame',anchor:'bottom',asp:1.35,n:(n??48)*nn,s0:s*sc,s1:s*sc*.55,life:life??1.05,v:v||[0,1.5,0],spread:sp??.16,r:r??.22,buoy:gr??.5,wind:wi,wob:.15,world:W,c1:'#fff3b8',c2:'#ffa51f',c3:'#e5381a',...ex});
 const SM=(sc,nn,ex)=>({kind:'smoke',n:(n??26)*nn,s0:s*sc,s1:s*sc*(1+(grow??2.6)),life:life??3.2,v:v||[0,1.0,0],spread:sp??.3,r:r??.25,buoy:gr??.2,wind:wi,op:op??.55,world:W,sj:.3,ro:3,c1:o.c||'#7a7a7e',c2:o.c2||'#3b3b40',...ex});
 const EM=(nn,ex)=>({kind:'spark',n:(n??24)*nn,s0:.07,s1:.05,life:life??1.6,v:v||[0,1.6,0],spread:sp??.9,r:r??.3,buoy:gr??-.3,wind:wi,world:W,c1:'#fff1c0',c2:'#ff7a1a',blend:'add',ro:6,...ex});
 if(type=='fire'||type=='flame')return{L:[F(1,1)],light:{c:'#ff9a3a',i:1.6,dist:7,flicker:.35}};
 if(type=='torch')return{L:[F(.55,.6,{r:.08,spread:.07}),EM(.4,{s0:.05})],light:{c:'#ff9a3a',i:1.3,dist:6,flicker:.4}};
 if(type=='inferno')return{L:[F(1.9,1,{r:.55,n:(n??48)*1.1}),F(1.2,.6,{r:.4,c3:'#ff5a14',c2:'#ffd147',c1:'#ffffff',life:.8}),EM(1.2,{r:.6}),SM(1.6,.9,{v:[0,1.8,0],r:.5,op:.6,c1:'#46464c',c2:'#1f1f23',s0:s*1.4})],light:{c:'#ff8a2a',i:3.2,dist:14,flicker:.45}};
 if(type=='smoke')return{L:[SM(1,1)]};
 if(type=='blacksmoke')return{L:[SM(1.2,1,{c1:'#2b2b2f',c2:'#101012',op:.8,v:v||[0,1.6,0],life:life??3.6})]};
 if(type=='steam')return{L:[SM(.8,.9,{c1:'#f2f4f8',c2:'#c9ced8',op:.35,life:life??2.2,v:v||[0,1.3,0],buoy:.4})]};
 if(type=='embers')return{L:[EM(1.2,{s0:.05,n:n??40,r:r??1,buoy:.35,v:v||[0,.6,0],life:life??3})]};
 if(type=='sparks')return{L:[EM(1,{buoy:gr??-6,v:v||[0,3,0],spread:sp??1.6,life:life??1.2,s0:.1,n:n??40})]};
 if(type=='explosion'){const q=(o.size??1);return{once:true,L:[
   {kind:'glow',n:1,s0:5.5*q,s1:9*q,life:.35,c1:'#fff6d0',c2:'#ffb040',blend:'add',once:true,ro:7,pw:.5},
   {kind:'ball',n:16,s0:1.1*q,s1:3.4*q,life:1.0,radial:[1.5*q,6.5*q],up:.7,drag:2.2,once:true,c1:'#fff3b8',c2:'#ff9a22',c3:'#d8301a',stag:.08,ro:5,sj:.4,pw:.6,rv:.8,buoy:1},
   {kind:'ring',n:1,s0:10*q,s1:10*q,life:.55,c1:'#ffe9b0',blend:'add',once:true,ro:6},
   EM(2.2,{once:true,radial:[6*q,17*q],buoy:-8,life:1.3,s0:.16,stag:.04}),
   SM(2,.7,{once:true,s0:1.4*q,s1:5*q,radial:[1*q,4*q],up:.5,drag:1.4,life:3.6,c1:'#5b5b60',c2:'#232326',op:.8,n:20,buoy:.4,delay:.12,stag:.2})],light:{c:'#ffb050',i:14,dist:30,flash:true}}}
 return null}
export function mkFX3(TH,o,toon){
 const T=toon??o.toon??true,pr=presets(o.type,o,T);if(!pr)return null;const g=new TH.Group(),ls=[];let K=o.k??1;
 const qs=o.scale??1,sc=Math.max(.45,Math.sqrt(qs));
 pr.L.forEach(L=>{const l2={...L,n:Math.max(2,Math.round(L.n*sc)),world:L.world};ls.push(layer(TH,l2,T,g,K))});
 let light=null,lm=pr.light&&o.light!==false?{...pr.light,...(typeof o.light=='object'?o.light:{})}:null;
 if(lm){light=new TH.PointLight(lm.c,0,lm.dist,2);light.position.y=.6;g.add(light)}
 let t=0,fl=0;const api={o:g,layers:ls,
  update:(dt)=>{t+=dt;if(!g.visible)return;ls.forEach(l=>l.update(dt));
   if(light){if(lm.flash){const u=Math.min(1,t/.9);light.intensity=lm.i*Math.exp(-u*5)*(u<1?1:0)}else{fl+=dt;const f=1+(Math.sin(fl*23)*.5+Math.sin(fl*37+1)*.3+Math.sin(fl*9)*.2)*(lm.flicker??.3);light.intensity=lm.i*K*f}}},
  restart(){t=0;ls.forEach(l=>l.reset());g.visible=true},setK(k){K=k;ls.forEach(l=>l.setK(k))},
  get done(){return pr.once&&ls.every(l=>l.done)},dispose(){ls.forEach(l=>l.dispose())}};
 g.userData.fxo=api;return api}

// =====================================================================
// ============ الإصدار 3 — الشخصية البشرية (Human) ======================
// =====================================================================
// جسم بنسب حقيقية (نحت بالحلقات loft)، وجه كامل: عيون بقزحية وجفون ترمش وتعبّر، حواجب، فم ديناميكي (ابتسامة/فتح/حروف)، أنف وأذنان،
// شعر بعدة تسريحات، حجاب/غترة/قبعات، لحية ونظارات، ملابس بطبقات (قميص، هودي، جاكيت، فستان، عباءة، ثوب...)، أيدٍ بأصابع تنقبض، أحذية.
// حركة طبقية: وضعية أساسية (وقوف/جلوس/مشي/انحناء...) + إيماءة (تلويح/إشارة/تغطية الوجه...) + تعبير وجه + كلام + نظر بالعيون والرأس + تنفّس وطرفة + IK للأذرع.
// الواجهة القديمة (set/get/speak/look/ik/tick/G) كما هي؛ والجديد: talk(on) expr(name,w) gesture(name,dur) hands(pose) gaze(...).
export const HUMAN_OPT={
 hair:[['bald','أصلع'],['buzz','حليق خفيف'],['short','قصير'],['side','قصير بفرق'],['bob','بوب'],['long','طويل'],['wavy','طويل مموّج'],['ponytail','ذيل حصان'],['bun','كعكة'],['curly','مجعّد'],['afro','أفرو'],['cap','قبعة (قديم)']],
 cover:[['none','بلا'],['hijab','حجاب'],['ghutra','غترة وعقال'],['taqiyah','طاقية'],['cap','كاب'],['beanie','قبعة صوف']],
 beard:[['none','بلا'],['stubble','خفيفة'],['short','قصيرة'],['full','كثّة'],['mustache','شارب']],
 acc:[['none','بلا'],['glasses','نظارة'],['sun','نظارة شمسية'],['scarf','وشاح'],['beard','لحية (قديم)']],
 top:[['tee','تيشيرت'],['shirt','قميص'],['hoodie','هودي'],['sweater','كنزة'],['jacket','جاكيت'],['coat','معطف'],['blouse','بلوزة'],['dress','فستان'],['abaya','عباءة'],['thobe','ثوب'],['suit','بدلة'],['tank','حمّالات']],
 bot:[['jeans','جينز'],['trousers','بنطال'],['shorts','شورت'],['skirt','تنورة'],['none','بلا']],
 shoe:[['sneaker','رياضي'],['boot','بوت'],['flat','مسطّح'],['heel','كعب'],['sandal','صندل']],
 sex:[['n','محايد'],['m','رجل'],['f','امرأة']],face:[['oval','بيضاوي'],['round','مستدير'],['square','مربّع'],['long','طويل']],
 nose:[['small','صغير'],['med','متوسط'],['big','كبير']],pat:[['','سادة'],['stripes','خطوط'],['checker','مربعات'],['dots','نقاط']]};
export const EXPR={
 neutral:{},
 happy:{smile:.7,lid:1,squint:.25,browUp:.1,open:.12},
 smile:{smile:.45,squint:.1},
 laugh:{smile:1,open:.6,squint:.55,browUp:.15},
 sad:{smile:-.5,browIn:.75,browUp:-.1,lid:.82,mw:.9},
 cry:{smile:-.75,browIn:.9,lid:.6,squint:.5,open:.25,mw:1.05},
 worried:{smile:-.25,browIn:.7,browUp:.3,lid:1.05,open:.08},
 scared:{smile:-.3,browIn:.5,browUp:.85,lid:1.45,open:.45,mw:1.1},
 terrified:{smile:-.4,browIn:.65,browUp:1,lid:1.55,open:.75,mw:1.15},
 panic:{smile:-.35,browIn:.55,browUp:.9,lid:1.5,open:.6,mw:1.1},
 angry:{smile:-.45,browIn:-.85,browUp:-.35,lid:.8,squint:.35,mw:.95},
 surprised:{browUp:1,lid:1.4,open:.5,mw:.75},
 shocked:{browUp:.9,lid:1.5,open:.35,smile:-.1},
 disgust:{smile:-.5,browIn:-.4,browUp:-.15,lid:.75,squint:.55,mw:.8},
 pain:{smile:-.4,browIn:.6,lid:.4,squint:.7,open:.3},
 tired:{lid:.55,browUp:-.2,smile:-.1},
 thinking:{browIn:-.2,browUp:.2,lid:.9,smile:-.05,mw:.8},
 determined:{browIn:-.6,browUp:-.15,lid:.9,smile:-.1,mw:.95},
 relieved:{smile:.35,lid:.75,browUp:.25,browIn:.3,open:.15},
 smirk:{smile:.35,smileL:-.2,browUp:.1,lid:.9},
 hopeful:{smile:.2,browIn:.5,browUp:.45,lid:1.1}};
const FXN=['smile','smileL','smileR','open','mw','pucker','browUp','browIn','browAsym','lid','lidL','lidR','squint','head','look'];
export const HANDS={relax:[.28,.4,.25],open:[0,.02,-.1],fist:[1.35,1.45,.75],point:[0,1.35,.65],grip:[1.0,1.1,.55],flat:[.05,.05,-.15],pinch:[.8,.8,.5],claw:[.7,.75,.2]};
const rgx=(a,b,u)=>a+(b-a)*u,CL=(x,a,b)=>Math.max(a,Math.min(b,x));
// نحت بالحلقات: rings=[{y,rx,rz,cx,cz,gap}] من الأسفل للأعلى. gap=نصف زاوية الفتحة الأمامية (راديان). caps:[أسفل،أعلى]
const catm=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
function subRings(rs,sub){if(sub<=1||rs.length<3)return rs;const O=[],K=['y','rx','rz','cx','cz','gap'],g=(r,k)=>r[k]||0;for(let i=0;i<rs.length-1;i++){const p0=rs[Math.max(0,i-1)],p1=rs[i],p2=rs[i+1],p3=rs[Math.min(rs.length-1,i+2)];for(let s=0;s<sub;s++){const t=s/sub,o={};K.forEach(k=>o[k]=catm(g(p0,k),g(p1,k),g(p2,k),g(p3,k),t));if(!rs.some(r=>r.gap))delete o.gap;if(o.gap<0)o.gap=0;O.push(o)}}O.push({...rs[rs.length-1]});return O}
export function loft(TH,rings,o){o=o||{};if(rings.length>1&&rings[0].y>rings[rings.length-1].y){rings=[...rings].reverse();if(o.caps)o={...o,caps:[o.caps[1],o.caps[0]]}}rings=subRings(rings,o.sub??3);const seg=o.seg||20,n=rings.length,P=[],I=[],UV=[];
 for(let i=0;i<n;i++){const r=rings[i],gap=r.gap||0,full=!(o.open||gap>0);for(let k=0;k<=seg;k++){const u=k/seg,a=full?u*6.2832:gap+(6.2832-2*gap)*u;P.push((r.cx||0)+Math.sin(a)*r.rx,r.y,(r.cz||0)+Math.cos(a)*r.rz);UV.push(u,i/(n-1))}}
 const w=seg+1;for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++){const a=i*w+k,b=a+1,c=a+w,d=c+1;I.push(a,b,c,b,d,c)}
 let base=P.length/3;
 const cap=(i,up)=>{const r=rings[i],full=!(o.open||r.gap>0);if(!full)return;const c=base++;P.push(r.cx||0,r.y,r.cz||0);UV.push(.5,up?1:0);for(let k=0;k<seg;k++){const a=i*w+k,b=a+1;up?I.push(c,a,b):I.push(c,b,a)}};
 if(o.caps&&o.caps[0])cap(0,false);if(o.caps&&o.caps[1])cap(n-1,true);
 const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(P,3));g.setAttribute('uv',new TH.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
 // دمج الدرز: تنعيم عند عمود البداية/النهاية
 if(!o.open&&!rings.some(r=>r.gap>0)){const nr=g.attributes.normal;for(let i=0;i<n;i++){const a=i*w,b=i*w+seg,x=nr.getX(a)+nr.getX(b),y=nr.getY(a)+nr.getY(b),z=nr.getZ(a)+nr.getZ(b),l=Math.hypot(x,y,z)||1;nr.setXYZ(a,x/l,y/l,z/l);nr.setXYZ(b,x/l,y/l,z/l)}}
 return g}
const ring=(y,rx,rz,e)=>({y,rx,rz,...(e||{})});
const scl=(rs,k,add)=>rs.map(r=>({...r,rx:r.rx*k+(add||0),rz:r.rz*k+(add||0)}));
const lerpRings=(a,b,u)=>a.map((r,i)=>({y:rgx(r.y,b[i].y,u),rx:rgx(r.rx,b[i].rx,u),rz:rgx(r.rz,b[i].rz,u),cx:rgx(r.cx||0,b[i].cx||0,u),cz:rgx(r.cz||0,b[i].cz||0,u)}));
const HEAD=[ring(-.135,.02,.03,{cz:.04}),ring(-.122,.045,.058,{cz:.035}),ring(-.098,.072,.082,{cz:.022}),ring(-.06,.092,.097,{cz:.006}),ring(-.02,.101,.104),ring(.03,.104,.108,{cz:-.002}),ring(.075,.099,.106,{cz:-.006}),ring(.11,.082,.094,{cz:-.01}),ring(.135,.052,.068,{cz:-.012}),ring(.147,.016,.03,{cz:-.012})];
const headRings=(f,jawW)=>{const R=HEAD.map(r=>({...r}));const sq=f=='square'?1.12:f=='round'?1.05:f=='long'?.93:1;R[2].rx*=sq;R[3].rx*=sq;R[1].rx*=sq*(f=='square'?1.25:1);if(f=='round'){R[0].rx*=1.3;R[1].rx*=1.1;R.forEach(r=>r.rz*=1.02)}if(f=='long'){R.forEach(r=>r.y*=1.07)}
 R.forEach(r=>{r.rx*=jawW});return R};
const frontZ=(R,y)=>{for(let i=0;i<R.length-1;i++){if(y>=R[i].y&&y<=R[i+1].y){const u=(y-R[i].y)/(R[i+1].y-R[i].y);return rgx((R[i].cz||0)+R[i].rz,(R[i+1].cz||0)+R[i+1].rz,u)}}return(R[R.length-1].cz||0)+R[R.length-1].rz};
const widthAt=(R,y)=>{for(let i=0;i<R.length-1;i++){if(y>=R[i].y&&y<=R[i+1].y){const u=(y-R[i].y)/(R[i+1].y-R[i].y);return rgx(R[i].rx,R[i+1].rx,u)}}return R[R.length-1].rx};
export function mkHuman(TH,l0,M){
 const l={h:1,w:1,skin:'#e8b890',hair:'short',hc:'#3a2a1e',top:'#4a6fa5',bot:'#2b2f3a',shoe:'#1a1a1a',eye:'#3a2a1c',acc:'none',ac:'#c0392b',tt:'tee',sex:'n',face:'oval',nose:'med',cover:'none',beard:'none',pat:'',lip:'',brow:'',age:0,bust:0,sleeve:'',len:'',botk:'',shoek:'',v:2,...l0};
 // توافق قديم
 if(l.tt&&['tee','coat'].includes(l.tt)&&!l0.top2)l.top2=l.tt;const top=l0.top2||(['tee','shirt','hoodie','sweater','jacket','coat','blouse','dress','abaya','thobe','suit','tank'].includes(l.tt)?l.tt:'tee');
 let hair=l.hair,cover=l.cover,beard=l.beard,acc=l.acc;if(hair=='cap'){cover='cap';hair='short'}if(acc=='beard'){beard='short';acc='none'}if(cover=='hijab'||cover=='ghutra')hair='bald';
 const male=l.sex=='m',fem=l.sex=='f',W=l.w,H=+l.h||1,kid=H<.92?(.92-H)*1.5:0,hs=(1+kid*.9)*(l.hs||1),skin=l.skin,cache=new Map();
 const mt=(c,o)=>{const k=c+(o?JSON.stringify(o):'');let m=cache.get(k);if(!m){m=M(c);if(o&&o.nol)m.userData={...m.userData,...OL};if(o&&o.side)m.side=o.side;if(o&&o.mat)skinMat(TH,m,o.mat);cache.set(k,m)}return m};
 const root=new TH.Group(),g=new TH.Group();root.add(g);g.scale.setScalar(H);
 // ---- العظام (نفس تسلسل mkRig لتتوافق الحركات والـIK) ----
 const bk=fem?{hip:.178,waist:.122,chest:.15,sh:.168}:male?{hip:.158,waist:.142,chest:.178,sh:.205}:{hip:.166,waist:.13,chest:.164,sh:.188},bw=Math.sqrt(W)*(1+kid*.1);
 const sx=(bk.sh-.01)*bw,hx=(male?.092:fem?.1:.095)*Math.sqrt(W),
 pv={body:[0,.93,0],spine:[0,1.05,0],neck:[0,1.5,0],head:[0,1.545,0],jaw:[0,1.62,.03],armR:[sx,1.43,0],armL:[-sx,1.43,0],elbowR:[sx+.008,1.15,0],elbowL:[-sx-.008,1.15,0],handR:[sx+.016,.895,0],handL:[-sx-.016,.895,0],fingR:[sx+.016,.835,0],fingL:[-sx-.016,.835,0],
  legR:[hx,.9,0],legL:[-hx,.9,0],kneeR:[hx,.5,0],kneeL:[-hx,.5,0],footR:[hx,.085,0],footL:[-hx,.085,0]};
 const G={};BONES.forEach(([b])=>G[b]=new TH.Group());G.body.position.set(...pv.body);g.add(G.body);
 BONES.slice(1).forEach(([b])=>{const P=BP[b],q=pv[P];G[b].position.set(pv[b][0]-q[0],pv[b][1]-q[1],pv[b][2]-q[2]);G[P].add(G[b])});G.head.rotation.order=G.neck.rotation.order='YXZ';
 const put=(bone,geo,mat,pos,rot,sc,opt)=>{const m=new TH.Mesh(geo,mat);const b=pv[bone];m.position.set((pos?pos[0]:0)-b[0],(pos?pos[1]:0)-b[1],(pos?pos[2]:0)-b[2]);if(rot)m.rotation.set(...rot);if(sc)m.scale.set(...sc);m.castShadow=!(opt&&opt.ns);m.receiveShadow=true;G[bone].add(m);return m};
 const ur=(bone,rs,mat,o)=>put(bone,loft(TH,rs,o),mat,[0,0,0]);
 const ageK=CL((l.age||0),0,1);
 // ===== الجذع =====

 const T=(y,rx,rz)=>ring(y,rx*bw,rz*bw*(1+(fem?0:0)));
 const torsoLow=[T(.84,.13,.095),T(.89,.158,.108),T(.94,bk.hip,.118),T(1.0,(bk.hip+bk.waist)/2,.108),T(1.05,bk.waist,.1)];
 const torsoUp=[T(1.05,bk.waist,.1),T(1.12,(bk.waist+bk.chest)/2,.105),T(1.22,bk.chest,.118+(fem?.012:0)),T(1.33,bk.chest+.008,.115),T(1.4,bk.sh+.018,.1),T(1.45,.125,.082),T(1.485,.08,.062),T(1.5,.055,.055)];
 ur('body',torsoLow,mt(skin),{caps:[1,0]});ur('spine',torsoUp,mt(skin),{caps:[0,1]});
 // عنق
 ur('neck',[ring(1.44,.052,.054),ring(1.52,.045,.047),ring(1.6,.043,.046,{cz:.004})],mt(skin),{caps:[0,0]});
 // ===== الأطراف (جلد) =====
 const lim=(bone,x,rs,mat)=>{const mm=rs.map(r=>({...r,cx:x}));return ur(bone,mm,mat,{seg:14,caps:[1,1]})};
 const aw=(.052+kid*.0)*Math.sqrt(W),legw=Math.sqrt(W);
 const SK=mt(skin);
 [[1,'R'],[-1,'L']].forEach(([s,S])=>{const ax=pv['arm'+S][0],ex=pv['elbow'+S][0],hx_=pv['hand'+S][0];
  put('arm'+S,new TH.SphereGeometry(.05*Math.sqrt(W),12,10),SK,[ax,1.405,0]);
  lim('arm'+S,ax,[ring(1.415,aw,aw*.96),ring(1.3,aw*.92,aw*.9),ring(1.16,aw*.78,aw*.76)],SK);
  put('elbow'+S,new TH.SphereGeometry(.042*Math.sqrt(W),10,8),SK,[ex,1.15,0]);
  lim('elbow'+S,ex,[ring(1.16,aw*.76,aw*.74),ring(1.02,aw*.68,aw*.64),ring(.9,aw*.52,aw*.5)],SK);
  // كف
  ur('hand'+S,[ring(.9,.028,.017,{cx:hx_}),ring(.865,.034,.018,{cx:hx_}),ring(.82,.036,.017,{cx:hx_}),ring(.795,.032,.015,{cx:hx_})],SK,{seg:12,caps:[1,1]});
  // أصابع: سبابة، وسطى(3 أصابع)، إبهام
  const FM=mt(skin,{nol:1});FM.userData={outlineParameters:{thickness:.0012}};const fg=(nm,px,py,pz,r1,r2,len,curlIdx)=>{const grp=new TH.Group();grp.position.set(px-pv['fing'+S][0],py-pv['fing'+S][1],pz);G['fing'+S].add(grp);const s1=new TH.Mesh(new TH.CapsuleGeometry(r1,len*.55,4,8),FM);s1.position.y=-len*.3;s1.castShadow=true;grp.add(s1);const g2=new TH.Group();g2.position.y=-len*.62;grp.add(g2);const s2=new TH.Mesh(new TH.CapsuleGeometry(r2,len*.5,4,8),FM);s2.position.y=-len*.25;s2.castShadow=true;g2.add(s2);return{grp,g2,s:S==='R'?-1:1}};
  const f1=fg('idx',hx_+(S=='R'?-.011:.011),.8,.012,.0095,.0085,.07),f2=fg('mid',hx_,.8,-.004,.0145,.013,.07),f3=fg('thb',hx_+(S=='R'?-.03:.03),.855,.014,.011,.0095,.058);
  (G['fing'+S].userData.f=[f1,f2,f3]);
  // مفصل رسغ الغاية
 });
 // أرجل
 const SH=mt(l.shoe),BT=mt(l.bot);
 [[1,'R'],[-1,'L']].forEach(([s,S])=>{const x=pv['leg'+S][0],lw=legw*(fem?1.05:1);
  put('leg'+S,new TH.SphereGeometry(.076*Math.sqrt(W),10,8),SK,[x,.9,0]);
  lim('leg'+S,x,[ring(.92,.098*lw,.1*lw),ring(.78,.086*lw,.09*lw),ring(.52,.062*lw,.064*lw)],SK);
  put('knee'+S,new TH.SphereGeometry(.058*lw,10,8),SK,[x,.5,.004]);
  lim('knee'+S,x,[ring(.52,.062*lw,.064*lw),ring(.38,.066*lw,.07*lw,{cz:-.008}),ring(.2,.047*lw,.049*lw),ring(.09,.04*lw,.042*lw)],SK);
 });
 // أحذية
 const shoeK=l.shoek||'sneaker';
 [[1,'R'],[-1,'L']].forEach(([s,S])=>{const x=pv['foot'+S][0],hl=shoeK=='heel';
  const sg=new TH.CapsuleGeometry(.047,.17,6,12);const sh1=put('foot'+S,sg,SH,[x,.05,.06],[Math.PI/2,0,0],[1.04,1,.78]);
  put('foot'+S,new TH.BoxGeometry(.1,.016,.24),mt(shoeK=='sandal'?'#6b4a2e':'#e8e8e8'),[x,.012,.065]);
  if(shoeK=='boot')put('foot'+S,new TH.CylinderGeometry(.05,.055,.2,12),SH,[x,.17,-.005]);
  if(hl){sh1.rotation.x=Math.PI/2+.35;sh1.position.y=.07;put('foot'+S,new TH.BoxGeometry(.03,.07,.03),SH,[x,.035,-.045])}
 });
 // ===== الرأس =====
 const jaw=(l.jaw||1),HR=headRings(l.face,jaw).map(r=>({...r,rx:r.rx*hs,rz:r.rz*hs,y:r.y*hs,cx:(r.cx||0)*hs,cz:(r.cz||0)*hs}));
 const HC=1.555+.12*hs;// مركز الرأس
 const headSkin=put('head',loft(TH,HR.map(r=>({...r,y:r.y+HC})),{seg:32,caps:[1,1],sub:4}),SK,[0,0,0]);
 const HY=y=>HC+y*hs,fz=y=>frontZ(HR,y*hs)*1,wd=y=>widthAt(HR,y*hs);
 // أذنان
 [1,-1].forEach(s=>put('head',new TH.SphereGeometry(.02*hs,10,8),SK,[s*(wd(0)-.004),HY(-.005*hs),HC*0+(-.008*hs)],0,[.5,1.1,.8]));
 // أنف
 const nz={small:.8,med:1,big:1.25}[l.nose]||1;
 put('head',new TH.SphereGeometry(.013*hs*nz,12,10),SK,[0,HY(-.034),fz(-.034)+.0005*hs],[.3,0,0],[.8,1.25,1.05]);
 put('head',new TH.SphereGeometry(.0085*hs*nz,10,8),SK,[0,HY(-.048),fz(-.046)+.0055*hs],0,[1.5,.85,1]);
 // عيون
 const eyes=[],lids=[],eyeX=.04*hs,eyeY=.02,eyeR=.0225*hs,irisC=l.eye;
 const NOL={nol:1};
 [-1,1].forEach(s=>{const eg=new TH.Group();const ez=fz(eyeY)-.012*hs;eg.position.set(s*eyeX,HY(eyeY)-pv.head[1],ez-pv.head[2]);G.head.add(eg);
  const wh=new TH.Mesh(new TH.SphereGeometry(eyeR,16,12),mt('#f6f3ec',NOL));wh.scale.set(1,1.04,.62);eg.add(wh);
  const ir=new TH.Group();eg.add(ir);const zf=eyeR*.62-.001;
  const iris=new TH.Mesh(new TH.CircleGeometry(eyeR*.55,24),mt(irisC,NOL));iris.position.z=zf;ir.add(iris);
  const pup=new TH.Mesh(new TH.CircleGeometry(eyeR*.3,16),mt('#0d0b0b',NOL));pup.position.z=zf+.0007;ir.add(pup);
  const hl=new TH.Mesh(new TH.CircleGeometry(eyeR*.14,10),new TH.MeshBasicMaterial({color:'#ffffff',userData:OL.outlineParameters?OL:undefined}));hl.material.userData={...OL};hl.position.set(eyeR*.2,eyeR*.22,zf+.0014);ir.add(hl);
  const mkLid=(up)=>{const lg=new TH.Group();eg.add(lg);const lm=new TH.Mesh(new TH.SphereGeometry(eyeR*1.09,16,10,0,6.2832,0,1.5708),mt(skin,{nol:1,side:2}));lm.scale.set(1.03,1.04,.7);if(!up)lm.rotation.x=Math.PI;lg.add(lm);return lg};
  const lu=mkLid(true),ld=mkLid(false);eyes.push({eg,ir,s,lu,ld,rx:eyeR});});
 // حواجب
 const browC=l.brow||l.hc,browG=[-1,1].map(s=>{const bg=new TH.Group();bg.position.set(s*eyeX*1.02,HY(.058)-pv.head[1],fz(.058)-.003*hs-pv.head[2]);G.head.add(bg);const bm=new TH.Mesh(new TH.CapsuleGeometry(.0048*hs,.042*hs,4,8),mt(browC,NOL));bm.rotation.z=Math.PI/2;bm.scale.set(1,1,.8);bg.add(bm);return{bg,s}});
 // الفم الديناميكي
 const MP=18,mouthZ=fz(-.078)+.004*hs,mouthY=HY(-.078)-pv.head[1],lipC=l.lip||(fem?'#b5525a':'#a8605a');
 const mkStrip=(mat)=>{const gm=new TH.BufferGeometry();gm.setAttribute('position',new TH.Float32BufferAttribute(new Float32Array((MP+1)*2*3),3));{const nn=new Float32Array((MP+1)*2*3);for(let i=2;i<nn.length;i+=3)nn[i]=1;gm.setAttribute('normal',new TH.Float32BufferAttribute(nn,3));gm.setAttribute('uv',new TH.Float32BufferAttribute(new Float32Array((MP+1)*2*2),2))}const I=[];for(let i=0;i<MP;i++){const a=2*i;I.push(a,a+1,a+2,a+1,a+3,a+2)}gm.setIndex(I);const me=new TH.Mesh(gm,mat);me.frustumCulled=false;me.position.set(0,mouthY,mouthZ-pv.head[2]);G.head.add(me);return me};
 const mIn=mkStrip(mt('#2a0e10',{nol:1,side:2})),mTeeth=mkStrip(mt('#f2eee6',{nol:1,side:2})),mUp=mkStrip(mt(lipC,{nol:1,side:2})),mLo=mkStrip(mt(lipC,{nol:1,side:2}));mUp.renderOrder=3;mLo.renderOrder=3;mIn.renderOrder=1;mTeeth.renderOrder=2;
 const mouthApply=(a,s,sl,sr,op,pk)=>{ // a=نصف العرض، s=ابتسامة -1..1، op=فتح 0..1
  const gap=op*.036*hs,lt=(.0065+(1-op)*.0025)*hs;const set=(me,fn)=>{const p=me.geometry.attributes.position;for(let i=0;i<=MP;i++){const u=i/MP*2-1,x=u*a;const[y0,y1]=fn(u,x);p.setXYZ(2*i,x,y0,0);p.setXYZ(2*i+1,x,y1,0)}p.needsUpdate=true};
  const corner=u=>{const sm=u<0?sl:sr;return (sm*.0125*hs)*Math.pow(Math.abs(u),2.2)};
  const upE=(u)=>gap*.38*(1-u*u*(.7+pk*.2))+corner(u),loE=(u)=>-gap*.62*(1-u*u*(.75))+corner(u)*.9-(op>0?0:0);
  set(mIn,(u)=>[loE(u),upE(u)]);set(mTeeth,(u)=>[upE(u)-Math.min(gap*.35,.007*hs),upE(u)]);
  set(mUp,(u)=>[upE(u)-.0007,upE(u)+lt*(1-u*u*.5)]);set(mLo,(u)=>[loE(u)-lt*(1.1-u*u*.5),loE(u)+.0007]);
  mIn.visible=mTeeth.visible=op>.03;mTeeth.visible=op>.14}
 // ===== الشعر والأغطية والملحقات =====
 const hairM=mt(l.hc,{side:2}),HRn=HR.map(r=>({...r,y:r.y+HC}));
 const hcap=(thick,gaps,from,to)=>{const rs=HRn.filter(r=>r.y>=HC+from*hs&&r.y<=HC+to*hs+1e-6).map((r,i,ar)=>{const yy=(r.y-HC)/hs,gp=gaps(yy);return{...r,rx:r.rx+thick,rz:r.rz+thick,cz:(r.cz||0)-thick*.3,y:r.y+(yy>.1?thick*.5:0),gap:gp}});return loft(TH,rs,{seg:26,caps:[0,1]})};
 const gapF=(a,b,c)=>yy=>yy>=c?0:yy>=b?(c-yy)/(c-b)*a*.5:yy>=-.03?a*.5+((b-yy)/(b+.03))*(a*.4):a;
 const HAIRFN={
  short:()=>{put('head',hcap(.011,y=>y>.1?0:y>.07?1.1:y>.03?1.55:2.0,.0,.15),hairM,[0,0,0]);put('head',new TH.BoxGeometry(.18*hs,.025,.03),hairM,[0,HY(.092),fz(.09)-.022],[.3,0,0])},
  buzz:()=>put('head',hcap(.004,y=>y>.1?0:y>.07?1.1:y>.03?1.55:2.0,.0,.15),hairM,[0,0,0]),
  side:()=>{put('head',hcap(.013,y=>y>.1?0:y>.07?1.0:y>.03?1.5:2.0,.0,.15),hairM,[0,0,0]);const m=put('head',new TH.SphereGeometry(.1*hs,14,10,0,6.28,0,1.0),hairM,[.012*hs,HY(.075),fz(.07)-.075*hs],[.9,0,.2],[1.05,.55,.7])},
  bob:()=>{put('head',hcap(.013,y=>y>.1?0:y>.07?1.0:y>.03?1.55:2.0,-.02,.15),hairM,[0,0,0]);const rs=[ring(HC-.03,.118*hs,.105*hs,{cz:-.02*hs,gap:1.9}),ring(HC-.1*hs,.12*hs,.108*hs,{cz:-.02*hs,gap:1.95}),ring(HC-.17*hs,.115*hs,.105*hs,{cz:-.018*hs,gap:2.05})];put('head',loft(TH,rs,{seg:20,open:true}),hairM,[0,0,0])},
  long:()=>{put('head',hcap(.013,y=>y>.1?0:y>.07?1.0:y>.03?1.55:2.0,-.02,.15),hairM,[0,0,0]);const rs=[ring(HC-.02,.118*hs,.105*hs,{cz:-.02*hs,gap:1.8}),ring(HC-.12*hs,.125*hs,.115*hs,{cz:-.03*hs,gap:1.95}),ring(HC-.26*hs,.125*hs,.115*hs,{cz:-.045*hs,gap:2.1}),ring(HC-.38*hs,.1*hs,.09*hs,{cz:-.05*hs,gap:2.3}),ring(HC-.44*hs,.04*hs,.04*hs,{cz:-.052*hs,gap:2.7})];put('head',loft(TH,rs,{seg:22,open:true}),hairM,[0,0,0])},
  wavy:()=>{HAIRFN.long()},
  ponytail:()=>{put('head',hcap(.012,y=>y>.1?0:y>.07?1.05:y>.03?1.6:2.1,-.01,.15),hairM,[0,0,0]);const cu=new TH.CatmullRomCurve3([new TH.Vector3(0,HC+.07*hs,-.1*hs),new TH.Vector3(0,HC+.02*hs,-.17*hs),new TH.Vector3(0,HC-.1*hs,-.19*hs),new TH.Vector3(0,HC-.24*hs,-.16*hs)]);put('head',new TH.TubeGeometry(cu,16,.04*hs,8),hairM,[0,0,0]);put('head',new TH.TorusGeometry(.03*hs,.009,6,10),mt('#c0392b'),[0,HC+.065*hs,-.105*hs],[1.2,0,0])},
  bun:()=>{put('head',hcap(.012,y=>y>.1?0:y>.07?1.05:y>.03?1.6:2.1,-.01,.15),hairM,[0,0,0]);put('head',new TH.SphereGeometry(.055*hs,12,10),hairM,[0,HC+.1*hs,-.07*hs])},
  curly:()=>{put('head',hcap(.012,y=>y>.1?0:y>.07?1.05:y>.03?1.55:2.0,-.0,.15),hairM,[0,0,0]);for(let i=0;i<22;i++){const a=i*2.4,yy=.04+((i*37)%10)/10*.1,rr=.095*hs;if(Math.cos(a)>.65&&yy<.09)continue;put('head',new TH.SphereGeometry(.035*hs,8,6),hairM,[Math.sin(a)*rr,HC+yy*hs,Math.cos(a)*rr*.95-.01])}},
  afro:()=>{put('head',new TH.SphereGeometry(.165*hs,18,14),hairM,[0,HC+.045*hs,-.025*hs],0,[1,.95,1]);}
 };
 if(HAIRFN[hair])HAIRFN[hair]();
 // أغطية
 const clothM=mt(l.ac,{side:2});
 if(cover=='hijab'){const cl=mt(l.ac,{side:2}),front=rr=>rr,rs=[];
  // غلاف الرأس بفتحة الوجه
  const hw=HR.filter(r=>r.y>=-.1*hs).map(r=>({...r,rx:r.rx+.012*hs,rz:r.rz+.014*hs,y:r.y+HC,cz:(r.cz||0)-.004,gap:r.y>=.075*hs?0.0:r.y>=.03*hs?.75:r.y>=-.03*hs?1.0:1.1}));
  {const L=hw[hw.length-1]||{},T=hw[0]&&hw[0].y>L.y?hw[0]:L;const top=hw.reduce((m,r)=>r.y>m.y?r:m,hw[0]);hw.push({...top,y:top.y+.012*hs,rx:top.rx*.7,rz:top.rz*.7,gap:0},{...top,y:top.y+.02*hs,rx:top.rx*.3,rz:top.rz*.3,gap:0})}
  put('head',loft(TH,hw,{seg:26,caps:[0,1]}),cl,[0,0,0]);
  // إطار حول الوجه
  const drape=[ring(HC-.12*hs,.112*hs,.115*hs,{cz:-.01}),ring(HC-.19*hs,.15*hs,.13*hs,{cz:-.015}),ring(HC-.3*hs,.205*hs,.15*hs,{cz:-.01}),ring(HC-.45*hs,.235*hs,.17*hs,{cz:-.01})];
  put('head',loft(TH,drape,{seg:26}),cl,[0,0,0]);
  put('head',new TH.TorusGeometry(.098*hs,.012*hs,6,24,5.2),cl,[0,HY(.02),fz(.02)-.1*hs],[0,0,0.54+Math.PI/2*0],[1,1.1,.5]);
 }
 if(cover=='ghutra'){const cl=mt('#f4f2ee',{side:2});const hw=HR.filter(r=>r.y>=-.02*hs).map(r=>({...r,rx:r.rx+.016*hs,rz:r.rz+.016*hs,y:r.y+HC+(r.y>.1*hs?.005:0),gap:r.y>=.08*hs?0:r.y>=.03*hs?1.2:1.45}));put('head',loft(TH,hw,{seg:26,caps:[0,1]}),cl,[0,0,0]);
  const dr=[ring(HC-.02*hs,.13*hs,.12*hs,{cz:-.02,gap:1.35}),ring(HC-.13*hs,.15*hs,.13*hs,{cz:-.03,gap:1.6}),ring(HC-.24*hs,.17*hs,.14*hs,{cz:-.03,gap:1.9}),ring(HC-.3*hs,.19*hs,.14*hs,{cz:-.02,gap:2.1})];put('head',loft(TH,dr,{seg:22,open:true}),cl,[0,0,0]);
  put('head',new TH.TorusGeometry(.108*hs,.011*hs,6,28),mt('#161616'),[0,HC+.07*hs,-.005],[Math.PI/2,0,0])}
 if(cover=='taqiyah'){put('head',hcap(.012,y=>y>.085?0:y>.04?1.3:1.8,.02,.15),mt('#f4f2ee',{side:2}),[0,0,0])}
 if(cover=='cap'){put('head',hcap(.016,y=>y>.1?0:y>.06?.9:1.4,.04,.15),mt(l.ac,{side:2}),[0,0,0]);put('head',new TH.BoxGeometry(.17*hs,.012,.1*hs),mt(l.ac),[0,HY(.058),fz(.06)+.04*hs],[.12,0,0])}
 if(cover=='beanie'){put('head',hcap(.02,y=>y>.1?0:y>.05?.5:1.0,.03,.15),mt(l.ac,{side:2}),[0,0,0]);put('head',new TH.SphereGeometry(.025*hs,8,6),mt(l.ac),[0,HC+.155*hs,0])}
 // لحية
 if(beard!='none'){const bh=beard=='stubble'?.004:beard=='short'?.012:.022,rs=HR.filter(r=>r.y<=.0).map(r=>({...r,y:r.y+HC,rx:r.rx+bh,rz:r.rz+bh,cz:(r.cz||0)+bh*.5,gap:Math.PI-(r.y<-.09*hs?1.7:r.y<-.05*hs?1.35:1.1)}));
  if(beard!='mustache'){const bg=loft(TH,rs.map(r=>({...r,gap:r.gap})),{seg:22,open:true});const m=put('head',bg,mt(l.hc,{side:2}),[0,0,0]);if(beard=='stubble')m.material=mt(l.hc,{side:2,mat:{op:.35}})}
  if(beard=='mustache'||beard=='short'||beard=='full')put('head',new TH.CapsuleGeometry(.008*hs,.05*hs,4,8),mt(l.hc),[0,HY(-.044),fz(-.044)+.002],[0,0,Math.PI/2],[1,1,.8])}
 // نظارات
 if(acc=='glasses'||acc=='sun'){const fm=mt(acc=='sun'?'#111':'#222',NOL),zz=fz(.022)+.006*hs;[-1,1].forEach(s=>{const rm=new TH.Mesh(new TH.TorusGeometry(.034*hs,.0035*hs,6,18),fm);rm.position.set(s*.046*hs,HY(.022)-pv.head[1],zz-pv.head[2]);G.head.add(rm);
   if(acc=='sun'){const ls=new TH.Mesh(new TH.CircleGeometry(.034*hs,18),mt('#0a0a0a',NOL));ls.position.copy(rm.position);ls.position.z-=.001;G.head.add(ls)}
   const tp=new TH.Mesh(new TH.CylinderGeometry(.0025,.0025,.1*hs,5),fm);tp.rotation.x=Math.PI/2;tp.position.set(s*.093*hs,HY(.025)-pv.head[1],zz-pv.head[2]-.05*hs);G.head.add(tp)});
  const br=new TH.Mesh(new TH.CylinderGeometry(.003,.003,.02*hs,5),fm);br.rotation.z=Math.PI/2;br.position.set(0,HY(.028)-pv.head[1],zz-pv.head[2]);G.head.add(br)}
 if(acc=='scarf'){ur('neck',[ring(1.43,.075,.08),ring(1.5,.082,.085),ring(1.56,.07,.074)],clothM,{seg:20})}
  // ثوب/تنورة تتبع الساقين (تتحرك مع الجلوس والمشي)
 const robeLegs=(mat,hem,fk,fh)=>{const cl=mat;
  ur('body',[ring(1.06,bk.waist*bw+.014,.105*bw+.014),ring(.98,bk.hip*bw+.02,.12*bw+.02),ring(.9,bk.hip*bw+.02,.12*bw+.02),ring(.85,bk.hip*bw*.7,.1*bw)],cl,{seg:22,caps:[1,0]});
  [[1,'R'],[-1,'L']].forEach(([s,S])=>{const x=pv['leg'+S][0];
   ur('leg'+S,[ring(.95,.118*bw,.125*bw,{cx:x}),ring(.78,.14*bw+(fk-.14)*.3,.14*bw+(fk-.14)*.3,{cx:x}),ring(.55,fk*.85+.05,fk*.85+.05,{cx:x}),ring(.5,fk*.88+.05,fk*.88+.05,{cx:x})],cl,{seg:20});
   put('knee'+S,new TH.SphereGeometry(fk*.88+.05,14,10),cl,[x,.5,0]);
   if(hem<.49)ur('knee'+S,[ring(.5,fk*.88+.05,fk*.88+.05,{cx:x}),ring((.5+hem)/2,(fk*.9+.05+fh)/2,(fk*.9+.05+fh)/2,{cx:x}),ring(hem,fh,fh,{cx:x})],cl,{seg:20})})};
 // ===== الملابس =====
 const TOPC=mt(l.top,{side:2,mat:l.pat?{tex:l.pat,tc:l.top,tc2:'#ffffff',rep:[3,3]}:undefined}),TOPD=mt(l.top,{side:2}),shellTop=(rs,mat,k)=>ur('spine',scl(rs,1,k||.013),mat,{seg:22,caps:[0,0]}),
 isLongRobe=top=='abaya'||top=='thobe',isDress=top=='dress';
 {const body=[T(1.02,bk.waist,.1),T(1.1,(bk.waist+bk.chest)/2,.106),T(1.22,bk.chest,.119+(fem?.012:0)),T(1.33,bk.chest+.008,.116),T(1.4,bk.sh+.018,.101),T(1.452,.127,.083),T(1.487,.082,.065),T(1.502,.062,.062)];
  if(top!='tank')shellTop(body,TOPC,top=='hoodie'||top=='sweater'||top=='coat'||top=='jacket'?.02:.013);
  if(top=='tank'){shellTop(body.slice(0,5),TOPC,.012)}
  // الجزء السفلي من القميص (حتى الورك أو أطول)
  const hemY={tee:.84,shirt:.82,hoodie:.78,sweater:.8,jacket:.74,coat:.5,blouse:.86,suit:.7,tank:.88,dress:1.0,abaya:1.0,thobe:1.0}[top]||.84;
  if(!isDress&&!isLongRobe&&!(top=='coat'||top=='jacket'||top=='suit')){const low=[T(hemY,bk.hip*1.01,.12),T(.94,bk.hip*1.01,.12),T(1.0,(bk.hip+bk.waist)/2,.11),T(1.05,bk.waist,.1)];ur('body',scl(low,1,.014),TOPC,{seg:22})}
  if(top=='coat'||top=='jacket'||top=='suit'){const a=ur('body',[ring(hemY,bk.hip*1.2,.145*bw),ring(.9,bk.hip*1.06,.125*bw),ring(.98,bk.hip,.115*bw)],TOPD,{seg:22,open:false})}
  if(top=='hoodie'){put('spine',new TH.SphereGeometry(.1,12,10),TOPD,[0,1.52,-.07],0,[1.3,.8,.7]);put('spine',new TH.TorusGeometry(.085,.016,6,14),TOPD,[0,1.52,.03],[1.4,0,0])}
  if(top=='shirt'||top=='suit'||top=='blouse'||top=='jacket'){put('spine',new TH.TorusGeometry(.062,.012,6,16),mt(top=='suit'?'#f4f4f4':l.top),[0,1.505,.0],[1.5,0,0],[1.15,1.1,.7])}
  if(top=='suit'){put('spine',new TH.BoxGeometry(.012,.28,.01),mt('#8a1c1c'),[0,1.28,.12*bw+.018])}
  if(top=='tee'||top=='shirt'||top=='sweater'||top=='tank'||top=='hoodie')put('spine',new TH.TorusGeometry(.055,.01,6,16),mt(top=='tee'?'#00000000'.length?l.top:'':l.top),[0,1.505,.0],[1.5,0,0],[1.05,1.1,.7]);
  // الكم
  const sl=l.sleeve||(top=='tee'?'short':top=='tank'?'none':isDress?'short':top=='blouse'?'three':'long');
  [[1,'R'],[-1,'L']].forEach(([s,S])=>{const ax=pv['arm'+S][0],ex=pv['elbow'+S][0],rob=isLongRobe,k=rob?1.22:top=='hoodie'||top=='coat'||top=='jacket'||top=='sweater'?1.22:1.12;
   if(sl=='none')return;
   put('arm'+S,new TH.SphereGeometry(.054*Math.sqrt(W)*k,12,10),TOPD,[ax,1.405,0]);
   const endU=sl=='short'?1.22:1.15,aw2=aw*k;
   lim('arm'+S,ax,[ring(1.42,aw2*1.0,aw2*.97),ring(1.3,aw2*.97,aw2*.95),ring(endU,aw2*.86,aw2*.84)],TOPD);
   if(sl=='long'||sl=='three'){put('elbow'+S,new TH.SphereGeometry(.046*Math.sqrt(W)*k,10,8),TOPD,[ex,1.15,0]);const end=sl=='three'?1.0:.91;lim('elbow'+S,ex,[ring(1.17,aw2*.86,aw2*.84),ring(1.03,aw2*(rob?.98:.78),aw2*(rob?.98:.76)),ring(end,aw2*(rob?1.0:.7),aw2*(rob?1.0:.68))],TOPD)}});
  // تنورة / فستان / ثوب
  if(isDress||isLongRobe||top=='coat'){const hem=top=='dress'?.5:top=='coat'?.42:.1,fl=top=='abaya'?.19:top=='thobe'?.15:top=='coat'?.13:.17;robeLegs(TOPD,hem,fl,top=='coat'?.15:top=='thobe'?.18:.23)}
 }
 // بنطال / تنورة
 if(!isDress&&!isLongRobe){const bot=l.bot,bk2=l.botk||'jeans';
  if(l.botk=='skirt'||l.botk=='none'){} 
  if(l.botk!='none'&&l.botk!='skirt'){[[1,'R'],[-1,'L']].forEach(([s,S])=>{const x=pv['leg'+S][0],lw=legw*(fem?1.05:1),k=1.1,sh=l.botk=='shorts';
   put('leg'+S,new TH.SphereGeometry(.08*Math.sqrt(W)*k,10,8),BT,[x,.9,0]);
   lim('leg'+S,x,[ring(.93,.104*lw*k,.108*lw*k),ring(.8,.092*lw*k,.097*lw*k),ring(sh?.7:.52,(sh?.088:.068)*lw*k,(sh?.09:.07)*lw*k)],BT);
   if(!sh){put('knee'+S,new TH.SphereGeometry(.066*lw*k,10,8),BT,[x,.5,.004]);lim('knee'+S,x,[ring(.53,.068*lw*k,.07*lw*k),ring(.38,.072*lw*k,.076*lw*k,{cz:-.008}),ring(.2,.055*lw*k,.057*lw*k),ring(.1,.053*lw*k,.055*lw*k)],BT)}});
   // حزام
   ur('body',[ring(1.02,bk.waist*bw+.016,.105*bw+.016),ring(1.05,bk.waist*bw+.016,.105*bw+.016)],mt('#222'),{seg:22})}
  if(l.botk=='skirt'){robeLegs(BT,.5,.19,.2)}}
 // سوار/قلادة بسيطة
 // ===== حالة الحركة =====
 const st={post:'idle',act:null,actT:0,actD:0,actLoop:false,talk:false,blendT:1,blendD:.4,last:null,cur:{},expr:{...EXPR.neutral},exprTo:{...EXPR.neutral},exprBase:'neutral',exprK:1,lh:'relax',rh:'relax',lhT:'relax',rhT:'relax',nextBlink:1+Math.random()*3,blink:0,sac:{x:0,y:0,tx:0,ty:0,t:0},vis:{o:0,w:1,p:0,t:0},t0:null,lastT:null,breath:Math.random()*6,shift:Math.random()*6};
 const R={o:root,G,pv,ik:{},look:null,meshes:[],hum:true,spec:l};
 R.set=n=>{n=String(n);const po=HPOSTURE[n],ge=HGESTURE[n];
  if(n=='talk'){R.talk(true);return}
  if(po){if(st.post!=n){st.last={...st.cur};st.blendT=0;st.blendD=po.blend||.45}st.post=n;st.name=n;if(po.expr&&!st.exprPinned)R.expr(po.expr)}
  else if(ge){R.gesture(n)}
  else if(n=='sad'){R.set('sadIdle')}};
 R.get=()=>st.name||st.post;
 R.posture=()=>st.post;
 R.talk=on=>{st.talk=on!==false};R.speak=(v,d)=>{R.talk(v);};
 R.gesture=(n,dur)=>{const ge=HGESTURE[n];if(!ge)return;st.act=n;st.actT=0;st.actD=dur||ge.d||1.6;st.actLoop=!!ge.loop&&!dur;st.actLast={...st.cur};st.actHard=false;if(ge.expr)R.expr(ge.expr,1,true)};
 R.endGesture=()=>{st.act=null};
 R.expr=(n,w,tmp)=>{const E=typeof n=='object'?n:EXPR[n]||EXPR.neutral;st.exprBase=typeof n=='string'?n:'custom';st.exprTo={...E};st.exprK=w??1;if(!tmp)st.exprPinned=false};
 R.hands=(a,b)=>{st.lhT=HANDS[b||a]?b||a:'relax';st.rhT=HANDS[a]?a:'relax'};
 R.blink=()=>{st.blink=.001};
 R.gaze=(x,y)=>{st.sac.tx=x;st.sac.ty=y;st.gazeFix=x!=null};
 R.face=o=>{Object.assign(st.exprTo,o)};
 const lidAng=o=>(90-CL(o,0,1.6)*120)*Math.PI/180;
 const apply=(P,dt,t)=>{BONES.forEach(([b])=>G[b].rotation.set(...(P[b]||[0,0,0])));G.body.position.y=pv.body[1]+(P.y||0);G.body.position.x=P.x||0;G.body.position.z=P.z||0;
  if(G.skirt){const th=((P.legR||[0])[0]+(P.legL||[0])[0])/2;G.skirt.rotation.x=CL(th,-1.2,.5)*.6;G.skirt.rotation.z=0}};
 R.apply=apply;
 R.tick=t=>{if(st.t0==null)st.t0=t;const dt=st.lastT==null?.016:CL(t-st.lastT,0,.1);st.lastT=t;
  const po=HPOSTURE[st.post]||HPOSTURE.idle;
  let P=po.f(t,{talk:st.talk,l,breath:st.breath,shift:st.shift,W});
  // مزج الانتقال
  if(st.blendT<1&&st.last){st.blendT=Math.min(1,st.blendT+dt/st.blendD);const u=st.blendT*st.blendT*(3-2*st.blendT);P=blendPose(st.last,P,u)}
  // إيماءة
  if(st.act){const ge=HGESTURE[st.act];st.actT+=dt;let env=1;const D=st.actD,a=Math.min(1,st.actT/.3),b=st.actLoop?1:Math.min(1,(D-st.actT)/.35);env=CL(Math.min(a,b),0,1);env=env*env*(3-2*env);
   const G2=ge.f(st.actT,{talk:st.talk,P});const ak=ge.add?1:env;P=ge.add?addPose(P,G2,env):overPose(P,G2,env,ge.bones);if(ge.hands&&st.actT<.1){st.rhT=ge.hands[0];st.lhT=ge.hands[1]||ge.hands[0]}
   if(!st.actLoop&&st.actT>=D){st.act=null;st.rhT=st.lhT='relax'}}
  // كلام: إيماءات الذراع
  if(st.talk){const sc=po.talkScale??1,k=sc;const ph=t*1.7+st.shift;const n1=Math.sin(ph*1.3)*Math.sin(ph*.7+1),n2=Math.sin(ph*1.1+2)*Math.sin(ph*.5);
   P=addPose(P,{head:[Math.sin(t*2.1)*.05*k+.02,Math.sin(t*1.3)*.08*k,Math.sin(t*.9)*.03*k],armR:[-.35*Math.max(0,n1)*k,0,.12*Math.max(0,n1)*k],elbowR:[-.6*Math.max(0,n1)*k,0,0],armL:[-.3*Math.max(0,n2)*k,0,-.1*Math.max(0,n2)*k],elbowL:[-.5*Math.max(0,n2)*k,0,0],spine:[Math.sin(t*1.7)*.015,0,0]},1)}
  // مراقب النظر والـIK يعمل بعد ضبط الوضعية
  const bias=st.exprBias;apply(P,dt,t);st.cur=P;
  // أيدي
  const hr=HANDS[st.rhT]||HANDS.relax,hl=HANDS[st.lhT]||HANDS.relax,k=1-Math.exp(-dt*12);
  st.rh=st.rh||'relax';st._r=st._r||[...HANDS.relax];st._l=st._l||[...HANDS.relax];for(let i=0;i<3;i++){st._r[i]+=(hr[i]-st._r[i])*k;st._l[i]+=(hl[i]-st._l[i])*k}
  ['R','L'].forEach(S=>{const f=G['fing'+S].userData.f,c=S=='R'?st._r:st._l,sg=S=='R'?-1:1,ex=(P['fing'+S]||[0])[0];
   f[0].grp.rotation.z=sg*Math.max(0,c[0]+ex)*.9*0;f[0].grp.rotation.x=0;
   const cv=(F,cr,sgn)=>{F.grp.rotation.set(0,0,sgn*cr*1.25);F.g2.rotation.set(0,0,sgn*cr*1.1)};
   cv(f[0],c[0]+ex,sg);cv(f[1],c[1]+ex,sg);f[2].grp.rotation.set(0,sg*.55,sg*(c[2]-.1)*1.1);f[2].g2.rotation.z=sg*c[2]*.7});
  // ===== الوجه =====
  const E=st.expr,To=st.exprTo,ek=1-Math.exp(-dt*9);for(const k2 of FXN){const tv=(To[k2]||0)*st.exprK,def=(k2=='lid'||k2=='mw')?1:0,cv=E[k2]==null?def:E[k2],tv2=To[k2]==null?(def):tv+(To[k2]==null?0:0);E[k2]=cv+(((To[k2]==null?def:(k2=='lid'||k2=='mw'?1+(To[k2]-1)*st.exprK:To[k2]*st.exprK)))-cv)*ek}
  // طرفة
  st.nextBlink-=dt;if(st.nextBlink<0&&!st.blink){st.blink=.001;st.nextBlink=1.8+Math.random()*4.5;if(Math.random()<.18)st.nextBlink=.25}
  let bl=0;if(st.blink){st.blink+=dt;const u=st.blink/.16;bl=u<.5?u*2:Math.max(0,2-u*2);if(u>=1)st.blink=0}
  // كلام: أشكال الفم
  const V=st.vis;let vo=0,vw=1,vp=0;if(st.talk){V.t-=dt;if(V.t<=0){V.t=.07+Math.random()*.1;const r=Math.random();V.target=r<.3?[.75,1,0]:r<.55?[.4,1.3,0]:r<.8?[.55,.65,1]:r<.9?[.12,1,0]:[.9,1.05,0]}
   const q=1-Math.exp(-dt*22);V.o+=((V.target||[0])[0]-V.o)*q;V.w+=((V.target||[0,1])[1]-V.w)*q;V.p+=((V.target||[0,1,0])[2]-V.p)*q;vo=V.o;vw=V.w;vp=V.p}else{V.o*=.7;V.p*=.7;V.w+=(1-V.w)*.3;vo=V.o}
  const baseOpen=E.open||0,openT=CL(baseOpen+vo*(st.talk?1:0),0,1),sm=E.smile||0,mwid=(E.mw==null?1:E.mw)*(vw)*(1-vp*.28);
  const smL=CL(sm+(E.smileL||0),-1,1),smR=CL(sm+(E.smileR||0),-1,1);
  const ms=mouthSig(smL,smR,openT,mwid,vp);if(ms!==st.ms){st.ms=ms;mouthApply(.028*hs*mwid,sm,smL,smR,openT,vp)}
  // أجفان
  const lidO=(E.lid==null?1:E.lid),sq=E.squint||0;
  eyes.forEach((e,i)=>{const lo=i==0?(E.lidL||0):(E.lidR||0),o=CL((lidO+lo)*(1-bl)-sq*.18,0,1.6);e.lu.rotation.x=lidAng(o);e.ld.rotation.x=(90-CL(sq*.5+(sm>.3?sm*.18:0)+(1-lidO>0?(1-lidO)*.12:0),0,1)*60)*Math.PI/180+Math.PI*0})
  // نظر العيون
  const sc2=st.sac;sc2.t-=dt;if(sc2.t<=0&&!st.gazeFix&&!R.look){sc2.t=.5+Math.random()*2.4;sc2.tx=(Math.random()-.5)*.8;sc2.ty=(Math.random()-.5)*.4}
  let gx=sc2.tx,gy=sc2.ty;if(R.look){const v=eyeDir(R.look);if(v){gx=CL(v[0],-1,1);gy=CL(v[1],-1,1)}}
  sc2.x+=(gx-sc2.x)*(1-Math.exp(-dt*(R.look?16:10)));sc2.y+=(gy-sc2.y)*(1-Math.exp(-dt*(R.look?16:10)));
  eyes.forEach(e=>{e.ir.position.x=sc2.x*e.rx*.38;e.ir.position.y=sc2.y*e.rx*.3;e.ir.position.z=0;e.ir.rotation.y=sc2.x*.35;e.ir.rotation.x=-sc2.y*.3});
  // حواجب
  const bu=E.browUp||0,bi=E.browIn||0;browG.forEach(b=>{const asym=(b.s>0?1:-1)*(E.browAsym||0);b.bg.position.y=HY(.058)-pv.head[1]+(bu*.011+asym*.006)*hs;b.bg.rotation.z=-b.s*(bi*.5)*(1);b.bg.rotation.x=0});
  // نظر الرأس والـIK
  if(R.look||Object.keys(R.ik).length){root.updateWorldMatrix(true,true);if(R.look){doLook(TH,G.neck,R.look,.3);doLook(TH,G.head,R.look,.5)}ikApply(TH,G,pv,R.ik)}
  // تنفّس
  const br=Math.sin(t*1.5+st.breath);const ch=1+br*.008;};
 const eyeDir=tg=>{const head=G.head;if(!head.parent)return null;const v=new TH.Vector3();vecOf(TH,tg,v);head.updateWorldMatrix(true,false);const lo=head.worldToLocal(v);return[Math.atan2(lo.x,lo.z)/.6,-Math.atan2(lo.y-.0,Math.hypot(lo.x,lo.z))/.5]};
 const mouthSig=(a,b,c,d,e)=>[a,b,c,d,e].map(x=>Math.round(x*60)).join();
 R.apply(HPOSTURE.idle.f(0,{}),0,0);mouthApply(.028*hs,0,0,0,0,0);
 return R}
const blendPose=(A,B,u)=>{const R={},ks=new Set([...Object.keys(A),...Object.keys(B)]);ks.forEach(k=>{if(k=='y'||k=='x'||k=='z'){R[k]=rgx(A[k]||0,B[k]||0,u)}else{const a=A[k]||[0,0,0],b=B[k]||[0,0,0];R[k]=[rgx(a[0],b[0],u),rgx(a[1],b[1],u),rgx(a[2],b[2],u)]}});return R};
const addPose=(A,B,u)=>{const R={...A};for(const k in B){if(k=='y'||k=='x'||k=='z'){R[k]=(R[k]||0)+B[k]*u}else{const a=R[k]||[0,0,0],b=B[k];R[k]=[a[0]+b[0]*u,a[1]+b[1]*u,a[2]+b[2]*u]}}return R};
const overPose=(A,B,u,bones)=>{const R={...A};for(const k in B){if(bones&&!bones.includes(k)&&k!='y')continue;if(k=='y'||k=='x'||k=='z'){R[k]=rgx(R[k]||0,B[k],u)}else{const a=R[k]||[0,0,0],b=B[k];R[k]=[rgx(a[0],b[0],u),rgx(a[1],b[1],u),rgx(a[2],b[2],u)]}}return R};
// ---------- وضعيات أساسية ----------
const S_=Math.sin,A_=Math.abs;
const arms=(a,b)=>({armR:a,armL:b});
const brth=(t,k)=>S_(t*1.5+(k||0))*.012;
const HPOSTURE={
 idle:{f:(t,c)=>{const b=brth(t,c.breath),sh=S_(t*.35+(c.shift||0));return{spine:[b,S_(t*.4)*.012,sh*.01],neck:[-b*.5,0,0],head:[S_(t*.5)*.015,S_(t*.37)*.05,S_(t*.29)*.02],armR:[.02+b,0,.06+b*.5],armL:[.02+b,0,-.06-b*.5],elbowR:[-.12,0,0],elbowL:[-.12,0,0],handR:[0,0,-.05],handL:[0,0,.05],legR:[0,0,sh*.012],legL:[0,0,sh*.012],body:[0,0,sh*.01],x:sh*.008}}},
 stand:{alias:'idle'},
 tense:{f:(t,c)=>{const b=brth(t*1.6,c.breath);return{spine:[b*1.4,0,0],head:[-.04,S_(t*.6)*.04,0],armR:[.05,0,.12],armL:[.05,0,-.12],elbowR:[-.45,0,0],elbowL:[-.45,0,0],legR:[0,0,.02],legL:[0,0,.02]}},expr:'worried'},
 sadIdle:{f:(t,c)=>{const b=brth(t,c.breath);return{spine:[.14+b,0,0],neck:[.15,0,0],head:[.2,S_(t*.3)*.04,0],armR:[.12,0,.05],armL:[.12,0,-.05],elbowR:[-.2,0,0],elbowL:[-.2,0,0],y:-.01}},expr:'sad'},
 walk:{f:(t,c)=>{const w=t*6,a=S_(w),b=Math.cos(w);return{legL:[a*.62,0,0],legR:[-a*.62,0,0],kneeL:[Math.max(0,-b*.2)+Math.max(0,a)*0+Math.max(0,-a)*.9*0+.05+Math.max(0,S_(w+1.6))*.6,0,0],kneeR:[.05+Math.max(0,S_(w+1.6+3.14))*.6,0,0],footL:[-a*.15,0,0],footR:[a*.15,0,0],armL:[-a*.5,0,.05],armR:[a*.5,0,-.05+.1],elbowL:[-.3-Math.max(0,-a)*.4,0,0],elbowR:[-.3-Math.max(0,a)*.4,0,0],spine:[.05,a*.12,b*.03],head:[0,-a*.06,0],body:[0,-a*.1,b*.04],y:A_(a)*-.03+.01,x:b*.01}},blend:.3},
 run:{f:(t,c)=>{const w=t*9.5,a=S_(w),b=Math.cos(w);return{legL:[a*1.0,0,0],legR:[-a*1.0,0,0],kneeL:[.2+Math.max(0,S_(w+1.8))*1.2,0,0],kneeR:[.2+Math.max(0,S_(w+1.8+3.14))*1.2,0,0],armL:[-a*.9,0,.05],armR:[a*.9,0,-.05],elbowL:[-1.2,0,0],elbowR:[-1.2,0,0],spine:[.28,a*.2,0],head:[-.2,-a*.08,0],body:[0,-a*.15,0],y:A_(b)*.05-.04}},blend:.25},
 sit:{f:(t,c)=>{const b=brth(t,c.breath),sh=S_(t*.3+(c.shift||0));return{y:-.46,legR:[-1.5,.05,.06],legL:[-1.5,-.05,-.06],kneeR:[1.5,0,0],kneeL:[1.5,0,0],footR:[0,0,0],footL:[0,0,0],spine:[b-.04,S_(t*.4)*.01,sh*.01],neck:[.03,0,0],head:[S_(t*.5)*.015,S_(t*.37)*.05,S_(t*.29)*.02],armR:[-.35,0,.1],armL:[-.35,0,-.1],elbowR:[-1.05,0,0],elbowL:[-1.05,0,0],handR:[0,.1,-.05],handL:[0,-.1,.05],z:0}},talkScale:.45,blend:.5},
 sitRelax:{f:(t,c)=>{const b=brth(t,c.breath);return{y:-.46,legR:[-1.45,.12,.05],legL:[-1.45,-.12,-.05],kneeR:[1.4,0,0],kneeL:[1.4,0,0],spine:[-.12+b,0,0],neck:[.1,0,0],head:[.06+S_(t*.5)*.015,S_(t*.37)*.04,0],armR:[-.15,0,.2],armL:[-.15,0,-.2],elbowR:[-.75,0,0],elbowL:[-.75,0,0]}},talkScale:.5},
 sitFear:{f:(t,c)=>{const b=brth(t*2.6,c.breath)*1.8,tr=S_(t*31)*.006;return{y:-.46,legR:[-1.55,.06,.05],legL:[-1.55,-.06,-.05],kneeR:[1.35,0,0],kneeL:[1.35,0,0],spine:[.1+b,0,tr],neck:[.08,0,0],head:[.02+S_(t*1.7)*.03,S_(t*1.1)*.12,tr],armR:[-.5,0,.14],armL:[-.5,0,-.14],elbowR:[-.9,0,0],elbowL:[-.9,0,0],handR:[0,0,0],handL:[0,0,0]}},talkScale:.4,expr:'scared',hands:'grip'},
 brace:{f:(t,c)=>{const b=brth(t*3,c.breath)*2;return{y:-.46,legR:[-1.55,.1,.05],legL:[-1.55,-.1,-.05],kneeR:[1.3,0,0],kneeL:[1.3,0,0],spine:[1.0+b,0,0],neck:[.35,0,0],head:[.35,0,0],armR:[-2.3,0,.55],armL:[-2.3,0,-.55],elbowR:[-1.7,0,0],elbowL:[-1.7,0,0],handR:[0,0,0],handL:[0,0,0],x:0,z:.03}},talkScale:0,expr:'terrified',blend:.7},
 cower:{f:(t,c)=>{const tr=S_(t*28)*.01;return{y:-.45,legR:[-1.6,.2,.1],legL:[-1.6,-.2,-.1],kneeR:[2.1,0,0],kneeL:[2.1,0,0],spine:[.75,0,tr],neck:[.4,0,0],head:[.4,S_(t*2)*.1,tr],armR:[-2.4,0,.4],armL:[-2.4,0,-.4],elbowR:[-2.0,0,0],elbowL:[-2.0,0,0]}},expr:'terrified'},
 crouch:{f:(t,c)=>({y:-.4,legR:[-1.6,.15,.1],legL:[-1.6,-.15,-.1],kneeR:[2.0,0,0],kneeL:[2.0,0,0],spine:[.4,0,0],head:[-.25,S_(t*.7)*.15,0],armR:[-.6,0,.2],armL:[-.6,0,-.2],elbowR:[-.8,0,0],elbowL:[-.8,0,0]})},
 kneel:{f:(t,c)=>({y:-.47,legR:[-.15,.05,.05],legL:[-.15,-.05,-.05],kneeR:[2.3,0,0],kneeL:[2.3,0,0],spine:[.1,0,0],head:[.1,0,0],armR:[-.2,0,.1],armL:[-.2,0,-.1],elbowR:[-.4,0,0],elbowL:[-.4,0,0]})},
 lean:{f:(t,c)=>{const b=brth(t,c.breath);return{spine:[.02,0,.14+b],body:[0,0,-.06],legR:[0,0,.1],legL:[0,0,-.05],kneeR:[.15,0,0],head:[0,.1,-.1],armR:[-.5,0,.1],armL:[0,0,-.1],elbowR:[-1.6,0,0],elbowL:[-.2,0,0],x:.03}}},
 fall:{f:(t,c)=>{const w=t*9;return{spine:[S_(w)*.2,0,S_(w*.8)*.2],head:[S_(w*1.2)*.3,S_(w)*.4,0],armR:[-2.2+S_(w)*.6,0,.9+S_(w*1.3)*.5],armL:[-2.4+S_(w+1)*.6,0,-.9-S_(w*1.1)*.5],elbowR:[-.6,0,0],elbowL:[-.6,0,0],legR:[-.4+S_(w+2)*.5,0,.2],legL:[-.5+S_(w)*.5,0,-.2],kneeR:[.6,0,0],kneeL:[.8,0,0]}},expr:'panic'},
 shaken:{f:(t,c)=>{const b=brth(t*2.4,c.breath)*1.8;return{spine:[.2+b,0,0],neck:[.12,0,0],head:[.18,S_(t*.9)*.2,0],armR:[.1,0,.12],armL:[.1,0,-.12],elbowR:[-.3,0,0],elbowL:[-.3,0,0],legR:[0,0,.03],legL:[0,0,.03],y:-.02}},expr:'worried'},
 limp:{f:(t,c)=>({spine:[.5,0,.1],neck:[.3,0,0],head:[.3,0,.1],armR:[.15,0,.08],armL:[.15,0,-.08],y:-.02})},
};
HPOSTURE.stand=HPOSTURE.idle;
// ---------- إيماءات ----------
const HGESTURE={
 wave:{d:2,loop:0,bones:['armR','elbowR','handR','head'],hands:['open'],f:t=>({armR:[-.3,0,2.7],elbowR:[0,0,-.45+S_(t*9)*.5],handR:[0,0,S_(t*9)*.3],head:[0,0,.08]})},
 point:{d:1.8,bones:['armR','elbowR','handR','head'],hands:['point'],f:t=>({armR:[-1.5,.12,.08],elbowR:[-.12,0,0],head:[0,.16,0]})},
 pointL:{d:1.8,bones:['armL','elbowL','handL'],hands:['relax','point'],f:t=>({armL:[-1.5,-.12,-.08],elbowL:[-.12,0,0]})},
 reach:{d:1.6,bones:['armR','elbowR','handR','spine'],hands:['open'],f:t=>({armR:[-1.45,0,.25],elbowR:[-.25,0,0],spine:[.12,0,0]})},
 reachBoth:{d:1.6,bones:['armR','armL','elbowR','elbowL','spine'],hands:['open','open'],f:t=>({armR:[-1.4,0,.3],armL:[-1.4,0,-.3],elbowR:[-.2,0,0],elbowL:[-.2,0,0],spine:[.1,0,0]})},
 shrug:{d:1.6,bones:['armR','armL','elbowR','elbowL','head','spine'],hands:['open','open'],f:t=>({armR:[-.2,0,.55],armL:[-.2,0,-.55],elbowR:[-1.05,0,0],elbowL:[-1.05,0,0],head:[0,0,.12],spine:[0,0,0]})},
 nod:{d:1.2,add:1,f:t=>({head:[S_(t*8)*.18*Math.max(0,1-t/1.2),0,0]})},
 shake:{d:1.4,add:1,f:t=>({head:[0,S_(t*9)*.3*Math.max(0,1-t/1.4),0]})},
 lookAround:{d:3,add:1,f:t=>({head:[0,S_(t*2)*.6,0],neck:[0,S_(t*2)*.2,0]})},
 coverFace:{d:3,loop:1,bones:['armR','armL','elbowR','elbowL','head','spine','handR','handL'],hands:['claw','claw'],expr:'terrified',f:t=>({armR:[-1.0,.1,.5],armL:[-1.0,-.1,-.5],elbowR:[-2.2,0,0],elbowL:[-2.2,0,0],head:[.18,0,0],spine:[.1,0,0]})},
 coverEars:{d:3,loop:1,bones:['armR','armL','elbowR','elbowL','head'],hands:['flat','flat'],expr:'pain',f:t=>({armR:[-.6,.4,1.0],armL:[-.6,-.4,-1.0],elbowR:[-2.45,0,0],elbowL:[-2.45,0,0],head:[.12,0,0]})},
 handsOnHead:{d:3,loop:1,bones:['armR','armL','elbowR','elbowL','head'],hands:['claw','claw'],expr:'panic',f:t=>({armR:[-.5,.2,1.8],armL:[-.5,-.2,-1.8],elbowR:[-2.0,0,0],elbowL:[-2.0,0,0]})},
 handsUp:{d:3,loop:1,bones:['armR','armL','elbowR','elbowL'],hands:['open','open'],f:t=>({armR:[-.3,0,2.6],armL:[-.3,0,-2.6],elbowR:[-.2,0,0],elbowL:[-.2,0,0]})},
 hug:{d:3,loop:1,bones:['armR','armL','elbowR','elbowL','spine','head'],hands:['open','open'],f:t=>({armR:[-1.1,-.6,.2],armL:[-1.1,.6,-.2],elbowR:[-1.2,0,0],elbowL:[-1.2,0,0],spine:[.08,0,0],head:[.1,0,.1]})},
 clap:{d:2,loop:1,bones:['armR','armL','elbowR','elbowL'],hands:['flat','flat'],f:t=>{const o=S_(t*14)*.14;return{armR:[-.9,-.6+o,.3],armL:[-.9,.6-o,-.3],elbowR:[-1.2,0,0],elbowL:[-1.2,0,0]}}},
 facepalm:{d:2.5,bones:['armR','elbowR','head','spine'],hands:['open'],expr:'tired',f:t=>({armR:[-.9,.3,.5],elbowR:[-2.3,0,0],head:[.28,0,0],spine:[.12,0,0]})},
 think:{d:3,loop:1,bones:['armR','elbowR','head'],hands:['relax'],expr:'thinking',f:t=>({armR:[-.7,.1,.2],elbowR:[-2.2,0,0],head:[.05,.12,.1]})},
 holdChest:{d:3,loop:1,bones:['armR','elbowR','head','handR'],hands:['flat'],f:t=>({armR:[-.55,.5,.25],elbowR:[-1.8,0,0],handR:[0,0,0]})},
 grip:{d:3,loop:1,bones:['armR','armL','elbowR','elbowL'],hands:['grip','grip'],f:t=>({armR:[-.6,.1,.15],armL:[-.6,-.1,-.15],elbowR:[-.8,0,0],elbowL:[-.8,0,0]})},
 cry:{d:4,loop:1,bones:['armR','elbowR','head','spine','handR'],hands:['flat'],expr:'cry',f:t=>({armR:[-.8,.2,.4],elbowR:[-2.3,0,0],head:[.28+S_(t*11)*.02,0,0],spine:[.12+S_(t*11)*.02,0,0]})},
 breatheHeavy:{d:3,loop:1,add:1,f:t=>({spine:[S_(t*7)*.035,0,0],armR:[0,0,S_(t*7)*.04],armL:[0,0,-S_(t*7)*.04],head:[-S_(t*7)*.02,0,0]})},
 shiver:{d:3,loop:1,add:1,f:t=>({spine:[0,0,S_(t*40)*.012],head:[0,S_(t*37)*.02,0],armR:[0,0,S_(t*43)*.02],armL:[0,0,S_(t*41)*.02]})},
 flinch:{d:.9,add:1,f:t=>{const e=Math.max(0,1-t/.9),k=Math.exp(-t*5);return{spine:[-.25*k,0,0],head:[-.3*k,0,0],armR:[-.3*k,0,.5*k],armL:[-.3*k,0,-.5*k],elbowR:[-.5*k,0,0],elbowL:[-.5*k,0,0]}}},
 stumble:{d:1.2,add:1,f:t=>{const k=Math.exp(-t*3);return{spine:[S_(t*10)*.2*k,0,S_(t*8)*.15*k],armR:[0,0,S_(t*9)*.6*k],armL:[0,0,-S_(t*9)*.6*k],body:[0,0,S_(t*8)*.1*k]}}},
};
for(const k in HPOSTURE)if(HPOSTURE[k].alias)HPOSTURE[k]=HPOSTURE[HPOSTURE[k].alias];
export const HUMAN_POSTURES=Object.keys(HPOSTURE),HUMAN_GESTURES=Object.keys(HGESTURE),HUMAN_EXPR=Object.keys(EXPR),HUMAN_HANDS=Object.keys(HANDS);

// =====================================================================
// ============ الإصدار 3 — مكتبة المجسمات الاحترافية (KITS) ============
// =====================================================================
// مجسمات مستديرة الحواف بخامات: مقصورة طائرة كاملة (جدران بنوافذ حقيقية)، مقاعد، جناح ومحرك، غيوم وتضاريس، أثاث، أغراض، مبانٍ، أشجار...
// تُستعمل كأي نوع: {k:'seat', color:'#..', pos, rot, scale} وتظهر في لوحة المحرر تلقائيًا (KINDS).
const _rb=new Map();
export function rbGeo(TH,w,h,d,r,seg){r=Math.max(.002,Math.min(r??.03,Math.min(w,h,d)/2-.001));const key=[w,h,d,r,seg].join();let g=_rb.get(key);if(g)return g;
 const a=w-2*r,b=h-2*r,sh=new TH.Shape([new TH.Vector2(-a/2,-b/2),new TH.Vector2(a/2,-b/2),new TH.Vector2(a/2,b/2),new TH.Vector2(-a/2,b/2)]);
 g=new TH.ExtrudeGeometry(sh,{depth:Math.max(.0005,d-2*r),bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:seg||3,curveSegments:1});g.translate(0,0,-(d-2*r)/2);g.computeVertexNormals();_rb.set(key,g);return g}
const rr=(TH,w,h,r)=>{const s=new TH.Shape(),a=w/2,b=h/2;r=Math.min(r,a,b);s.moveTo(-a+r,-b);s.lineTo(a-r,-b);s.quadraticCurveTo(a,-b,a,-b+r);s.lineTo(a,b-r);s.quadraticCurveTo(a,b,a-r,b);s.lineTo(-a+r,b);s.quadraticCurveTo(-a,b,-a,b-r);s.lineTo(-a,-b+r);s.quadraticCurveTo(-a,-b,-a+r,-b);return s};
const ringGeo=(TH,w,h,r,t,depth)=>{const s=rr(TH,w,h,r),hl=rr(TH,w-2*t,h-2*t,Math.max(.005,r-t));s.holes.push(new TH.Path(hl.getPoints(12)));const g=new TH.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:8});g.translate(0,0,-depth/2);return g};
// تلوين ثابت بالأعلى: مواد
function bx(TH,M,g){return(w,h,d,c,pos,rot,r,mat)=>{const m=new TH.Mesh(rbGeo(TH,w,h,d,r??.03),M(c));if(mat)skinMat(TH,m.material,mat);if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;g.add(m);return m}}
function sph(TH,M,g){return(r,c,pos,sc,seg)=>{const m=new TH.Mesh(new TH.SphereGeometry(r,seg||14,(seg||14)*.7|0),M(c));if(pos)m.position.set(...pos);if(sc)m.scale.set(...sc);m.castShadow=m.receiveShadow=true;g.add(m);return m}}
function cyl(TH,M,g){return(r1,r2,h,c,pos,rot,seg)=>{const m=new TH.Mesh(new TH.CylinderGeometry(r1,r2,h,seg||16),M(c));if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;g.add(m);return m}}
const glowM=m=>{m.userData.glow=1;return m};
// تجويف بالمقطع: يمسح خطًا متعدد النقاط على طول z
function sweep(TH,prof,z0,z1,mirror){const P=[],I=[],UV=[];let k=0;for(let i=0;i<prof.length-1;i++){let[x0,y0]=prof[i],[x1,y1]=prof[i+1];if(mirror){x0=-x0;x1=-x1}
  P.push(x0,y0,z0,x1,y1,z0,x0,y0,z1,x1,y1,z1);UV.push(0,i,0,i+1,1,i,1,i+1);const a=k,b=k+1,c=k+2,d=k+3;mirror?I.push(a,b,c,b,d,c):I.push(a,c,b,b,c,d);k+=4}
 const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(P,3));g.setAttribute('uv',new TH.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();return g}
const clipProf=(prof,ymin,ymax)=>{const O=[],L=(a,b,y)=>{const t=(y-a[1])/(b[1]-a[1]);return[a[0]+(b[0]-a[0])*t,y]};for(let i=0;i<prof.length-1;i++){let a=prof[i],b=prof[i+1];if(b[1]<=ymin||a[1]>=ymax)continue;if(a[1]<ymin)a=L(a,b,ymin);if(b[1]>ymax)b=L(a,b,ymax);if(!O.length)O.push(a);O.push(b)}return O};
const PROF=[[1.56,0],[1.62,.45],[1.66,.95],[1.64,1.5],[1.52,1.95],[1.26,2.28],[.8,2.48],[.3,2.55],[0,2.57]];
const yAt=(prof,y)=>{for(let i=0;i<prof.length-1;i++){const a=prof[i],b=prof[i+1];if(y>=a[1]&&y<=b[1]){const t=(y-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*t}}return prof[prof.length-1][0]};
export const KITS={
 // ----- مقصورة الطائرة -----
 // p: {len, pitch, wall, ceil, floor, carpet, win:true, bins:true, wy:[.95,1.5], ww}
 cabin:(TH,p,M)=>{const g=new TH.Group(),L=p.len||12,P=p.pitch||.86,ww=p.ww||.3,wy=p.wy||[.98,1.5],z0=p.z0??-L,z1=p.z1??1.2,wall=p.wall||'#e7e3da',B=bx(TH,M,g),ceilC=p.ceil||'#f1efe9';
  const wm=M(wall),cm=M(ceilC);const add=(geo,m)=>{const o=new TH.Mesh(geo,m);o.receiveShadow=true;o.castShadow=false;g.add(o);return o};
  const nWin=Math.floor((z1-z0)/P);const zs=[];for(let i=0;i<=nWin;i++)zs.push(z0+i*P+P*.5);
  // أرضية + سجادة
  B(3.14,.1,z1-z0,p.floor||'#3b3f4a',[0,-.05,(z0+z1)/2],0,.01);B(.6,.012,z1-z0,p.carpet||'#2b4a73',[0,.004,(z0+z1)/2],0,.004,{tex:'carpet',tc:p.carpet||'#2b4a73',tc2:'#3a5d8c',rep:[1,Math.round((z1-z0)*2)]});
  // جدران بنوافذ حقيقية: أعمدة بين النوافذ + شريط أسفل وأعلى كل نافذة
  const full=PROF.filter((q,i)=>true),under=clipProf(PROF,0,wy[0]),over=clipProf(PROF,wy[1],3);
  [false,true].forEach(mir=>{let z=z0;for(const zc of zs){const a=zc-ww/2,b=zc+ww/2;if(a>z)add(sweep(TH,full,z,a,mir),wm);if(p.win!==false){add(sweep(TH,under,a,b,mir),wm);add(sweep(TH,over,a,b,mir),wm)}else add(sweep(TH,full,a,b,mir),wm);z=b}if(z1>z)add(sweep(TH,full,z,z1,mir),wm);
   if(p.win!==false)for(const zc of zs){const xw=yAt(PROF,(wy[0]+wy[1])/2),fr=new TH.Mesh(ringGeo(TH,ww+.06,wy[1]-wy[0]+.06,.12,.03,.06),M('#d9d5cb'));fr.position.set((mir?-1:1)*(xw-.02),(wy[0]+wy[1])/2,zc);fr.rotation.y=Math.PI/2;fr.rotation.x=0;g.add(fr);
    const gl=new TH.Mesh(new TH.PlaneGeometry(ww,wy[1]-wy[0]),(()=>{const m=M('#bcd8ee');skinMat(TH,m,{op:.14});m.userData={...OL};return m})());gl.position.set((mir?-1:1)*(xw+.0),(wy[0]+wy[1])/2,zc);gl.rotation.y=(mir?-1:1)*-Math.PI/2;g.add(gl);
    if(p.shades!==false){const sh=Math.random()*.28;const s2=new TH.Mesh(rbGeo(TH,ww-.01,(wy[1]-wy[0])*(.15+sh),.015,.006),M('#efece4'));s2.position.set((mir?-1:1)*(xw-.035),wy[1]-.03-(wy[1]-wy[0])*(.15+sh)/2,zc);s2.rotation.y=Math.PI/2;g.add(s2)}}});
  // سقف: ملمس مقوّس (المقطع يغطيه)، شرائط إضاءة
  if(p.bins!==false){[-1,1].forEach(s=>{B(.78,.42,z1-z0-.4,p.bin||'#ddd9cf',[s*1.12,2.1,(z0+z1)/2],[0,0,s*-.18],.08);for(let i=0;i<=nWin;i++)B(.01,.3,P-.06,'#c9c5ba',[s*.74,2.08,z0+i*P+P],[0,0,0],.003)})}
  const ln=glowM(new TH.Mesh(rbGeo(TH,.08,.012,z1-z0-.6,.004),M('#fff6dc')));ln.position.set(0,2.545,(z0+z1)/2);g.add(ln);ln.material.emissive=new TH.Color('#fff2cc');ln.material.emissiveIntensity=p.lightI??1.4;
  // لوحات PSU والأضواء الصغيرة فوق كل صف
  for(let i=0;i<=nWin;i++){[-1,1].forEach(s=>{B(.5,.03,.1,'#cfcbc1',[s*.94,1.98,z0+i*P+P*.5],0,.01)})}
  if(p.front!==false)B(3.1,2.6,.1,'#cfd2d6',[0,1.3,z1+.05],0,.02);if(p.back!==false){B(3.1,2.6,.1,'#cfd2d6',[0,1.3,z0-.05],0,.02);B(1.3,1.9,.04,'#7a2d3a',[.2,1.15,z0+.02],0,.02,{tex:'fabric',tc:'#7a2d3a',tc2:'#5d2230',rep:[2,3]});B(.08,.12,.02,'#2fd66b',[-1.3,2.1,z0+.02],0,.01).material.emissive=new TH.Color('#2fd66b')}
  return g},
 // مقعد طائرة واحد: p.color القماش، p.head لون وسادة الرأس
 seat:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#3b5a85',hd=p.head||'#e9e6df',fb={tex:'fabric',tc:c,tc2:'#00000030'.length?'#223a5c':c,rep:[2,2]};
  B(.44,.1,.5,c,[0,.42,.02],0,.04,fb);B(.44,.62,.12,c,[0,.78,-.2],[-.1,0,0],.05,fb);B(.34,.2,.09,hd,[0,1.17,-.235],[-.1,0,0],.04);
  B(.04,.2,.4,'#4a4f58',[-.24,.55,0],0,.015);B(.04,.2,.4,'#4a4f58',[.24,.55,0],0,.015);B(.34,.04,.3,'#c9ccd1',[0,.34,.05],0,.01);
  B(.03,.4,.03,'#3a3d45',[-.14,.2,.1]);B(.03,.4,.03,'#3a3d45',[.14,.2,.1]);B(.4,.02,.34,'#2c2f36',[0,.01,.0],0,.01);
  B(.3,.2,.02,'#2a2d34',[0,.84,.13*0-.14],[-.1,0,0],.01); // جيب خلف المقعد
  return g},
 // صف مقاعد 3+3: p.rows (عدد الصفوف), p.pitch, p.cols تجاوز، p.skip=[صف..] لتجاهل صفوف
 seatrows:(TH,p,M)=>{const g=new TH.Group(),R=p.rows||6,P=p.pitch||.86,cols=p.cols||[-1.3,-.9,-.5,.5,.9,1.3],sk=p.skip||[],cs=p.colors||{};
  for(let i=0;i<R;i++){if(sk.includes(i))continue;for(const x of cols){const s=KITS.seat(TH,{color:(cs[x]||p.color||'#3b5a85'),head:p.head},M);s.position.set(x,0,-i*P);g.add(s)}}return mergeStatic(TH,g)},
 // جناح: p.side=1|-1، p.len، p.sweep
 wing:(TH,p,M)=>{const g=new TH.Group(),s=p.side||1,L=p.len||9,sw=p.sweep||4.2,c=p.color||'#c9ced6';
  const sh=new TH.Shape([new TH.Vector2(0,1.7),new TH.Vector2(L,1.7-sw-.2),new TH.Vector2(L,1.7-sw-1.4),new TH.Vector2(0,-2.8)]);
  const geo=new TH.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelSize:.1,bevelThickness:.06,bevelSegments:3,curveSegments:2});geo.rotateX(Math.PI/2);geo.translate(0,.08,0);
  const m=new TH.Mesh(geo,M(c));m.castShadow=m.receiveShadow=true;m.scale.x=s;m.rotation.z=0;
  // بعد التدوير: x=امتداد الجناح، y=سماكة، z=وتر. نعكس z ليكون الخلف سالبًا
  m.rotation.y=0;g.add(m);
  const tip=new TH.Mesh(rbGeo(TH,.06,1.1,1.1,.03),M(p.tip||'#d34a3a'));tip.position.set(s*(L-.04),.55,1.7-sw-1.1);tip.rotation.z=s*-.1;g.add(tip);
  return g},
 // محرك نفاث: p.fan، p.color؛ الاتجاه: المقدمة نحو +z
 engine:(TH,p,M)=>{const g=new TH.Group(),c=p.color||'#d5d9df',R=p.r||.62;
  const pts=[[.0,1.0],[R*.72,1.0],[R*1.02,.82],[R*1.06,.4],[R*1.0,-.5],[R*.78,-1.15],[R*.38,-1.5],[.0,-1.52]].map(q=>new TH.Vector2(q[0],q[1]));
  const body=new TH.Mesh(new TH.LatheGeometry(pts,32),M(c));body.rotation.x=Math.PI/2;body.castShadow=true;g.add(body);
  const inner=new TH.Mesh(new TH.CylinderGeometry(R*.74,R*.74,.5,28,1,true),M('#2b2f36'));inner.rotation.x=Math.PI/2;inner.position.z=.78;inner.material.side=2;g.add(inner);
  const fan=new TH.Mesh(new TH.CylinderGeometry(R*.7,R*.7,.04,28),M('#3a3f48'));fan.rotation.x=Math.PI/2;fan.position.z=.62;g.add(fan);g.userData.fan=fan;
  for(let i=0;i<12;i++){const b=new TH.Mesh(new TH.BoxGeometry(.04,R*.64,.02),M('#8f96a3'));b.position.set(0,0,.63);b.rotation.z=i/12*6.283;b.geometry.translate(0,R*.32,0);fan.add&&g.add(b)}
  const sp=new TH.Mesh(new TH.ConeGeometry(R*.14,.3,12),M('#e8e8ea'));sp.rotation.x=Math.PI/2;sp.position.z=.74;g.add(sp);
  const pylon=new TH.Mesh(rbGeo(TH,.16,.9,1.6,.05),M('#c0c5ce'));pylon.position.set(0,R*.8,.1);g.add(pylon);
  g.userData.anchors={rear:[0,0,-1.5],front:[0,0,1.05]};return g},
 cloud:(TH,p,M)=>{const g=new TH.Group(),c=p.color||'#ffffff',sh=p.shade||'#dfe7f2',n=p.n||7,R=Math.random;let sd=p.seed||3;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<n;i++){const s=(.9+r()*1.3)*(p.s||1),m=new TH.Mesh(new TH.IcosahedronGeometry(s,2),M(i%3==0?sh:c));m.position.set((r()-.5)*4*(p.s||1),(r()-.2)*.9*(p.s||1),(r()-.5)*2.4*(p.s||1));m.scale.y=.62;m.userData=OL;m.material.userData={...OL};g.add(m)}
  return g},
 // أرض بالأسفل: رقع حقول وطرق وأنهار (ملمس مولّد)
 terrain:(TH,p,M)=>{const g=new TH.Group(),sz=p.size||400,n=(p.cols||['#6c8a4a','#8a9a52','#b7a46a','#587a43','#a58e5c']),R=Math.random;const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d');x.fillStyle=n[0];x.fillRect(0,0,512,512);
  let sd=p.seed||5;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<90;i++){x.fillStyle=n[(r()*n.length)|0];const w=30+r()*100,h=30+r()*100;x.fillRect(r()*512,r()*512,w,h)}
  x.strokeStyle='#4f6a8f';x.lineWidth=14;x.beginPath();x.moveTo(0,r()*512);x.bezierCurveTo(150,r()*512,300,r()*512,512,r()*512);x.stroke();
  x.strokeStyle='#6a6a6a';x.lineWidth=5;for(let i=0;i<5;i++){x.beginPath();const y=r()*512;x.moveTo(0,y);x.lineTo(512,y+(r()-.5)*80);x.stroke();x.beginPath();const xx=r()*512;x.moveTo(xx,0);x.lineTo(xx+(r()-.5)*80,512);x.stroke()}
  const t=new TH.CanvasTexture(cv);t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(p.rep||6,p.rep||6);t.colorSpace=TH.SRGBColorSpace;
  const m=new TH.Mesh(new TH.PlaneGeometry(sz,sz,1,1),M('#ffffff'));m.material.map=t;m.rotation.x=-Math.PI/2;m.userData=OL;m.material.userData={...OL};m.receiveShadow=false;g.add(m);return g},
 // ---- أغراض ----
 suitcase:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#b0392f';B(.42,.62,.24,c,[0,.4,0],0,.06,{tex:'stripes',tc:c,tc2:'#00000022'.length?c:c,rep:[1,1]});B(.3,.03,.03,'#2a2a2a',[0,.74,0],0,.01);B(.02,.2,.02,'#2a2a2a',[.1,.82,0]);B(.02,.2,.02,'#2a2a2a',[-.1,.82,0]);[-.15,.15].forEach(x=>B(.05,.06,.05,'#1a1a1a',[x,.04,0],0,.02));return g},
 backpack:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#2f6b5e';B(.32,.42,.18,c,[0,.3,0],0,.07);B(.26,.2,.06,c,[0,.2,.11],0,.03);B(.04,.3,.02,'#222',[-.1,.32,-.1]);B(.04,.3,.02,'#222',[.1,.32,-.1]);return g},
 laptop:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.32,.015,.22,p.color||'#8d9199',[0,.01,0],0,.006);const s=B(.32,.21,.01,'#8d9199',[0,.115,-.105],[-.25,0,0],.004);B(.29,.18,.004,p.screen||'#1b2d4a',[0,.115,-.098],[-.25,0,0],.002).material.emissive=new TH.Color(p.screen||'#3a6fb8');g.children[2].material.emissiveIntensity=.8;return g},
 phone:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.07,.008,.145,'#1a1a1c',[0,.005,0],0,.008);const s=B(.063,.002,.135,p.screen||'#274a7a',[0,.01,0],0,.004);s.material.emissive=new TH.Color(p.screen||'#4a80c0');s.material.emissiveIntensity=p.i??.9;return g},
 cup:(TH,p,M)=>{const g=new TH.Group(),C=cyl(TH,M,g);C(.04,.032,.1,p.color||'#f1efe8',[0,.05,0]);C(.0385,.0385,.004,'#6b4a33',[0,.098,0]);return g},
 bottle:(TH,p,M)=>{const g=new TH.Group(),C=cyl(TH,M,g);C(.035,.035,.17,p.color||'#7fb8d8',[0,.085,0]);C(.016,.03,.04,p.color||'#7fb8d8',[0,.19,0]);C(.017,.017,.02,'#2f6bb3',[0,.22,0]);return g},
 book:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.15,.03,.22,p.color||'#6b2f2f',[0,.015,0],0,.004);B(.14,.025,.2,'#f1ead7',[.004,.015,0],0,.002);return g},
 teddy:(TH,p,M)=>{const g=new TH.Group(),S=sph(TH,M,g),c=p.color||'#b5875a';S(.1,c,[0,.12,0],[1,1.1,.9]);S(.075,c,[0,.27,0]);S(.03,c,[-.06,.33,0]);S(.03,c,[.06,.33,0]);S(.03,'#e9d3b5',[0,.255,.065],[1,.8,.7]);S(.012,'#222',[-.028,.285,.07]);S(.012,'#222',[.028,.285,.07]);S(.035,c,[-.11,.14,.02]);S(.035,c,[.11,.14,.02]);S(.04,c,[-.05,.03,.03]);S(.04,c,[.05,.03,.03]);return g},
 pillow:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.36,.1,.24,p.color||'#e8ecef',[0,.05,0],0,.045,{tex:'fabric',tc:p.color||'#e8ecef',tc2:'#cfd6dc'});return g},
 blanket:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.9,.04,.6,p.color||'#c26a4a',[0,.02,0],0,.018,{tex:'fabric',tc:p.color||'#c26a4a',tc2:'#9c4a31',rep:[3,3]});return g},
 tablet:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.2,.01,.14,'#1a1a1c',[0,.005,0],0,.01);const s=B(.18,.002,.12,p.screen||'#2a4a7a',[0,.011,0],0,.004);s.material.emissive=new TH.Color(p.screen||'#4a80c0');return g},
 headphones:(TH,p,M)=>{const g=new TH.Group(),c=p.color||'#222';const t=new TH.Mesh(new TH.TorusGeometry(.08,.008,8,20,Math.PI),M(c));t.position.y=.08;g.add(t);[-1,1].forEach(s=>{const e=new TH.Mesh(new TH.CylinderGeometry(.04,.04,.03,16),M(c));e.rotation.z=Math.PI/2;e.position.set(s*.08,.08,0);g.add(e)});return g},
 lifevest:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#f08a1c';B(.18,.4,.12,c,[-.12,.2,0],0,.05);B(.18,.4,.12,c,[.12,.2,0],0,.05);B(.4,.1,.12,c,[0,.38,0],0,.04);B(.03,.3,.01,'#e8e8e8',[-.12,.2,.07]);B(.03,.3,.01,'#e8e8e8',[.12,.2,.07]);return g},
 // قناع أكسجين: كأس صفراء + أنبوب نحو الأعلى (p.tube=[x,y,z] نقطة الاتصال)
 oxmask:(TH,p,M)=>{const g=new TH.Group(),C=cyl(TH,M,g);const cp=new TH.Mesh(new TH.SphereGeometry(.06,12,8,0,6.283,0,1.4),M('#f2c23a'));cp.scale.set(1.1,1,.8);cp.rotation.x=1.2;g.add(cp);C(.012,.012,.2,'#2b2f33',[0,.1,0],0,6);const bag=new TH.Mesh(rbGeo(TH,.12,.16,.04,.02),M('#f5f1e8'));bag.position.set(0,-.1,.02);g.add(bag);return g},
 // أنبوب مرن بين نقطتين (ديناميكي): p.from, p.to
 hose:(TH,p,M)=>{const a=new TH.Vector3(...(p.from||[0,0,0])),b=new TH.Vector3(...(p.to||[0,-.5,0])),m=a.clone().lerp(b,.5);m.y-=p.sag??.25;const cu=new TH.CatmullRomCurve3([a,m,b]);const g=new TH.Group();const t=new TH.Mesh(new TH.TubeGeometry(cu,18,p.rad||.012,6),M(p.color||'#2b2f33'));t.castShadow=true;g.add(t);return g},
 tray:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.4,.015,.28,'#dfe1e4',[0,.01,0],0,.01);B(.1,.025,.1,'#f1efe8',[.08,.03,0],0,.04);return g},
 plant:(TH,p,M)=>{const g=new TH.Group(),C=cyl(TH,M,g);C(.12,.09,.2,p.pot||'#a85d3a',[0,.1,0]);for(let i=0;i<8;i++){const l=new TH.Mesh(new TH.SphereGeometry(.09,8,6),M(p.color||'#3d7a45'));l.scale.set(.5,1.6,.25);l.position.set(Math.cos(i*.8)*.08,.34,Math.sin(i*.8)*.08);l.rotation.z=Math.cos(i*.8)*.5;l.rotation.x=-Math.sin(i*.8)*.5;g.add(l)}return g},
 frame:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(.5,.4,.03,p.color||'#5a3d28',[0,0,0],0,.01);B(.42,.32,.01,p.art||'#9ec4d8',[0,0,.02],0,.002,{tex:p.tex||'stripes',tc:p.art||'#9ec4d8',tc2:'#e8c07a'});return g},
 rug:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(p.w||2.4,.02,p.d||1.6,p.color||'#8a3d3d',[0,.01,0],0,.01,{tex:p.tex||'carpet',tc:p.color||'#8a3d3d',tc2:'#a85a4a',rep:[3,2]});return g},
 curtain:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);for(let i=0;i<6;i++)B(.16,p.h||2,.05,p.color||'#7a3a4a',[i*.15-.4,0,Math.sin(i*1.3)*.03],0,.02);return g},
 lamp2:(TH,p,M)=>{const g=new TH.Group(),C=cyl(TH,M,g);C(.12,.14,.03,'#2a2a2e',[0,.015,0]);C(.015,.015,1.4,'#2a2a2e',[0,.7,0]);const sh=C(.1,.18,.24,p.shade||'#f3dca6',[0,1.5,0]);sh.userData.glow=1;sh.material.emissive=new TH.Color(p.shade||'#f3dca6');sh.material.emissiveIntensity=.7;if(!p.nolight){const L=new TH.PointLight(p.light||0xffd9a0,1.2,8);L.position.set(0,1.45,0);g.add(L)}return g},
 sofa2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#7a4a5a',f={tex:'fabric',tc:c,tc2:'#000000'.length?c:c,rep:[3,2]};B(2.0,.28,.9,c,[0,.2,0],0,.08,f);B(1.9,.2,.78,c,[0,.43,.04],0,.09,f);B(2.0,.62,.24,c,[0,.72,-.34],[-.12,0,0],.1,f);[-1,1].forEach(s=>B(.2,.5,.9,c,[s*.9,.46,0],0,.09,f));[-.45,.45].forEach(x=>B(.32,.3,.1,p.cushion||'#d9b36a',[x,.66,-.2],[-.2,0,0],.05));B(.9,.08,.08,'#2a1f1a',[0,.04,.3]);return g},
 chair2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#8a5a35';B(.46,.05,.46,c,[0,.46,0],0,.02);B(.46,.5,.05,c,[0,.74,-.21],[-.06,0,0],.02);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(.04,.46,.04,c,[a*.2,.23,b*.2],0,.015));return g},
 table2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#8a5a35';B(p.w||1.4,.06,p.d||.8,c,[0,.75,0],0,.025,{tex:'wood',tc:c,tc2:'#6b4226'});[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>B(.06,.72,.06,c,[a*((p.w||1.4)/2-.08),.36,b*((p.d||.8)/2-.08)],0,.02));return g},
 bed2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(1.6,.3,2.0,'#5a3d28',[0,.2,0],0,.05);B(1.52,.22,1.92,p.color||'#e5e0ee',[0,.46,.02],0,.08,{tex:'fabric',tc:p.color||'#e5e0ee',tc2:'#c9c2dc'});[-.35,.35].forEach(x=>B(.55,.14,.34,'#ffffff',[x,.62,-.78],0,.06));B(1.7,.9,.08,'#5a3d28',[0,.65,-1.04],0,.03);return g},
 shelf:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#6b4a32';B(.9,1.8,.3,c,[0,.9,0],0,.02);for(let i=0;i<5;i++){B(.82,.03,.28,'#8a6446',[0,.25+i*.35,.02],0,.008);for(let j=0;j<4;j++)B(.07,.2+.04*((i+j)%3),.2,['#8a2f2f','#2f5a8a','#c9a24a','#3b7a52'][(i+j)%4],[-.3+j*.17,.37+i*.35,.03],0,.005)}return g},
 tv:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(1.2,.7,.05,'#18181a',[0,.8,0],0,.015);const s=B(1.14,.64,.01,p.screen||'#223a5c',[0,.8,.03],0,.004);s.material.emissive=new TH.Color(p.screen||'#3a6aa8');s.material.emissiveIntensity=.8;B(.3,.04,.16,'#222',[0,.42,0]);B(.04,.38,.04,'#222',[0,.62,-.02]);return g},
 door2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#6b4a32';B(1.1,2.2,.14,'#d9d5cb',[0,1.1,0],0,.02);B(.9,2.1,.06,c,[0,1.05,.03],0,.015);B(.6,.8,.01,'#00000018'.length?c:c,[0,1.5,.07],0,.005);const k=new TH.Mesh(new TH.SphereGeometry(.04,10,8),M('#d4af37'));k.position.set(.35,1.05,.1);g.add(k);return g},
 window2:(TH,p,M)=>{const g=new TH.Group(),w=p.w||1.2,h=p.h||1.3;const fr=new TH.Mesh(ringGeo(TH,w,h,.02,.07,.12),M(p.color||'#e9e4d8'));g.add(fr);const gl=new TH.Mesh(new TH.PlaneGeometry(w-.12,h-.12),(()=>{const m=M(p.glass||'#bcd8ee');skinMat(TH,m,{op:.25});m.userData={...OL};return m})());g.add(gl);const bx_=new TH.Mesh(new TH.BoxGeometry(.04,h-.1,.04),M(p.color||'#e9e4d8'));g.add(bx_);const b2=new TH.Mesh(new TH.BoxGeometry(w-.1,.04,.04),M(p.color||'#e9e4d8'));g.add(b2);return g},
 // جدار بفتحات: p.w,p.h,p.t، holes:[{x,y,w,h}] (x من المنتصف، y من الأرض)
 wallx:(TH,p,M)=>{const w=p.w||4,h=p.h||2.6,t=p.t||.16,s=new TH.Shape([new TH.Vector2(-w/2,0),new TH.Vector2(w/2,0),new TH.Vector2(w/2,h),new TH.Vector2(-w/2,h)]);
  (p.holes||[]).forEach(o=>{const a=o.x-o.w/2,b=o.x+o.w/2,y0=o.y,y1=o.y+o.h;s.holes.push(new TH.Path([new TH.Vector2(a,y0),new TH.Vector2(a,y1),new TH.Vector2(b,y1),new TH.Vector2(b,y0)]))});
  const g=new TH.ExtrudeGeometry(s,{depth:t,bevelEnabled:false});g.translate(0,0,-t/2);const m=new TH.Mesh(g,M(p.color||'#d9d2c4'));m.castShadow=m.receiveShadow=true;if(p.tex)skinMat(TH,m.material,{tex:p.tex,tc:p.color||'#d9d2c4',tc2:p.tc2||'#c4bba9',rep:[w/2,h/2]});const G=new TH.Group();G.add(m);return G},
 floor2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g);B(p.w||8,.1,p.d||8,p.color||'#a8794a',[0,-.05,0],0,.01,{tex:p.tex||'planks',tc:p.color||'#a8794a',tc2:'#7a5430',rep:[(p.w||8)/2,(p.d||8)/2]});return g},
 // ---- طبيعة ومدينة ----
 tree2:(TH,p,M)=>{const g=new TH.Group(),R=Math.random;let sd=p.seed||(Math.random()*1e3+1|0);const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const c=p.color||'#3f7d46';
  const t=new TH.Mesh(new TH.CylinderGeometry(.12,.2,1.6,8),M('#5b3e28'));t.position.y=.8;t.castShadow=true;g.add(t);
  for(let i=0;i<6;i++){const s=.8+r()*.7,m=new TH.Mesh(new TH.IcosahedronGeometry(s,1),M(i%2?c:p.color2||'#4a9152'));m.position.set((r()-.5)*1.4,2+r()*1.3,(r()-.5)*1.4);m.castShadow=true;g.add(m)}return g},
 bush:(TH,p,M)=>{const g=new TH.Group(),S=sph(TH,M,g);S(.4,p.color||'#4a8a4f',[0,.3,0],[1.2,.8,1]);S(.3,p.color||'#3f7d46',[.3,.25,.1]);S(.28,'#4a8a4f',[-.3,.22,-.1]);return g},
 building:(TH,p,M)=>{const g=new TH.Group(),w=p.w||6,h=p.h||14,d=p.d||6,c=p.color||'#9aa3b0',B=bx(TH,M,g);const cv=document.createElement('canvas');cv.width=128;cv.height=256;const x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,128,256);for(let i=0;i<8;i++)for(let j=0;j<16;j++){const lit=Math.random()<(p.lit??.35);x.fillStyle=lit?'#ffe9a8':'#4a5a70';x.fillRect(8+i*15,8+j*15,9,10)}const t=new TH.CanvasTexture(cv);t.colorSpace=TH.SRGBColorSpace;t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(Math.max(1,w/5),Math.max(1,h/12));
  const m=B(w,h,d,'#ffffff',[0,h/2,0],0,.04);m.material.map=t;m.material.emissiveMap=t;m.material.emissive=new TH.Color('#ffffff');m.material.emissiveIntensity=p.glow??.35;return g},
 hill:(TH,p,M)=>{const g=new TH.Group(),m=new TH.Mesh(new TH.SphereGeometry(1,24,12,0,6.283,0,1.5708),M(p.color||'#6f9a52'));m.scale.set(p.w||30,p.h||8,p.d||30);m.receiveShadow=true;g.add(m);return g},
 water:(TH,p,M)=>{const g=new TH.Group(),m=new TH.Mesh(new TH.PlaneGeometry(p.w||60,p.d||60),M(p.color||'#3a78a8'));m.rotation.x=-Math.PI/2;m.position.y=.02;skinMat(TH,m.material,{op:p.op??.85,metal:.2,rough:.1});g.add(m);return g},
 car2:(TH,p,M)=>{const g=new TH.Group(),B=bx(TH,M,g),c=p.color||'#b23a3a';B(1.8,.5,4,c,[0,.55,0],0,.18);B(1.5,.5,2.1,'#222a38',[0,1.0,-.2],0,.2);B(1.62,.3,1.7,c,[0,1.05,-.2],0,.15);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const w=new TH.Mesh(new TH.CylinderGeometry(.36,.36,.26,18),M('#111'));w.rotation.z=Math.PI/2;w.position.set(a*.9,.36,b*1.25);w.castShadow=true;g.add(w)});[-1,1].forEach(s=>{const l=B(.3,.14,.05,'#fff3c4',[s*.6,.6,2.0],0,.02);l.material.emissive=new TH.Color('#fff3c4')});return g},
 // سماء قبة النافذة: لا شيء هنا (انظر env.sky)
};
export const KIT_NAMES={cabin:'مقصورة طائرة',seat:'مقعد طائرة',seatrows:'صفوف مقاعد',wing:'جناح طائرة',engine:'محرك نفاث',cloud:'سحابة',terrain:'تضاريس أرضية',suitcase:'حقيبة سفر',backpack:'حقيبة ظهر',laptop:'لابتوب',phone:'هاتف',cup:'كوب',bottle:'زجاجة',book:'كتاب',teddy:'دبدوب',pillow:'وسادة',blanket:'بطانية',tablet:'جهاز لوحي',headphones:'سمّاعات',lifevest:'سترة نجاة',oxmask:'قناع أكسجين',hose:'أنبوب مرن',tray:'صينية',plant:'نبتة',frame:'إطار صورة',rug:'سجادة',curtain:'ستارة',lamp2:'مصباح أرضي',sofa2:'أريكة مريحة',chair2:'كرسي',table2:'طاولة',bed2:'سرير',shelf:'رف كتب',tv:'تلفاز',door2:'باب',window2:'نافذة',wallx:'جدار بفتحات',floor2:'أرضية',tree2:'شجرة',bush:'شجيرة',building:'مبنى',hill:'تلة',water:'ماء',car2:'سيارة'};

Object.assign(KINDS,KIT_NAMES);
export const TEXTURES=['checker','stripes','dots','grid','bricks','planks','noise','fabric','carpet','leather','metal','wood','tiles','concrete','paper','wallpaper'];

// إضاءة حافّة خفيفة (rim) لكل المواد الكرتونية: تعطي حضورًا بصريًا وانفصالًا عن الخلفية. تتحكم بها RIM (لون/شدة) أو env.rim
export const RIM={color:{value:{r:.79,g:.86,b:1}},k:{value:.2}};
export function RIMP(sh){sh.uniforms.rimColor=RIM.color;sh.uniforms.rimK=RIM.k;
 sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform vec3 rimColor;uniform float rimK;\nvoid main() {').replace('#include <dithering_fragment>','{float rm=pow(1.-clamp(dot(normalize(vNormal),normalize(vViewPosition)),0.,1.),3.2);gl_FragColor.rgb+=rimColor*rm*rimK*(.4+.6*luminance(gl_FragColor.rgb));}\n#include <dithering_fragment>')}
export const setRim=(c,k)=>{if(c){const q=typeof c=='string'?{r:parseInt(c.slice(1,3),16)/255,g:parseInt(c.slice(3,5),16)/255,b:parseInt(c.slice(5,7),16)/255}:{r:c[0],g:c[1],b:c[2]};RIM.color.value={r:Math.pow(q.r,2.2),g:Math.pow(q.g,2.2),b:Math.pow(q.b,2.2)}}if(k!=null)RIM.k.value=k};

// =====================================================================
// ============ الإصدار 3 — الصوت: مركّب أصوات + ضبابية + صدى ============
// =====================================================================
// أصوات مستمرة (loop): rain wind engine fire hum cabin rumble turbulence alarm siren beep heartbeat tinnitus creak rattle static breath hiss pad tension
// أصوات لحظية (once): boom thud crash whoosh ding click metal glass snap pop zap thump bang
// خيارات الصوت: vol, rate, at (مكاني), fade (دخول تدريجي), dur (إيقاف تلقائي مع خروج), rev (صدى 0-1), pan, bpm, f (تردد)
export const SYNTHS={loop:['rain','wind','engine','fire','hum','cabin','rumble','turbulence','alarm','siren','beep','heartbeat','tinnitus','creak','rattle','static','breath','hiss','pad','tension'],once:['boom','thud','crash','whoosh','ding','click','metal','glass','snap','pop','zap','thump','bang']};
const _A=Audio3D.prototype,_init0=_A.init;
Object.assign(_A,{
 init(){const c=_init0.call(this);if(c&&!this.lp){try{this.lp=c.createBiquadFilter();this.lp.type='lowpass';this.lp.frequency.value=22000;this.lp.Q.value=.5;this.comp=c.createDynamicsCompressor();this.comp.threshold.value=-14;this.comp.ratio.value=4;
   try{this.out.disconnect()}catch(e){}this.out.connect(this.lp);this.lp.connect(this.comp);this.comp.connect(c.destination);
   // صدى مولّد
   const n=Math.floor(c.sampleRate*2.2),ib=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ib.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}
   this.rv=c.createConvolver();this.rv.buffer=ib;this.rvg=c.createGain();this.rvg.gain.value=.5;this.rv.connect(this.rvg);this.rvg.connect(this.lp)}catch(e){}}return c},
 _br(){const c=this.c;if(!this.bb){const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;d[i]=l*3.5}this.bb=b}const s=c.createBufferSource();s.buffer=this.bb;s.loop=true;return s},
 // ضبابية عامة (مثل أذن مصدومة): f=تردد القطع
 muffle(f,dur){if(!this.lp)return;const t=this.c.currentTime,p=this.lp.frequency;p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.exponentialRampToValueAtTime(Math.max(80,f||22000),t+(dur||.3))},
 master(v,dur){if(!this.out)return;const t=this.c.currentTime,p=this.out.gain;p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(v,t+(dur||.3))},
 _syn(k,o){const c=this.c,out=c.createGain(),ctl={},nodes=[],F=(t,f,q)=>{const x=c.createBiquadFilter();x.type=t;x.frequency.value=f;if(q!=null)x.Q.value=q;nodes.push(x);return x},
  OSC=(t,f)=>{const x=c.createOscillator();x.type=t;x.frequency.value=f;nodes.push(x);return x},G=v=>{const x=c.createGain();x.gain.value=v;nodes.push(x);return x},now=()=>c.currentTime;
  const stops=[];const reg=x=>{stops.push(x);return x};const start=x=>{x.start();reg(x);return x};
  const NS=()=>start(this._ns()),BR=()=>start(this._br());
  const lfo=(f,amt,target,type)=>{const l=OSC(type||'sine',f),g=G(amt);l.connect(g);g.connect(target);start(l);return l};
  ctl.stop=()=>stops.forEach(s=>{try{s.stop()}catch(e){}});
  const once=(d)=>{ctl.once=d};
  if(k=='rain'){const s=NS(),f=F('highpass',1200);s.connect(f);f.connect(out)}
  else if(k=='wind'){const s=NS(),f=F('bandpass',420,.8);lfo(.15,250,f.frequency);s.connect(f);f.connect(out)}
  else if(k=='fire'){const s=NS(),f=F('lowpass',700),g2=G(.6);lfo(7,.5,g2.gain,'sawtooth');s.connect(f);f.connect(g2);g2.connect(out);const s2=NS(),f2=F('highpass',3000),g3=G(.0);lfo(11,.12,g3.gain,'square');s2.connect(f2);f2.connect(g3);g3.connect(out)}
  else if(k=='engine'){const a=start(OSC('sawtooth',38)),b=start(OSC('square',19)),f=F('lowpass',500);a.connect(f);b.connect(f);f.connect(out);const set=r=>{a.frequency.value=38+r*55;b.frequency.value=19+r*27.5};set(o.rate||1);ctl.rate=set}
  else if(k=='cabin'){const s=BR(),f=F('lowpass',220),g=G(1.2);s.connect(f);f.connect(g);g.connect(out);const h=NS(),hf=F('bandpass',1800,.6),hg=G(.045);h.connect(hf);hf.connect(hg);hg.connect(out);const e=start(OSC('sine',96)),eg=G(.07);e.connect(eg);eg.connect(out);const e2=start(OSC('sine',144)),eg2=G(.03);e2.connect(eg2);eg2.connect(out)}
  else if(k=='rumble'){const s=BR(),f=F('lowpass',o.f||120),g=G(1.6);lfo(.4,.5,g.gain);s.connect(f);f.connect(g);g.connect(out)}
  else if(k=='turbulence'){const s=BR(),f=F('lowpass',150),g=G(1);const l=OSC('sawtooth',.9),lg=G(.8);l.connect(lg);lg.connect(g.gain);start(l);const l2=start(OSC('sine',.27)),lg2=G(.5);l2.connect(lg2);lg2.connect(g.gain);s.connect(f);f.connect(g);g.connect(out);const n2=NS(),nf=F('bandpass',500,.5),ng=G(.15);lfo(.5,.12,ng.gain);n2.connect(nf);nf.connect(ng);ng.connect(out)}
  else if(k=='alarm'){const a=start(OSC('square',880)),g=G(.0),f=F('lowpass',2400);const l=OSC('square',o.rate||2.2),lg=G(.5),lb=G(.5);l.connect(lg);lg.connect(g.gain);g.gain.value=.5;a.connect(f);f.connect(g);g.connect(out);start(l);const fl=start(OSC('square',2.2)),fg=G(220);fl.connect(fg);fg.connect(a.frequency);a.frequency.value=660;fl.frequency.value=o.rate||2.2}
  else if(k=='siren'){const a=start(OSC('sawtooth',700)),l=start(OSC('sine',.5)),lg=G(260),f=F('lowpass',1800);l.connect(lg);lg.connect(a.frequency);a.connect(f);f.connect(out)}
  else if(k=='beep'){const a=start(OSC('sine',o.f||1000)),g=G(0),l=start(OSC('square',o.rate||1)),lg=G(.5),f=F('lowpass',2000);const sh=c.createWaveShaper();l.connect(lg);lg.connect(g.gain);g.gain.value=.5;a.connect(g);g.connect(out)}
  else if(k=='heartbeat'){const bpm=o.bpm||70,iv=60/bpm*1000;let alive=true;const beat=(t0,v)=>{const x=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();x.type='sine';x.frequency.setValueAtTime(70,t0);x.frequency.exponentialRampToValueAtTime(38,t0+.12);f.type='lowpass';f.frequency.value=180;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.012);g.gain.exponentialRampToValueAtTime(.001,t0+.16);x.connect(f);f.connect(g);g.connect(out);x.start(t0);x.stop(t0+.2)};
   const id=setInterval(()=>{if(!alive||!this.c)return;const t=this.c.currentTime+.02;beat(t,1);beat(t+.24,.75)},iv);ctl.stop=()=>{alive=false;clearInterval(id)};ctl.bpm=b=>{}}
  else if(k=='tinnitus'){const a=start(OSC('sine',o.f||4300)),g=G(.12);const a2=start(OSC('sine',(o.f||4300)*1.47)),g2=G(.04);a.connect(g);g.connect(out);a2.connect(g2);g2.connect(out)}
  else if(k=='creak'){const s=NS(),f=F('bandpass',320,6),g=G(.0);lfo(.31,200,f.frequency);const l=OSC('sawtooth',.23),lg=G(.5);l.connect(lg);lg.connect(g.gain);start(l);g.gain.value=.5;s.connect(f);f.connect(g);g.connect(out);const s2=NS(),f2=F('bandpass',1100,9),g4=G(.25);lfo(.17,500,f2.frequency);s2.connect(f2);f2.connect(g4);g4.connect(out)}
  else if(k=='rattle'){const s=NS(),f=F('bandpass',2200,1.2),g=G(0);const l=OSC('square',23),lg=G(.5);l.connect(lg);lg.connect(g.gain);start(l);g.gain.value=.5;s.connect(f);f.connect(g);g.connect(out)}
  else if(k=='static'){const s=NS(),f=F('bandpass',2500,.4),g=G(.6);lfo(7,.4,g.gain,'square');s.connect(f);f.connect(g);g.connect(out)}
  else if(k=='breath'){const s=NS(),f=F('bandpass',900,.7),g=G(.0);const l=OSC('sine',o.rate||.4),lg=G(.5);l.connect(lg);lg.connect(g.gain);start(l);g.gain.value=.5;s.connect(f);f.connect(g);g.connect(out)}
  else if(k=='hiss'){const s=NS(),f=F('highpass',4200);s.connect(f);f.connect(out)}
  else if(k=='pad'||k=='tension'){const root=o.f||(k=='tension'?55:110),ch=k=='tension'?[1,1.0595,1.5,2.0]:(o.chord||[1,1.1892,1.4983,2]);ch.forEach((r,i)=>{const a=start(OSC('sawtooth',root*r*(1+(i-1.5)*.003))),f=F('lowpass',k=='tension'?400:700);lfo(.07+i*.03,120,f.frequency);const g=G(.16/(1+i*.4));a.connect(f);f.connect(g);g.connect(out)});if(k=='tension'){const tr=G(0),t0=start(OSC('triangle',root*4)),tl=start(OSC('sine',5.5)),tg=G(.05);tl.connect(tg);tg.connect(tr.gain);tr.gain.value=.06;t0.connect(tr);tr.connect(out)}}
  // ----- لحظية -----
  else if(k=='boom'){const t=now();once(4);const s=this._ns();nodes.push(s);const f=F('lowpass',1400,.7),g=G(0);f.frequency.setValueAtTime(1800,t);f.frequency.exponentialRampToValueAtTime(70,t+1.6);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1.6,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+2.6);s.connect(f);f.connect(g);g.connect(out);s.start(t);reg(s);
   const b=OSC('sine',90),bg=G(0);b.frequency.setValueAtTime(90,t);b.frequency.exponentialRampToValueAtTime(24,t+1.2);bg.gain.setValueAtTime(0,t);bg.gain.linearRampToValueAtTime(1.8,t+.015);bg.gain.exponentialRampToValueAtTime(.001,t+2.2);b.connect(bg);bg.connect(out);b.start(t);b.stop(t+2.4);
   const cr=this._ns(),cf=F('highpass',2400),cg=G(0);cg.gain.setValueAtTime(0,t);cg.gain.linearRampToValueAtTime(.5,t+.004);cg.gain.exponentialRampToValueAtTime(.001,t+.35);cr.connect(cf);cf.connect(cg);cg.connect(out);cr.start(t);reg(cr)}
  else if(k=='thud'||k=='thump'){const t=now();once(.8);const b=OSC('sine',k=='thud'?110:70),bg=G(0);b.frequency.setValueAtTime(k=='thud'?110:70,t);b.frequency.exponentialRampToValueAtTime(34,t+.18);bg.gain.setValueAtTime(0,t);bg.gain.linearRampToValueAtTime(1.3,t+.006);bg.gain.exponentialRampToValueAtTime(.001,t+.45);b.connect(bg);bg.connect(out);b.start(t);b.stop(t+.5);const s=this._ns(),f=F('lowpass',700),g=G(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.7,t+.004);g.gain.exponentialRampToValueAtTime(.001,t+.22);s.connect(f);f.connect(g);g.connect(out);s.start(t);reg(s)}
  else if(k=='bang'){const t=now();once(1.2);const s=this._ns(),f=F('bandpass',1800,.5),g=G(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1.4,t+.002);g.gain.exponentialRampToValueAtTime(.001,t+.5);s.connect(f);f.connect(g);g.connect(out);s.start(t);reg(s);const b=OSC('sine',140),bg=G(0);b.frequency.setValueAtTime(140,t);b.frequency.exponentialRampToValueAtTime(40,t+.15);bg.gain.setValueAtTime(.9,t);bg.gain.exponentialRampToValueAtTime(.001,t+.35);b.connect(bg);bg.connect(out);b.start(t);b.stop(t+.4)}
  else if(k=='crash'||k=='glass'){const t=now(),gl=k=='glass';once(gl?1.6:2.4);for(let i=0;i<(gl?14:10);i++){const tt=t+Math.random()*(gl?.5:.9),s=this._ns(),f=F('bandpass',(gl?2500:700)+Math.random()*(gl?5000:2200),gl?7:3),g=G(0);g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime((gl?.22:.4)*(1-i*.05),tt+.003);g.gain.exponentialRampToValueAtTime(.001,tt+(gl?.25:.45));s.connect(f);f.connect(g);g.connect(out);s.start(tt);reg(s)}
   if(!gl){const b=OSC('sine',70),bg=G(0);b.frequency.setValueAtTime(70,t);b.frequency.exponentialRampToValueAtTime(28,t+.8);bg.gain.setValueAtTime(.9,t);bg.gain.exponentialRampToValueAtTime(.001,t+1.2);b.connect(bg);bg.connect(out);b.start(t);b.stop(t+1.3)}}
  else if(k=='whoosh'){const t=now();once(1.6);const s=this._ns(),f=F('bandpass',300,1.2),g=G(0);f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(3500,t+.5);f.frequency.exponentialRampToValueAtTime(400,t+1.2);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.4);g.gain.exponentialRampToValueAtTime(.001,t+1.3);s.connect(f);f.connect(g);g.connect(out);s.start(t);reg(s)}
  else if(k=='ding'){const t=now();once(2.4);[[880,.5],[1318,.3]].forEach(([fr,v],i)=>{const a=OSC('sine',fr),g=G(0),tt=t+i*.38;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(v,tt+.008);g.gain.exponentialRampToValueAtTime(.001,tt+1.6);a.connect(g);g.connect(out);a.start(tt);a.stop(tt+1.8)})}
  else if(k=='click'||k=='snap'||k=='pop'){const t=now();once(.4);const s=this._ns(),f=F(k=='pop'?'lowpass':'highpass',k=='pop'?600:2500),g=G(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.001);g.gain.exponentialRampToValueAtTime(.001,t+(k=='snap'?.12:.05));s.connect(f);f.connect(g);g.connect(out);s.start(t);reg(s)}
  else if(k=='metal'){const t=now();once(2);[[320,.5],[517,.35],[811,.3],[1190,.25],[1710,.15]].forEach(([fr,v])=>{const a=OSC('triangle',fr*(1+Math.random()*.02)),g=G(0);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.001,t+1.2+Math.random()*.6);a.connect(g);g.connect(out);a.start(t);a.stop(t+2)})}
  else if(k=='zap'){const t=now();once(.6);const a=OSC('sawtooth',2200),g=G(0);a.frequency.setValueAtTime(2200,t);a.frequency.exponentialRampToValueAtTime(90,t+.3);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);a.connect(g);g.connect(out);a.start(t);a.stop(t+.4)}
  else{const a=start(OSC('sine',110));a.connect(out)}
  return{n:out,ctl}},
 async play(id,o){if(!this.init())return;this.stop(id);const c=this.c,g=c.createGain(),vol=o.vol??.5,fd=o.fade||0;g.gain.value=fd?0:vol;if(fd)g.gain.linearRampToValueAtTime(vol,c.currentTime+fd);let src,ctl={};
  try{if(o.synth){const s=this._syn(o.synth,o);src=s.n;ctl=s.ctl}else if(o.url){const s=c.createBufferSource();s.buffer=await this._buf(o.url);s.loop=o.loop!==false;s.playbackRate.value=o.rate||1;s.start();src=s;ctl.stop=()=>s.stop();ctl.rate=r=>s.playbackRate.value=r}else return}catch(e){return}
  src.connect(g);let pan=null,tail=g;if(o.at){pan=c.createPanner();pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=o.ref||2;pan.maxDistance=o.max||60;pan.rolloffFactor=o.roll??1.2;g.connect(pan);pan.connect(this.out)}else if(o.pan!=null&&c.createStereoPanner){const sp=c.createStereoPanner();sp.pan.value=o.pan;g.connect(sp);sp.connect(this.out)}else g.connect(this.out);
  if(o.rev&&this.rv){const rg=c.createGain();rg.gain.value=o.rev;g.connect(rg);rg.connect(this.rv)}
  const ent={g,pan,at:o.at,ctl,keep:!!o.keep};this.m.set(id,ent);
  const life=o.dur||(ctl.once?ctl.once:0);if(life){const fo=o.dur?Math.min(o.fade||.4,.6):0;setTimeout(()=>{if(this.m.get(id)===ent)this.stop(id,fo)},(life-fo)*1000)}},
 set(id,o){const e=this.m.get(id);if(!e)return;const t=this.c.currentTime,d=o.dur||0;if(o.vol!=null){const p=e.g.gain;p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);d?p.linearRampToValueAtTime(o.vol,t+d):p.setValueAtTime(o.vol,t)}if(o.rate!=null&&e.ctl.rate)e.ctl.rate(o.rate)},
 stop(id,fade){const e=this.m.get(id);if(!e)return;const done=()=>{try{e.ctl.stop&&e.ctl.stop()}catch(x){}try{e.g.disconnect();e.pan&&e.pan.disconnect()}catch(x){}};this.m.delete(id);if(fade>0&&this.c){const t=this.c.currentTime,p=e.g.gain;try{p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(0,t+fade)}catch(x){}setTimeout(done,fade*1000+60)}else done()}});

// =====================================================================
// ============ امتدادات World (v3): معالجة لاحقة + إجراءات جديدة =========
// =====================================================================
const _L0=World.prototype.loadScene,_D0=World.prototype.dispose;
Object.assign(World.prototype,{
 _post(){if(this.post!==undefined)return this.post;const q=this.q.post;this.post=(q=='off'||this.o.post===false)?null:new Post(this.TH,this.r,{lite:q=='lite'});return this.post},
 applyPost(sc){const P=this._post();if(!P)return;if(sc&&sc.post){P.P=JSON.parse(JSON.stringify(POST_DEF));if(sc.post.look)P.set(POSTLOOK[sc.post.look]||{});P.set(sc.post);this.dof0=sc.post.dof&&typeof sc.post.dof=='object'?sc.post.dof:sc.post.dof?{}:null}else if(!(sc&&sc.continue)){P.P=JSON.parse(JSON.stringify(POST_DEF));this.dof0=null}
  },
 postTo(spec,dur,ease){const P=this._post();if(!P)return;const A=JSON.parse(JSON.stringify(P.P));P.set(spec);const B=P.P;if(!(dur>0))return;P.P=JSON.parse(JSON.stringify(A));
  const ez=EASE[ease||'inout']||EASE.inout,ks=Object.keys(B).filter(k=>JSON.stringify(A[k])!=JSON.stringify(B[k])&&typeof B[k]!='string'&&k!='focusSpec'),fl=(a,b,u)=>Array.isArray(a)?a.map((x,i)=>x+(b[i]-x)*u):a+(b-a)*u;let t=0;
  ['dof','focusSpec'].forEach(k=>{if(k in B)P.P[k]=B[k]});
  this._tw('post:'+ks.join(),dt=>{t+=dt;const u=ez(Math.min(1,t/dur));ks.forEach(k=>{if(k!='dof')P.P[k]=fl(A[k],B[k],u)});return t>=dur},()=>{ks.forEach(k=>P.P[k]=B[k])})},
 render(){const o=this.o,r=this.r,cam=this.cam,draw=()=>o.outline?o.outline.render(this.S,cam):r.render(this.S,cam),P=this._post();
  if(!P||!P.on){draw();return}
  const dd=this.rig.dofs||this.dof0;P.P.dof=dd&&dd.on!==false&&this.q.dof?1:0;let f=null;
  if(P.P.dof){if(dd.range!=null)P.P.range=dd.range;P.P.dofBlur=dd.blur??1;f=dd.focus??P.P.focusSpec;if(typeof f=='string'){const e=this.get(f);f=e?e.getWorldPosition(new this.TH.Vector3()).distanceTo(cam.position):8}if(f==null)f=8}
  P.render(draw,cam,f,this._dt||.016)},
 loadScene(sc){if(sc&&sc.env&&(sc.env.rim||sc.env.rimK!=null))setRim(sc.env.rim,sc.env.rimK);this.applyPost(sc);return _L0.call(this,sc)},
 dispose(){this.post&&this.post.dispose();return _D0.call(this)},
 fx(id,a){const o=this.get(id);if(!o)return;if(a.on!==undefined||(a.burst==null&&a.k==null))o.visible=a.on!==false;const f=o.userData.fxo;if(f){if(a.burst){f.restart()}if(a.k!=null)f.setK(a.k)}},
 sound(a){if(this.mute&&!a.force)return;if(a.stop){this.audio.stop(a.stop,a.fade);return}if(a.set){this.audio.set(a.id,a.set);return}this.audio.play(a.id||a.synth||a.url,{...a,at:a.at?this._res(a.at):null})},
 extra(a){switch(a.a){
  case'post':this.postTo(a.set||(({a:_,dur:__,ease:___,dt:____,...r})=>r)(a),a.dur,a.ease);break;
  case'fade':this.postTo({fade:a.to??1,...(a.color?{fadeColor:a.color}:{})},a.dur??1,a.ease);break;
  case'flash':{const P=this._post();if(!P)break;P.set({flash:a.i??1,...(a.color?{flashColor:a.color}:{})});this.postTo({flash:0},a.dur??.6,'out');break}
  case'grade':this.postTo(a.set||(({a:_,dur:__,...r})=>r)(a),a.dur??1.5,a.ease);break;
  case'bars':this.postTo({bars:a.to??.12},a.dur??1);break;
  case'pulse':{const P=this._post();if(!P)break;P.set({pulse:a.i??.8,...(a.color?{pulseColor:a.color}:{})});this.postTo({pulse:0},a.dur??1.2,'out');break}
  case'expr':{const e=this.E.get(a.id);e&&e.rig&&e.rig.expr&&e.rig.expr(a.n||a.name||'neutral',a.w);break}
  case'gesture':{const e=this.E.get(a.id);e&&e.rig&&e.rig.gesture&&e.rig.gesture(a.n,a.dur);break}
  case'hands':{const e=this.E.get(a.id);e&&e.rig&&e.rig.hands&&e.rig.hands(a.n||a.r||'relax',a.l);break}
  case'face':{const e=this.E.get(a.id);e&&e.rig&&e.rig.face&&e.rig.face(a.set||{});break}
  case'blink':{const e=this.E.get(a.id);e&&e.rig&&e.rig.blink&&e.rig.blink();break}
  case'muffle':this.audio.init&&this.audio.init();this.audio.muffle(a.f,a.dur);break;
  case'master':this.audio.master(a.v??1,a.dur);break;
  case'horizon':this.horizon(a);break;
  case'fling':this.fling(a);break;
  case'ambient':this.ambient(a);break;
  case'spawn':{const s={...(a.spec||{})};this.spawn(a.id,s);if(s.parent)this.attach(a.id,s.parent,{pos:s.pos||[0,0,0],rot:s.rot,keep:false});break}
  case'remove':this.remove(a.id);break;
  case'slow':this.timeScale=a.to??1;if(a.dur)this.dir.later(a.dur,()=>this.timeScale=a.back??1);break;
  }}
});
const _SE0=World.prototype.setEnv,_U0=World.prototype.update,_CR0=CamRig.prototype.update,_CRS=CamRig.prototype.set;
Object.assign(World.prototype,{
 _H(){if(!this.H){this.H=new this.TH.Group();this.H.matrixAutoUpdate=false;this.S.add(this.H);this.hz=this.hz||{roll:0,pitch:0,yaw:0,rise:0,pivot:[0,1.2,-3]}}return this.H},
 setEnv(E){_SE0.call(this,E);this._H();const gnd=this.env&&this.env.objs.find(o=>o.userData&&o.userData.isGround);if(gnd){this.S.remove(gnd);this.H.add(gnd)}this._applyH()},
 _applyH(){const hz=this.hz;if(!hz||!this.H)return;const TH=this.TH,q=new TH.Quaternion().setFromEuler(new TH.Euler(hz.pitch*D2R,hz.yaw*D2R,hz.roll*D2R,'ZXY')),p=new TH.Vector3(...hz.pivot),M=new TH.Matrix4().makeTranslation(p.x,p.y,p.z).multiply(new TH.Matrix4().makeRotationFromQuaternion(q)).multiply(new TH.Matrix4().makeTranslation(0,hz.rise,0)).multiply(new TH.Matrix4().makeTranslation(-p.x,-p.y,-p.z));
  this.H.matrix.copy(M);this.H.matrixWorldNeedsUpdate=true;if(this.env&&this.env.sky)this.env.sky.o.quaternion.copy(q)},
 horizon(a){const hz=(this._H(),this.hz),ks=['roll','pitch','yaw','rise'],f0={},t={};ks.forEach(k=>{f0[k]=hz[k];t[k]=a[k]!=null?+a[k]:hz[k]});if(a.pivot)hz.pivot=a.pivot;const d=a.dur||0,ez=EASE[a.ease||'inout']||EASE.inout;
  if(!(d>0)){ks.forEach(k=>hz[k]=t[k]);this._applyH();return}let tt=0;this._tw('hz',dt=>{tt+=dt;const u=ez(Math.min(1,tt/d));ks.forEach(k=>hz[k]=f0[k]+(t[k]-f0[k])*u);return tt>=d})},
 // رمي جسم/أجسام بفيزياء بسيطة: {ids|id, vel:[x,y,z], spin:[x,y,z]°/ث, grav:[0,-9.8,0], dur, floor:y, bounce, jitter}
 fling(a){const ids=a.ids||[a.id];ids.forEach(id=>{const o=this.get(id);if(!o)return;const R=Math.random,j=a.jitter||0,v=new this.TH.Vector3(...(a.vel||[0,2,0])).add(new this.TH.Vector3((R()-.5)*j,(R()-.5)*j,(R()-.5)*j)),sp=(a.spin||[0,0,0]).map(x=>(x+(R()-.5)*(a.sj||0))*D2R),g=a.grav||[0,-9.8,0],fl=a.floor,bn=a.bounce??.3,D=a.dur||3;let t=0;
  this._tw('fl:'+id,dt=>{t+=dt;v.x+=g[0]*dt;v.y+=g[1]*dt;v.z+=g[2]*dt;o.position.addScaledVector(v,dt);o.rotation.x+=sp[0]*dt;o.rotation.y+=sp[1]*dt;o.rotation.z+=sp[2]*dt;if(fl!=null&&o.position.y<fl){o.position.y=fl;v.y=-v.y*bn;v.x*=.8;v.z*=.8;sp[0]*=.6;sp[1]*=.6;sp[2]*=.6}return t>=D})})},
 // تدرّج الإضاءة والضباب والسماء الحالية: {hemi:{i,c}, sun:{i,c}, fog:{d,c}, sky:{top,mid,bottom}, dur}
 ambient(a){const E=this.env;if(!E)return;const TH=this.TH,d=a.dur||0,ez=EASE[a.ease||'inout']||EASE.inout,jobs=[];
  const cl=(o,k,to)=>{const f=o[k].clone(),t=new TH.Color(to);jobs.push(u=>o[k].lerpColors(f,t,u))},nm=(o,k,to)=>{const f=o[k];jobs.push(u=>o[k]=f+(to-f)*u)};
  if(a.hemi&&E.hemi){if(a.hemi.i!=null)nm(E.hemi,'intensity',a.hemi.i);if(a.hemi.c)cl(E.hemi,'color',a.hemi.c);if(a.hemi.g)cl(E.hemi,'groundColor',a.hemi.g)}
  if(a.sun&&E.sun){if(a.sun.i!=null)nm(E.sun,'intensity',a.sun.i);if(a.sun.c)cl(E.sun,'color',a.sun.c)}
  if(a.fog&&this.S.fog){if(a.fog.d!=null&&this.S.fog.density!=null)nm(this.S.fog,'density',a.fog.d);if(a.fog.c)cl(this.S.fog,'color',a.fog.c)}
  if(a.sky&&E.sky){const u=E.sky.o.children[0]&&E.sky.o.children[0].material&&E.sky.o.children[0].material.uniforms;if(u){if(a.sky.top)cl(u.top,'value',a.sky.top);if(a.sky.mid)cl(u.mid,'value',a.sky.mid);if(a.sky.bottom)cl(u.bot,'value',a.sky.bottom)}}
  if(a.bg&&this.S.background)cl(this.S,'background',a.bg);
  if(a.lights)for(const id in a.lights){const o=this.get(id),L=o&&o.userData.light;if(L){if(a.lights[id].i!=null)nm(L,'intensity',a.lights[id].i);if(a.lights[id].c)cl(L,'color',a.lights[id].c)}}
  if(!(d>0)){jobs.forEach(j=>j(1));return}let t=0;this._tw('amb'+Math.random(),dt=>{t+=dt;const u=ez(Math.min(1,t/d));jobs.forEach(j=>j(u));return t>=d})},
 update(dt){_U0.call(this,dt);this._applyH()},
});
// كاميرا: ميل (roll) واهتزاز يد خفيف دائم يعطي حياة
CamRig.prototype.set=function(s){_CRS.call(this,s);return this};
CamRig.prototype.update=function(dt){_CR0.call(this,dt);const s=this.s||{},c=this.c,D=Math.PI/180;this._hn=(this._hn||0)+dt;
 const rt=(s.roll||0)*D;this._roll=this._roll==null?rt:this._roll+(rt-this._roll)*(1-Math.exp(-dt*(s.rollRate||3)));if(Math.abs(this._roll)>1e-4)c.rotateZ(this._roll);
 const ha=s.hand!=null?s.hand:(this.hand0??.0035);if(ha>0){const t=this._hn;c.position.x+=Math.sin(t*1.7)*ha+Math.sin(t*3.1+1)*ha*.4;c.position.y+=Math.sin(t*1.3+2)*ha*.8+Math.sin(t*2.7)*ha*.3;c.rotateX(Math.sin(t*1.1)*ha*.5);c.rotateY(Math.sin(t*.9+1)*ha*.5)}};
const POSTLOOK={
 telltale:{contrast:1.08,saturation:1.12,vignette:.32,grain:.03,paint:.55,bloom:.25},
 cinematic:{contrast:1.12,saturation:.95,vignette:.4,grain:.04,bars:.1,bloom:.4,temperature:.08},
 noir:{contrast:1.25,saturation:.1,vignette:.55,grain:.07,bloom:.3},
 warm:{temperature:.5,saturation:1.1,bloom:.45,vignette:.3},
 cold:{temperature:-.5,saturation:.9,bloom:.3,vignette:.35},
 danger:{contrast:1.2,saturation:1.05,temperature:.25,vignette:.5,bloom:.55,aberration:.002}};
export const POST_LOOKS=Object.keys(POSTLOOK);
