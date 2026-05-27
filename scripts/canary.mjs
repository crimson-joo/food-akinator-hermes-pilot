import { request } from 'node:https';
const base = process.env.CANARY_URL || 'https://crimson-joo.github.io/food-akinator-hermes-pilot/';
const url = `${base}${base.includes('?') ? '&' : '?'}v=${Date.now()}`;
function get(target){return new Promise((resolve,reject)=>{request(target,res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body}));}).on('error',reject).end();});}
const res = await get(url);
const assetPath = res.body.match(/src="([^"]*assets\/index-[^"]+\.js)"/)?.[1];
const assetUrl = assetPath ? new URL(assetPath, base).toString() : null;
const js = assetUrl ? await get(assetUrl) : { status: 0, body: '' };
const checks = [
  res.status === 200,
  /<div id="root"><\/div>/.test(res.body),
  js.status === 200,
  /아무거나 탐정단/.test(js.body),
  /마음속으로 음식 하나를 정해/.test(js.body),
  !/\b(genie|lamp|turban|blue skin)\b/i.test(js.body)
];
if (checks.every(Boolean)) console.log(`CANARY PASS ${url} asset=${assetUrl}`); else { console.error(`CANARY FAIL ${url} status=${res.status} asset=${assetUrl} assetStatus=${js.status} checks=${checks.join(',')}`); process.exit(1);}
