'use client';
import {useLanguage} from './language';


import {useId, useState, type CSSProperties} from 'react';
import {Pause, Play} from 'lucide-react';

const providers = [
  ['openai', 'OpenAI'], ['claude-color', 'Claude'], ['gemini-color', 'Gemini'],
  ['deepseek-color', 'DeepSeek'], ['mistral-color', 'Mistral'], ['grok', 'Grok'],
  ['qwen-color', 'Qwen'], ['cohere-color', 'Cohere'], ['perplexity-color', 'Perplexity'],
  ['kimi-color', 'Kimi'], ['zhipu-color', 'GLM'], ['doubao-color', 'Doubao'],
  ['yi-color', 'Yi'], ['ollama', 'Ollama'],
] as const;
type Point=[number,number];
// A single Hermite spline shares tangents across every bend. Unlike separate
// Bezier segments, its normals never jump at the joins.
const knots:Point[]=[[1530,-55],[1280,55],[1110,175],[1030,315],[960,440],[800,530],[490,565],[150,568],[-190,568]];
function tangent(i:number):Point{
 if(i===0)return [-260,80];
 if(i===knots.length-1)return [-500,0];
 return [(knots[i+1][0]-knots[i-1][0])*.5,(knots[i+1][1]-knots[i-1][1])*.5];
}
function center(progress:number){
 const segment=Math.min(knots.length-2,Math.floor(progress*(knots.length-1)));
 const t=progress===1?1:progress*(knots.length-1)-segment;const t2=t*t,t3=t2*t;
 const a=knots[segment],b=knots[segment+1],m=tangent(segment),n=tangent(segment+1);
 const position:Point=[0,0],derivative:Point=[0,0],second:Point=[0,0];
 for(let axis=0;axis<2;axis++){
  position[axis]=(2*t3-3*t2+1)*a[axis]+(t3-2*t2+t)*m[axis]+(-2*t3+3*t2)*b[axis]+(t3-t2)*n[axis];
  derivative[axis]=(6*t2-6*t)*a[axis]+(3*t2-4*t+1)*m[axis]+(-6*t2+6*t)*b[axis]+(3*t2-2*t)*n[axis];
  second[axis]=(12*t-6)*a[axis]+(6*t-4)*m[axis]+(-12*t+6)*b[axis]+(6*t-2)*n[axis];
 }
 return {position,derivative,second};
}
// Arc-length lookup keeps icons from accelerating abruptly between spline spans.
const arc=[0];let previous=center(0).position;
for(let i=1;i<=1024;i++){const current=center(i/1024).position;arc.push(arc[i-1]+Math.hypot(current[0]-previous[0],current[1]-previous[1]));previous=current}
function point(progress:number,lane:number):Point{
 const distance=progress*arc[1024];let low=0,high=1024;
 while(high-low>1){const mid=(low+high)>>1;if(arc[mid]<distance)low=mid;else high=mid}
 const parameter=(low+(distance-arc[low])/(arc[high]-arc[low]||1))/1024;
 const {position:[x,y],derivative:[dx,dy]}=center(parameter);
 const speed=Math.hypot(dx,dy)||1;
 // Smooth, slowly varying width avoids pinching at spline-span boundaries.
 const spread=.24+.93*Math.sin(progress*Math.PI/2)+.06*Math.sin(progress*Math.PI*2)*Math.sin(progress*Math.PI);
 const ripple=Math.sin(progress*Math.PI*2.6+lane*.013)*Math.sin(progress*Math.PI)*2.4;
 const offset=lane*spread+ripple;
 return [x-dy/speed*offset,y+dx/speed*offset];
}
function samples(lane:number):Point[]{return Array.from({length:121},(_,i)=>point(i/120,lane))}
// Refit the offset samples as cubic curves too: no polyline corners at any zoom.
function curve(points:Point[],start=true){
 let d=start?`M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`:'';
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];
  d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(2)},${(b[1]+(c[1]-a[1])/6).toFixed(2)} ${(c[0]-(e[0]-b[0])/6).toFixed(2)},${(c[1]-(e[1]-b[1])/6).toFixed(2)} ${c[0].toFixed(2)},${c[1].toFixed(2)}`;
 }
 return d;
}
function riverLine(lane:number){return curve(samples(lane))}
function ribbon(first:number,last:number){const a=samples(first),b=samples(last).reverse();return `${curve(a)} L${b[0][0].toFixed(2)},${b[0][1].toFixed(2)}${curve(b,false)} Z`}
const lanes=[-84,-65,-39,-22,3,30,49,83];
const riverPaths=lanes.map(riverLine);
const riverSurface=ribbon(-84,83),riverInset=ribbon(-42,52),riverEdge=ribbon(49,83);

const frameRules=[-43,0,43].map((lane,index)=>`@keyframes model-river-flow-${index}{${Array.from({length:51},(_,i)=>{
  const t=i/50;const [x,y]=point(t,lane);const scale=.34+t*1.13+Math.sin(t*Math.PI*6)*(.025+t*.065);
  const angle=Math.sin(t*Math.PI*6+index)*7;
  const opacity=t<.07?t/.07:t>.93?(1-t)/.07:1;
  return `${i*2}%{transform:translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${scale.toFixed(3)}) rotate(${angle.toFixed(2)}deg);opacity:${opacity.toFixed(3)}}`;
}).join('')}}`).join('\n');
// Seeded variation keeps SSR and hydration identical while making each icon
// spin independently instead of moving in synchronized groups.
function variation(index:number,salt:number){const n=Math.sin((index+1)*127.1+salt*311.7)*43758.5453;return n-Math.floor(n)}
const boats=Array.from({length:28},(_,index)=>{
  const lane=index%3;const slot=Math.floor(index/3);const total=lane===0?10:9;
  const progress=(slot+.45+lane*.33)/total;
  const [x,y]=point(progress,[-43,0,43][lane]);
  return {provider:providers[index%providers.length],lane,progress,x,y,duration:43+lane*4,spinDuration:20+variation(index,1)*26,spinDirection:variation(index,2)>.5?"normal":"reverse",spinStart:variation(index,3)*360};
});
export default function ModelRiver(){
const {t}=useLanguage();
 const [paused,setPaused]=useState(false);const id=useId().replaceAll(':','');
 return <div className="model-river" data-paused={paused}>
  <style>{frameRules}</style>
  <svg className="river-scene" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby={`${id}-title ${id}-description`}>
   <title id={`${id}-title`}>{t("A flowing river of AI models")}</title>
   <desc id={`${id}-description`}>{t("Fourteen model brands drift along a winding river from the distant upper right to the lower left: OpenAI, Claude, Gemini, DeepSeek, Mistral, Grok, Qwen, Cohere, Perplexity, Kimi, GLM, Doubao, Yi and Ollama.")}</desc>
   <defs>
    <linearGradient id={`${id}-surface`} gradientUnits="userSpaceOnUse" x1="1320" y1="50" x2="480" y2="650"><stop stopColor="#e9e5fa" stopOpacity=".12"/><stop offset=".42" stopColor="#c9bff0" stopOpacity=".19"/><stop offset=".72" stopColor="#f7f5ff" stopOpacity=".65"/><stop offset="1" stopColor="#c0b4e8" stopOpacity=".21"/></linearGradient>
    <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8e7dbb" stopOpacity=".04"/><stop offset="1" stopColor="#70608f" stopOpacity=".16"/></linearGradient>
    <linearGradient id={`${id}-light`} gradientUnits="userSpaceOnUse" x1="1200" y1="110" x2="450" y2="620"><stop stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor="#fff" stopOpacity=".7"/><stop offset="1" stopColor="#fff" stopOpacity=".16"/></linearGradient>
   </defs>
   <g aria-hidden="true">
    <path d={riverSurface} fill="#74698a" opacity=".09" transform="translate(0 15)" className="river-depth"/>
    <path d={riverSurface} fill={`url(#${id}-surface)`}/>
    <path d={riverEdge} fill={`url(#${id}-edge)`}/>
    <path d={riverInset} fill={`url(#${id}-light)`}/>
   </g>
   <g className="river-banks" fill="none" strokeLinecap="round" strokeLinejoin="round">{riverPaths.map((path,i)=><path key={lanes[i]} d={path} stroke={i===0||i===4?'#fff':'#a99acb'} strokeWidth={[1.4,.65,1,.55,1.6,.8,.5,1.05][i]} opacity={[.8,.24,.32,.22,.68,.3,.22,.34][i]}/>)}</g>
   <g aria-hidden="true">{boats.map((boat,i)=><g key={i} className={`river-vessel river-lane-${boat.lane}`} style={{'--spin-time':`${boat.spinDuration}s`,'--spin-direction':boat.spinDirection,'--spin-start':`${boat.spinStart}deg`,'--flow-time':`${boat.duration}s`,'--flow-delay':`${-boat.progress*boat.duration}s`,transform:`translate(${boat.x}px,${boat.y}px) scale(${.34+boat.progress*1.13})`} as CSSProperties}>
    <g className="river-token"><g className="river-spin"><rect x="-29" y="-29" width="58" height="58" rx="18" fill="#fff" fillOpacity=".94" stroke="#eeedf1"/><image href={`/models/${boat.provider[0]}.svg`} x="-18" y="-18" width="36" height="36"/><title>{boat.provider[1]}</title></g></g>
   </g>)}</g>
  </svg>
  <button type="button" className="river-pause" onClick={()=>setPaused(!paused)} aria-label={t(paused?'Play model river animation':'Pause model river animation')}>{paused?<Play size={12}/>:<Pause size={12}/>}<span>{t(paused?'Play motion':'Pause motion')}</span></button>
 </div>
}
