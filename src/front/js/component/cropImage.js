// cropImage.js

// Utiliza canvas para recortar la imagen
    const getCroppedImg = (imageSrc, pixelCrop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = imageSrc;
    return new Promise((resolve, reject) => {
        image.onload = () => {
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );
            canvas.toBlob(blob => {
                const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg');
        };
        image.onerror = reject;
    });
};

export default getCroppedImg;