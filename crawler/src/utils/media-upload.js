/**
 * 图片上传服务
 * 上传到 media-singapore.rainping.com
 */

const MEDIA_UPLOAD_URL = 'http://media-singapore.rainping.com/p13111/upload'
const MEDIA_AUTH_TOKEN = 'Bearer openclaw-mcp-a1b2c3d4e5f6g7h8'
const MEDIA_DOMAIN = 'https://media-singapore.rainping.com'

/**
 * 从 URL 下载图片并上传到媒体服务
 * @param {string} imageUrl - 原始图片 URL
 * @returns {Promise<{url: string, postfix: string}>}
 */
export async function uploadImageFromUrl(imageUrl) {
  try {
    // 1. 下载图片
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 2. 获取文件扩展名
    const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = `poster_${Date.now()}.${ext}`
    
    // 3. 上传到媒体服务
    const formData = new FormData()
    const blob = new Blob([buffer], { type: `image/${ext}` })
    formData.append('file', blob, filename)
    
    const uploadResponse = await fetch(MEDIA_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': MEDIA_AUTH_TOKEN
      },
      body: formData
    })
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
    }
    
    const result = await uploadResponse.json()
    
    // 4. 返回图片 URL 和 postfix
    // 假设返回格式: { url: "...", postfix: "..." } 或 { path: "...", postfix: "..." }
    const postfix = result.postfix || result.path || result.key
    const url = result.url || `${MEDIA_DOMAIN}/p13111/${postfix}`
    
    return { url, postfix }
    
  } catch (error) {
    console.error('Error uploading image:', error.message)
    throw error
  }
}

/**
 * 上传 Buffer 到媒体服务
 * @param {Buffer} buffer - 图片 Buffer
 * @param {string} filename - 文件名
 * @returns {Promise<{url: string, postfix: string}>}
 */
export async function uploadBuffer(buffer, filename) {
  try {
    const ext = filename.split('.').pop() || 'jpg'
    
    const formData = new FormData()
    const blob = new Blob([buffer], { type: `image/${ext}` })
    formData.append('file', blob, filename)
    
    const uploadResponse = await fetch(MEDIA_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': MEDIA_AUTH_TOKEN
      },
      body: formData
    })
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
    }
    
    const result = await uploadResponse.json()
    
    const postfix = result.postfix || result.path || result.key
    const url = result.url || `${MEDIA_DOMAIN}/p13111/${postfix}`
    
    return { url, postfix }
    
  } catch (error) {
    console.error('Error uploading buffer:', error.message)
    throw error
  }
}

export default {
  uploadImageFromUrl,
  uploadBuffer,
  MEDIA_DOMAIN
}
