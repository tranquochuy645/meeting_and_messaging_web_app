export const processImage = (file: Blob, callback: (data: string) => void) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
        if (event.target?.result) {
            const image = new Image();
            image.onload = async () => {
                const canvas = document.createElement("canvas");
                const maxWidth = 200; // Set the desired maximum width
                const maxHeight = 200; // Set the desired maximum height
                let width = image.width;
                let height = image.height;

                // Determine the new dimensions while maintaining aspect ratio
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                // Resize the image using the canvas
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(image, 0, 0, width, height);

                // Convert the resized image back to base64
                const resizedBase64Data = canvas.toDataURL("image/jpeg");
                callback(resizedBase64Data)
            };

            // Load the image
            image.src = event.target.result as string;
        }
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);

};