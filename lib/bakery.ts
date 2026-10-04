export type Lang = "ar" | "en";
export const business = {
  deliveryFee: 1500, currency: "SAR", timeZone: "Asia/Riyadh",
  address: { ar: "حي الملقا، الرياض — يُحدد موقع الاستلام عند تأكيد الطلب", en: "Al Malqa, Riyadh — pickup location shared on confirmation" },
  hours: { ar: "يومياً، ٩ صباحاً – ٩ مساءً", en: "Daily, 9 am – 9 pm" },
  story: { ar: "بدأت سبراوت آند كرمب بفكرة بسيطة: المخبوزات الرائعة تبدأ بمكونات نباتية، ووقت كافٍ، والكثير من العناية. من خبز العجين المخمر إلى لفائف القرفة، نخبز بكميات صغيرة حسب الطلب، لتصل كل لقمة طازجة ومليئة بالنكهة.", en: "Sprout & Crumb began with a simple idea: wonderful baking starts with plants, a little patience, and plenty of care. From slow-fermented sourdough to cinnamon rolls, we bake small batches to order, so every bite arrives fresh and full of flavour." },
};
export const menu = [
  { id: "sourdough", price: 2800, ar: "خبز العجين المخمر", en: "Slow sourdough", descAr: "قشرة ذهبية، قلب طري، وتخمير بطيء. رغيف كامل.", descEn: "A golden crust, an airy centre, and a slow rise. One whole loaf.", allergensAr: "قمح (جلوتين)", allergensEn: "Wheat (gluten)", number: "01" },
  { id: "croissant", price: 1600, ar: "كرواسون نباتي", en: "Golden croissant", descAr: "طبقات هشة وزبدة نباتية. حبة واحدة.", descEn: "Delicate layers, plant-based butter, beautifully flaky. One piece.", allergensAr: "قمح، صويا", allergensEn: "Wheat, soy", number: "02" },
  { id: "cinnamon", price: 1800, ar: "لفافة القرفة", en: "Cinnamon swirl", descAr: "عجينة طرية بالقرفة وطبقة فانيلا خفيفة. حبة واحدة.", descEn: "A soft cinnamon spiral with a light vanilla glaze. One piece.", allergensAr: "قمح، صويا", allergensEn: "Wheat, soy", number: "03" },
  { id: "cookie", price: 1200, ar: "كوكيز الشوكولاتة", en: "Chocolate chunk cookie", descAr: "حواف مقرمشة، قلب طري، وقطع شوكولاتة داكنة.", descEn: "Crisp edges, a soft centre, and generous dark chocolate chunks.", allergensAr: "قمح، صويا", allergensEn: "Wheat, soy", number: "04" },
  { id: "banana", price: 1500, ar: "كيكة الموز والجوز", en: "Banana & walnut slice", descAr: "شريحة بالموز الناضج والجوز المحمص.", descEn: "A generous slice with ripe bananas and toasted walnuts.", allergensAr: "قمح، جوز", allergensEn: "Wheat, walnuts", number: "05" },
  { id: "box", price: 6500, ar: "صندوق المشاركة", en: "The sharing box", descAr: "٢ كرواسون، ٢ لفافة قرفة، و٢ كوكيز. للحظات الأجمل معاً.", descEn: "2 croissants, 2 cinnamon swirls, and 2 cookies. Better together.", allergensAr: "قمح، صويا", allergensEn: "Wheat, soy", number: "06" },
] as const;
export const slots = ["09:00", "12:00", "15:00", "18:00"] as const;
export const statuses = ["new", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"] as const;
export type Status = typeof statuses[number];
export const statusLabels: Record<Status, { ar: string; en: string }> = {
 new:{ar:"جديد",en:"New"}, confirmed:{ar:"مؤكد",en:"Confirmed"}, preparing:{ar:"قيد التحضير",en:"Preparing"}, ready:{ar:"جاهز للاستلام",en:"Ready for pickup"}, out_for_delivery:{ar:"في الطريق",en:"Out for delivery"}, completed:{ar:"مكتمل",en:"Completed"}, cancelled:{ar:"ملغي",en:"Cancelled"},
};
export const nextStatuses = (status: Status, fulfilment: string): Status[] => ({new:["confirmed","cancelled"],confirmed:["preparing","cancelled"],preparing:[fulfilment === "delivery" ? "out_for_delivery" : "ready","cancelled"],ready:["completed","cancelled"],out_for_delivery:["completed","cancelled"],completed:[],cancelled:[]} as Record<Status,Status[]>)[status];
export const money = (value: number, lang: Lang) => new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-SA", {style:"currency",currency:"SAR",maximumFractionDigits:2}).format(value / 100);
export const slotLabel = (slot: string, lang: Lang) => { const hour=Number(slot.slice(0,2)); return lang === "ar" ? `${hour}–${hour+3} (بتوقيت الرياض)` : `${hour}:00–${hour+3}:00 (Riyadh)`; };
export const errors: Record<string, {ar:string;en:string}> = {
 invalid:{ar:"يرجى مراجعة بيانات الطلب والحقول المطلوبة.",en:"Please review the required order details."}, cart:{ar:"اختر منتجاً واحداً على الأقل (حتى ٢٠ حبة من كل منتج).",en:"Choose at least one item (up to 20 of each product)."}, phone:{ar:"أدخل رقم جوال سعودي صحيحاً يبدأ بـ 05 أو +9665.",en:"Enter a valid Saudi mobile number starting with 05 or +9665."}, date:{ar:"اختر موعداً صالحاً يبدأ بعد ٢٤ ساعة على الأقل وخلال ٣٠ يوماً.",en:"Choose a valid slot at least 24 hours ahead and within 30 days."}, address:{ar:"أدخل عنوان التوصيل في الرياض (١٠ أحرف على الأقل).",en:"Enter your Riyadh delivery address (at least 10 characters)."}, unavailable:{ar:"تعذر حفظ الطلب الآن. احتفظنا باختياراتك؛ حاول مجدداً.",en:"We could not save your order. Your selections are safe; please try again."}, duplicate:{ar:"تم استخدام مرجع الإرسال لطلب مختلف. حدّث الصفحة للمحاولة مجدداً.",en:"This submission reference belongs to a different order. Refresh before trying again."}, forbidden:{ar:"ليس لديك صلاحية الوصول.",en:"You do not have access."}, transition:{ar:"تغيّرت حالة الطلب. حدّث القائمة وحاول مجدداً.",en:"The order status changed. Refresh and try again."}, rate:{ar:"طلبات كثيرة خلال وقت قصير. حاول بعد دقائق.",en:"Too many requests. Please try again in a few minutes."}
};
