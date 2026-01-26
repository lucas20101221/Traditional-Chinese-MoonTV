// src/lib/translate.ts
// 簡繁轉換對應表（簡體 → 繁體）
const cnToTwMap: Record<string, string> = {
  汉: '漢',
  马: '馬',
  门: '門',
  国: '國',
  车: '車',
  云: '雲',
  龙: '龍',
  后: '後',
  发: '發',
  台: '臺',
  面: '麵',
};

// 繁體 → 簡體對應表
const twToCnMap: Record<string, string> = {
  漢: '汉',
  馬: '马',
  門: '门',
  國: '国',
  車: '车',
  雲: '云',
  龍: '龙',
  後: '后',
  發: '发',
  臺: '台',
  麵: '面',
};

// 將文字轉為繁體
export function toTW(text: string): string {
  let result = '';
  for (const ch of text) {
    result += cnToTwMap[ch] || ch;
  }
  return result;
}

// 將文字轉為簡體
export function toSimplified(text: string): string {
  let result = '';
  for (const ch of text) {
    result += twToCnMap[ch] || ch;
  }
  return result;
}
