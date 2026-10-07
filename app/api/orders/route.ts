import {json,readBody,sameOrigin} from "@/lib/server";
import {execute,one,transaction} from "@/lib/database";
import {InputError,validateOrder} from "@/lib/validation";
export const dynamic="force-dynamic";
type OrderRow={reference:string;payload_hash:string;requested_date:string;slot:string;fulfilment:string;total:number;status:string};
const receipt=(row:any)=>({reference:row.reference,date:row.date||row.requested_date,slot:row.slot,fulfilment:row.fulfilment,total:Number(row.total),status:row.status});
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:"forbidden"},403);
 const key=request.headers.get("Idempotency-Key")||"";if(!/^[a-f0-9-]{36}$/i.test(key))return json({error:"invalid"},400);
 let body;try{body=await readBody(request)}catch{return json({error:"invalid"},400)}
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(body))))).map(v=>v.toString(16).padStart(2,"0")).join("");
 try{
  const existing=await one<OrderRow>("SELECT * FROM orders WHERE idempotency_key = ?",[key]);if(existing)return existing.payload_hash===hash?json(receipt(existing)):json({error:"duplicate"},409);
  const order=validateOrder(body);const now=new Date().toISOString().slice(0,19).replace("T"," ");
  const recent=await one<{count:number}>("SELECT COUNT(*) AS count FROM orders WHERE phone = ? AND created_at > ?",[order.phone,new Date(Date.now()-600000).toISOString().slice(0,19).replace("T"," ")]);if(Number(recent?.count||0)>=5)return json({error:"rate"},429);
  const id=crypto.randomUUID();const reference="SC-"+id.replaceAll("-","").slice(0,12).toUpperCase();
  try{await transaction(async()=>{await execute("INSERT INTO orders (id,reference,idempotency_key,payload_hash,name,phone,requested_date,slot,fulfilment,address,notes,subtotal,delivery_fee,total,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,reference,key,hash,order.name,order.phone,order.date,order.slot,order.fulfilment,order.address,order.notes,order.subtotal,order.deliveryFee,order.total,"new",now,now]);for(const item of order.items)await execute("INSERT INTO order_items (id,order_id,product_id,name_ar,name_en,unit_price,quantity) VALUES (?,?,?,?,?,?,?)",[crypto.randomUUID(),id,item.id,item.ar,item.en,item.price,item.quantity])})}catch(error){const raced=await one<OrderRow>("SELECT * FROM orders WHERE idempotency_key = ?",[key]);if(raced)return raced.payload_hash===hash?json(receipt(raced)):json({error:"duplicate"},409);throw error}
  return json(receipt({...order,reference,status:"new"}),201);
 }catch(error){if(error instanceof InputError)return json({error:error.code},400);console.error("Order persistence unavailable",error instanceof Error?error.message:"unknown");return json({error:"unavailable"},503)}
}
