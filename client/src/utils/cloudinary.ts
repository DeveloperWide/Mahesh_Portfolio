type CloudinaryUploadResult = { url: string; publicId: string };

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
  | string
  | undefined;
const folder = (import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined) || "";

export const cloudinaryIsConfigured = Boolean(cloudName && uploadPreset);

export const uploadProjectImage = async (
  file: File,
): Promise<CloudinaryUploadResult> => {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured (missing env vars).");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  if (folder) form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Cloudinary upload failed");
  }

  const data = (await res.json()) as any;
  return { url: data.secure_url, publicId: data.public_id };
};

