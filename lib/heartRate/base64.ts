const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BUFFER_MASK = 0xffffff;
const BYTE_BITS = 8;
const SEXTET_BITS = 6;
const BYTE_MASK = 0xff;

export function base64ToBytes(input: string): Uint8Array | null {
  const clean = input.replace(/\s/g, '').replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let index = 0;
  for (const char of clean) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value < 0) return null;
    buffer = ((buffer << SEXTET_BITS) | value) & BUFFER_MASK;
    bits += SEXTET_BITS;
    if (bits >= BYTE_BITS) {
      bits -= BYTE_BITS;
      out[index] = (buffer >> bits) & BYTE_MASK;
      index += 1;
    }
  }
  return out.subarray(0, index);
}
