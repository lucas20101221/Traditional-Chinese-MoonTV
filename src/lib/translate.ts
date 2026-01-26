// src/lib/translate.ts
// 簡單中→繁轉換

const map: Record<string, string> = {
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

export function toTW(text: string): string {
  let result = '';
  for (const ch of text) {
    result += map[ch] || ch;
  }
  return result;
}

export async function toSimplified(text: string): Promise<string> {
  // 這裡直接回傳原文，或你可以自己加簡化 Map
  return text;
}
