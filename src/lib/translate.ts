// src/lib/translate.ts

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
  // 直接回傳原文，避免 build 錯誤
  return text;
}
