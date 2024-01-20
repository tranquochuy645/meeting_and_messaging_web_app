export async function generateKeyPair() {
    try {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // Exponent 65537
                hash: 'SHA-256',
            },
            true, // extractable, allowing export of the keys
            ['encrypt', 'decrypt'] // key usage
        );

        const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

        return {
            publicKey: ab2str(publicKey),
            privateKey: ab2str(privateKey),
        };
    } catch (error) {
        console.error('Error generating key pair:', error);
        throw error;
    }
}

function ab2str(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
}
