import {business,menu,slots} from "./bakery";
export class InputError extends Error {constructor(public code:string){super(code)}}
function text(value:unknown,min:number,max:number,code="invalid"){if(typeof value!=="string"||value.trim().length<min||value.trim().length>max)throw new InputError(code);return value.trim()}
export function validateOrder(body:any,now=Date.now()){
 if(!body||typeof body!=="object"||Array.isArray(body))throw new InputError("invalid");
 if(body.website)throw new InputError("invalid");
 const name=text(body.name,2,80);let phone=text(body.phone,9,20,"phone").replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[\s()-]/g,"");
 if(/^05\d{8}$/.test(phone))phone="+966"+phone.slice(1);else if(/^9665\d{8}$/.test(phone))phone="+"+phone;
 if(!/^\+9665\d{8}$/.test(phone))throw new InputError("phone");
 if(body.fulfilment!=="pickup"&&body.fulfilment!=="delivery")throw new InputError("invalid");
 const fulfilment=body.fulfilment as "pickup"|"delivery";const address=fulfilment==="delivery"?text(body.address,10,300,"address"):"";const notes=text(body.notes??"",0,500);
 const date=text(body.date,10,10,"date");const slot=text(body.slot,5,5,"date");if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!slots.includes(slot as any))throw new InputError("date");
 const timestamp=Date.parse(`${date}T${slot}:00+03:00`);if(!Number.isFinite(timestamp)||new Date(timestamp+10800000).toISOString().slice(0,10)!==date||timestamp<now+86400000||timestamp>now+30*86400000)throw new InputError("date");
 if(!Array.isArray(body.items)||body.items.length<1||body.items.length>menu.length)throw new InputError("cart");
 const seen=new Set<string>();const items=body.items.map((item:any)=>{const product=menu.find(p=>p.id===item?.id);if(!product||seen.has(product.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20)throw new InputError("cart");seen.add(product.id);return {id:product.id,ar:product.ar,en:product.en,price:product.price,quantity:item.quantity as number}}).sort((a:any,b:any)=>a.id.localeCompare(b.id));
 const subtotal=items.reduce((sum:number,item:any)=>sum+item.price*item.quantity,0);const deliveryFee=fulfilment==="delivery"?business.deliveryFee:0;
 return {name,phone,date,slot,fulfilment,address,notes,items,subtotal,deliveryFee,total:subtotal+deliveryFee};
}
