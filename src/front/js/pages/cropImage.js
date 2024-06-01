export const getCroppedImg = (imageSrc, pixelCrop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
        image.onload = () => {
            const size = Math.min(pixelCrop.width, pixelCrop.height);
            canvas.width = size;
            canvas.height = size;

            // Crear una máscara circular
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                size,
                size
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                blob.name = 'cropped.jpg';
                resolve(blob);
            }, 'image/jpeg');
        };

        image.onerror = () => {
            reject(new Error('Failed to load image'));
        };
    });
};

export default getCroppedImg;
