export type Language='en'|'zh';
/** Explicit choice wins; otherwise any Chinese browser preference selects Chinese. */
export function detectLanguage(languages:readonly string[],saved:string|null):Language{
 if(saved==='en'||saved==='zh')return saved;
 return languages.some(language=>/^zh(?:[-_]|$)/i.test(language))?'zh':'en';
}
