import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function imageUploadUtil(imageUrlOrBase64) {
  const result = await cloudinary.uploader.upload(imageUrlOrBase64, {
    resource_type: "image",
    folder: "ai-image-generator",
  });
  //console.log("result", result);
  return result.secure_url;
}
