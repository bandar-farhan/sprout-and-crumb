import {env} from "cloudflare:workers";
export {adminAccess} from "./auth";
export function database(){if(!env.DB)throw new Error("D1 unavailable");return env.DB}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
export function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin}
export async function readBody(request:Request){if(!request.headers.get("content-type")?.includes("application/json"))throw Error("invalid");const reader=request.body?.getReader();if(!reader)throw Error("invalid");let raw="";let length=0;const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>12000){await reader.cancel();throw Error("invalid")}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode();return JSON.parse(raw)}
