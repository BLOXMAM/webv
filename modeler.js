// ======================= modeler.js — استوديو النمذجة الحرّة (مثل Blender مصغّر) =======================
// الاستعمال: import {openModeler} from './modeler.js'; openModeler({part,toast,done,TH?,title?})
// part = {s:'mesh', mesh, mods, mats, ...}: يُعدَّل في المكان ويُحفظ عند الإغلاق.
import*as K from './kit3d.js';
const{PMesh,MO,prim,applyMods,meshGeo,faceN,faceCenter,topo,vertFaces,vertNeighbors,compact,orientOutward,subsurf}=K,ek=K.MESH_EK,dk=K.MESH_DK;
const THU='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const CSS=`.md{position:fixed;inset:0;z-index:99999;background:#0c0f15;color:#ece7db;display:flex;flex-direction:column;font:14px/1.4 Tajawal,system-ui,sans-serif;--ac:#e0b862;--pn:#161a24;--p2:#1e2331;--ln:#2a3144;--mu:#9aa1b4;--rd:#e5675d;touch-action:none}
.md *{box-sizing:border-box}.md button{font:inherit;background:var(--p2);color:#ece7db;border:1px solid var(--ln);border-radius:8px;padding:6px 10px;cursor:pointer;white-space:nowrap}
.md button:hover{border-color:var(--ac)}.md button.on{background:var(--ac);color:#1a1408;border-color:var(--ac);font-weight:700}.md button.sm{padding:3px 7px;font-size:12px}.md button:disabled{opacity:.4}
.md input,.md select{font:inherit;background:#0e1118;color:#ece7db;border:1px solid var(--ln);border-radius:6px;padding:3px 6px}.md input[type=range]{padding:0;width:100%}.md input[type=color]{padding:1px;width:40px;height:28px}
.md .bar{display:flex;gap:6px;align-items:center;padding:6px 8px;background:var(--pn);border-bottom:1px solid var(--ln);flex-wrap:wrap}.md .main{flex:1;display:flex;min-height:0}.md .vp{flex:1;position:relative;min-width:0;min-height:0}
.md canvas{width:100%;height:100%;display:block}.md .side{width:340px;max-width:46vw;overflow:auto;background:var(--pn);border-inline-start:1px solid var(--ln);padding:8px}
.md .tb{position:absolute;top:8px;inset-inline-start:8px;display:flex;flex-direction:column;gap:4px;max-height:calc(100% - 16px);overflow:auto}
.md .hint{position:absolute;bottom:6px;inset-inline:8px;font-size:12px;color:var(--mu);pointer-events:none;text-shadow:0 1px 2px #000}.md .stat{position:absolute;top:8px;inset-inline-end:8px;font-size:12px;color:var(--mu);pointer-events:none;text-align:end}
.md .row{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin:4px 0}.md .card{background:var(--p2);border:1px solid var(--ln);border-radius:10px;padding:7px;margin:6px 0}.md h4{margin:6px 0 2px;font-size:13px;color:var(--ac)}
.md label.L{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--mu);flex:1;min-width:90px}.md .tabs{display:flex;gap:4px;margin-bottom:6px}.md .tabs button{flex:1}
.md .mu{color:var(--mu);font-size:12px}.md .sw{display:flex;gap:4px;align-items:center;padding:3px 6px;border:1px solid var(--ln);border-radius:8px;cursor:pointer}.md .sw.on{border-color:var(--ac);background:#2a2415}
@media(max-width:820px){.md .main{flex-direction:column}.md .side{width:auto;max-width:none;height:34vh;border-inline-start:0;border-top:1px solid var(--ln)}.md.pmin .side{height:0;padding:0;overflow:hidden;border:0}.md.pbig .side{height:62vh}.md.pmid .side{height:34vh}
.md .bar{flex-wrap:nowrap;overflow-x:auto;gap:4px;padding:4px 6px}.md .bar button{padding:5px 8px;font-size:13px}.md .bar .ttl,.md .bar .lb{display:none}.md .vp{min-height:38vh}
.md .tb{top:auto;bottom:0;inset-inline:0;max-height:none;flex-direction:row;flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;gap:3px;padding:4px 6px;background:#0c0f15cc;max-width:none}.md .tb{align-items:center;height:auto}.md .tb .row{flex-wrap:nowrap;margin:0;flex:none}.md .tb button{padding:4px 8px;font-size:12px;flex:none;height:32px;width:auto;white-space:nowrap}.md .hint{display:none}.md .stat{font-size:10px}
.md .card{padding:5px}.md button.sm{padding:5px 8px}}
.md .btn-pn{display:none}@media(max-width:820px){.md .btn-pn{display:inline-block}}`;
const h=(t,a,...k)=>{const e=document.createElement(t);for(const x in a||{}){const v=a[x];if(v==null)continue;if(x.startsWith('on'))e[x]=v;else if(x=='class')e.className=v;else if(x=='style')e.style.cssText=v;else if(x in e&&x!='list'&&x!='type'){try{e[x]=v}catch(_){e.setAttribute(x,v)}}else e.setAttribute(x,v)}
 k.flat(9).forEach(c=>{if(c!=null&&c!==false)e.append(c instanceof Node?c:document.createTextNode(c))});return e};
const D2R=Math.PI/180,r3=x=>Math.round(x*1e3)/1e3;
export const MD_TEX=[['','بلا خامة'],['checker','رقعة'],['stripes','خطوط'],['dots','نقاط'],['grid','شبكة'],['bricks','طوب'],['planks','ألواح خشب'],['noise','حبيبات'],['fabric','قماش'],['carpet','سجاد'],['leather','جلد'],['metal','معدن'],['wood','خشب'],['tiles','بلاط'],['concrete','خرسانة'],['paper','ورق'],['wallpaper','ورق جدران']];
export async function openModeler(c){
 const TH=c.TH||await import(THU),toast=c.toast||(m=>console.log(m)),part=c.part;
 part.s='mesh';if(!part.mesh)part.mesh=prim('cube',{size:1}).toJSON();part.mods=part.mods||{};if(!part.mats||!part.mats.length)part.mats=[{c:part.c||'#c9a46a'}];
 if(!document.getElementById('md-css'))document.head.append(h('style',{id:'md-css'},CSS));
 // ---------- الحالة ----------
 let M=PMesh.fromJSON(part.mesh);
 const sel={v:new Set(),e:new Set(),f:new Set()};
 let smode='v',emode='edit',tool='move',orient='global',snapOn=false,xray=false,sym={x:false,y:false,z:false},prop={on:false,r:.4},shade='solid',ortho=false,showFaceDir=false,wireOv=true,activeMat=0,tab='tools',showMods=true,multi=false,
  yaw=.7,pit=.45,dist=5.5,tg=new TH.Vector3(0,0,0),dirty=false,topoDirty=true,undoS=[],redoS=[],last=null,hint='',gr=null,brush={t:'draw',r:.25,s:.5,sub:false,front:true,col:'#d9534f',a:1},ring=null,alive=true,hover=null,viewAnim=null;
 // ---------- الواجهة ----------
 const root=h('div',{class:'md',dir:'rtl'}),cv=h('canvas'),vp=h('div',{class:'vp'},cv),side=h('div',{class:'side'}),tb=h('div',{class:'tb'}),hintEl=h('div',{class:'hint'}),statEl=h('div',{class:'stat'}),bar=h('div',{class:'bar'}),main=h('div',{class:'main'},vp,side);
 vp.append(tb,hintEl,statEl);root.append(bar,main);if(innerWidth<=820)root.classList.add('pmid');(document.querySelector('dialog[open]')||document.body).append(root);
 const rd=new TH.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:!!c.test});rd.setPixelRatio(Math.min(devicePixelRatio||1,2));rd.setClearColor(0x1b2030);rd.autoClear=false;
 const scene=new TH.Scene(),oscene=new TH.Scene(),cam=new TH.PerspectiveCamera(45,1,.01,500),ocam=new TH.OrthographicCamera(-2,2,2,-2,-500,500);let C=cam;
 scene.add(new TH.HemisphereLight(0xffffff,0x6a6f80,1.15));const dl=new TH.DirectionalLight(0xffffff,1.6);scene.add(dl,dl.target);
 const grid=new TH.GridHelper(10,20,0x6a728a,0x363d52);grid.material.depthWrite=false;scene.add(grid);
 const ax=[[1,0,0,0xe5675d],[0,1,0,0x7bd88f],[0,0,1,0x6aa8ff]].map(([x,y,z,col])=>{const g=new TH.BufferGeometry().setFromPoints([new TH.Vector3(-5*x,-5*y,-5*z),new TH.Vector3(5*x,5*y,5*z)]);const l=new TH.Line(g,new TH.LineBasicMaterial({color:col,transparent:true,opacity:.55,depthWrite:false}));return l});ax[1].visible=false;ax.forEach(a=>scene.add(a));
 const gm=K.gmap(TH),Mt=K.mat(TH,gm,true);
 const clay=new TH.MeshStandardMaterial({color:0xc4bdb0,roughness:.78,metalness:0,polygonOffset:true,polygonOffsetFactor:1.5,polygonOffsetUnits:1.5,side:TH.FrontSide});
 let solid=null,pickMesh=null,cageL=null,cageP=null,faceHL=null,backM=null,eList=[],eMap=new Map();
 // ---------- أدوات صغيرة ----------
 const V3=(a)=>new TH.Vector3(a[0],a[1],a[2]),arr=(v)=>[v.x,v.y,v.z];
 const cloneSel=()=>({v:new Set(sel.v),e:new Set(sel.e),f:new Set(sel.f)}),setSelRaw=s=>{sel.v=new Set(s.v);sel.e=new Set(s.e);sel.f=new Set(s.f)};
 const status=t=>{hint=t;hintEl.textContent=t};
 // اشتقاق بقية المجموعات من المجموعة الأساسية حسب النمط
 function norm(){const n=M.nv;
  if(smode=='v'){for(const i of[...sel.v])if(i>=n)sel.v.delete(i);sel.e=MO.vertsToEdges(M,sel.v);sel.f=MO.vertsToFaces(M,sel.v)}
  else if(smode=='e'){const E=eMap.size?eMap:null;sel.e=new Set([...sel.e].filter(k=>{const[a,b]=dk(k);return a<n&&b<n}));sel.v=MO.edgesToVerts(sel.e);sel.f=MO.edgesToFaces(M,sel.e)}
  else{sel.f=new Set([...sel.f].filter(i=>i<M.f.length));sel.v=MO.facesToVerts(M,sel.f);sel.e=MO.facesToEdges(M,sel.f)}}
 function setMode(m){if(smode==m)return;if(m=='v'){/* v من e/f */}else if(m=='e'){sel.e=smode=='v'?MO.vertsToEdges(M,sel.v):MO.facesToEdges(M,sel.f)}else{sel.f=smode=='v'?MO.vertsToFaces(M,sel.v):MO.edgesToFaces(M,sel.e)}smode=m;norm();overlay();ui()}
 // ---------- تراجع/إعادة ----------
 const snap=()=>({m:M.clone(),mods:JSON.stringify(part.mods),mats:JSON.stringify(part.mats),sel:cloneSel(),smode});
 function pushUndo(){undoS.push(snap());if(undoS.length>40)undoS.shift();redoS.length=0;last=null;dirty=true}
 function restore(s){M=s.m.clone();part.mods=JSON.parse(s.mods);part.mats=JSON.parse(s.mats);smode=s.smode;setSelRaw(s.sel);topoDirty=true;last=null;rebuild();ui()}
 function undo(){if(emode=='tex'&&texUndo())return;if(!undoS.length)return toast('لا يوجد ما يُتراجع عنه');redoS.push(snap());restore(undoS.pop())}
 function redo(){if(!redoS.length)return;undoS.push(snap());restore(redoS.pop())}
 // ---------- بناء العرض ----------
 const dispose=o=>{if(!o)return;o.geometry&&o.geometry.dispose();scene.remove(o)};
 function evalMesh(){return emode=='edit'&&showMods||emode=='view'?applyMods(M,part.mods):M}
 function rebuild(){const t0=performance.now();
  dispose(solid);dispose(backM);solid=null;backM=null;
  const E=evalMesh();let g;
  if(shade=='mat'||emode=='view'){const q={...part,mesh:M.toJSON(),mods:emode=='sculpt'||emode=='paint'?{}:part.mods};solid=K.mkMeshPart(TH,q,Mt,K.skinMat);solid.traverse(o=>{o.material&&[].concat(o.material).forEach(m=>{m.polygonOffset=true;m.polygonOffsetFactor=1.5;m.polygonOffsetUnits=1.5})})}
  else{g=meshGeo(TH,E,{sa:part.sa??part.mods.sa??50,mats:1});solid=new TH.Mesh(g,shade=='wire'?new TH.MeshBasicMaterial({color:0x8a93ad,wireframe:true}):shade=='vc'&&E.vc?new TH.MeshBasicMaterial({vertexColors:true}):clay);if(shade=='vc'&&E.vc)solid.material.polygonOffset=true,solid.material.polygonOffsetFactor=1.5}
  scene.add(solid);
  if(showFaceDir){const gb=meshGeo(TH,E,{sa:50,mats:1});backM=new TH.Mesh(gb,new TH.MeshBasicMaterial({color:0xff2a2a,side:TH.BackSide}));scene.add(backM)}
  pickMesh=new TH.Mesh(meshGeo(TH,M,{sa:50,mats:1}),new TH.MeshBasicMaterial({side:TH.DoubleSide}));pickMesh.updateMatrixWorld(true);
  overlay();stats(performance.now()-t0)}
 function stats(ms){let tr=0;M.f.forEach(f=>tr+=f.length-2);statEl.innerHTML='رؤوس '+M.nv+' · وجوه '+M.f.length+' · مثلثات '+tr+(ms?'<br>'+ms.toFixed(0)+'ms':'')}
 function overlay0(){dispose(cageL);dispose(cageP);dispose(faceHL);cageL=cageP=faceHL=null;if(emode!='edit'){return}
  if(topoDirty){eMap=topo(M);eList=[...eMap.keys()];topoDirty=false}
  const nE=eList.length,lp=new Float32Array(nE*6),lc=new Float32Array(nE*6);const SE=sel.e,SV=sel.v;
  for(let i=0;i<nE;i++){const k=eList[i],e=eMap.get(k),a=e.a,b=e.b;lp.set([M.v[3*a],M.v[3*a+1],M.v[3*a+2],M.v[3*b],M.v[3*b+1],M.v[3*b+2]],i*6);
   const s=SE.has(k),cr=M.cr.get(k)>0,bd=e.fs.length!=2;const col=s?[1,.62,.1]:cr?[1,.3,.9]:bd?[.35,.85,1]:[.04,.04,.06];const ca=smode=='v'&&SV.has(a)?[1,.62,.1]:col,cb=smode=='v'&&SV.has(b)?[1,.62,.1]:col;lc.set([...ca,...cb],i*6)}
  const lg=new TH.BufferGeometry();lg.setAttribute('position',new TH.BufferAttribute(lp,3));lg.setAttribute('color',new TH.BufferAttribute(lc,3));cageL=new TH.LineSegments(lg,new TH.LineBasicMaterial({vertexColors:true,depthTest:!xray,transparent:true,opacity:.9}));cageL.renderOrder=3;scene.add(cageL);
  // نقاط: رؤوس (نمط v) أو مراكز الوجوه (نمط f)
  let pp=[],pc=[];if(smode=='v'){for(let i=0;i<M.nv;i++){pp.push(M.v[3*i],M.v[3*i+1],M.v[3*i+2]);pc.push(...(SV.has(i)?[1,.62,.1]:[.05,.05,.07]))}}
  else if(smode=='f'){M.f.forEach((f,fi)=>{const c=faceCenter(M,f);pp.push(...c);pc.push(...(sel.f.has(fi)?[1,.62,.1]:[.1,.45,1]))})}
  else if(smode=='e'){}
  if(pp.length){const pg=new TH.BufferGeometry();pg.setAttribute('position',new TH.Float32BufferAttribute(pp,3));pg.setAttribute('color',new TH.Float32BufferAttribute(pc,3));cageP=new TH.Points(pg,new TH.PointsMaterial({size:smode=='v'?7:6,sizeAttenuation:false,vertexColors:true,depthTest:!xray}));cageP.renderOrder=4;scene.add(cageP)}
  if(sel.f.size){const pos=[];sel.f.forEach(fi=>{K.triangulate(M,M.f[fi]).forEach(t=>t.forEach(i=>pos.push(M.v[3*i],M.v[3*i+1],M.v[3*i+2])))});const fg=new TH.BufferGeometry();fg.setAttribute('position',new TH.Float32BufferAttribute(pos,3));faceHL=new TH.Mesh(fg,new TH.MeshBasicMaterial({color:0xffa31a,transparent:true,opacity:.38,side:TH.DoubleSide,depthTest:!xray,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,depthWrite:false}));faceHL.renderOrder=2;scene.add(faceHL)}
  placeGizmo()}

 // ---------- الكاميرا ----------
 function camUpdate(){const asp=Math.max(.1,cv.clientWidth/Math.max(1,cv.clientHeight));
  if(ortho){C=ocam;const s=dist*.5;ocam.left=-s*asp;ocam.right=s*asp;ocam.top=s;ocam.bottom=-s;ocam.updateProjectionMatrix()}else{C=cam;cam.aspect=asp;cam.updateProjectionMatrix()}
  const d=dist*(ortho?4:1);C.position.set(tg.x+Math.sin(yaw)*Math.cos(pit)*d,tg.y+Math.sin(pit)*d,tg.z+Math.cos(yaw)*Math.cos(pit)*d);C.up.set(0,1,0);C.lookAt(tg);C.updateMatrixWorld(true);dl.position.copy(C.position).add(new TH.Vector3(1,2,1));dl.target.position.copy(tg);}
 function viewTo(name){const V={front:[0,0],back:[Math.PI,0],right:[Math.PI/2,0],left:[-Math.PI/2,0],top:[yaw,Math.PI/2-.001],bottom:[yaw,-Math.PI/2+.001],persp:[.7,.45]};const v=V[name];if(!v)return;ortho=name!='persp';viewAnim={y0:yaw,p0:pit,y1:v[0],p1:v[1],t:0};ui()}
 function frame(all){const pts=[];const src=all||!sel.v.size?[...Array(M.nv).keys()]:[...sel.v];if(!src.length)return;let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];src.forEach(i=>{for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],M.v[3*i+k]);mx[k]=Math.max(mx[k],M.v[3*i+k])}});tg.set((mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2);dist=Math.max(1.5,Math.hypot(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2])*2.1)}
 const rayOf=(e)=>{const b=cv.getBoundingClientRect(),ndc=new TH.Vector2((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1),r=new TH.Raycaster();camUpdate();r.setFromCamera(ndc,C);return r};
 const toScreen=(p)=>{const v=new TH.Vector3(p[0],p[1],p[2]).project(C),b=cv.getBoundingClientRect();return[(v.x+1)/2*b.width,(1-v.y)/2*b.height,v.z]};
 const pxScale=()=>{// وحدات عالم لكل بكسل عند المحور
  const b=cv.getBoundingClientRect();return ortho?dist/b.height:2*Math.tan(cam.fov*D2R/2)*C.position.distanceTo(tg)/b.height};
 // ---------- نقطة الارتكاز والأساس (orientation) ----------
 function pivot(){const vs=sel.v.size?[...sel.v]:[];if(!vs.length)return null;if(prop.pivot=='active'&&last&&last.active!=null)return M.pos(last.active);let x=0,y=0,z=0;vs.forEach(i=>{x+=M.v[3*i];y+=M.v[3*i+1];z+=M.v[3*i+2]});return[x/vs.length,y/vs.length,z/vs.length]}
 function basis(){// أعمدة الأساس B[0..2] كمتجهات
  if(orient=='view'){camUpdate();const m=C.matrixWorld.elements;return[new TH.Vector3(m[0],m[1],m[2]),new TH.Vector3(m[4],m[5],m[6]),new TH.Vector3(m[8],m[9],m[10])]}
  if(orient=='normal'&&sel.v.size){let n=new TH.Vector3();if(sel.f.size)sel.f.forEach(fi=>{const q=faceN(M,M.f[fi]);n.x+=q[0];n.y+=q[1];n.z+=q[2]});else{const N=MO.vertexNormals(M);sel.v.forEach(i=>{n.x+=N[i][0];n.y+=N[i][1];n.z+=N[i][2]})}
   if(n.lengthSq()>1e-12){n.normalize();const up=Math.abs(n.y)<.95?new TH.Vector3(0,1,0):new TH.Vector3(1,0,0);const u=new TH.Vector3().crossVectors(up,n).normalize(),w=new TH.Vector3().crossVectors(n,u);return[u,n,w]}}
  return[new TH.Vector3(1,0,0),new TH.Vector3(0,1,0),new TH.Vector3(0,0,1)]}
 // ---------- Gizmo ----------
 const giz=new TH.Group(),hits=[];oscene.add(giz);giz.visible=false;
 const GM=(col,op)=>new TH.MeshBasicMaterial({color:col,depthTest:false,depthWrite:false,transparent:true,opacity:op??1,toneMapped:false,side:TH.DoubleSide});
 const AXC=[0xe5675d,0x7bd88f,0x6aa8ff],YEL=0xffd24a;
 let gizTool=null;
 function buildGizmo(){while(giz.children.length)giz.remove(giz.children[0]);hits.length=0;if(!gizTool)return;const add=(o,hd,ro)=>{o.renderOrder=ro||999;giz.add(o);if(hd){o.userData.hd=hd;hits.push(o)}return o};
  const hid=()=>new TH.MeshBasicMaterial({visible:false});
  for(let i=0;i<3;i++){const R=new TH.Quaternion().setFromUnitVectors(new TH.Vector3(0,1,0),new TH.Vector3(i==0?1:0,i==1?1:0,i==2?1:0));
   if(gizTool=='move'||gizTool=='scale'){const sh=new TH.Mesh(new TH.CylinderGeometry(.018,.018,.8,8),GM(AXC[i]));sh.position.set(0,.4,0);const tip=gizTool=='move'?new TH.Mesh(new TH.ConeGeometry(.07,.2,12),GM(AXC[i])):new TH.Mesh(new TH.BoxGeometry(.13,.13,.13),GM(AXC[i]));tip.position.set(0,.9,0);
    const g=new TH.Group();g.add(sh,tip);g.quaternion.copy(R);add(g,null);const hb=new TH.Mesh(new TH.CylinderGeometry(.09,.09,1.05,8),hid());hb.position.set(0,.55,0);const hg=new TH.Group();hg.add(hb);hg.quaternion.copy(R);add(hg,{t:gizTool=='move'?'T':'S',a:i});hits[hits.length-1]=hg;hg.userData.hd={t:gizTool=='move'?'T':'S',a:i};
    if(gizTool=='move'){const j=(i+1)%3,k=(i+2)%3;const pl=new TH.Mesh(new TH.PlaneGeometry(.22,.22),GM(AXC[i],.45));const o=new TH.Group();const q=new TH.Mesh(new TH.PlaneGeometry(.22,.22),GM(AXC[i],.5));const pos=[0,0,0];pos[j]=.3;pos[k]=.3;q.position.set(...pos);// المستوى العمودي على المحور i
     q.quaternion.copy(new TH.Quaternion().setFromUnitVectors(new TH.Vector3(0,0,1),new TH.Vector3(i==0?1:0,i==1?1:0,i==2?1:0)));add(q,{t:'P',a:i},998)}}
   if(gizTool=='rot'){const ring=new TH.Mesh(new TH.TorusGeometry(1,.014,6,64),GM(AXC[i]));const q=new TH.Quaternion().setFromUnitVectors(new TH.Vector3(0,0,1),new TH.Vector3(i==0?1:0,i==1?1:0,i==2?1:0));ring.quaternion.copy(q);add(ring,null);const hr=new TH.Mesh(new TH.TorusGeometry(1,.09,6,48),hid());hr.quaternion.copy(q);add(hr,{t:'R',a:i})}}
  if(gizTool=='scale'){const c=new TH.Mesh(new TH.BoxGeometry(.2,.2,.2),GM(0xdddddd,.9));add(c,{t:'S',a:3})}
  if(gizTool=='rot'){const s=new TH.Mesh(new TH.SphereGeometry(.98,16,12),new TH.MeshBasicMaterial({visible:false}));giz.add(s)}}
 function placeGizmo(){const p=pivot();gizTool=emode=='edit'&&['move','rot','scale'].includes(tool)&&p?tool:null;if(giz.userData.tool!=gizTool){giz.userData.tool=gizTool;buildGizmo()}giz.visible=!!gizTool;if(!gizTool)return;
  const B=basis(),m=new TH.Matrix4().makeBasis(B[0],B[1],B[2]);giz.quaternion.setFromRotationMatrix(m);giz.position.set(p[0],p[1],p[2]);camUpdate();const s=(ortho?dist*.16:C.position.distanceTo(giz.position)*.2);giz.scale.setScalar(s)}
 // ---------- أوزان التحرير النسبي والتناظر ----------
 function weights(){const W=new Map();sel.v.forEach(i=>W.set(i,1));if(!prop.on||!sel.v.size)return W;const R=prop.r,cell=R,H=new Map(),key=(x,y,z)=>Math.floor(x/cell)+','+Math.floor(y/cell)+','+Math.floor(z/cell);
  sel.v.forEach(i=>{const k=key(M.v[3*i],M.v[3*i+1],M.v[3*i+2]);(H.get(k)||H.set(k,[]).get(k)).push(i)});
  for(let i=0;i<M.nv;i++){if(W.has(i))continue;const x=M.v[3*i],y=M.v[3*i+1],z=M.v[3*i+2],cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);let best=1e9;
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let d=-1;d<=1;d++){const L=H.get((cx+a)+','+(cy+b)+','+(cz+d));if(!L)continue;for(const j of L){const q=Math.hypot(x-M.v[3*j],y-M.v[3*j+1],z-M.v[3*j+2]);if(q<best)best=q}}
   if(best<R){const t=1-best/R;W.set(i,t*t*(3-2*t))}}return W}
 function mirrorMap(){const mp=new Map(),q=1e4,key=(x,y,z)=>Math.round(x*q)+','+Math.round(y*q)+','+Math.round(z*q);const H=new Map();for(let i=0;i<M.nv;i++)H.set(key(M.v[3*i],M.v[3*i+1],M.v[3*i+2]),i);
  const res=[];['x','y','z'].forEach((a,ai)=>{if(!sym[a])return;const m=new Int32Array(M.nv).fill(-1);for(let i=0;i<M.nv;i++){const p=[M.v[3*i],M.v[3*i+1],M.v[3*i+2]];p[ai]=-p[ai];const j=H.get(key(p[0],p[1],p[2]));if(j!=null)m[i]=j}res.push([ai,m])});return res}
 // ---------- سحب Gizmo ----------
 let gd=null;
 function lineParam(P0,a,ray){// أقرب نقطة على المحور (P0+a t) إلى الشعاع
  const w0=P0.clone().sub(ray.ray.origin),d=ray.ray.direction,A=a.dot(a),B=a.dot(d),Cc=d.dot(d),D=a.dot(w0),E=d.dot(w0),den=A*Cc-B*B;if(Math.abs(den)<1e-9)return 0;return(B*E-Cc*D)/den}
 function planePt(P0,n,ray){const pl=new TH.Plane().setFromNormalAndCoplanarPoint(n,P0),o=new TH.Vector3();return ray.ray.intersectPlane(pl,o)}
 function startGizmo(e,hd){const p=pivot();if(!p)return false;pushUndo();const B=basis(),P=V3(p),W=weights(),orig=new Map();W.forEach((w,i)=>orig.set(i,M.pos(i)));const ray=rayOf(e);
  gd={hd,B,P,W,orig,mm:mirrorMap(),ray0:ray,e0:e,c0:null};
  if(hd.t=='T'&&hd.a<3)gd.t0=lineParam(P,B[hd.a],ray);else if(hd.t=='T'||hd.t=='P')gd.p0=planePt(P,hd.t=='P'?B[hd.a]:C.getWorldDirection(new TH.Vector3()),ray);
  else if(hd.t=='S'&&hd.a<3)gd.t0=lineParam(P,B[hd.a],ray);else if(hd.t=='S'){const s=toScreen(p);gd.s0=Math.hypot(e.clientX-cv.getBoundingClientRect().left-s[0],e.clientY-cv.getBoundingClientRect().top-s[1])||1}
  else if(hd.t=='R'){const q=planePt(P,B[hd.a],ray);gd.v0=q?q.clone().sub(P):new TH.Vector3(1,0,0)}
  return true}
 const snapV=(v,s)=>snapOn?Math.round(v/s)*s:v;
 function moveGizmo(e){const g=gd,B=g.B,ray=rayOf(e),hd=g.hd;let apply;
  if(hd.t=='T'){let d;if(hd.a<3){const t=lineParam(g.P,B[hd.a],ray);d=B[hd.a].clone().multiplyScalar(snapV(t-g.t0,.05))}else{const q=planePt(g.P,C.getWorldDirection(new TH.Vector3()),ray);d=q&&g.p0?q.clone().sub(g.p0):new TH.Vector3()}apply=(p,w)=>[p[0]+d.x*w,p[1]+d.y*w,p[2]+d.z*w];g.delta=d}
  else if(hd.t=='P'){const q=planePt(g.P,B[hd.a],ray),d=q&&g.p0?q.clone().sub(g.p0):new TH.Vector3();if(snapOn){d.x=snapV(d.x,.05);d.y=snapV(d.y,.05);d.z=snapV(d.z,.05)}apply=(p,w)=>[p[0]+d.x*w,p[1]+d.y*w,p[2]+d.z*w];g.delta=d}
  else if(hd.t=='R'){const q=planePt(g.P,B[hd.a],ray);if(!q)return;const v=q.clone().sub(g.P);let ang=Math.atan2(new TH.Vector3().crossVectors(g.v0,v).dot(B[hd.a]),g.v0.dot(v));if(snapOn)ang=Math.round(ang/(15*D2R))*15*D2R;g.angle=ang;
   apply=(p,w)=>{const v=new TH.Vector3(p[0],p[1],p[2]).sub(g.P).applyAxisAngle(B[hd.a],ang*w).add(g.P);return[v.x,v.y,v.z]}}
  else{let f;if(hd.a<3){const t=lineParam(g.P,B[hd.a],ray);f=Math.abs(g.t0)>1e-3?t/g.t0:1+(t-g.t0)}else{const b=cv.getBoundingClientRect(),s=toScreen(arr(g.P));f=Math.hypot(e.clientX-b.left-s[0],e.clientY-b.top-s[1])/g.s0}f=snapOn?Math.round(f*10)/10:f;f=Math.max(-20,Math.min(20,f));g.factor=f;
   apply=(p,w)=>{const v=new TH.Vector3(p[0],p[1],p[2]).sub(g.P);const comp=[B[0],B[1],B[2]].map(b=>v.dot(b));const k=1+(f-1)*w;for(let i=0;i<3;i++)if(hd.a==3||hd.a==i)comp[i]*=k;const r=g.P.clone().addScaledVector(B[0],comp[0]).addScaledVector(B[1],comp[1]).addScaledVector(B[2],comp[2]);return[r.x,r.y,r.z]}}
  g.orig.forEach((p0,i)=>{const w=g.W.get(i);M.setPos(i,apply(p0,w))});
  g.mm.forEach(([ai,m])=>{g.orig.forEach((p0,i)=>{const j=m[i];if(j<0||j==i){if(j==i){const p=M.pos(i);p[ai]=0;M.setPos(i,p)}return}if(g.orig.has(j)&&!prop.on&&sel.v.has(j))return;const p=M.pos(i);p[ai]=-p[ai];M.setPos(j,p)})});
  fastRefresh()}
 let rf=0;function fastRefresh(){if(rf)return;rf=requestAnimationFrame(()=>{rf=0;rebuild()})}
 function endGizmo(){gd=null;dirty=true;rebuild()}

 // ---------- الالتقاط والتحديد ----------
 function visibleAt(p,e){if(xray)return true;const r=rayOf(e),o=C.position,d=V3(p).sub(o),L=d.length();r.set(o,d.normalize());const hs=r.intersectObject(pickMesh);return!hs.length||hs[0].distance>L-Math.max(.004,L*.004)}
 function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;let t=l2?((px-ax)*dx+(py-ay)*dy)/l2:0;t=Math.max(0,Math.min(1,t));const x=ax+dx*t,y=ay+dy*t;return[Math.hypot(px-x,py-y),t]}
 function pickAt(e){camUpdate();const b=cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top;
  if(smode=='f'){const hs=rayOf(e).intersectObject(pickMesh);if(!hs.length)return null;return{k:'f',id:pickMesh.geometry.userData.tf[hs[0].faceIndex]}}
  if(smode=='v'){const c=[];for(let i=0;i<M.nv;i++){const s=toScreen(M.pos(i));if(s[2]>1)continue;const d=Math.hypot(s[0]-mx,s[1]-my);if(d<16)c.push([d,i])}c.sort((a,b)=>a[0]-b[0]);for(const[d,i]of c.slice(0,10))if(visibleAt(M.pos(i),e))return{k:'v',id:i};return null}
  const c=[];eMap.forEach((ed,k)=>{const A=toScreen(M.pos(ed.a)),B=toScreen(M.pos(ed.b));if(A[2]>1||B[2]>1)return;const[d,t]=segDist(mx,my,A[0],A[1],B[0],B[1]);if(d<12)c.push([d,k,t,ed])});c.sort((a,b)=>a[0]-b[0]);
  for(const[d,k,t,ed]of c.slice(0,8)){const p=[0,1,2].map(q=>M.v[3*ed.a+q]+(M.v[3*ed.b+q]-M.v[3*ed.a+q])*t);if(visibleAt(p,e))return{k:'e',id:k}}return null}
 function applyPick(p,e){const add=e.shiftKey||e.ctrlKey||multi,prim=smode=='v'?sel.v:smode=='e'?sel.e:sel.f;
  if(e.altKey&&p&&p.k=='e'){const lp=MO.edgeLoop(M,p.id);if(!add)sel.e.clear();lp.forEach(x=>sel.e.add(x));norm();overlay();ui();return}
  if(!p){if(!add){prim.clear();}norm();overlay();ui();return}
  if(add){if(prim.has(p.id))prim.delete(p.id);else prim.add(p.id)}else{prim.clear();prim.add(p.id)}
  if(last)last.active=p.k=='v'?p.id:null;norm();overlay();ui()}
 function boxSelect(x0,y0,x1,y1,add){camUpdate();const b=cv.getBoundingClientRect(),X0=Math.min(x0,x1)-b.left,X1=Math.max(x0,x1)-b.left,Y0=Math.min(y0,y1)-b.top,Y1=Math.max(y0,y1)-b.top,inside=(s)=>s[2]<=1&&s[0]>=X0&&s[0]<=X1&&s[1]>=Y0&&s[1]<=Y1;
  const prim=smode=='v'?sel.v:smode=='e'?sel.e:sel.f;if(!add)prim.clear();const test=!xray&&M.nv<2500,fake={clientX:0,clientY:0};
  const vis=(p,s)=>{if(!test)return true;return visibleAt(p,{clientX:s[0]+b.left,clientY:s[1]+b.top})};
  if(smode=='v'){for(let i=0;i<M.nv;i++){const p=M.pos(i),s=toScreen(p);if(inside(s)&&vis(p,s))prim.add(i)}}
  else if(smode=='e'){eMap.forEach((e,k)=>{const pa=M.pos(e.a),pb=M.pos(e.b),sa=toScreen(pa),sb=toScreen(pb);if(inside(sa)&&inside(sb)&&vis(pa,sa)&&vis(pb,sb))prim.add(k)})}
  else M.f.forEach((f,fi)=>{const c=faceCenter(M,f),s=toScreen(c);if(inside(s)&&vis(c,s))prim.add(fi)});norm();overlay();ui()}
 const prm=()=>smode=='v'?sel.v:smode=='e'?sel.e:sel.f;
 function selAll(){const p=prm();p.clear();if(smode=='v')for(let i=0;i<M.nv;i++)p.add(i);else if(smode=='e')eList.forEach(k=>p.add(k));else M.f.forEach((_,i)=>p.add(i));norm();overlay();ui()}
 function selNone(){sel.v.clear();sel.e.clear();sel.f.clear();overlay();ui()}
 function selInvert(){const p=prm(),all=smode=='v'?[...Array(M.nv).keys()]:smode=='e'?eList:M.f.map((_,i)=>i),n=new Set(all.filter(i=>!p.has(i)));p.clear();n.forEach(i=>p.add(i));norm();overlay();ui()}
 function selGrow(g){if(smode=='f'){if(g){sel.f=MO.growFaces(M,sel.f)}else{const vs=new Set();M.f.forEach((f,fi)=>{if(!sel.f.has(fi))f.forEach(i=>vs.add(i))});sel.f=new Set([...sel.f].filter(fi=>!M.f[fi].some(i=>vs.has(i))))}}
  else{const N=vertNeighbors(M);if(g){const s=new Set(sel.v);sel.v.forEach(i=>N[i].forEach(j=>s.add(j)));sel.v=s}else{const bd=new Set();for(let i=0;i<M.nv;i++)if(!sel.v.has(i))N[i].forEach(j=>bd.add(j));sel.v=new Set([...sel.v].filter(i=>!bd.has(i)))}
   if(smode=='e')sel.e=MO.vertsToEdges(M,sel.v)}
  norm();overlay();ui()}
 function selLinked(){const s=new Set();if(smode=='f')sel.f.forEach(fi=>MO.linkedFaces(M,fi).forEach(x=>s.add(x)));else sel.v.forEach(v=>MO.linkedVerts(M,v).forEach(x=>s.add(x)));if(smode=='f')sel.f=s;else if(smode=='v')sel.v=s;else{sel.v=s;sel.e=MO.vertsToEdges(M,s)}norm();overlay();ui()}
 function selLoop(ring){if(smode!='e'){toast('اختر نمط الحواف (2)');return}const s=new Set(sel.e);[...sel.e].forEach(k=>(ring?MO.edgeRing(M,k):MO.edgeLoop(M,k)).forEach(x=>s.add(x)));sel.e=s;norm();overlay();ui()}
 // ---------- مشغّل العمليات مع «تعديل آخر عملية» ----------
 function setResult(r){if(!r)return;const want=smode;const has=x=>x&&x.size;
  if(want=='f'&&!has(r.f)&&(has(r.e)||has(r.v))){smode=has(r.e)?'e':'v'}
  if(want=='v'&&!has(r.v)&&has(r.f)){}
  sel.v=new Set(r.v||[]);sel.e=new Set(r.e||[]);sel.f=new Set(r.f||[]);
  if(smode=='f'&&!sel.f.size){smode=sel.e.size?'e':'v'}
  if(smode=='e'&&!sel.e.size){if(sel.f.size)smode='f';else smode='v'}
  if(smode=='v'&&!sel.v.size&&sel.f.size){sel.v=MO.facesToVerts(M,sel.f)}
  norm()}
 function op(name,params,run,spec,opt){opt=opt||{};pushUndo();const base={m:M.clone(),sel:cloneSel(),smode};last={name,base,run,params,spec,opt};applyLast()}
 function ui(){uiBar();uiTb();uiSide()}
 function applyLast(noUI){const L=last;if(!L)return;M=L.base.m.clone();smode=L.base.smode;setSelRaw(L.base.sel);topoDirty=true;let r;try{r=L.run(M,cloneSel(),L.params)}catch(err){console.error(err);toast('تعذّرت العملية: '+err.message);undoS.pop();M=L.base.m.clone();setSelRaw(L.base.sel);smode=L.base.smode;last=null;rebuild();ui();return}
  topoDirty=true;if(r===false){undoS.pop();M=L.base.m.clone();setSelRaw(L.base.sel);smode=L.base.smode;last=null;rebuild();ui();return}
  if(r)setResult(r);if(L.opt.mode&&smode!=L.opt.mode){const m=L.opt.mode;if(m=='e')sel.e=MO.vertsToEdges(M,sel.v);smode=m;norm()}
  if(L.opt.orient)orient=L.opt.orient;if(L.opt.tool)tool=L.opt.tool;dirty=true;rebuild();if(!noUI)ui()}
 function need(k,msg){const n=k=='v'?sel.v.size:k=='e'?sel.e.size:sel.f.size;if(!n){toast(msg||'حدّد شيئًا أولًا');return false}return true}
 const avgNormalOf=(m,fs)=>{const n=[0,0,0];fs.forEach(fi=>{const q=faceN(m,m.f[fi]);n[0]+=q[0];n[1]+=q[1];n[2]+=q[2]});const l=Math.hypot(...n)||1;return[n[0]/l,n[1]/l,n[2]/l]};
 const moveV=(m,vs,d)=>vs.forEach(i=>{m.v[3*i]+=d[0];m.v[3*i+1]+=d[1];m.v[3*i+2]+=d[2]});
 const OPS={
  extrude(){if(!sel.v.size)return toast('حدّد شيئًا للبثق');
   op('بثق',{d:0,ind:false},(m,s,p)=>{let r;if(smode=='f'){if(p.ind){const nv=new Set(),nf=new Set();[...s.f].forEach(fi=>{const q=faceN(m,m.f[fi]),l=Math.hypot(...q)||1,rr=MO.extrudeFaces(m,[fi]);moveV(m,rr.v,[q[0]/l*p.d,q[1]/l*p.d,q[2]/l*p.d]);rr.v.forEach(x=>nv.add(x));rr.f.forEach(x=>nf.add(x))});return{v:nv,f:nf,e:MO.facesToEdges(m,nf)}}
     const n=avgNormalOf(m,s.f);r=MO.extrudeFaces(m,s.f);moveV(m,r.v,[n[0]*p.d,n[1]*p.d,n[2]*p.d]);return r}
    if(smode=='e'){r=MO.extrudeEdges(m,s.e);const N=MO.vertexNormals(m);r.v.forEach(i=>{});return r}
    r=MO.extrudeVerts(m,s.v);return r},[{k:'d',l:'مسافة البثق',mn:-2,mx:2,st:.01},{k:'ind',t:'check',l:'كل وجه على حدة'}],{orient:'normal',tool:'move'})},
  inset(){if(!need('f','حدّد وجوهًا (نمط 3) للإدخال'))return;op('إدخال',{d:.08,depth:0,ind:false},(m,s,p)=>MO.insetFaces(m,s.f,p.d,{individual:p.ind,depth:p.depth}),[{k:'d',l:'السمك',mn:0,mx:.5,st:.005},{k:'depth',l:'العمق',mn:-.5,mx:.5,st:.005},{k:'ind',t:'check',l:'كل وجه على حدة'}])},
  loopcut(k,x,y){op('قصّ حلقة',{n:1,slide:.5},(m,s,p)=>{const r=MO.loopCut(m,k,p.n,p.slide);if(!r)return false;return r},[{k:'n',l:'عدد القصّات',mn:1,mx:12,st:1},{k:'slide',l:'الانزلاق',mn:.05,mx:.95,st:.01}],{mode:'e'})},
  subdivide(){if(!sel.v.size)return toast('حدّد شيئًا للتقسيم');op('تقسيم',{n:1},(m,s,p)=>smode=='f'?MO.subdivideFaces(m,s.f,p.n):MO.subdivideEdges(m,smode=='e'?s.e:MO.vertsToEdges(m,s.v),p.n),[{k:'n',l:'عدد التقسيمات',mn:1,mx:6,st:1}])},
  subAll(){op('تقسيم ناعم (Catmull-Clark)',{n:1},(m,s,p)=>{const r=subsurf(m,p.n,400000);M=r;sel.v.clear();return{v:new Set(),f:new Set(),e:new Set()}},[{k:'n',l:'المستوى',mn:1,mx:3,st:1}])},
  merge(mode){if(sel.v.size<2)return toast('حدّد رأسين فأكثر');op('دمج',{},(m,s)=>MO.mergeVerts(m,s.v,mode||'center'))},
  weld(){op('لحام بالمسافة',{d:.001},(m,s,p)=>{MO.weld(m,p.d);return{v:new Set(),f:new Set(),e:new Set()}},[{k:'d',l:'المسافة',mn:.0001,mx:.2,st:.0001}])},
  del(kind){if(!sel.v.size&&!sel.f.size)return toast('حدّد شيئًا للحذف');op('حذف',{},(m,s)=>{if(kind=='faces')return MO.deleteFaces(m,MO.vertsToFaces(m,s.v));if(smode=='f')return MO.deleteFaces(m,s.f);if(smode=='e')return MO.deleteEdges(m,s.e);return MO.deleteVerts(m,s.v)})},
  dissolve(){if(!sel.v.size)return;op('إذابة',{},(m,s)=>smode=='e'?MO.dissolveEdges(m,new Set(s.e)):smode=='v'?MO.dissolveVerts(m,s.v):MO.dissolveEdges(m,MO.facesToEdges(m,s.f)))},
  fill(){if(smode=='f'||!sel.e.size)return toast('حدّد حافة حدودية مغلقة (نمط 2)');op('ملء',{},(m,s)=>MO.fill(m,s.e)||false)},
  makeFace(){if(sel.v.size<3)return toast('حدّد 3 رؤوس فأكثر');op('إنشاء وجه',{},(m,s)=>MO.makeFace(m,s.v))},
  bridge(){if(!sel.e.size)return toast('حدّد حلقتي حواف (نمط 2)');op('جسر',{},(m,s)=>MO.bridge(m,s.e)||false)},
  flip(){if(!sel.f.size&&!sel.v.size)return;op('قلب الاتجاه',{},(m,s)=>{MO.flip(m,sel.f.size?s.f:MO.vertsToFaces(m,s.v));return null})},
  recalc(){op('إعادة حساب الاتجاه للخارج',{},(m)=>{MO.recalc(m);return null})},
  connect(){if(sel.v.size<2)return toast('حدّد رأسين متقابلين في وجه');op('وصل رؤوس',{},(m,s)=>MO.connect(m,s.v))},
  smooth(){if(!sel.v.size)return toast('حدّد رؤوسًا');op('تنعيم رؤوس',{f:.5,n:2},(m,s,p)=>{MO.smoothVerts(m,s.v,p.f,p.n);return null},[{k:'f',l:'القوة',mn:.05,mx:1,st:.05},{k:'n',l:'التكرار',mn:1,mx:20,st:1}])},
  spin(){if(!sel.e.size)return toast('حدّد حواف المقطع (نمط 2)');const p0=pivot()||[0,0,0];op('لفّ (Lathe)',{axis:1,steps:16,angle:360,cx:0,cy:0,cz:0},(m,s,p)=>MO.spin(m,s.e,{axis:+p.axis,steps:p.steps,angle:p.angle,center:[p.cx,p.cy,p.cz]})||false,[{k:'axis',t:'sel',l:'المحور',o:[[0,'X'],[1,'Y'],[2,'Z']]},{k:'steps',l:'الخطوات',mn:3,mx:64,st:1},{k:'angle',l:'الزاوية',mn:10,mx:360,st:5}])},
  dup(){if(!sel.v.size)return;op('نسخ',{},(m,s)=>{const fs=smode=='f'?[...s.f]:[...MO.vertsToFaces(m,s.v)];const mp=new Map(),nv=new Set(),nf=new Set();const get=i=>{if(!mp.has(i)){mp.set(i,m.addV(m.pos(i),m.col(i)));nv.add(mp.get(i))}return mp.get(i)};
    if(!fs.length){s.v.forEach(i=>get(i));return{v:nv,f:nf,e:new Set()}}fs.forEach(fi=>nf.add(m.addF(m.f[fi].map(get),m.fm[fi])));return{v:nv,f:nf,e:MO.facesToEdges(m,nf)}},null,{tool:'move'})},
  sharp(v){if(!sel.e.size)return toast('حدّد حوافًا (نمط 2)');op(v?'تجعيد حواف':'إزالة تجعيد',{},(m,s)=>{s.e.forEach(k=>{if(v)m.cr.set(k,v);else m.cr.delete(k)});return null})},
  flat(v){if(!sel.f.size&&!sel.v.size)return toast('حدّد وجوهًا');op(v?'تظليل مسطّح':'تظليل ناعم',{},(m,s)=>{const fs=sel.f.size?s.f:MO.vertsToFaces(m,s.v);fs.forEach(fi=>v?m.ff.add(fi):m.ff.delete(fi));return null})},
  flatten(axn){if(!sel.v.size)return;op('تسطيح على '+'XYZ'[axn],{},(m,s)=>{let a=0;s.v.forEach(i=>a+=m.v[3*i+axn]);a/=s.v.size;s.v.forEach(i=>m.v[3*i+axn]=a);return null})},
  zero(axn){if(!sel.v.size)return;op('تصفير '+'XYZ'[axn],{},(m,s)=>{s.v.forEach(i=>m.v[3*i+axn]=0);return null})},
  center(kind){op('تمركز',{},(m)=>{const b=K.bbox(m),c=[(b.min[0]+b.max[0])/2,kind=='bottom'?b.min[1]:(b.min[1]+b.max[1])/2,(b.min[2]+b.max[2])/2];if(kind=='xz')c[1]=0;for(let i=0;i<m.nv;i++){m.v[3*i]-=c[0];m.v[3*i+1]-=c[1];m.v[3*i+2]-=c[2]}return null},null)},
  quad(){op('مثلثات إلى رباعيات',{},(m)=>{MO.quadify(m);return{v:new Set(),f:new Set(),e:new Set()}})},
  applyMods(){pushUndo();M=applyMods(M,part.mods);part.mods={};topoDirty=true;sel.v.clear();sel.e.clear();sel.f.clear();rebuild();ui();toast('طُبّقت المعدّلات على الشبكة')},
  add(type,o){const ps={type,seg:16,size:1,ring:10,n:4,hs:1};Object.assign(ps,o||{});
   const spec=[{k:'size',l:'الحجم',mn:.05,mx:4,st:.05}];if(['cylinder','cone','circle','sphere','torus'].includes(type))spec.push({k:'seg',l:'القطاعات',mn:3,mx:64,st:1});if(['cylinder','cone'].includes(type))spec.push({k:'hs',l:'ارتفاع (تقسيم)',mn:1,mx:12,st:1},{k:'hgt',l:'الطول',mn:.1,mx:4,st:.05});if(type=='sphere')spec.push({k:'ring',l:'الحلقات',mn:3,mx:48,st:1});if(type=='cubesphere')spec.push({k:'n',l:'التقسيم',mn:1,mx:16,st:1});if(type=='grid'||type=='plane')spec.push({k:'nx',l:'تقسيم X',mn:1,mx:32,st:1},{k:'nz',l:'تقسيم Z',mn:1,mx:32,st:1});if(type=='torus')spec.push({k:'seg',l:'القطاعات',mn:3,mx:64,st:1},{k:'ring',l:'الحلقات',mn:3,mx:32,st:1});
   ps.hgt=1;ps.nx=ps.nz=type=='grid'?4:1;if(type=='cylinder'||type=='cone')ps.hgt=1;
   const pv=sel.v.size&&false?pivot():[0,0,0];op('إضافة '+type,ps,(m,s,p)=>{const o={size:p.size,n:p.type=='cubesphere'?p.n:p.seg,r:p.size/2,seg:p.seg,ring:p.ring,hs:p.hs,h:p.hgt*p.size,nx:p.nx,nz:p.nz};const pm=prim(p.type,o),b=m.nv,nv=new Set(),nf=new Set();
    for(let i=0;i<pm.nv;i++)nv.add(m.addV([pm.v[3*i]+pv[0],pm.v[3*i+1]+pv[1],pm.v[3*i+2]+pv[2]],[1,1,1]));pm.f.forEach(f=>nf.add(m.addF(f.map(i=>i+b),0)));smode='f';return{v:nv,f:nf,e:MO.facesToEdges(m,nf)}},spec,{tool:'move'})}
 };

 // ---------- النحت والتلوين: عرض مفهرس يُحدَّث في المكان ----------
 let swire=null,sg=null,smesh=null,sNor=null,stroke=null,vN=null;
 function buildSculptView(){dispose(swire);swire=null;dispose(smesh);dispose(solid);dispose(backM);solid=smesh=null;const g=new TH.BufferGeometry(),idx=[],tf=[];M.f.forEach((f,fi)=>K.triangulate(M,f).forEach(t=>{idx.push(t[0],t[1],t[2]);tf.push(fi)}));
  g.setAttribute('position',new TH.BufferAttribute(new Float32Array(M.v),3));g.setAttribute('normal',new TH.BufferAttribute(new Float32Array(M.nv*3),3));g.setIndex(idx);g.userData.tf=tf;
  const hv=!!M.vc;if(hv)g.setAttribute('color',new TH.BufferAttribute(new Float32Array(M.vc),3));
  smesh=new TH.Mesh(g,hv?new TH.MeshStandardMaterial({vertexColors:true,roughness:.8,side:TH.DoubleSide}):new TH.MeshStandardMaterial({color:0xc4bdb0,roughness:.78,side:TH.DoubleSide}));
  if(shade=='wire')smesh.material=new TH.MeshBasicMaterial({color:0x8a93ad,wireframe:true});sg=g;solid=smesh;scene.add(smesh);pickMesh=smesh;
  if(wireOv&&shade!='wire'){smesh.material.polygonOffset=true;smesh.material.polygonOffsetFactor=1;smesh.material.polygonOffsetUnits=1;const E=topo(M),ix=[];E.forEach(e=>ix.push(e.a,e.b));const lg=new TH.BufferGeometry();lg.setAttribute('position',g.attributes.position);lg.setIndex(ix);swire=new TH.LineSegments(lg,new TH.LineBasicMaterial({color:0x10131c,transparent:true,opacity:.45}));swire.renderOrder=2;lg.userData.shared=1;scene.add(swire)}
  sculptRefresh()}
 function sculptRefresh(){vN=MO.vertexNormals(M);const p=sg.attributes.position,n=sg.attributes.normal;p.array.set(M.v);for(let i=0;i<M.nv;i++){n.array[3*i]=vN[i][0];n.array[3*i+1]=vN[i][1];n.array[3*i+2]=vN[i][2]}p.needsUpdate=n.needsUpdate=true;if(sg.attributes.color){sg.attributes.color.array.set(M.vc);sg.attributes.color.needsUpdate=true}sg.computeBoundingSphere();smesh.updateMatrixWorld(true);sg.boundingBox=null}
 function brushRing(){if(ring)return ring;ring=new TH.Mesh(new TH.RingGeometry(.96,1,64),new TH.MeshBasicMaterial({color:0xffd24a,side:TH.DoubleSide,depthTest:false,transparent:true,opacity:.9}));ring.renderOrder=20;ring.visible=false;scene.add(ring);return ring}
 function hitAt(e){const hs=rayOf(e).intersectObject(smesh,false);return hs.length?hs[0]:null}
 function showRing(hit){const r=brushRing();if(!hit||(emode!='sculpt'&&emode!='paint'&&emode!='tex')){r.visible=false;return}const n=hit.face.normal.clone();r.position.copy(hit.point);r.lookAt(hit.point.clone().add(n));r.scale.setScalar(emode=='tex'?tbr.r:brush.r);r.visible=true}
 // الرؤوس المتأثرة: كروية حول نقطة (مع التناظر)
 function gather(pt,R,nrmOnly){const res=new Map(),cents=[[pt.x,pt.y,pt.z,1,1,1]];[['x',0],['y',1],['z',2]].forEach(([a,ai])=>{if(!sym[a])return;const L=cents.length;for(let i=0;i<L;i++){const c=cents[i].slice();c[ai]=-c[ai];c[3+ai]=-c[3+ai];cents.push(c)}});
  cents.forEach(([cx,cy,cz,sx,sy,sz])=>{const R2=R*R;for(let i=0;i<M.nv;i++){const dx=M.v[3*i]-cx,dy=M.v[3*i+1]-cy,dz=M.v[3*i+2]-cz,d2=dx*dx+dy*dy+dz*dz;if(d2<R2){const t=1-Math.sqrt(d2)/R,w=t*t*(3-2*t);if(!res.has(i)||res.get(i).w<w)res.set(i,{w,s:[sx,sy,sz],c:[cx,cy,cz]})}}});return res}
 function faceCull(hit,set){if(!brush.front)return set;const vn=vN,cd=C.getWorldDirection(new TH.Vector3());for(const[i]of set){if(vn[i][0]*cd.x+vn[i][1]*cd.y+vn[i][2]*cd.z>.25)set.delete(i)}return set}
 function startStroke(e){const hit=hitAt(e);if(!hit)return false;pushUndo();if(emode=='paint')M.enableColors([.85,.8,.72]);if(M.vc&&!sg.attributes.color)buildSculptView();
  stroke={hit,last:hit.point.clone(),e,t:0,inv:e.ctrlKey||e.altKey,start:hit.point.clone()};
  if(emode=='sculpt'&&brush.t=='grab'){const set=faceCull(hit,gather(hit.point,brush.r));stroke.set=set;stroke.orig=new Map();set.forEach((w,i)=>stroke.orig.set(i,M.pos(i)));stroke.pl=new TH.Plane().setFromNormalAndCoplanarPoint(C.getWorldDirection(new TH.Vector3()),hit.point)}
  strokeTick(e);return true}
 function avgN(set){const n=[0,0,0];set.forEach((w,i)=>{n[0]+=vN[i][0]*w.w;n[1]+=vN[i][1]*w.w;n[2]+=vN[i][2]*w.w});const l=Math.hypot(...n)||1;return[n[0]/l,n[1]/l,n[2]/l]}
 function strokeTick(e){if(!stroke)return;const hit=hitAt(e)||(brush.t=='grab'?null:null);if(emode=='sculpt'&&brush.t=='grab'){const o=rayOf(e),pt=new TH.Vector3();if(!o.ray.intersectPlane(stroke.pl,pt))return;const d=pt.sub(stroke.start);stroke.set.forEach((w,i)=>{const p=stroke.orig.get(i);M.setPos(i,[p[0]+d.x*w.w*w.s[0],p[1]+d.y*w.w*w.s[1],p[2]+d.z*w.w*w.s[2]])});;
    // تناظر: المرآة تتحرك بعكس الإزاحة على المحور المقابل
    sculptRefresh();return}
  if(!hit)return;stroke.last=hit.point.clone();const R=brush.r,set=faceCull(hit,gather(hit.point,R));if(!set.size)return;const n=avgN(set),s=brush.s,sgn=stroke.inv?-1:1;
  if(emode=='paint'){const col=new TH.Color(brush.col);set.forEach((w,i)=>{const k=Math.min(1,s*w.w*brush.a*.9);M.vc[3*i]+=(col.r-M.vc[3*i])*k;M.vc[3*i+1]+=(col.g-M.vc[3*i+1])*k;M.vc[3*i+2]+=(col.b-M.vc[3*i+2])*k});sculptRefresh();return}
  const NB=brush.t=='smooth'?vertNeighbors(M):null;const np=new Map();
  set.forEach((w,i)=>{const p=M.pos(i);let q=p;const k=s*w.w;
   if(brush.t=='draw'){const nn=sym.x||sym.y||sym.z?vN[i]:n;q=[p[0]+nn[0]*k*R*.12*sgn,p[1]+nn[1]*k*R*.12*sgn,p[2]+nn[2]*k*R*.12*sgn]}
   else if(brush.t=='inflate'){const nn=vN[i];q=[p[0]+nn[0]*k*R*.12*sgn,p[1]+nn[1]*k*R*.12*sgn,p[2]+nn[2]*k*R*.12*sgn]}
   else if(brush.t=='smooth'){const N=NB[i];if(!N.size)return;let x=0,y=0,z=0;N.forEach(j=>{x+=M.v[3*j];y+=M.v[3*j+1];z+=M.v[3*j+2]});const c=N.size,f=Math.min(1,k*.6);q=[p[0]+(x/c-p[0])*f,p[1]+(y/c-p[1])*f,p[2]+(z/c-p[2])*f]}
   else if(brush.t=='pinch'){const c=w.c,f=k*.25*sgn;q=[p[0]+(c[0]-p[0])*f,p[1]+(c[1]-p[1])*f,p[2]+(c[2]-p[2])*f]}
   else if(brush.t=='flatten'){const c=w.c,nn=vN[i],d=(p[0]-c[0])*n[0]+(p[1]-c[1])*n[1]+(p[2]-c[2])*n[2],f=Math.min(1,k*.7);q=[p[0]-n[0]*d*f,p[1]-n[1]*d*f,p[2]-n[2]*d*f]}
   else if(brush.t=='crease'){const c=w.c,nn=vN[i],f=k*.2;q=[p[0]-nn[0]*k*R*.1*sgn+(c[0]-p[0])*f,p[1]-nn[1]*k*R*.1*sgn+(c[1]-p[1])*f,p[2]-nn[2]*k*R*.1*sgn+(c[2]-p[2])*f]}
   np.set(i,q)});np.forEach((q,i)=>M.setPos(i,q));
  // قيد التناظر: الرؤوس على المستوى تبقى عليه
  ['x','y','z'].forEach((a,ai)=>{if(sym[a])np.forEach((q,i)=>{if(Math.abs(M.v[3*i+ai])<1e-4*0)M.v[3*i+ai]=0})});sculptRefresh()}
 function endStroke(){stroke=null;dirty=true;topoDirty=true}
 function subSculpt(smoothMode){pushUndo();if(smoothMode)M=subsurf(M,1,400000);else{MO.subdivideFaces(M,new Set(M.f.map((_,i)=>i)),1)}topoDirty=true;if(emode=='sculpt'||emode=='paint')buildSculptView();else rebuild();ui();toast('الرؤوس الآن '+M.nv)}
 function fillPaint(){pushUndo();M.enableColors([.85,.8,.72]);const col=new TH.Color(brush.col),vs=sel.v.size?sel.v:new Set([...Array(M.nv).keys()]);vs.forEach(i=>{M.vc[3*i]=col.r;M.vc[3*i+1]=col.g;M.vc[3*i+2]=col.b});if(sg)buildSculptView();else rebuild();dirty=true}
 function clearPaint(){pushUndo();M.vc=null;if(emode=='paint')buildSculptView();else rebuild();ui()}

 // ---------- الرسم على الخامة (Texture Paint): UV + طبقات ----------
 let tp=null,tex3=null,tcv=null,tctx=null,timg=null,tLayer=1,tStroke=null,tTouched=false,tFlag=null,uvPrev=null,uvT=0,uvLive=false,tpBusy=false,seamL=null;
 const tbr={r:0,hard:.55,op:1,flow:1,erase:false,col:'#d9534f',front:true,size:1024,angle:60,margin:.008};
 const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],len3=a=>Math.hypot(a[0],a[1],a[2]),lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const bboxD=()=>{const b=K.bbox(M);return Math.hypot(b.max[0]-b.min[0],b.max[1]-b.min[1],b.max[2]-b.min[2])||1};
 const hexRGB=x=>{const k=new TH.Color(x);return[Math.round(k.r*255),Math.round(k.g*255),Math.round(k.b*255)]};
 const rgbHex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
 function overlay(){overlay0();seamOv()}
 function seamOv(){dispose(seamL);seamL=null;if(emode!='edit'||!M.sm.size)return;const p=[];M.sm.forEach(k=>{const[a,b]=dk(k);if(a<M.nv&&b<M.nv)p.push(M.v[3*a],M.v[3*a+1],M.v[3*a+2],M.v[3*b],M.v[3*b+1],M.v[3*b+2])});const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(p,3));seamL=new TH.LineSegments(g,new TH.LineBasicMaterial({color:0xff3b3b,depthTest:false}));seamL.renderOrder=25;scene.add(seamL)}
 // فك UV (يمسح الخامة القديمة لأن الإحداثيات تتغير)
 function doUnwrap(){const r=K.unwrapUV(M,{angle:tbr.angle,margin:tbr.margin});tp=null;part.tex=undefined;tTouched=false;dirty=true;return r}
 async function loadLayers(){const S=tp.size,L=(part.tex&&part.tex.layers)||[];if(!L.length||part.tex.size!=S)return false;const cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d',{willReadFrequently:true});tp.layers=[];
  for(const q of L){const im=new Image();im.src=q.d;try{await im.decode()}catch(e){continue}cx.clearRect(0,0,S,S);cx.drawImage(im,0,0,S,S);const l=tp.addLayer(q.n);l.o=q.o??1;l.v=q.v??1;l.b=q.b||'n';l.d.set(cx.getImageData(0,0,S,S).data)}return tp.layers.length>0}
 async function ensureTP(){if(tpBusy)return;tpBusy=true;try{
   if(!K.uvOK(M)){const r=doUnwrap();toast('فُكّ UV تلقائيًا: '+r.islands+' جزيرة')}
   const S=part.tex&&part.tex.size||tbr.size;tbr.size=S;
   if(!tp||tp.size!=S){tp=new K.TexPaint(M,S);if(!(await loadLayers())){tp.layers=[];const mc=(part.mats&&part.mats[0]&&part.mats[0].c)||'#c9a46a',c=hexRGB(mc);tp.addLayer('الخلفية',[...c,255]);tp.addLayer('رسم 1');tLayer=1}
    tcv=document.createElement('canvas');tcv.width=tcv.height=S;tctx=tcv.getContext('2d');timg=new ImageData(tp.out,S,S);
    tex3=new TH.CanvasTexture(tcv);tex3.colorSpace=TH.SRGBColorSpace;tex3.anisotropy=8}
   else tp.setMesh(M);
   tLayer=Math.min(tLayer,tp.layers.length-1);if(!tbr.r)tbr.r=bboxD()*.07;
   tp.composeAll();texFlush(true);K.TEXLIVE.set(part.tex||(part.tex={size:S,layers:[],final:''}),{TH,t:tex3});
  }finally{tpBusy=false}}
 function texFlush(full){if(!tctx)return;if(full||!tFlag)tctx.putImageData(timg,0,0);else tctx.putImageData(timg,0,0,tFlag[0],tFlag[1],tFlag[2]-tFlag[0],tFlag[3]-tFlag[1]);tex3.needsUpdate=true;tFlag=null}
 function texMark(rc){if(!rc)return;const r=[rc[0]-5,rc[1]-5,rc[2]+5,rc[3]+5].map((v,i)=>Math.max(0,Math.min(tp.size,v)));if(!tFlag)tFlag=r;else{tFlag[0]=Math.min(tFlag[0],r[0]);tFlag[1]=Math.min(tFlag[1],r[1]);tFlag[2]=Math.max(tFlag[2],r[2]);tFlag[3]=Math.max(tFlag[3],r[3])}uvLive=true}
 function buildTexView(){dispose(smesh);dispose(solid);dispose(backM);dispose(swire);swire=null;solid=smesh=null;if(!tex3)return;
  const g=meshGeo(TH,M,{sa:part.sa??50,mats:1});smesh=new TH.Mesh(g,new TH.MeshStandardMaterial({map:tex3,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));solid=smesh;scene.add(smesh);pickMesh=smesh;smesh.updateMatrixWorld(true);sg=null;
  if(wireOv){const E=topo(M),p=[];E.forEach(e=>p.push(M.v[3*e.a],M.v[3*e.a+1],M.v[3*e.a+2],M.v[3*e.b],M.v[3*e.b+1],M.v[3*e.b+2]));const lg=new TH.BufferGeometry();lg.setAttribute('position',new TH.Float32BufferAttribute(p,3));swire=new TH.LineSegments(lg,new TH.LineBasicMaterial({color:0x10131c,transparent:true,opacity:.3}));swire.renderOrder=2;scene.add(swire)}}
 async function enterTex(){await ensureTP();if(emode!='tex')return;buildTexView();uiSide();drawUV();status('ارسم على المجسم مباشرة. Alt+نقرة = التقاط لون. الفرشاة ثلاثية الأبعاد فتعبر حدود الجزر.')}
 // ---------- الضربة ----------
 function texStart(e){if(!tp||!smesh)return false;const hit=hitAt(e);if(!hit)return false;
  if(e.altKey&&hit.uv){const c=tp.sample(hit.uv.x,hit.uv.y);tbr.col=rgbHex(c);uiSide();return false}
  const L=tp.layers[tLayer];if(!L||!L.v){toast('الطبقة مخفية');return false}
  tp.begin(tLayer,tbr.erase||e.ctrlKey);tStroke={last:null};tTouched=true;dirty=true;texTick(e);return true}
 function texTick(e){if(!tStroke)return;const hit=hitAt(e);if(!hit)return;const pt=[hit.point.x,hit.point.y,hit.point.z],n=hit.face.normal.clone().transformDirection(smesh.matrixWorld),N=[n.x,n.y,n.z],col=hexRGB(tbr.col);
  const pts=[];if(tStroke.last){const d=len3(sub3(pt,tStroke.last)),sp=Math.max(tbr.r*.18,1e-4),k=Math.min(60,Math.ceil(d/sp));for(let i=1;i<=k;i++)pts.push(lerp3(tStroke.last,pt,i/k))}else pts.push(pt);tStroke.last=pt;
  pts.forEach(p=>{const L=[[p,N]];[['x',0],['y',1],['z',2]].forEach(([a,ai])=>{if(!sym[a])return;const m=L.length;for(let i=0;i<m;i++){const q=L[i][0].slice(),nn=L[i][1].slice();q[ai]=-q[ai];nn[ai]=-nn[ai];L.push([q,nn])}});
   L.forEach(([q,nn])=>texMark(tp.dab(q,nn,tbr.r,tbr.hard,col,tbr.op,tbr.flow,tbr.front)))})}
 function texEnd(){if(!tStroke)return;tStroke=null;tp.end();uvLive=true;uvT=0}
 function texUndo(){if(!tp||!tp.undo.length)return false;tp.undoOne();texFlush(true);drawUV();return true}
 function texFull(){tp.composeAll();texFlush(true);tTouched=true;dirty=true}
 // ---------- معاينة UV ----------
 function drawUV(){if(!uvPrev||!tp||!tcv||!tp.layers.length)return;const S=uvPrev.width,x=uvPrev.getContext('2d');x.clearRect(0,0,S,S);x.drawImage(tcv,0,0,S,S);x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=1;x.beginPath();M.f.forEach((f,fi)=>{const U=M.uv[fi],n=f.length;for(let i=0;i<n;i++){const j=(i+1)%n;x.moveTo(U[2*i]*S,(1-U[2*i+1])*S);x.lineTo(U[2*j]*S,(1-U[2*j+1])*S)}});x.stroke()}
 // ---------- حفظ ----------
 function exportCanvas(arr,S){const c=document.createElement('canvas');c.width=c.height=S;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(arr),S,S),0,0);return c}
 function saveTex(){if(!tp)return;if(!tTouched&&!(part.tex&&part.tex.final))return;tp.composeAll();const S=tp.size;
  const layers=tp.layers.map(l=>({n:l.n,o:l.o,v:l.v,b:l.b,d:exportCanvas(l.d,S).toDataURL('image/webp',.92)}));
  const fin=exportCanvas(tp.out,S);part.tex={size:S,layers,final:fin.toDataURL('image/jpeg',.93)}}
 function downloadTex(){if(!tp)return;tp.composeAll();const c=exportCanvas(tp.out,tp.size),a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='texture.png';a.click()}
 async function importImg(file){if(!file||!tp)return;const url=URL.createObjectURL(file),im=new Image();im.src=url;try{await im.decode()}catch(e){return toast('تعذّر قراءة الصورة')}const S=tp.size,cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(im,0,0,S,S);const L=tp.addLayer('صورة',null,tLayer+1);L.d.set(cx.getImageData(0,0,S,S).data);tLayer++;URL.revokeObjectURL(url);texFull();uiSide();drawUV()}
 // ---------- اللوحة ----------
 function texPanel(){const X=[];
  if(!tp||!tcv||!K.uvOK(M)){X.push(h('p',{class:'mu'},tpBusy?'جارٍ التحضير…':'لا توجد خريطة UV لهذه الشبكة.'),B('فك UV تلقائي',async()=>{await ensureTP();buildTexView();uiSide();drawUV()},0));return X}
  X.push(h('h4',{},'UV'));
  uvPrev=h('canvas',{width:512,height:512,style:'width:100%;max-width:220px;aspect-ratio:1;background:#222;border-radius:8px;display:block;margin:auto'});X.push(uvPrev);
  X.push(Rg('زاوية فصل الجزر',()=>tbr.angle,v=>tbr.angle=v,20,89,1),Rg('هامش بين الجزر',()=>tbr.margin,v=>tbr.margin=v,.002,.03,.001));
  X.push(h('div',{class:'row'},Se('حجم الخامة',[[512,'512'],[1024,'1024'],[2048,'2048']],()=>tbr.size,v=>{tbr.size=+v}),B('🧩 فك UV من جديد',async()=>{if(!confirm('إعادة الفك أو تغيير الحجم تمسح الرسم الحالي على الخامة. متابعة؟'))return;pushUndo();doUnwrap();part.tex={size:tbr.size,layers:[],final:''};tp=null;await ensureTP();buildTexView();uiSide();drawUV()},0,'sm'),B('⬇ PNG',downloadTex,0,'sm','تنزيل الخامة كصورة')));
  X.push(h('p',{class:'mu'},'لتحكم أدق في أماكن القطع: في وضع التحرير حدّد حوافًا واضغط «علّم Seam» ثم أعد الفك.'));
  X.push(h('h4',{},'الطبقات'));
  const rows=[];for(let i=tp.layers.length-1;i>=0;i--){const l=tp.layers[i];rows.push(h('div',{class:'sw'+(i==tLayer?' on':''),style:'flex-wrap:wrap',onclick:e=>{if(e.target.closest('button,select,input'))return;tLayer=i;uiSide()}},
   B(l.v?'👁':'🚫',()=>{l.v=l.v?0:1;texFull();uiSide();drawUV()},0,'sm'),h('input',{value:l.n,style:'flex:1;min-width:60px',oninput:e=>l.n=e.target.value}),
   h('select',{onchange:e=>{l.b=e.target.value;texFull()}},...BL().map(([v,t])=>{const o=h('option',{value:v},t);if(v==l.b)o.selected=true;return o})),
   h('input',{type:'range',min:0,max:1,step:.01,value:l.o,style:'width:70px',oninput:e=>{l.o=+e.target.value;texFull()}})))}
  X.push(h('div',{style:'display:flex;flex-direction:column;gap:4px'},...rows));
  const Lc=tp.layers[tLayer];
  X.push(h('div',{class:'row'},B('➕ طبقة',()=>{tp.addLayer('رسم '+tp.layers.length,null,tLayer+1);tLayer++;uiSide()},0,'sm'),B('⧉',()=>{const n=tp.addLayer(Lc.n+' نسخة',null,tLayer+1);n.d.set(Lc.d);n.o=Lc.o;n.b=Lc.b;tLayer++;texFull();uiSide();drawUV()},0,'sm','تكرار'),B('⬆',()=>{if(tLayer<tp.layers.length-1){[tp.layers[tLayer],tp.layers[tLayer+1]]=[tp.layers[tLayer+1],tp.layers[tLayer]];tLayer++;texFull();uiSide();drawUV()}},0,'sm','رفع'),B('⬇',()=>{if(tLayer>0){[tp.layers[tLayer],tp.layers[tLayer-1]]=[tp.layers[tLayer-1],tp.layers[tLayer]];tLayer--;texFull();uiSide();drawUV()}},0,'sm','خفض'),
   B('⤓ دمج لأسفل',()=>{if(tLayer>0){tp.mergeDown(tLayer);tLayer--;texFull();uiSide();drawUV()}},0,'sm'),B('🗑',()=>{if(tp.layers.length>1){tp.layers.splice(tLayer,1);tLayer=Math.min(tLayer,tp.layers.length-1);texFull();uiSide();drawUV()}},0,'sm','حذف الطبقة')));
  X.push(h('div',{class:'row'},B('🪣 تعبئة باللون',()=>{pushTexUndo();tp.fill(Lc,[...hexRGB(tbr.col),255]);texFull()},0,'sm'),B('⌫ مسح الطبقة',()=>{pushTexUndo();tp.clear(Lc);texFull()},0,'sm'),B('🎨 من تلوين الرؤوس',()=>{if(!M.vc)return toast('لا يوجد تلوين رؤوس');const l=tp.addLayer('من الرؤوس',null,tLayer+1);tp.bakeVC(l);tLayer++;texFull();uiSide();drawUV()},0,'sm','يحوّل التلوين القديم إلى طبقة'),
   h('label',{class:'sw',style:'cursor:pointer'},'🖼 صورة كطبقة',h('input',{type:'file',accept:'image/*',style:'display:none',onchange:e=>importImg(e.target.files[0])}))));
  X.push(h('h4',{},'الفرشاة'));
  X.push(h('div',{class:'row'},Lb('اللون',h('input',{type:'color',value:tbr.col,oninput:e=>tbr.col=e.target.value})),B('✏ رسم',()=>{tbr.erase=false;uiSide()},!tbr.erase,'sm'),B('◌ ممحاة',()=>{tbr.erase=true;uiSide()},tbr.erase,'sm')));
  const D=bboxD();X.push(Rg('الحجم',()=>tbr.r,v=>tbr.r=v,D*.004,D*.4,D*.002),Rg('الصلابة',()=>tbr.hard,v=>tbr.hard=v,0,1,.01),Rg('الشفافية الكلية',()=>tbr.op,v=>tbr.op=v,.02,1,.01),Rg('القوة',()=>tbr.flow,v=>tbr.flow=v,.05,1,.01));
  X.push(h('div',{class:'row'},Ck('تجاهل الوجوه الخلفية',()=>tbr.front,v=>tbr.front=v),...['x','y','z'].map(a=>B(a.toUpperCase(),()=>{sym[a]=!sym[a];uiSide()},sym[a],'sm','تناظر'))));
  X.push(h('p',{class:'mu'},'Alt+نقرة = التقاط اللون · Ctrl أثناء الرسم = ممحاة · Ctrl+Z يتراجع عن ضربات الخامة.'));
  return X}
 const BL=()=>K.TEX_BLENDS;
 function pushTexUndo(){const L=tp.layers[tLayer];tp.undo.push({li:tLayer,data:L.d.slice(),rect:[0,0,tp.size,tp.size]})}
 // حواف الفصل (Seam)
 function seamOp(add){if(!sel.e.size)return toast('حدّد حوافًا أولًا (وضع الحواف)');pushUndo();sel.e.forEach(k=>add?M.sm.add(k):M.sm.delete(k));overlay();toast(add?'عُلّمت '+sel.e.size+' حافة كخط فصل':'أُزيلت العلامات')}

 // ---------- واجهة المستخدم ----------
 const B=(t,f,on,cls,title)=>h('button',{class:(on?'on ':'')+(cls||''),onclick:f,title:title||''},t),Lb=(t,el)=>h('label',{class:'L'},t,el),
 Rg=(t,get,set,mn,mx,st,done)=>{const v=h('span',{class:'mu'},String(r3(get()))),i=h('input',{type:'range',min:mn,max:mx,step:st,value:get(),oninput:e=>{set(+e.target.value);v.textContent=String(r3(+e.target.value));done&&done(true)}});return h('label',{class:'L'},h('span',{},t+' ',v),i)},
 Ck=(t,get,set)=>h('label',{class:'L',style:'flex-direction:row;align-items:center;gap:5px;min-width:0'},h('input',{type:'checkbox',checked:!!get(),onchange:e=>set(e.target.checked)}),t),
 Se=(t,o,get,set)=>{const s=h('select',{onchange:e=>set(e.target.value)});o.forEach(([v,x])=>{const e=h('option',{value:v},x);if(String(v)==String(get()))e.selected=true;s.append(e)});return Lb(t,s)};
 const MODES={v:'نقاط',e:'حواف',f:'وجوه'};
 function uiBar(){bar.replaceChildren(h('b',{class:'ttl',style:'color:var(--ac)'},c.title||'🧊 مصمم المجسمات'),...[['edit','✏','تحرير'],['sculpt','🖌','نحت'],['paint','🎨','تلوين'],['tex','🖼','خامة'],['view','👁','معاينة']].map(([k,i,t])=>B(h('span',{},i,h('span',{class:'lb'},' '+t)),()=>setEmode(k),emode==k)),h('span',{style:'flex:1'}),B('↶',undo),B('↷',redo),B('✕',cancel),B('✔ تم',finish,1),B('☰',()=>{const m=root.classList;m.contains('pmin')?(m.remove('pmin'),m.add('pmid')):m.contains('pmid')?(m.remove('pmid'),m.add('pbig')):m.contains('pbig')?(m.remove('pbig'),m.add('pmin')):m.add('pmid');setTimeout(()=>window.dispatchEvent(new Event('resize')),50)},0,'btn-pn'))}
 function uiTb(){const X=[];
  if(emode=='edit'){X.push(...['v','e','f'].map((k,i)=>B((i+1)+' '+MODES[k],()=>setMode(k),smode==k)));
   X.push(B('☝ تحديد',()=>setTool('select'),tool=='select'),B('▭ صندوق',()=>setTool('box'),tool=='box'),B('✥ تحريك',()=>setTool('move'),tool=='move'),B('⟳ تدوير',()=>setTool('rot'),tool=='rot'),B('⤢ حجم',()=>setTool('scale'),tool=='scale'),B('➿ قصّ حلقة',()=>setTool('loop'),tool=='loop'));
   X.push(B('➕ تحديد متعدد',()=>{multi=!multi;uiTb()},multi),B('👁 شفاف',()=>{xray=!xray;overlay();uiTb()},xray))}
  X.push(h('div',{class:'row',style:'margin:0'},B('أمام',()=>viewTo('front'),0,'sm'),B('جانب',()=>viewTo('right'),0,'sm'),B('علوي',()=>viewTo('top'),0,'sm'),B('منظور',()=>viewTo('persp'),0,'sm'),B('◎',()=>{frame(false);},0,'sm','تركيز على المحدد'),B(ortho?'◫':'◪',()=>{ortho=!ortho;uiTb()},ortho,'sm','متعامد/منظور')));tb.replaceChildren(...X)}
 function setTool(t){tool=t;if(t=='loop'){if(smode!='e')setMode('e')}placeGizmo();uiTb();status(({select:'اضغط لتحديد. اسحب الخلفية للدوران (إصبعان: تقريب وتحريك).',box:'اسحب مستطيلًا لتحديد عدة عناصر.',move:'اسحب أسهم المحاور لتحريك المحدد. المربعات الصغيرة تحرك على مستوى.',rot:'اسحب إحدى الحلقات لتدوير المحدد.',scale:'اسحب مكعبات المحاور (أو الأبيض) لتغيير الحجم.',loop:'مرّر على حافة واضغط لقصّ حلقة. بعدها عدّل عدد القصّات والانزلاق من اللوحة.'})[t]||'')}
 function setEmode(m){if(emode==m)return;if(stroke)endStroke();if(tStroke)texEnd();emode=m;last=null;if(m=='tex'){if(Object.keys(part.mods).some(k=>part.mods[k])){if(!confirm('رسم الخامة يحتاج تطبيق المعدّلات (ميرور/تقسيم…) على الشبكة أولًا. أطبّقها الآن؟')){emode='edit';return}M=applyMods(M,part.mods);part.mods={};topoDirty=true;sel.v.clear();sel.e.clear();sel.f.clear()}setTool('select');dispose(cageL);dispose(cageP);dispose(faceHL);dispose(seamL);cageL=cageP=faceHL=seamL=null;giz.visible=false;dispose(solid);solid=null;dirty=true;enterTex()}
  else if(m=='sculpt'||m=='paint'){if(Object.keys(part.mods).some(k=>part.mods[k])){toast('المعدّلات مخفية أثناء النحت/التلوين (طبّقها لتنحت النتيجة)')}setTool('select');status(m=='sculpt'?'اضغط على المجسم واسحب لنحته. Ctrl/Alt = عكس الاتجاه.':'اسحب فوق المجسم للتلوين. غيّر اللون والحجم من اللوحة.');dispose(cageL);dispose(cageP);dispose(faceHL);cageL=cageP=faceHL=null;giz.visible=false;buildSculptView()}
  else{if(ring)ring.visible=false;dispose(swire);swire=null;sg=null;smesh=null;topoDirty=true;rebuild();if(m=='edit')setTool(tool=='select'?'select':tool);status(m=='view'?'معاينة المجسم بمواده الحقيقية.':'')}uiBar();uiTb();uiSide()}
 function cancel(){if(!confirm('تجاهل كل تعديلاتك في هذه الجلسة؟'))return;Object.assign(part,JSON.parse(origPart));Object.keys(part).forEach(k=>{if(!(k in JSON.parse(origPart)))delete part[k]});close(true)}
 function finish(){if(tStroke)texEnd();part.mesh=M.toJSON();if(tp)saveTex();close(false)}
 function close(cancelled){alive=false;if(part.tex)K.TEXLIVE.delete(part.tex);cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);root.remove();[solid,backM,cageL,cageP,faceHL].forEach(o=>o&&o.geometry&&o.geometry.dispose());rd.dispose();gm.dispose();c.done&&c.done(part,cancelled)}
 // ----- لوحة «تعديل آخر عملية» -----
 function redoCard(){if(!last||!last.spec||emode!='edit')return null;const L=last,X=[h('h4',{},'⚙ '+L.name+' — عدّل القيم')];L.spec.forEach(s=>{
   if(s.t=='check')X.push(Ck(s.l,()=>L.params[s.k],v=>{L.params[s.k]=v;applyLast(true)}));else if(s.t=='sel')X.push(Se(s.l,s.o,()=>L.params[s.k],v=>{L.params[s.k]=+v;applyLast(true)}));
   else X.push(Rg(s.l,()=>L.params[s.k],v=>{L.params[s.k]=v},s.mn,s.mx,s.st,()=>applyLast(true)))});return h('div',{class:'card'},...X)}
 const origApply=applyLast;
 function uiSide(){const X=[];
  X.push(h('div',{class:'tabs'},...[['tools',emode=='edit'?'أدوات':emode=='sculpt'?'فرشاة':emode=='paint'?'لون':emode=='tex'?'خامة':'عرض'],['mods','معدّلات'],['mats','مواد'],['view','عرض']].filter(([k])=>!(emode=='view'&&k=='tools')).map(([k,t])=>B(t,()=>{tab=k;uiSide()},(tab==k||(emode=='view'&&k=='view'&&tab=='tools')),'sm'))));
  const rc=redoCard();if(rc)X.push(rc);
  if(tab=='tools'&&emode=='edit')X.push(...toolsEdit());else if(tab=='tools'&&emode=='sculpt')X.push(...sculptPanel());else if(tab=='tools'&&emode=='paint')X.push(...paintPanel());else if(tab=='tools'&&emode=='tex')X.push(...texPanel());else if(tab=='mods')X.push(...modsPanel());else if(tab=='mats')X.push(...matsPanel());else X.push(...viewPanel());
  side.replaceChildren(...X);if(emode=='tex')drawUV()}
 function toolsEdit(){const X=[],o=(t,f,cls,title)=>B(t,f,0,cls||'sm',title);
  X.push(h('h4',{},'➕ إضافة مجسم'),h('div',{class:'row'},...[['cube','مكعب'],['plane','مستوى'],['grid','شبكة'],['circle','دائرة'],['cylinder','أسطوانة'],['cone','مخروط'],['sphere','كرة'],['cubesphere','كرة مكعّبة'],['torus','طارة'],['ico','كرة مثلثية']].map(([k,t])=>o(t,()=>OPS.add(k)))));
  X.push(h('h4',{},'🧩 خطوط فصل UV'),h('div',{class:'row'},o('علّم Seam',()=>seamOp(true),'sm','حدّد حوافًا ثم اضغط'),o('امسح Seam',()=>seamOp(false))));
  X.push(h('h4',{},'التحديد'),h('div',{class:'row'},o('الكل',selAll),o('لا شيء',selNone),o('عكس',selInvert),o('+ توسيع',()=>selGrow(true)),o('− تقليص',()=>selGrow(false)),o('مرتبط',selLinked),o('حلقة',()=>selLoop(false)),o('متوازية',()=>selLoop(true))));
  X.push(h('h4',{},'عمليات الشبكة'),h('div',{class:'row'},o('بثق E',OPS.extrude),o('إدخال I',OPS.inset),o('تقسيم',OPS.subdivide),o('وصل J',OPS.connect),o('دمج M',()=>OPS.merge('center')),o('دمج للأول',()=>OPS.merge('first')),o('لحام',OPS.weld),o('إذابة',OPS.dissolve),o('حذف X',()=>OPS.del()),o('حذف وجوه فقط',()=>OPS.del('faces')),o('ملء F',OPS.fill),o('وجه من رؤوس',OPS.makeFace),o('جسر',OPS.bridge),o('لفّ (مخرطة)',OPS.spin),o('نسخ ⇧D',OPS.dup),o('تنعيم رؤوس',OPS.smooth)));
  X.push(h('h4',{},'الاتجاه والتظليل'),h('div',{class:'row'},o('قلب الاتجاه',OPS.flip),o('الاتجاه للخارج',OPS.recalc),o('تظليل ناعم',()=>OPS.flat(0)),o('تظليل مسطّح',()=>OPS.flat(1)),o('تجعيد ×1',()=>OPS.sharp(1)),o('تجعيد ×3',()=>OPS.sharp(3)),o('إزالة التجعيد',()=>OPS.sharp(0))));
  X.push(h('h4',{},'محاذاة'),h('div',{class:'row'},...[0,1,2].map(a=>o('تسطيح '+'XYZ'[a],()=>OPS.flatten(a),null,'يجعل المحدد على نفس '+'XYZ'[a])),...[0,1,2].map(a=>o('صفر '+'XYZ'[a],()=>OPS.zero(a),null,'يضع المحدد على المستوى')),o('توسيط المجسم',()=>OPS.center('center')),o('على الأرض',()=>OPS.center('bottom')),o('تقسيم ناعم كامل',OPS.subAll),o('مثلثات→رباعيات',OPS.quad)));
  X.push(h('h4',{},'التحويل'),h('div',{class:'row'},Se('الاتجاه',[['global','عالمي'],['normal','عمودي على السطح'],['view','حسب الكاميرا']],()=>orient,v=>{orient=v;placeGizmo();}),Ck('مغناطيس (خطوات ثابتة)',()=>snapOn,v=>snapOn=v)),
   h('div',{class:'row'},Ck('تحرير نسبي (يلين مع الجوار)',()=>prop.on,v=>{prop.on=v;uiSide()}),prop.on?Rg('نصف القطر',()=>prop.r,v=>prop.r=v,.05,2,.01):''),
   h('div',{class:'row'},h('span',{class:'mu'},'تناظر:'),...['x','y','z'].map(a=>B(a.toUpperCase(),()=>{sym[a]=!sym[a];uiSide()},sym[a],'sm'))),numericPanel());
  return X}
 let numv=[0,0,0];
 function numericPanel(){const inp=i=>h('input',{type:'number',step:.05,value:numv[i],style:'width:62px',onchange:e=>numv[i]=+e.target.value});return h('div',{class:'card'},h('div',{class:'mu'},'تحريك رقمي للمحدد'),h('div',{class:'row'},inp(0),inp(1),inp(2),B('طبّق',()=>{if(!sel.v.size)return toast('حدّد شيئًا');pushUndo();sel.v.forEach(i=>{M.v[3*i]+=numv[0];M.v[3*i+1]+=numv[1];M.v[3*i+2]+=numv[2]});rebuild()},0,'sm')),h('div',{class:'row'},Se('تدوير حول',[[0,'X'],[1,'Y'],[2,'Z']],()=>numv.ra||1,v=>numv.ra=+v),h('input',{type:'number',step:5,value:numv.deg||0,style:'width:62px',onchange:e=>numv.deg=+e.target.value}),B('دوّر°',()=>{if(!sel.v.size)return;pushUndo();const p=pivot(),a=[0,0,0];a[numv.ra??1]=1;const q=new TH.Quaternion().setFromAxisAngle(new TH.Vector3(...a),(numv.deg||0)*D2R);sel.v.forEach(i=>{const v=V3(M.pos(i)).sub(V3(p)).applyQuaternion(q).add(V3(p));M.setPos(i,arr(v))});rebuild()},0,'sm'),h('input',{type:'number',step:.1,value:numv.sc??1,style:'width:62px',onchange:e=>numv.sc=+e.target.value}),B('كبّر×',()=>{if(!sel.v.size)return;pushUndo();const p=pivot(),k=numv.sc??1;sel.v.forEach(i=>{const q=M.pos(i);M.setPos(i,[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,p[2]+(q[2]-p[2])*k])});rebuild()},0,'sm')))}
 function sculptPanel(){return[h('h4',{},'فرشاة النحت'),h('div',{class:'row'},Ck('إظهار خطوط الشبكة',()=>wireOv,v=>{wireOv=v;buildSculptView()})),h('div',{class:'row'},...[['draw','ارسم/ابرز'],['inflate','انفخ'],['smooth','نعّم'],['grab','اسحب'],['pinch','اضغط'],['flatten','سوّي'],['crease','اخدش']].map(([k,t])=>B(t,()=>{brush.t=k;uiSide()},brush.t==k,'sm'))),
  Rg('الحجم',()=>brush.r,v=>brush.r=v,.03,1.2,.01),Rg('القوة',()=>brush.s,v=>brush.s=v,.05,1,.05),Ck('تجاهل الوجوه الخلفية',()=>brush.front,v=>brush.front=v),
  h('div',{class:'row'},h('span',{class:'mu'},'تناظر:'),...['x','y','z'].map(a=>B(a.toUpperCase(),()=>{sym[a]=!sym[a];uiSide()},sym[a],'sm'))),
  h('h4',{},'التفاصيل'),h('p',{class:'mu'},'لنحت التفاصيل الدقيقة ضاعف الرؤوس أولًا.'),h('div',{class:'row'},B('تقسيم ناعم (يصقل)',()=>subSculpt(true),0,'sm'),B('تقسيم خطّي (يحافظ على الشكل)',()=>subSculpt(false),0,'sm')),
  h('p',{class:'mu'},'الرؤوس: '+M.nv)]}
 function paintPanel(){return[h('h4',{},'فرشاة التلوين'),h('div',{class:'row'},Ck('إظهار خطوط الشبكة',()=>wireOv,v=>{wireOv=v;buildSculptView()})),h('div',{class:'row'},Lb('اللون',h('input',{type:'color',value:brush.col,oninput:e=>brush.col=e.target.value}))),Rg('الحجم',()=>brush.r,v=>brush.r=v,.03,1.2,.01),Rg('القوة',()=>brush.s,v=>brush.s=v,.05,1,.05),Ck('تجاهل الوجوه الخلفية',()=>brush.front,v=>brush.front=v),
  h('div',{class:'row'},B('تعبئة الكل باللون',fillPaint,0,'sm'),B('مسح التلوين',clearPaint,0,'sm')),h('p',{class:'mu'},'التلوين يُخزَّن على الرؤوس؛ كثرة الرؤوس = دقة أعلى. استعمل «تقسيم» من وضع النحت لزيادة الدقة.')]}
 function modsPanel(){const m=part.mods,set=(k,v)=>{pushUndo();if(v)m[k]=v;else delete m[k];rebuild();uiSide()},X=[h('h4',{},'معدّلات حيّة (غير مدمّرة)')];
  X.push(h('div',{class:'row'},h('span',{class:'mu'},'مرآة:'),...[['mx','X'],['my','Y'],['mz','Z']].map(([k,t])=>B(t,()=>set(k,!m[k]),!!m[k],'sm'))),h('p',{class:'mu'},'نمذج نصف المجسم والمرآة تكمل النصف الآخر. ضع الرؤوس عند الوسط على الصفر.'));
  X.push(Rg('تنعيم السطح (Subdivision)',()=>m.sub||0,v=>{m.sub=v||undefined;rebuild()},0,3,1,()=>{}),Rg('سماكة (Solidify)',()=>m.solid||0,v=>{m.solid=v||undefined;rebuild()},0,.3,.005,()=>{}),Rg('زاوية التنعيم التلقائي',()=>part.sa??50,v=>{part.sa=v;rebuild()},0,180,5,()=>{}),
   Rg('تكرار (Array) العدد',()=>(m.arr||{}).n||1,v=>{m.arr=v>1?{n:v,o:(m.arr||{}).o||[1,0,0]}:undefined;rebuild()},1,12,1,()=>{}),m.arr?Rg('المسافة X',()=>m.arr.o[0],v=>{m.arr.o[0]=v;rebuild()},-3,3,.05,()=>{}):'');
  X.push(h('div',{class:'row'},B('تطبيق المعدّلات على الشبكة',OPS.applyMods,0,'sm')),h('p',{class:'mu'},'القائمة تُحفظ مع المجسم وتُعرض في القصة.'));return X}
 function matsPanel(){const X=[h('h4',{},'خانات المواد')],mats=part.mats;
  X.push(h('div',{class:'row'},...mats.map((q,i)=>h('div',{class:'sw'+(i==activeMat?' on':''),onclick:()=>{activeMat=i;uiSide()}},h('span',{style:'width:16px;height:16px;border-radius:4px;background:'+(q.c||'#c9a46a')}),'م'+(i+1))),B('＋',()=>{pushUndo();mats.push({c:'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')});activeMat=mats.length-1;rebuild();uiSide()},0,'sm'),mats.length>1?B('−',()=>{pushUndo();mats.splice(activeMat,1);M.fm=M.fm.map(x=>x==activeMat?0:x>activeMat?x-1:x);activeMat=Math.max(0,activeMat-1);rebuild();uiSide()},0,'sm'):''));
  const q=mats[activeMat]||(activeMat=0,mats[0]),ch=()=>{rebuild()};
  X.push(h('div',{class:'card'},h('div',{class:'row'},Lb('اللون',h('input',{type:'color',value:q.c||'#c9a46a',oninput:e=>{q.c=e.target.value;ch()}})),Se('خامة',MD_TEX,()=>q.tex||'',v=>{q.tex=v||undefined;ch()})),
   h('div',{class:'row'},Lb('توهج',h('input',{type:'color',value:q.e||'#000000',oninput:e=>{q.e=e.target.value;ch()}})),Rg('شدة التوهج',()=>q.ei??1,v=>q.ei=v,0,4,.1,ch)),Rg('الشفافية',()=>q.op??1,v=>q.op=v,.05,1,.05,ch),Rg('معدنية',()=>q.metal??0,v=>q.metal=v,0,1,.05,ch),Rg('خشونة',()=>q.rough??.8,v=>q.rough=v,0,1,.05,ch),
   h('div',{class:'row'},Ck('زجاج',()=>q.glass,v=>{q.glass=v||undefined;ch()}),Ck('وجهان (للأسطح الرقيقة)',()=>q.side==2,v=>{q.side=v?2:undefined;ch()}),Ck('اعتماد تلوين الرؤوس',()=>q.vc!==false,v=>{q.vc=v?undefined:false;ch()}),...(part.tex?[Ck('استخدام الخامة المرسومة',()=>q.tp!==false,v=>{q.tp=v?undefined:false;ch()})]:[])),h('div',{class:'row'},Ck('مزج لون المادة مع التلوين (ضرب)',()=>!!q.cw,v=>{q.cw=v?1:undefined;ch()})),h('p',{class:'mu'},'إن كان المجسم ملوّنًا بالفرشاة فتلوينه هو الظاهر، ولون المادة لا يؤثر إلا مع «المزج». أوقف «اعتماد تلوين الرؤوس» لإظهار لون المادة الصافي.')));
  X.push(h('div',{class:'row'},B('عيّن للوجوه المحددة',()=>{if(!sel.f.size&&!sel.v.size)return toast('حدّد وجوهًا');pushUndo();(sel.f.size?sel.f:MO.vertsToFaces(M,sel.v)).forEach(fi=>M.fm[fi]=activeMat);rebuild()},0,'sm'),B('حدّد وجوه المادة',()=>{if(smode!='f')setMode('f');sel.f=new Set(M.f.map((_,i)=>i).filter(i=>(M.fm[i]||0)==activeMat));norm();overlay();ui()},0,'sm')),Rg('حجم نقش الخامة',()=>part.uvs||1,v=>{part.uvs=v},.2,6,.1,()=>rebuild()));return X}
 function viewPanel(){return[h('h4',{},'العرض'),h('div',{class:'row'},...[['solid','طين'],['mat','المواد'],['vc','ألوان الرؤوس'],['wire','إطار']].map(([k,t])=>B(t,()=>{shade=k;if(emode=='sculpt'||emode=='paint')buildSculptView();else if(emode=='tex')buildTexView();else rebuild();uiSide()},shade==k,'sm'))),
  h('div',{class:'row'},Ck('إظهار المعدّلات أثناء التحرير',()=>showMods,v=>{showMods=v;rebuild()}),Ck('اتجاه الوجوه (الخلفي أحمر)',()=>showFaceDir,v=>{showFaceDir=v;rebuild()}),Ck('الشبكة المرجعية',()=>grid.visible,v=>grid.visible=v),Ck('إظهار خطوط الشبكة (نحت/تلوين)',()=>wireOv,v=>{wireOv=v;if(emode=='sculpt'||emode=='paint')buildSculptView();else if(emode=='tex')buildTexView()})),
  h('div',{class:'row'},B('إطار على الكل',()=>frame(true),0,'sm'),B('تركيز المحدد',()=>frame(false),0,'sm')),h('h4',{},'اختصارات'),h('p',{class:'mu',style:'line-height:1.7'},'1/2/3 نقاط/حواف/وجوه · G/R/S أداة تحريك/تدوير/حجم · E بثق · I إدخال · X حذف · M دمج · F ملء · J وصل · Ctrl+R قصّ حلقة · ⇧D نسخ · A تحديد الكل · Alt+A إلغاء · Ctrl+Z تراجع · Alt+Z شفاف · Home إطار · أرقام لوحة المفاتيح 1/3/7/5 للمناظر.')]}
 // ---------- لوحة المفاتيح ----------
 function kd(e){if(!alive||/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName))return;const k=e.key.toLowerCase(),cz=e.ctrlKey||e.metaKey;if(k=='escape'){e.preventDefault();e.stopPropagation();selNone();return}
  if(e.code&&e.code.startsWith('Numpad')){const m={Numpad1:e.ctrlKey?'back':'front',Numpad3:e.ctrlKey?'left':'right',Numpad7:e.ctrlKey?'bottom':'top',Numpad5:null};if(e.code=='Numpad5'){ortho=!ortho;uiTb()}else if(m[e.code]){viewTo(m[e.code]);e.preventDefault()}return}
  if(cz&&k=='z'){e.preventDefault();e.shiftKey?redo():undo();return}if(cz&&k=='y'){e.preventDefault();redo();return}
  if(e.altKey&&k=='z'){xray=!xray;overlay();uiTb();return}
  if(cz&&k=='r'){e.preventDefault();setTool('loop');return}
  if(emode=='edit'){if(k=='1')setMode('v');else if(k=='2')setMode('e');else if(k=='3')setMode('f');else if(k=='g')setTool('move');else if(k=='r')setTool('rot');else if(k=='s')setTool('scale');else if(k=='q')setTool('select');else if(k=='b')setTool('box');
   else if(k=='e')OPS.extrude();else if(k=='i')OPS.inset();else if(k=='x'||k=='delete'||k=='backspace'){e.preventDefault();OPS.del()}else if(k=='m')OPS.merge('center');else if(k=='f')OPS.fill();else if(k=='j')OPS.connect();else if(k=='d'&&e.shiftKey)OPS.dup();
   else if(k=='a'){e.altKey?selNone():selAll()}}
  if(k=='home')frame(true)}
 // ---------- المؤشر ----------
 const pts=new Map();let pm=null,ps=null,box=null,hoverRingHL=null;
 const pinchD=()=>{const[a,b]=[...pts.values()];return[Math.hypot(a[0]-b[0],a[1]-b[1]),(a[0]+b[0])/2,(a[1]+b[1])/2]};
 function gizHit(e){if(!giz.visible)return null;giz.updateMatrixWorld(true);camUpdate();const r=rayOf(e),hs=r.intersectObjects(hits,true);for(const x of hs){let o=x.object;while(o&&!(o.userData&&o.userData.hd))o=o.parent;if(o)return o.userData.hd}return null}
 function edgeAt(e){const old=smode;smode='e';const p=pickAt(e);smode=old;return p&&p.k=='e'?p.id:null}
 function loopHover(e){const k=edgeAt(e);if(k===hover)return;hover=k;if(hoverRingHL){hoverRingHL.geometry.dispose();scene.remove(hoverRingHL);hoverRingHL=null}if(k==null)return;const ring=MO.edgeRing(M,k),pos=[];ring.forEach(q=>{const ed=eMap.get(q);if(ed)pos.push(M.v[3*ed.a],M.v[3*ed.a+1],M.v[3*ed.a+2],M.v[3*ed.b],M.v[3*ed.b+1],M.v[3*ed.b+2])});const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(pos,3));hoverRingHL=new TH.LineSegments(g,new TH.LineBasicMaterial({color:0xffe14a,depthTest:false,linewidth:2}));hoverRingHL.renderOrder=30;scene.add(hoverRingHL)}
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);cv.focus&&cv.focus();pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size==2){pm='pinch';ps=pinchD();return}
  if(e.button==2||e.button==1){pm='pan';ps={x:e.clientX,y:e.clientY};return}
  if(emode=='tex'){if(texStart(e)){pm='stroke';return}pm='orbit';ps={x:e.clientX,y:e.clientY};return}
  if(emode=='sculpt'||emode=='paint'){if(startStroke(e)){pm='stroke';return}pm='orbit';ps={x:e.clientX,y:e.clientY};return}
  if(emode=='edit'){const hd=gizHit(e);if(hd){startGizmo(e,hd);pm='gizmo';return}
   if(tool=='box'){pm='box';ps={x:e.clientX,y:e.clientY,add:e.shiftKey||multi};box=h('div',{style:'position:fixed;border:1px dashed #ffd24a;background:#ffd24a22;pointer-events:none;z-index:100000'});root.append(box);return}
   if(tool=='loop'){const k=edgeAt(e);if(k!=null)OPS.loopcut(k);pm=null;return}
   pm='press';ps={x:e.clientX,y:e.clientY,moved:0,e};return}
  pm='orbit';ps={x:e.clientX,y:e.clientY}};
 cv.onpointermove=e=>{const q=pts.get(e.pointerId);if(!q){if(emode=='edit'&&tool=='loop')loopHover(e);else if(emode=='sculpt'||emode=='paint'||emode=='tex')showRing(hitAt(e));return}const dx=e.clientX-q[0],dy=e.clientY-q[1];pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pm=='pinch'&&pts.size==2){const n=pinchD();dist=Math.max(.2,Math.min(80,dist*ps[0]/n[0]));const s=pxScale();const m=C.matrixWorld.elements;tg.addScaledVector(new TH.Vector3(m[0],m[1],m[2]),-(n[1]-ps[1])*s).addScaledVector(new TH.Vector3(m[4],m[5],m[6]),(n[2]-ps[2])*s);ps=n}
  else if(pm=='orbit'){yaw-=dx*.008;pit=Math.max(-1.55,Math.min(1.55,pit+dy*.008))}
  else if(pm=='pan'){const s=pxScale(),m=C.matrixWorld.elements;tg.addScaledVector(new TH.Vector3(m[0],m[1],m[2]),-dx*s).addScaledVector(new TH.Vector3(m[4],m[5],m[6]),dy*s)}
  else if(pm=='press'){ps.moved+=Math.abs(dx)+Math.abs(dy);if(ps.moved>7){pm='orbit'}}
  else if(pm=='gizmo')moveGizmo(e);
  else if(pm=='box'){const x0=Math.min(ps.x,e.clientX),y0=Math.min(ps.y,e.clientY);Object.assign(box.style,{left:x0+'px',top:y0+'px',width:Math.abs(e.clientX-ps.x)+'px',height:Math.abs(e.clientY-ps.y)+'px'})}
  else if(pm=='stroke'){if(emode=='tex')texTick(e);else{stroke.e=e;strokeTick(e)}showRing(hitAt(e))}};
 cv.onpointerup=cv.onpointercancel=e=>{pts.delete(e.pointerId);if(pm=='press'&&ps&&ps.moved<=7){applyPick(pickAt(ps.e),ps.e)}else if(pm=='gizmo')endGizmo();else if(pm=='box'){boxSelect(ps.x,ps.y,e.clientX,e.clientY,ps.add);box&&box.remove();box=null}else if(pm=='stroke'){if(emode=='tex')texEnd();else endStroke();if(emode=='paint')dirty=true}
  if(!pts.size)pm=null;else if(pts.size==1&&pm=='pinch'){pm=null}};
 cv.onwheel=e=>{e.preventDefault();dist=Math.max(.2,Math.min(80,dist*(1+e.deltaY*.0012)))};
 cv.ondblclick=e=>{if(emode=='edit'&&smode=='e'&&tool=='select'){const k=edgeAt(e);if(k!=null){sel.e=new Set(MO.edgeLoop(M,k));norm();overlay();ui()}}};
 // ---------- الحلقة الرئيسية ----------
 let raf=0,lastT=0,autosave=0;
 function loop(t){if(!alive)return;raf=requestAnimationFrame(loop);const w=cv.clientWidth,hh=cv.clientHeight;if(w&&hh&&(cv.width!=Math.round(w*rd.getPixelRatio())||cv.height!=Math.round(hh*rd.getPixelRatio())))rd.setSize(w,hh,false);
  if(viewAnim){const a=viewAnim;a.t=Math.min(1,a.t+.12);const u=a.t*a.t*(3-2*a.t);let dy=a.y1-a.y0;dy=Math.atan2(Math.sin(dy),Math.cos(dy));yaw=a.y0+dy*u;pit=a.p0+(a.p1-a.p0)*u;if(a.t>=1)viewAnim=null}
  if(tFlag&&emode!='sculpt')texFlush(false);if(uvLive&&uvPrev&&t-uvT>250){uvT=t;uvLive=false;drawUV()}camUpdate();if(giz.visible)placeGizmo();rd.clear();rd.render(scene,C);rd.clearDepth();if(giz.visible)rd.render(oscene,C);
  if(dirty&&t-autosave>4000){autosave=t;part.mesh=M.toJSON();dirty=false}}
 const origPart=JSON.stringify(part);
 // واجهة للاختبارات والبرمجة
 const API={get M(){return M},sel,part,OPS,op,undo,redo,setMode,setEmode,setTool,rebuild,overlay,norm,frame,viewTo,pickAt,applyPick,boxSelect,toScreen,selAll,selNone,selGrow,selLoop,finish,close,get smode(){return smode},get emode(){return emode},brush,sym,prop,get last(){return last},applyLast,gizHit,startGizmo,moveGizmo,endGizmo,setView:(y,p,d)=>{yaw=y;pit=p;dist=d},setTg:(x,y,z)=>tg.set(x,y,z),root,cv,get C(){return C},uiSide,setTab:t=>{tab=t;uiSide()},get snapCount(){return undoS.length},setShade:s=>{shade=s;rebuild()},pivot,startStroke,strokeTick,endStroke,hitAt,buildSculptView,setOrtho:v=>{ortho=v},camUpdate,setOrient:v=>{orient=v},giz,get tp(){return tp},tb:tbr,texStart,texTick,texEnd,ensureTP,enterTex,buildTexView,saveTex,get tLayer(){return tLayer},set tLayer(v){tLayer=v},texFull,seamOp,get smesh(){return smesh}};
 setTool('select');rebuild();frame(true);uiBar();uiTb();uiSide();status('اضغط على النقاط/الحواف/الوجوه لتحديدها، ثم استعمل الأسهم أو أدوات اللوحة.');document.addEventListener('keydown',kd);raf=requestAnimationFrame(loop);
 return API}
