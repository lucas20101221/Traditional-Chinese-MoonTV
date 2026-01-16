let converter: ((text: string) => string) | null = null;

export async function toSimplified(text: string): Promise<string> {
  if (!text) return text;

  try {
    if (!converter) {
      // 動態載入，避免 Cloudflare / Edge 在 build 時炸掉
      const mod: any = await import('opencc-js');

      const OpenCC = mod.default ?? mod;
      if (!OpenCC?.Converter) {
        console.warn('[opencc] Converter not found, return original text');
        return text;
      }

      converter = OpenCC.Converter({ from: 'tw', to: 'cn' });
    }

    return converter(text);
  } catch (err) {
    console.error('[opencc] failed, fallback original text', err);
    return text; // 失敗時安全回傳原字串
  }
}
