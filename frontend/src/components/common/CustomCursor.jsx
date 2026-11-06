import { useEffect } from 'react';

export default function CustomCursor(){
  useEffect(()=>{
    if(window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dot=document.createElement('div'), ring=document.createElement('div');
    dot.className='cursor-dot'; ring.className='cursor-ring'; document.body.append(dot,ring);
    let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y,raf;
    const move=e=>{x=e.clientX;y=e.clientY;document.documentElement.style.setProperty('--cursor-x',`${x}px`);document.documentElement.style.setProperty('--cursor-y',`${y}px`);const target=e.target.closest('.button,.submit-button,.login-nav');if(target){const r=target.getBoundingClientRect();const dx=(x-(r.left+r.width/2))*.12,dy=(y-(r.top+r.height/2))*.12;target.style.translate=`${dx}px ${dy}px`;}document.querySelectorAll('.button,.submit-button,.login-nav').forEach(el=>{if(el!==target)el.style.translate='0 0'});};
    const hover=e=>{const target=e.target.closest('a,button,.course-card,.faculty-card,.notice-preview,.achiever-card');ring.classList.toggle('cursor-active',!!target);ring.dataset.label=target?.tagName==='A'?'View':target?'Click':'';};
    const click=()=>{ring.classList.remove('cursor-burst');void ring.offsetWidth;ring.classList.add('cursor-burst');};
    const loop=()=>{rx+=(x-rx)*.16;ry+=(y-ry)*.16;dot.style.transform=`translate3d(${x}px,${y}px,0)`;ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;raf=requestAnimationFrame(loop);};
    window.addEventListener('mousemove',move);document.addEventListener('mouseover',hover);window.addEventListener('click',click);loop();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('mousemove',move);document.removeEventListener('mouseover',hover);window.removeEventListener('click',click);dot.remove();ring.remove();};
  },[]);
  return null;
}
