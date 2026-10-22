// Models open automatically. Render at a bounded frame rate only while the tab is visible.
for(const host of document.querySelectorAll('[data-stl-viewer]')) {
 const button=host.querySelector('button'),status=host.querySelector('[role=status]');
 async function load(){
  button.disabled=true;status.textContent='Loading 3D model…';
  try {
   const THREE=await import('./assets/vendor/three/three.module.js');
   const {OrbitControls}=await import('./assets/vendor/three/OrbitControls.js');
   const scene=new THREE.Scene();let model;
   const fbx=/\.fbx$/i.test(host.dataset.stlViewer);
   if(fbx){const {FBXLoader}=await import('./assets/vendor/three/FBXLoader.js');model=await new FBXLoader().loadAsync(host.dataset.stlViewer);}
   else {const {STLLoader}=await import('./assets/vendor/three/STLLoader.js');const geometry=await new STLLoader().loadAsync(host.dataset.stlViewer);geometry.computeVertexNormals();model=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x439fe8,roughness:.55,metalness:.15}));}
   model.rotation.x+=THREE.MathUtils.degToRad(Number(host.dataset.rotationX)||0);
   model.rotation.z+=THREE.MathUtils.degToRad(Number(host.dataset.rotationZ)||0);
   const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());model.position.sub(center);const pivot=new THREE.Group();pivot.add(model);scene.add(pivot);
   const radius=box.getSize(new THREE.Vector3()).length()/2||1;
   const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   const canvas=renderer.domElement;canvas.style.cssText='display:block;width:100%;height:420px;touch-action:none';canvas.setAttribute('aria-label','Interactive 3D model: drag to rotate, scroll to zoom');canvas.tabIndex=0;host.append(canvas);
   const camera=new THREE.PerspectiveCamera(45,1,radius/100,radius*100);camera.position.set(radius*1.7,radius*1.3,radius*2.4);if(host.dataset.frontView==='true')camera.position.set(0,0,radius*3.2);camera.lookAt(0,0,0);
   scene.add(new THREE.HemisphereLight(0xffffff,0x475569,3));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(radius*3,radius*4,radius*5);scene.add(light);
   const controls=new OrbitControls(camera,canvas);controls.minDistance=radius*.3;controls.maxDistance=radius*12;const spinAxis=['x','y','z'].includes(host.dataset.spinAxis)?host.dataset.spinAxis:null;let spinning=!matchMedia('(prefers-reduced-motion: reduce)').matches;controls.autoRotate=spinning&&!spinAxis;controls.autoRotateSpeed=1;
   const render=()=>renderer.render(scene,camera);controls.addEventListener('change',render);
   const resize=new ResizeObserver(()=>{renderer.setSize(host.clientWidth,420,false);camera.aspect=host.clientWidth/420;camera.updateProjectionMatrix();render();});resize.observe(host);
   controls.saveState();button.hidden=true;status.textContent='Drag to rotate · Scroll or pinch to zoom';
   const reset=document.createElement('button');reset.type='button';reset.textContent='Reset view';reset.onclick=()=>{controls.reset();pivot.rotation.set(0,0,0);render();};host.append(reset);
   const spin=document.createElement('button');spin.type='button';const label=()=>{spin.textContent=spinning?'Pause rotation':'Resume rotation';spin.setAttribute('aria-pressed',String(spinning));};label();spin.onclick=()=>{spinning=!spinning;controls.autoRotate=spinning&&!spinAxis;label();};host.append(spin);
   let stopped=false,last=0,raf;function animate(now){if(stopped)return;raf=requestAnimationFrame(animate);if(document.hidden||now-last<33)return;const delta=Math.min((now-last)/1000,.1);last=now;if(spinning){if(spinAxis)pivot.rotation[spinAxis]-=delta*.2;else controls.update(delta);render();}}raf=requestAnimationFrame(animate);
   window.addEventListener('pagehide',()=>{stopped=true;cancelAnimationFrame(raf);resize.disconnect();controls.dispose();model.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m)continue;for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});renderer.dispose();},{once:true});render();
  }catch(error){status.textContent='Unable to open the 3D viewer. The model download is available below.';button.hidden=false;button.disabled=false;button.textContent='Retry 3D viewer';}
 }
 button.addEventListener('click',load);load();
}
