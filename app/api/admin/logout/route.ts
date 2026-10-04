import {json,sameOrigin} from "@/lib/server";
export async function POST(request:Request){if(!sameOrigin(request))return json({error:"forbidden"},403);return Response.json({ok:true},{headers:{"Cache-Control":"no-store","Set-Cookie":`sprout-admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${new URL(request.url).protocol==='https:'?'; Secure':''}`}})}
