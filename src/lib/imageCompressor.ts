/**
 * Client-side image compression utility
 * Resizes high-resolution photos taken on smartphones (which can be 5MB-15MB)
 * to an optimized size (max 1200px, JPEG ~100-250KB) so they upload instantly
 * and work seamlessly on mobile and desktop devices.
 */

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  name: string;
  originalSize: number;
  compressedSize: number;
}

export function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
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
        if (!ctx) {
          reject(new Error('Não foi possível inicializar o renderizador de imagem.'));
          return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                dataUrl,
                name: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                originalSize: file.size,
                compressedSize: blob.size,
              });
            } else {
              // Fallback to dataUrl as blob
              resolve({
                blob: file,
                dataUrl,
                name: file.name,
                originalSize: file.size,
                compressedSize: file.size,
              });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Falha ao decodificar a imagem selecionada.'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Erro ao ler os dados da foto.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao carregar o arquivo do seu dispositivo.'));
    };

    reader.readAsDataURL(file);
  });
}
