'use client';
import {createContext,useContext,useEffect,useState,useCallback,type ReactNode} from 'react';
import {Globe} from 'lucide-react';
import zh from './zh-cn.json';
import {detectLanguage,type Language} from './locale';
const STORAGE_KEY='smartrouter-language';
const translations:Record<string,string>=zh;
type LocaleContext={language:Language;setLanguage:(language:Language)=>void;t:(text:string)=>string};
const LanguageContext=createContext<LocaleContext>({language:'en',setLanguage:()=>{},t:text=>text});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setCurrent]=useState<Language>('en');
 useEffect(()=>{let saved:string|null=null;try{saved=localStorage.getItem(STORAGE_KEY)}catch{}setCurrent(detectLanguage(navigator.languages?.length?navigator.languages:[navigator.language],saved))},[]);
 useEffect(()=>{document.documentElement.lang=language==='zh'?'zh-CN':'en'},[language]);
 const setLanguage=useCallback((value:Language)=>{setCurrent(value);try{localStorage.setItem(STORAGE_KEY,value)}catch{}},[]);
 const t=useCallback((text:string)=>language==='zh'?(translations[text]??text):text,[language]);
 return <LanguageContext.Provider value={{language,setLanguage,t}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext)}
export function LanguageSwitch(){const {language,setLanguage}=useLanguage();return <button className="language-switch" type="button" onClick={()=>setLanguage(language==='en'?'zh':'en')} aria-label={language==='en'?'切换为中文':'Switch to English'}><Globe size={15}/><span>{language==='en'?'中文':'EN'}</span></button>}
