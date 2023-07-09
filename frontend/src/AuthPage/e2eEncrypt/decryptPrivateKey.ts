import { deriveEncryptionKey } from "./deriveEncryptionKey";

interface EncryptedUserData {
    username: string;
    password: string;
    publicKey: string;
    privateKey: {
        data: {
            encrypted: Buffer;
            salt: Buffer;
        };
        key_salt: Buffer;
    };
}

export const decryptPrivateKey = async (data: EncryptedUserData): Promise<string> => {
    try {
        const derivedKey = await deriveEncryptionKey(data.username, data.password, data.privateKey.key_salt);
        const decryptedPrivateKey = await decryptData(
            data.privateKey.data.encrypted,
            derivedKey.key,
            data.privateKey.data.salt
        );

        return decryptedPrivateKey;
    } catch (error) {
        console.error('Error decrypting private key:', error);
        throw error;
    }
};

async function decryptData(encryptedData: any, passphrase: Buffer, salt: Uint8Array): Promise<string> {
    try {
        const data = new Uint8Array(encryptedData);

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
            ['decrypt']
        );

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: data.slice(0, 12) },
            derivedKey,
            data.slice(12)
        );

        const decoder = new TextDecoder();
        const decryptedText = decoder.decode(decryptedData);

        return decryptedText;
    } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
    }
}