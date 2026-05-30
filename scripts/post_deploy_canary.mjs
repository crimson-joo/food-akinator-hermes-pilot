#!/usr/bin/env node

const canonical = process.env.CANARY_URL || 'https://crimson-joo.github.io/food-akinator-hermes-pilot/';
const expectedSha = process.env.CANARY_SHA || '';
const url = new URL(canonical.endsWith('/') ? canonical : `${canonical}/`);
url.searchParams.set('v', `${Date.now()}`);

const requiredHtmlPatterns = [/type="module"/, /assets\/index-[^"']+\.js/];
const requiredJsPatterns = [
  /오늘 뭐 먹을지 제가 맞혀볼게요/,
  /data-ui-state/,
  /data-character-cue/,
  /data-answer-key/,
  /김치찌개|된장찌개|치킨/,
  /단서가 잠깐 엉켰어요/,
];
const forbiddenJsPatterns = [/clue:\s*yes/i, /TOP3 후보판/i, /추천 리스트만/i];

async function fetchText(target) {
  const response = await fetch(target, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${target}`);
  }
  return { text: await response.text(), response };
}

function assertPatterns(label, text, patterns) {
  for (const pattern of patterns) {
    if (!pattern.test(text)) {
      throw new Error(`${label} missing required pattern: ${pattern}`);
    }
  }
}

function assertForbidden(label, text, patterns) {
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      throw new Error(`${label} contains forbidden old/internal marker: ${pattern}`);
    }
  }
}

const { text: html } = await fetchText(url.toString());
assertPatterns('HTML', html, requiredHtmlPatterns);

const assetMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/);
if (!assetMatch) throw new Error('HTML does not expose a module script asset');
const assetUrl = new URL(assetMatch[1], url).toString();
const { text: js } = await fetchText(`${assetUrl}?v=${Date.now()}`);
assertPatterns('Built JS', js, requiredJsPatterns);
assertForbidden('Built JS', js, forbiddenJsPatterns);

console.log('CANARY PASS');
console.log(`canonical_url=${canonical}`);
console.log(`cache_busted_url=${url.toString()}`);
console.log(`asset_url=${assetUrl}`);
if (expectedSha) console.log(`expected_sha=${expectedSha}`);
console.log('checks=html-200,module-asset-reachable,required-markers,old-marker-absence');
