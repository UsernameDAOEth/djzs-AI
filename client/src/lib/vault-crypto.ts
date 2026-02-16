const SALT_KEY = "djzs-vault-salt";
const VERIFY_KEY = "djzs-vault-verify";
const LOCK_KEY = "djzs-vault-locked";

async function deriveCryptoKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encoded: string, key: CryptoKey): Promise<string> {
  const raw = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const ciphertext = raw.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

function getSalt(): Uint8Array {
  const stored = localStorage.getItem(SALT_KEY);
  if (stored) return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
  return salt;
}

export function isVaultEncryptionSetUp(): boolean {
  return !!localStorage.getItem(VERIFY_KEY);
}

export function isVaultLocked(): boolean {
  return localStorage.getItem(LOCK_KEY) === "true";
}

export function lockVault() {
  localStorage.setItem(LOCK_KEY, "true");
  _sessionKey = null;
}

let _sessionKey: CryptoKey | null = null;

export function getSessionKey(): CryptoKey | null {
  return _sessionKey;
}

export async function setupVaultPassphrase(passphrase: string): Promise<void> {
  const salt = getSalt();
  const key = await deriveCryptoKey(passphrase, salt);
  const verifyToken = await encryptData("djzs-vault-ok", key);
  localStorage.setItem(VERIFY_KEY, verifyToken);
  localStorage.removeItem(LOCK_KEY);
  _sessionKey = key;
}

export async function unlockVault(passphrase: string): Promise<boolean> {
  const salt = getSalt();
  const key = await deriveCryptoKey(passphrase, salt);
  const verifyToken = localStorage.getItem(VERIFY_KEY);
  if (!verifyToken) return false;
  try {
    const result = await decryptData(verifyToken, key);
    if (result !== "djzs-vault-ok") return false;
    localStorage.removeItem(LOCK_KEY);
    _sessionKey = key;
    return true;
  } catch {
    return false;
  }
}

export function removeVaultEncryption() {
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(VERIFY_KEY);
  localStorage.removeItem(LOCK_KEY);
  _sessionKey = null;
}
