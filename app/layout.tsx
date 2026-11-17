import './globals.css';
import '../public/select-control.css';
import {LanguageProvider} from './components/language';
import type {Viewport} from 'next';
export const viewport:Viewport={themeColor:'#5546C7'};
export const metadata = {title:'SmartRouter — One gateway. Every model.',description:'SmartRouter connects your ideas to the best AI models through one unified gateway.',manifest:'/site.webmanifest'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><LanguageProvider>{children}</LanguageProvider></body></html>}
