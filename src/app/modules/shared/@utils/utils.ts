function simpleStringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return function() {
    t |= 0;
    t = Math.imul(t + 0x6D2B79F5, 1);
    t = (t ^ (t >>> 15)) * (t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomHSLGenerator(seed?: string): [string, string, string, string] {
  const rand = seed ? mulberry32(simpleStringToHash(seed)) : Math.random;
  const hue = Math.floor(rand() * 360).toString();
  const saturation = Math.floor(40 + rand() * 30).toString();  // 40–80%
  const lightness = Math.floor(70 + rand() * 20).toString();  // 70–90%

  return [`hsl(${hue}, ${saturation}%, ${lightness}%)`, hue, saturation, lightness];
}
