const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB — plenty for a profile photo, keeps documents small

export interface PhotoFields {
  // Stored as base64 text rather than a Buffer: Mongo/BSON Buffers are views
  // over a shared backing ArrayBuffer, which crashes Next's server-action
  // redirect response ("ArrayBuffer is not detachable and could not be
  // cloned") the moment one is read anywhere in that render — even a Buffer
  // that's converted to a string immediately and never passed as a prop.
  photo: string;
  photoContentType: string;
}

/** Reads an optional file input from FormData. Returns null when no file was
    chosen (so callers can leave the existing stored photo untouched on edit). */
export async function readPhotoField(formData: FormData, name: string): Promise<PhotoFields | null | { error: string }> {
  const file = formData.get(name);
  if (!(file instanceof File) || file.size === 0) return null;

  if (!file.type.startsWith("image/")) return { error: "Please upload an image file." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "Image must be smaller than 2MB." };

  const photo = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { photo, photoContentType: file.type };
}

export function toPhotoDataUrl(photo?: string | null, photoContentType?: string | null): string | null {
  if (!photo || !photoContentType) return null;
  return `data:${photoContentType};base64,${photo}`;
}
