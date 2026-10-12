import { hindi } from './hi';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
const lookup = new Map(Object.entries(hindi).map(([source, translated]) => [normalize(source), translated]));
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const templates = Object.entries(hindi)
  .filter(([source]) => /\{\d+\}/.test(source) && /[A-Za-z]/.test(source.replace(/\{\d+\}/g, '')))
  .map(([source, translated]) => {
    const parameters: string[] = [];
    const chunks = source.split(/(\{\d+\})/);
    const expression = chunks.map(chunk => {
      if (/^\{\d+\}$/.test(chunk)) { parameters.push(chunk); return '(.*?)'; }
      return escapeRegex(chunk).replace(/\s+/g, '\\s+');
    }).join('');
    return { source, translated, parameters, pattern: new RegExp(`^${expression}$`, 'i') };
  })
  // Match specific sentences before short patterns such as “{0} days”.
  .sort((a, b) => b.source.replace(/\{\d+\}/g, '').length - a.source.replace(/\{\d+\}/g, '').length);

export function translateCopy(value: string, language: string): string {
  if (language !== 'Hindi' || !value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const content = value.trim();
  const exact = lookup.get(normalize(content));
  if (exact) return leading + exact + trailing;
  for (const { translated, parameters, pattern } of templates) {
    const match = pattern.exec(content);
    if (!match) continue;
    const values = new Map(parameters.map((parameter, index) => [parameter, match[index + 1]]));
    return leading + translated.replace(/\{\d+\}/g, parameter => values.get(parameter) ?? parameter) + trailing;
  }
  // Routes, names, booking references, and provider copy are never guessed.
  return value;
}
