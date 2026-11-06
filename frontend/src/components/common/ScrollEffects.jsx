import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export default function ScrollEffects(){
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis=new Lenis({smoothWheel:true,lerp:.09});
  let raf; const tick=t=>{lenis.raf(t);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);
  const ctx=gsap.context(()=>{gsap.utils.toArray('main section,.section,.about-band,.dark-cta').forEach((el)=>{gsap.fromTo(el,{y:24,opacity:.65},{y:0,opacity:1,duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}})});});
  return()=>{cancelAnimationFrame(raf);lenis.destroy();ctx.revert();};
 },[]);return null;
}
