import { randomBytes, pbkdf2Sync } from 'crypto';

interface DerivedKey {
    key: Buffer;
    key_salt: Buffer;
}

const deriveEncryptionKey = async (username: string, password: string, key_salt?: Buffer): Promise<DerivedKey> => {
    const randomSalt = randomBytes(16); // Generate a random salt
    if (!key_salt) {
        key_salt = Buffer.concat([Buffer.from(username), randomSalt]); // Combine username and random salt
    }
    // Derive the encryption key using PBKDF2
    const key = pbkdf2Sync(password, key_salt, 100000, 32, 'sha256');

    return {
        key,
        key_salt,
    };
};

export { deriveEncryptionKey };
