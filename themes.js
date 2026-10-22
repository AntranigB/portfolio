/* Optional appearance preferences. Fish are a bounded CSS-only decoration. */
(() => {
  const root=document.documentElement;
  const darkPreference=window.matchMedia('(prefers-color-scheme: dark)');
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
  const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
  let chosenTheme=read('portfolio-theme');
  let tropical=read('portfolio-tropical')==='true';
  function applyTheme(){
    const dark=chosenTheme?chosenTheme==='dark':darkPreference.matches;
    root.dataset.theme=dark?'dark':'light';
    document.querySelectorAll('.theme-toggle').forEach(button=>{
      button.textContent=dark?'☀':'☾';button.setAttribute('aria-pressed',String(dark));
      button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');button.title=button.getAttribute('aria-label');
    });
  }
  function refreshPhoto(){
    document.querySelectorAll('.headshot[data-normal-src]').forEach(image=>{
      image.src=tropical&&image.dataset.tropicalSrc?image.dataset.tropicalSrc:image.dataset.normalSrc;
      image.closest('.headshot-frame')?.classList.toggle('tropical-photo',tropical);
    });
  }
  function applyTropical(){
    root.dataset.tropical=String(tropical);
    document.querySelectorAll('.tropical-toggle').forEach(button=>button.setAttribute('aria-pressed',String(tropical)));
    document.querySelector('.tropical-fish')?.remove();
    if(tropical&&!motionPreference.matches){
      const layer=document.createElement('div');layer.className='tropical-fish';layer.setAttribute('aria-hidden','true');
      ['🐠','🐟','🐡','🐠','🐟','🐠','🐡','🐟'].forEach((fish,i)=>{
        const swimmer=document.createElement('span');swimmer.className='fish-swimmer';
        swimmer.style.setProperty('--fish-top',(10+i*10)+'%');swimmer.style.setProperty('--fish-speed',(23+i*2)+'s');
        swimmer.style.setProperty('--fish-delay',(-i*6)+'s');swimmer.style.setProperty('--fish-size',(26+(i%3)*7)+'px');
        const shape=document.createElement('span');shape.textContent=fish;swimmer.append(shape);layer.append(swimmer);
      });document.body.append(layer);
    }
    refreshPhoto();pauseEffects();
  }
  function pauseEffects(){root.classList.toggle('effects-paused',document.hidden);}
  document.querySelectorAll('.theme-toggle').forEach(button=>button.addEventListener('click',()=>{
    chosenTheme=root.dataset.theme==='dark'?'light':'dark';write('portfolio-theme',chosenTheme);applyTheme();
  }));
  document.querySelectorAll('.tropical-toggle').forEach(button=>button.addEventListener('click',()=>{
    tropical=!tropical;write('portfolio-tropical',String(tropical));
    applyTropical();
  }));
  darkPreference.addEventListener('change',()=>{if(!chosenTheme)applyTheme();});
  motionPreference.addEventListener('change',applyTropical);
  document.addEventListener('visibilitychange',pauseEffects);
  window.PortfolioAppearance={refreshPhoto};applyTheme();applyTropical();
})();
