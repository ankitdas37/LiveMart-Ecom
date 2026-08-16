/**
 * Compresses an image file using HTML5 Canvas.
 * Non-image files are returned as-is.
 * 
 * @param {File} file - The file to compress.
 * @param {number} maxWidth - The maximum width of the output image.
 * @param {number} maxHeight - The maximum height of the output image.
 * @param {number} quality - The quality of the output JPEG/WEBP (0 to 1).
 * @returns {Promise<File>} A promise that resolves to the compressed file.
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // If not an image or is a GIF (which canvas breaks animation for), return original
    if (!file.type.match(/image.*/) || file.type === 'image/gif') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output type. Prefer webp, fallback to jpeg.
        let outputType = 'image/webp';

        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback to jpeg if webp failed
            canvas.toBlob((fallbackBlob) => {
              if (!fallbackBlob) return reject(new Error('Canvas empty'));
              resolve(new File([fallbackBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
            }, 'image/jpeg', quality);
            return;
          }
          
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const newFile = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
          });
          
          resolve(newFile);
        }, outputType, quality);
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
};
