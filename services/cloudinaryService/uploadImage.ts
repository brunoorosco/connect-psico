import { uploadImageAction } from "@/actions/uploadImage";
import { env } from "@/config/application";
import axios from "axios";
import crypto from "crypto";

/**
 * Gera assinatura para Cloudinary com SHA-1, conforme documentação oficial.
 */
function generateCloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const toSign = sortedParams + apiSecret;

  return crypto.createHash("sha1").update(toSign).digest("hex");
}

/**
 * Faz upload seguro de imagem para o Cloudinary com assinatura.
 */
export async function uploadImageToCloudinary(file: File, userId: string, folder ='profile'): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params = {
    timestamp,
    public_id: userId,
    folder: folder,
  };

  const signature = generateCloudinarySignature(params, env.cloudinaryApiSecret as string);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("public_id", userId);
  formData.append("folder", folder);
  formData.append("signature", signature);
  formData.append("api_key", env.cloudinaryApiKey as string);
  formData.append("timestamp", timestamp);


   const response = await uploadImageAction(formData);
     if (response.result) {
    // @ts-ignore
    return response.result.secure_url as string;
  } else {
    console.error(response.error);
    throw new Error(response.error || 'Erro no upload');
  }

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.secure_url as string;
}
