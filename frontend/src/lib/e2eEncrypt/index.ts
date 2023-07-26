import { encryptPrivateKey } from './encryptPrivateKey';
import { generateKeyPair } from './generateKeyPair';
import { hashString } from './hashString';
import { deriveEncryptionKey } from './deriveEncryptionKey.ts'; 

/**
 * Function to set up encryption for a user.
 * Generates key pair, derives encryption key from username and password,
 * and encrypts the private key using the derived encryption key.
 * @param username - The username of the user.
 * @param password - The password of the user.
 * @returns An object containing the encrypted user data.
 */
const encryptionSetup = async (username: string, password: string) => {
    // Hash the password
    password = await hashString(password);

    // Generate key pair
    const { publicKey, privateKey } = await generateKeyPair();

    // Derive encryption key from username and password
    const { key, key_salt } = await deriveEncryptionKey(username, password);

    // Encrypt private key using the derived encryption key
    const { encrypted, salt } = await encryptPrivateKey(privateKey, key);

    // Return the encrypted user data
    return {
        username: username,
        password: password,
        publicKey: publicKey,
        privateKey: {
            data: {
                encrypted: encrypted,
                salt: salt
            },
            key_salt: key_salt
        }
    };
};

export { encryptionSetup };
