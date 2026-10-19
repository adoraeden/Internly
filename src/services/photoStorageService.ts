/**
 * Photo helpers
 *
 * Validates a chosen photo and shrinks it in the browser before it is
 * uploaded to the server. Nothing is stored in the browser any more.
 */

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 Megabytes
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Resize and compress image on a 2D canvas so the upload stays small.
 */
function compressImage(file: File, maxDim = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process the selected image file.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          // Some browsers ignore WebP and return PNG; both are accepted by the server
          resolve(dataUrl);
        } catch {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.onerror = () => reject(new Error('Could not process the selected image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read the file from disk.'));
    reader.readAsDataURL(file);
  });
}

export const PhotoStorageService = {
  /** Validates file size and format. */
  validatePhoto(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported file format. Please upload a JPEG, PNG, or WebP image.',
      };
    }

    if (file.size > MAX_PHOTO_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size (${sizeMB} MB) exceeds the 2 MB limit. Please select a smaller photo.`,
      };
    }

    return { valid: true };
  },

  /** Shrinks the photo and returns it as a data URL, ready to upload. */
  async prepareForUpload(file: File): Promise<string> {
    const validation = this.validatePhoto(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid photo file.');
    }
    return compressImage(file, 480);
  },

  /** Deletes the old shared browser photo left by earlier versions. Safe to run repeatedly. */
  clearLegacyPhoto(): void {
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        window.indexedDB.deleteDatabase('internly_media_db');
      }
    } catch {
      // Nothing to clean up if the browser blocks access
    }
  },
};