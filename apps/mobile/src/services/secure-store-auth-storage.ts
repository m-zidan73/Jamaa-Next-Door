import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 450;
const CHUNK_COUNT_SUFFIX = ".chunk-count";

function chunkCountKey(key: string) {
  return `${key}${CHUNK_COUNT_SUFFIX}`;
}

function chunkKey(key: string, index: number) {
  return `${key}.chunk-${index}`;
}

async function getChunkCount(key: string) {
  const storedCount = await SecureStore.getItemAsync(chunkCountKey(key));
  const count = storedCount ? Number.parseInt(storedCount, 10) : 0;
  return Number.isInteger(count) && count > 0 ? count : 0;
}

export const secureStoreAuthStorage = {
  async getItem(key: string) {
    const count = await getChunkCount(key);

    if (!count) {
      return SecureStore.getItemAsync(key);
    }

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
    );

    return chunks.every((chunk): chunk is string => chunk !== null) ? chunks.join("") : null;
  },

  async setItem(key: string, value: string) {
    const previousCount = await getChunkCount(key);
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [""];

    await Promise.all(
      chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)),
    );
    await SecureStore.setItemAsync(chunkCountKey(key), String(chunks.length));
    await SecureStore.deleteItemAsync(key);

    await Promise.all(
      Array.from(
        { length: Math.max(0, previousCount - chunks.length) },
        (_, index) => SecureStore.deleteItemAsync(chunkKey(key, chunks.length + index)),
      ),
    );
  },

  async removeItem(key: string) {
    const count = await getChunkCount(key);

    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(chunkCountKey(key)),
      ...Array.from({ length: count }, (_, index) =>
        SecureStore.deleteItemAsync(chunkKey(key, index)),
      ),
    ]);
  },
};
