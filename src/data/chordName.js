export function parseChordName(name) {
  const match = name.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return null;
  const [, letter, accidental, rest] = match;
  return { root: letter + (accidental || ""), rest };
}
