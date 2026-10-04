import {database,json,readBody,sameOrigin} from "@/lib/server";
import {InputError,validateOrder} from "@/lib/validation";
export const dynamic="force-dynamic";
const receipt=(row:any)=>({reference:row.reference,date:row.date,slot:row.slot,fulfilment:row.fulfilment,total:row.total,status:row.status});
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:"forbidden"},403);
 const key=request.headers.get("Idempotency-Key")||"";if(!/^[a-f0-9-]{36}$/i.test(key))return json({error:"invalid"},400);
 let body;try{body=await readBody(request)}catch{return json({error:"invalid"},400)}
 // Hash the submitted payload so a retry remains safe even after its date crosses the lead-time boundary.
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(body))))).map(v=>v.toString(16).padStart(2,"0")).join("");
 try{const db=database();const existing=await db.prepare("SELECT * FROM orders WHERE idempotency_key = ?").bind(key).first<any>();if(existing)return existing.payload_hash===hash?json(receipt(existing)):json({error:"duplicate"},409);
 const order=validateOrder(body);const now=new Date().toISOString();const recent=await db.prepare("SELECT COUNT(*) AS count FROM orders WHERE phone = ? AND created_at > ?").bind(order.phone,new Date(Date.now()-600000).toISOString()).first<{count:number}>();if((recent?.count||0)>=5)return json({error:"rate"},429);
 const id=crypto.randomUUID();const reference="SC-"+id.replaceAll("-","").slice(0,12).toUpperCase();
 const statements=[db.prepare("INSERT INTO orders (id,reference,idempotency_key,payload_hash,name,phone,date,slot,fulfilment,address,notes,subtotal,delivery_fee,total,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,reference,key,hash,order.name,order.phone,order.date,order.slot,order.fulfilment,order.address,order.notes,order.subtotal,order.deliveryFee,order.total,"new",now,now),...order.items.map((item:any)=>db.prepare("INSERT INTO order_items (id,order_id,product_id,name_ar,name_en,unit_price,quantity) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,item.id,item.ar,item.en,item.price,item.quantity))];
 try{await db.batch(statements)}catch(error){const raced=await db.prepare("SELECT * FROM orders WHERE idempotency_key = ?").bind(key).first<any>();if(raced)return raced.payload_hash===hash?json(receipt(raced)):json({error:"duplicate"},409);throw error}
 return json(receipt({...order,reference,status:"new"}),201);
 }catch(error){if(error instanceof InputError)return json({error:error.code},400);console.error("Order persistence unavailable",error instanceof Error?error.message:"unknown");return json({error:"unavailable"},503)}
}
