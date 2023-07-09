
export async function encryptPrivateKey(privateKey: string, passphrase: Buffer) {
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKey);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passphrase,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt']
    );

    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
        derivedKey,
        data
    );

    const encryptedPrivateKey = {
        encrypted: Array.from(new Uint8Array(encryptedData)),
        salt: Array.from(new Uint8Array(salt)),
    };

    return encryptedPrivateKey;
}
