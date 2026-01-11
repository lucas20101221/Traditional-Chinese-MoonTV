import OpenCC from 'opencc-js';

const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

export function toSimplified(text: string): string {
  return converter(text);
}
