/**
 * Cloudinary integration for FiveRate
 * Uses unsigned uploads with the "fiverate" upload preset.
 * Only the cloud name and upload preset are needed on the frontend.
 */

const CLOUD_NAME = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'] as string;
const UPLOAD_PRESET = import.meta.env['VITE_CLOUDINARY_UPLOAD_PRESET'] as string;

export interface CloudinaryUploadResult {
  url: string;        // Original URL
  secureUrl: string;  // HTTPS URL (always use this)
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload a File to Cloudinary using an unsigned upload preset.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export async function uploadToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        `Cloudinary upload failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}

/**
 * Build a Cloudinary transformation URL.
 * Useful for auto-resizing images on the fly.
 */
export function cloudinaryUrl(
  secureUrl: string,
  transforms: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  if (!secureUrl) return secureUrl;
  const parts = secureUrl.split("/upload/");
  if (parts.length !== 2) return secureUrl;

  const t: string[] = [];
  if (transforms.width) t.push(`w_${transforms.width}`);
  if (transforms.height) t.push(`h_${transforms.height}`);
  if (transforms.crop) t.push(`c_${transforms.crop}`);
  if (transforms.quality) t.push(`q_${transforms.quality}`);
  t.push("f_auto"); // auto format (webp where supported)

  return `${parts[0]}/upload/${t.join(",")}/` + parts[1];
}
