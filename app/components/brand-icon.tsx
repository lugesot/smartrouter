import type {SVGProps} from 'react';
/** Shared vector geometry for the approved Smart S identity. */
export default function BrandIcon({size=24,...props}:SVGProps<SVGSVGElement>&{size?:number}) {
  return <svg width={size} height={size} viewBox="64 64 384 384" fill="currentColor" aria-hidden="true" focusable="false" {...props}><path d="M382 96H202C153 96 121 119 105 159C87 204 107 228 151 236C176 241 219 242 270 242L190 174H382C434 174 434 96 382 96Z"/><path d="M382 96H202C153 96 121 119 105 159C87 204 107 228 151 236C176 241 219 242 270 242L190 174H382C434 174 434 96 382 96Z" transform="rotate(180 256 256)"/></svg>;
}
