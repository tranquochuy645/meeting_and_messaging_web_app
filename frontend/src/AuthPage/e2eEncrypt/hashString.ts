async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashedArray = Array.from(new Uint8Array(buffer));
    const hashedString = hashedArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashedString;
}
export {hashString}
