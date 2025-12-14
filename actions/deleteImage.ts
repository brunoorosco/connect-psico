"use server"

import cloudinary from "@/lib/cloudinary"

/**
 * Extrai o public_id de uma URL do Cloudinary
 * Exemplo: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
 * Retorna: folder/image
 */
function extractPublicIdFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname

        // console.log('🔍 Extracting public_id from pathname:', pathname)

        // Padrão Cloudinary: /image/upload/v[version]/[folder]/[filename].[ext]
        // ou: /image/upload/[folder]/[filename].[ext]
        // Precisamos extrair tudo após /upload/ até a extensão
        const match = pathname.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.\w+$/)

        if (match && match[1]) {
            console.log('✅ Extracted public_id:', match[1])
            return match[1]
        }

        // console.warn('❌ Could not match pattern in pathname:', pathname)
        return null
    } catch (error) {
        console.error('❌ Error parsing URL:', error)
        return null
    }
}

/**
 * Deleta uma imagem do Cloudinary usando sua URL
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<{ success?: boolean; error?: string }> {
    try {
        // console.log('🗑️ Attempting to delete image:', imageUrl)

        if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
            // console.log('⏭️ Not a Cloudinary URL, skipping deletion')
            return { success: true } // Não é uma imagem do Cloudinary, ignora
        }

        const publicId = extractPublicIdFromUrl(imageUrl)

        if (!publicId) {
            // console.warn('❌ Could not extract public_id from URL:', imageUrl)
            return { error: 'Invalid Cloudinary URL' }
        }

        // console.log('🚀 Calling Cloudinary destroy with public_id:', publicId)
        const result = await cloudinary.uploader.destroy(publicId)
        // console.log('📊 Cloudinary response:', result)

        if (result.result === 'ok' || result.result === 'not found') {
            // console.log('✅ Image deleted successfully or not found')
            return { success: true }
        }

        console.error('❌ Unexpected result:', result.result)
        return { error: `Failed to delete: ${result.result}` }
    } catch (error) {
        console.error('💥 Error deleting image from Cloudinary:', error)
        return { error: 'Failed to delete image' }
    }
}
