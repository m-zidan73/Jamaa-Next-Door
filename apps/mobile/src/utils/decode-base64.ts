export function decodeBase64(base64: string): ArrayBuffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const normalized = base64.replace(/\s/g, "").replace(/=+$/, "");
  const output = new Uint8Array(Math.floor((normalized.length * 6) / 8));
  let accumulator = 0;
  let bits = 0;
  let offset = 0;

  for (const character of normalized) {
    const value = alphabet.indexOf(character);
    if (value < 0) {
      throw new Error("The selected image contains invalid data.");
    }
    accumulator = (accumulator << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[offset++] = (accumulator >> bits) & 0xff;
    }
  }

  return output.buffer.slice(0, offset);
}
