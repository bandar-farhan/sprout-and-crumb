import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';const errors=[];page.on('pageerror',e=>errors.push(e.message));mkdirSync('outputs',{recursive:true});
try{
 await page.goto(base);await page.getByRole('heading',{name:'خيرٌ ينبت. وطعمٌ يُحب.'}).waitFor();
 assert.equal(await page.locator('html').getAttribute('lang'),'ar');assert.equal(await page.locator('html').getAttribute('dir'),'rtl');assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),false);
 await page.screenshot({path:'outputs/desktop-ar.png',fullPage:true});
 await page.getByRole('button',{name:'Switch to English'}).click();assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
 await page.getByRole('button',{name:'Use black theme'}).click();await page.reload();await page.getByRole('button',{name:'Use white theme'}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'en');await page.screenshot({path:'outputs/desktop-en-dark.png',fullPage:true});
 await page.getByRole('button',{name:'Add Slow sourdough',exact:true}).click();await page.getByRole('button',{name:'Add Golden croissant',exact:true}).click();
 await page.locator('input[name=name]').fill('Browser Customer');await page.locator('input[name=phone]').fill('0502345678');await page.locator('input[name=date]').fill(new Date(Date.now()+4*86400000).toISOString().slice(0,10));
 await page.getByRole('combobox',{name:'Fulfilment',exact:true}).click();await page.getByRole('option',{name:'Riyadh delivery (+SAR 15)',exact:true}).click();await page.locator('textarea[name=address]').fill('Riyadh Al Malqa Street 24');
 await page.route('**/api/orders',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'unavailable'})}));
 await page.getByRole('button',{name:'Place preorder',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.locator('input[name=name]').inputValue(),'Browser Customer');assert.match(await page.locator('.grand-total').textContent(),/59/);
 await page.unroute('**/api/orders');await page.getByRole('button',{name:'Place preorder',exact:true}).click();await page.getByText('PREORDER RECEIVED',{exact:true}).waitFor();assert.match(await page.locator('.receipt').textContent(),/SC-/);
 await page.goto(base+'/admin');await page.getByLabel('Email',{exact:true}).fill('devtest@gmail.com');await page.getByLabel('Password',{exact:true}).fill('devtest');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('heading',{name:'Bakery orders'}).waitFor();await page.getByText('Browser Customer',{exact:true}).first().waitFor();await page.screenshot({path:'outputs/admin-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'outputs/admin-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'admin no mobile overflow');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByLabel('Email',{exact:true}).waitFor();
 await page.goto(base);await page.getByRole('button',{name:'التبديل إلى العربية'}).click();await page.getByRole('button',{name:'تفعيل المظهر الأبيض'}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Arabic mobile no overflow');await page.screenshot({path:'outputs/mobile-ar.png',fullPage:true});
 await page.getByRole('button',{name:'Switch to English'}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'English mobile no overflow');await page.screenshot({path:'outputs/mobile-en.png',fullPage:true});
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');console.log(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left< -1||e.right>innerWidth+1)})));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'200% text no overflow');
 assert.deepEqual(errors,[],'no browser runtime errors');console.log('PASS browser: Arabic/English, RTL/LTR, persisted light/dark, cart, delivery, failed-save recovery, receipt, admin login/list/logout, desktop/mobile, 200% text');
}finally{await browser.close()}
