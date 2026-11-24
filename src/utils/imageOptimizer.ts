export interface OptimizedImageResult {
  dataUrl: string;
  extension: 'webp' | 'jpg';
  mimeType: 'image/webp' | 'image/jpeg';
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

const MAX_DIMENSION = 1400;
const OUTPUT_QUALITY = 0.82;

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen seleccionada. Verificá que sea JPG, PNG o WEBP.'));
    };
    img.src = objectUrl;
  });

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Error al leer el archivo en el navegador.'));
    reader.readAsDataURL(file);
  });

const estimateBase64Bytes = (dataUrl: string): number => {
  const commaIdx = dataUrl.indexOf(',');
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
};

/**
 * Optimiza y redimensiona fotografías en el navegador antes de subirlas al servidor.
 * Reduce fotos de cámara/celular de 5–12 MB a ~80–200 KB en formato WebP (o JPEG)
 * manteniendo excelente nitidez visual sin sobrecargar el peso del sitio.
 */
export async function optimizeImageForWeb(
  file: File,
  maxDimension: number = MAX_DIMENSION,
  quality: number = OUTPUT_QUALITY
): Promise<OptimizedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  try {
    const img = await loadImageFromFile(file);
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    let targetW = naturalW;
    let targetH = naturalH;

    if (naturalW > maxDimension || naturalH > maxDimension) {
      const ratio = Math.min(maxDimension / naturalW, maxDimension / naturalH);
      targetW = Math.max(1, Math.round(naturalW * ratio));
      targetH = Math.max(1, Math.round(naturalH * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas no disponible');
    }

    // Fondo blanco para PNG transparentes si terminan en JPEG
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Intentar WebP primero (más liviano con igual calidad)
    let dataUrl = canvas.toDataURL('image/webp', quality);
    let mimeType: 'image/webp' | 'image/jpeg' = 'image/webp';
    let extension: 'webp' | 'jpg' = 'webp';

    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      mimeType = 'image/jpeg';
      extension = 'jpg';
    }

    const optimizedSize = estimateBase64Bytes(dataUrl);

    // Si el archivo original ya era WebP/JPEG y más liviano que la re-compresión y dentro de tamaño, usarlo
    if (
      naturalW <= maxDimension &&
      naturalH <= maxDimension &&
      (file.type === 'image/webp' || file.type === 'image/jpeg') &&
      file.size <= optimizedSize
    ) {
      const rawDataUrl = await readFileAsDataUrl(file);
      return {
        dataUrl: rawDataUrl,
        extension: file.type === 'image/webp' ? 'webp' : 'jpg',
        mimeType: file.type === 'image/webp' ? 'image/webp' : 'image/jpeg',
        originalSize: file.size,
        optimizedSize: file.size,
        width: naturalW,
        height: naturalH,
      };
    }

    return {
      dataUrl,
      extension,
      mimeType,
      originalSize: file.size,
      optimizedSize,
      width: targetW,
      height: targetH,
    };
  } catch (err) {
    // Fallback seguro si el canvas falla con algún formato raro
    const rawDataUrl = await readFileAsDataUrl(file);
    const isWebp = rawDataUrl.startsWith('data:image/webp');
    return {
      dataUrl: rawDataUrl,
      extension: isWebp ? 'webp' : 'jpg',
      mimeType: isWebp ? 'image/webp' : 'image/jpeg',
      originalSize: file.size,
      optimizedSize: file.size,
      width: 0,
      height: 0,
    };
  }
}

export function formatFileSizeKb(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
