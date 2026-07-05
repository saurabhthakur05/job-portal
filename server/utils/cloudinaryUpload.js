import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (
  buffer,
  folder = "job-portal",
  resourceType = "auto"
) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const b64 = buffer.toString("base64");
  const dataURI = `data:application/octet-stream;base64,${b64}`;

  return cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: resourceType,
  });
};