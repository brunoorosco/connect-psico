"use server"

import cloudinary from "@/lib/cloudinary"

export async function uploadImageAction(formData: FormData) {
  const file = formData.get("file") as File | null
  const folder = formData.get("folder") as string

  if (!file) {
    return { error: "No file provided" }
  }
  if (!folder) {
    return { error: "No folder provided" }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: folder }, function (error, result) {
          if (error) reject(error)
          else resolve(result)
        })
        .end(buffer)
    })

    return { result }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Upload failed" }
  }
}
