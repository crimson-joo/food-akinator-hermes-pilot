export type TraitKey = 'spicy' | 'soupy' | 'rice' | 'noodle' | 'meat' | 'seafood' | 'vegetable' | 'fried' | 'grilled' | 'street' | 'share' | 'solo' | 'hot' | 'cold' | 'saucy' | 'cheesy' | 'sweet' | 'light' | 'heavy' | 'lateNight' | 'hangover' | 'premium' | 'comfort' | 'crunchy' | 'fermented' | 'broth' | 'riceCake' | 'stew' | 'delivery' | 'quick';
export type Food = { id: string; name: string; traits: Record<TraitKey, number>; reason: string; tags: string[] };
export const TRAITS = ['spicy', 'soupy', 'rice', 'noodle', 'meat', 'seafood', 'vegetable', 'fried', 'grilled', 'street', 'share', 'solo', 'hot', 'cold', 'saucy', 'cheesy', 'sweet', 'light', 'heavy', 'lateNight', 'hangover', 'premium', 'comfort', 'crunchy', 'fermented', 'broth', 'riceCake', 'stew', 'delivery', 'quick'] as const;

const baseTraits = Object.fromEntries(TRAITS.map((trait) => [trait, 0.1])) as Record<TraitKey, number>;
function food(id: string, name: string, highs: TraitKey[], reason: string, tags: string[] = []): Food {
  const traits = { ...baseTraits };
  for (const trait of highs) traits[trait] = 0.9;
  return { id, name, traits, reason, tags };
}

export const FOODS: Food[] = [
  food('tteokbokki', '떡볶이', ['spicy', 'street', 'share', 'hot', 'saucy', 'comfort', 'riceCake', 'delivery', 'quick'], '매콤달콤한 소스와 쫄깃한 떡, 분식 본능이 강하게 잡혔어요.', ['분식', '배달']),
  food('seolleongtang', '설렁탕', ['soupy', 'meat', 'solo', 'hot', 'light', 'hangover', 'comfort', 'broth'], '맑고 깊은 국물, 속을 달래는 한 그릇 쪽으로 기울었어요.', ['국밥', '해장']),
  food('kimchi-jjigae', '김치찌개', ['spicy', 'soupy', 'rice', 'share', 'hot', 'comfort', 'fermented', 'stew'], '칼칼한 김치 국물과 밥 생각이 같이 올라왔네요.', ['한식', '찌개']),
  food('samgyeopsal', '삼겹살', ['meat', 'grilled', 'share', 'hot', 'heavy', 'premium'], '고기 굽는 냄새와 함께 먹는 분위기가 강해요.', ['외식', '고기']),
  food('jajangmyeon', '짜장면', ['noodle', 'solo', 'saucy', 'comfort', 'delivery', 'quick'], '윤기 있는 검은 소스와 빠른 배달 감성이 보여요.', ['중식', '배달']),
  food('jjamppong', '짬뽕', ['spicy', 'soupy', 'noodle', 'seafood', 'hot', 'hangover', 'delivery'], '얼큰한 해물 국물과 면의 조합이 선명해요.', ['중식', '해장']),
  food('fried-chicken', '치킨', ['meat', 'fried', 'share', 'heavy', 'lateNight', 'crunchy', 'delivery'], '바삭함, 야식, 같이 집어 먹는 분위기가 강합니다.', ['야식', '배달']),
  food('bibimbap', '비빔밥', ['rice', 'vegetable', 'solo', 'hot', 'saucy', 'light', 'comfort'], '밥과 여러 재료를 한 번에 섞는 균형감이 보여요.', ['한식', '혼밥']),
  food('naengmyeon', '냉면', ['noodle', 'solo', 'cold', 'light', 'broth', 'quick'], '차갑고 산뜻한 면, 입맛을 리셋하는 쪽이에요.', ['면', '시원함']),
  food('sushi', '초밥', ['rice', 'seafood', 'solo', 'cold', 'light', 'premium'], '깔끔하고 한 점씩 먹는 프리미엄 감각이 있어요.', ['일식', '프리미엄']),
  food('pork-cutlet', '돈까스', ['meat', 'fried', 'solo', 'saucy', 'comfort', 'crunchy'], '바삭한 튀김옷과 소스, 혼밥 만족감이 큽니다.', ['일식', '혼밥']),
  food('gimbap', '김밥', ['rice', 'vegetable', 'street', 'solo', 'light', 'quick'], '가볍고 빠르게 집어 먹는 김밥 라인이 보여요.', ['분식', '간편']),
  food('ramyeon', '라면', ['spicy', 'soupy', 'noodle', 'hot', 'lateNight', 'comfort', 'quick'], '늦은 시간 뜨거운 면 국물이 당기는 신호예요.', ['야식', '면']),
  food('pizza', '피자', ['share', 'cheesy', 'heavy', 'lateNight', 'delivery'], '치즈와 배달, 여러 조각을 나누는 그림이 보여요.', ['배달', '파티']),
  food('burger', '버거', ['meat', 'solo', 'heavy', 'delivery', 'quick'], '빠르고 든든한 패스트푸드 쪽으로 좁혀졌어요.', ['패스트푸드', '간편']),
  food('bossam', '보쌈', ['meat', 'share', 'premium', 'comfort', 'fermented'], '부드러운 고기와 김치/쌈 조합이 강합니다.', ['한식', '모임']),
  food('dakgalbi', '닭갈비', ['spicy', 'meat', 'grilled', 'share', 'hot', 'saucy'], '철판 위 매콤한 닭고기와 볶음 분위기예요.', ['외식', '고기']),
  food('haemul-pajeon', '해물파전', ['seafood', 'fried', 'share', 'comfort', 'crunchy'], '바삭한 전과 같이 나눠 먹는 장면이 떠올라요.', ['전', '비오는날']),
  food('poke', '포케', ['rice', 'seafood', 'vegetable', 'solo', 'cold', 'light'], '신선하고 가벼운 한 그릇, 부담 없는 선택이에요.', ['건강식', '혼밥']),
  food('mara-tang', '마라탕', ['spicy', 'soupy', 'meat', 'vegetable', 'share', 'hot', 'delivery'], '얼얼하고 직접 고른 재료의 국물감이 보여요.', ['중식', '매운맛']),
  food('galbi-tang', '갈비탕', ['soupy', 'meat', 'hot', 'premium', 'comfort', 'broth'], '맑은 고기 국물과 든든함이 중심입니다.', ['한식', '국물']),
  food('budae-jjigae', '부대찌개', ['spicy', 'soupy', 'meat', 'share', 'hot', 'stew', 'delivery'], '햄, 라면, 칼칼한 찌개가 같이 떠오르네요.', ['찌개', '배달']),
  food('kalguksu', '칼국수', ['soupy', 'noodle', 'hot', 'light', 'comfort', 'broth'], '두툼한 면과 따뜻한 국물이 차분하게 잡혀요.', ['면', '국물']),
  food('salad', '샐러드', ['vegetable', 'solo', 'cold', 'light', 'quick'], '가볍고 산뜻한 선택, 몸이 편한 메뉴 쪽입니다.', ['가벼움', '건강식']),
  food('hotteok', '호떡', ['street', 'hot', 'sweet', 'comfort', 'quick'], '달콤하고 따뜻한 길거리 간식 신호가 있어요.', ['간식', '달콤']),
  food('jjimdak', '찜닭', ['meat', 'share', 'hot', 'saucy', 'heavy', 'delivery'], '간장 소스와 닭고기, 당면의 묵직함이 보여요.', ['배달', '찜']),
  food('sundae-guk', '순대국', ['soupy', 'meat', 'solo', 'hot', 'hangover', 'comfort', 'broth'], '뜨거운 국밥과 든든한 순대 향이 잡힙니다.', ['국밥', '해장']),
  food('gamjatang', '감자탕', ['spicy', 'soupy', 'meat', 'share', 'hot', 'heavy', 'stew'], '뼈해장국처럼 진한 국물과 푸짐함이 보여요.', ['국물', '모임']),
  food('jokbal', '족발', ['meat', 'share', 'lateNight', 'premium', 'delivery'], '야식 테이블에 올릴 쫀득한 고기 메뉴입니다.', ['야식', '배달']),
  food('korean-bbq-beef', '소갈비살', ['meat', 'grilled', 'share', 'hot', 'premium', 'heavy'], '오늘은 조금 좋은 고기를 굽고 싶은 쪽이에요.', ['외식', '프리미엄']),
  food('makguksu', '막국수', ['noodle', 'cold', 'light', 'saucy', 'quick'], '시원하고 고소한 면 한 그릇으로 좁혀집니다.', ['면', '시원함']),
  food('udon', '우동', ['soupy', 'noodle', 'solo', 'hot', 'light', 'broth', 'quick'], '뜨끈한 국물과 탱글한 면이 편안하게 보여요.', ['일식', '면']),
  food('omelet-rice', '오므라이스', ['rice', 'solo', 'hot', 'saucy', 'comfort', 'quick'], '부드러운 계란과 소스 얹은 밥의 안정감입니다.', ['양식', '혼밥']),
  food('risotto', '리조또', ['rice', 'solo', 'hot', 'cheesy', 'premium', 'comfort'], '크리미하고 천천히 먹는 한 접시 쪽입니다.', ['양식', '프리미엄']),
  food('pasta', '파스타', ['noodle', 'solo', 'saucy', 'cheesy', 'premium'], '소스가 감긴 면과 분위기 있는 한 접시예요.', ['양식', '데이트']),
  food('pho', '쌀국수', ['soupy', 'noodle', 'meat', 'solo', 'hot', 'light', 'broth'], '맑은 향신 국물과 가벼운 면이 떠오릅니다.', ['면', '국물']),
  food('banh-mi', '반미', ['meat', 'vegetable', 'solo', 'crunchy', 'quick'], '바삭한 빵과 신선한 속재료의 빠른 한 끼예요.', ['간편', '샌드위치']),
  food('curry-rice', '카레라이스', ['rice', 'solo', 'hot', 'saucy', 'comfort', 'delivery'], '진한 카레와 밥 한 접시의 익숙함입니다.', ['일식', '밥']),
  food('kimchi-fried-rice', '김치볶음밥', ['spicy', 'rice', 'solo', 'hot', 'saucy', 'comfort', 'fermented', 'quick'], '매콤한 김치와 볶음밥의 빠른 만족감이에요.', ['한식', '혼밥']),
  food('fried-rice', '볶음밥', ['rice', 'solo', 'hot', 'quick', 'comfort'], '밥을 고슬하게 볶아 한 번에 해결하는 쪽입니다.', ['중식', '간편']),
  food('mandu', '만두', ['meat', 'street', 'share', 'hot', 'quick'], '한 입씩 집어 먹는 만두의 간편함이 보여요.', ['분식', '간식']),
  food('shabu-shabu', '샤브샤브', ['soupy', 'meat', 'vegetable', 'share', 'hot', 'light', 'premium', 'broth'], '맑은 육수에 재료를 담가 먹는 느긋한 식사입니다.', ['외식', '건강식']),
  food('gopchang', '곱창', ['meat', 'grilled', 'share', 'hot', 'heavy', 'lateNight', 'premium'], '고소한 구이와 밤 모임의 에너지가 강해요.', ['야식', '고기']),
  food('bingsu', '빙수', ['share', 'cold', 'sweet', 'light', 'premium'], '차갑고 달콤하게 나눠 먹는 디저트 신호입니다.', ['디저트', '시원함']),
  food('waffle', '와플', ['street', 'solo', 'sweet', 'crunchy', 'quick'], '바삭한 디저트와 달콤한 토핑이 떠오릅니다.', ['디저트', '간식']),
  food('coffee-dessert', '커피와 케이크', ['solo', 'cold', 'sweet', 'light', 'premium', 'quick'], '밥보다 카페 디저트로 기분 전환하고 싶은 쪽입니다.', ['카페', '디저트'])
];
