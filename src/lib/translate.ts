/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

let converter: any;

function getConverter() {
  if (!converter) {
    // 使用 require 避免 SSR build 錯
    const OpenCC = require('opencc-js');
    const lib = OpenCC.default ?? OpenCC;
    converter = lib.Converter({ from: 'tw', to: 'cn' });
  }
  return converter;
}

export function toSimplified(text: string): string {
  try {
    const c = getConverter();
    return c(text);
  } catch {
    // Edge 或 build 時失敗 → 直接回傳原字串
    return text;
  }
}
