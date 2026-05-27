import { request } from 'node:https';
const base = process.env.CANARY_URL || 'https://crimson-joo.github.io/food-akinator-hermes-pilot/';
const url = `${base}${base.includes('?') ? '&' : '?'}v=${Date.now()}`;
function get(target){return new Promise((resolve,reject)=>{request(target,res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body}));}).on('error',reject).end();});}
const res = await get(url);
const checks = [res.status === 200, /아무거나 탐정단|root/.test(res.body), !/Akinator|genie|lamp|turban/i.test(res.body)];
if (checks.every(Boolean)) console.log(`CANARY PASS ${url}`); else { console.error(`CANARY FAIL ${url} status=${res.status}`); process.exit(1);}
