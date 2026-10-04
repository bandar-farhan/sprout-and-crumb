"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun, Sprout, Languages } from "lucide-react";
import type { Lang } from "@/lib/bakery";
const Context=createContext<{lang:Lang; t:(ar:string,en:string)=>string}>({lang:"ar",t:(ar)=>ar});
export const useLocale=()=>useContext(Context);
export function Shell({children,admin=false}:{children:React.ReactNode;admin?:boolean}) {
 const [lang,setLang]=useState<Lang>("ar"); const [dark,setDark]=useState(false);
 useEffect(()=>{try {setLang(localStorage.getItem("sprout-language")==="en"?"en":"ar");setDark(localStorage.getItem("sprout-theme")==="dark");} catch {}},[]);
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";document.documentElement.classList.toggle("dark",dark);},[lang,dark]);
 const t=(ar:string,en:string)=>lang==="ar"?ar:en;
 return <Context.Provider value={{lang,t}}><a className="skip" href="#main">{t("انتقل للمحتوى","Skip to content")}</a><header className="header"><a className="brand" href="/" aria-label="Sprout and Crumb"><Sprout size={31}/><span dir="ltr">sprout <i>&</i> crumb<small>{t("مخبز نباتي • الرياض","PLANT-BASED BAKERY • RIYADH")}</small></span></a><nav aria-label={t("التنقل الرئيسي","Main navigation")}>{admin?<a href="/">{t("المتجر","Storefront")}</a>:<><a href="#menu">{t("قائمتنا","Our menu")}</a><a href="#story">{t("حكايتنا","Our story")}</a><a href="#preorder">{t("اطلب مسبقاً","Preorder")}</a></>}</nav><div className="controls"><button className="icon-button language" onClick={()=>{const next=lang==="ar"?"en":"ar";setLang(next);try{localStorage.setItem("sprout-language",next)}catch{}}} aria-label={t("Switch to English","التبديل إلى العربية")}><Languages size={17}/>{lang==="ar"?"EN":"عربي"}</button><button className="icon-button" onClick={()=>{setDark(!dark);try{localStorage.setItem("sprout-theme",dark?"light":"dark")}catch{}}} aria-label={t(dark?"تفعيل المظهر الأبيض":"تفعيل المظهر الأسود",dark?"Use white theme":"Use black theme")}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button></div></header>{children}<footer><a className="brand" href="/" dir="ltr"><Sprout/>sprout & crumb</a><p>{t("نباتي بالكامل. مخبوز بكل عناية.","All plants. All heart. Freshly baked.")}</p><a href="/admin">{t("إدارة الطلبات","Order management")}</a><small>© {new Date().getFullYear()} Sprout & Crumb</small></footer></Context.Provider>;
}
