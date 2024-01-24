export type Fields = Record<string, string>;

export interface PresignedPost {
    url: string;
    fields: Fields;
}
export const getPresignedPost = async (url: string, token: string) => {
    const response = await fetch(
        `${url}?token=${token}`,
        {
            method: 'POST',
        }
    )
    if (response.ok) {
        return (await response.json()) as PresignedPost;
    }
    return null;
}

export const postFile = async (presignedPost: PresignedPost, file: File) => {
    const form = new FormData();
    Object.entries(presignedPost.fields).forEach(([field, value]) => {
        form.append(field, value);
    });
    form.append("file", file);
    const response = await fetch(
        presignedPost.url,
        {
            method: "POST",
            body: form
        }
    )
    return (response.status == 204)
}
