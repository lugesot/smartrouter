'use client';

import Link from 'next/link';
import {Server, Sparkles, Building2, Check, ArrowUpRight} from 'lucide-react';
import {useLanguage} from './language';

const features = [
  {
    icon:Server,
    category:'PRIVATE INFRASTRUCTURE',
    title:'Your servers. Lower costs.',
    description:'Connect private model servers to SmartRouter and access more affordable inference through one unified gateway.',
    points:[
      ['Connect private servers','Bring your private model endpoints into the same workflow.'],
      ['More affordable inference','Use private infrastructure to reduce the cost of model calls.'],
    ],
  },
  {
    icon:Sparkles,
    category:'INTELLIGENT API',
    title:'All the models. Less setup.',
    description:'A smarter API that takes care of model access and fallback, so you can focus on building.',
    points:[
      ['No individual activation','All models are enabled automatically, with no separate activation required.'],
      ['No fallback configuration','Automatically fall back to a model with equivalent capabilities when needed.'],
    ],
  },
  {
    icon:Building2,
    category:'ENTERPRISE SUBSCRIPTIONS',
    title:'Built around your business.',
    description:'A flexible subscription with the policies, private services and access controls your organization needs.',
    points:[
      ['Flexible token policies','Tailor token allocation and usage policies to your business.'],
      ['Register private services','Register and use your own private model services.'],
      ['Independent access control','Manage resource permissions through a dedicated control platform.'],
    ],
  },
] as const;

export default function PlatformFeatures(){
 const {t}=useLanguage();
 return <section className="lp-section lp-platform" id="platform" aria-labelledby="platform-heading">
  <div className="lp-section-heading">
   <div><div className="lp-kicker">{t('MORE CONTROL. LESS COMPLEXITY.')}</div><h2 id="platform-heading">{t('One gateway. Your way.')}</h2></div>
   <p>{t('Lower your costs, simplify model access, and give your team room to grow.')}</p>
  </div>
  <div className="lp-benefits-grid">
   {features.map((feature,index)=><article key={feature.category} className={`lp-benefit${index===2?' lp-benefit-enterprise':''}`}>
    <div className="lp-benefit-top"><span className="lp-benefit-icon"><feature.icon size={23} strokeWidth={1.6}/></span><span className="lp-benefit-number">0{index+1}</span></div>
    <div className="lp-benefit-category">{t(feature.category)}</div>
    <h3>{t(feature.title)}</h3>
    <p>{t(feature.description)}</p>
    <ul>{feature.points.map(([title,description])=><li key={title}><Check size={15} aria-hidden="true"/><div><h4>{t(title)}</h4><p>{t(description)}</p></div></li>)}</ul>
   </article>)}
  </div>
  <div className="lp-section-foot"><span>{t('Private infrastructure. Intelligent routing. Enterprise control.')}</span><Link href="/workspace">{t('Explore the workspace')} <ArrowUpRight size={15}/></Link></div>
 </section>;
}
