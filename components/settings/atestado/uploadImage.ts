import { uploadImageAction } from "@/actions/uploadImage"

// @components/settings/atestado/uploadImage.ts
export default async function uploadImage(file: File, folder = "layers") {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", folder)

    const res = await uploadImageAction(fd)
    console.log('[uploadImage.ts:10]', { res });
  
    // const res = await fetch("/api/upload-image", {
    //   method: "POST",
    //   body: fd,
    // })
    // if (!res) {
    //   const msg = await res.text().catch(() => "")
    //   throw new Error(msg || "Upload failed")
    // }
    return res // { secure_url, public_id, width, height, ... }
  }
  