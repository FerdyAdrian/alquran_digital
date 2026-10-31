import * as SecureStore from 'expo-secure-store';

// Keychain values are kept small; a session can exceed the per-item limit on iOS.
const chunkSize = 450;
let revision = 0;
type Manifest = { revision: string; count: number };
const readManifest = async (key: string): Promise<Manifest | null> => {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  let parsed: Manifest;
  try { parsed = JSON.parse(raw) as Manifest; } catch { return null; }
  return parsed && typeof parsed.revision === 'string' && Number.isInteger(parsed.count) && parsed.count > 0 && parsed.count < 1000 ? parsed : null;
};
const removeChunks = async (key: string, manifest: Manifest | null) => {
  if (manifest) await Promise.all(Array.from({ length: manifest.count }, (_, i) => SecureStore.deleteItemAsync(`${key}.${manifest.revision}.${i}`)));
};
export default {
  async getItem(key: string) {
    const manifest = await readManifest(key);
    if (!manifest) return null;
    const chunks = await Promise.all(Array.from({ length: manifest.count }, (_, i) => SecureStore.getItemAsync(`${key}.${manifest.revision}.${i}`)));
    return chunks.some(value => value === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string) {
    const previous = await readManifest(key);
    const characters = Array.from(value);
    const current = { revision: `${Date.now()}-${revision++}`, count: Math.max(1, Math.ceil(characters.length / chunkSize)) };
    if (current.count >= 1000) throw new Error('Session storage limit exceeded');
    try {
      for (let i = 0; i < current.count; i++) await SecureStore.setItemAsync(`${key}.${current.revision}.${i}`, characters.slice(i * chunkSize, (i + 1) * chunkSize).join(''));
      await SecureStore.setItemAsync(key, JSON.stringify(current));
    } catch (error) { await removeChunks(key, current); throw error; }
    await removeChunks(key, previous);
  },
  async removeItem(key: string) {
    const previous = await readManifest(key);
    await SecureStore.deleteItemAsync(key);
    await removeChunks(key, previous);
  },
};
