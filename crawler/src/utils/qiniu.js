import qiniu from 'qiniu'
import crypto from 'crypto'

// 七牛云配置
const QINIU_ACCESS_KEY = 'jVeA56atbZqphRGKdJ3AeGB8GrqeDRd04FWuG6j0'
const QINIU_SECRET_KEY = 's3n-IpkX2HpgQsgL8R_FbrDIa-rqYI7a7bNv3v6P'
const QINIU_BUCKET = 'kanlemei'  // 需要创建这个 bucket
const QINIU_DOMAIN = 'https://cdn.kanlemei.com'  // 七牛 CDN 域名

// 初始化七牛 SDK
const mac = new qiniu.auth.digest.Mac(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)
const config = new qiniu.conf.Config()
config.zone = qiniu.zone.Zone_z0  // 华东机房
const bucketManager = new qiniu.rs.BucketManager(mac, config)
const formUploader = new qiniu.form_up.FormUploader(config)
const putExtra = new qiniu.form_up.PutExtra()

/**
 * 从 URL 上传图片到七牛云
 */
export async function uploadImageFromUrl(imageUrl, key) {
  return new Promise((resolve, reject) => {
    // 生成唯一文件名
    const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = key || `posters/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    // 从 URL 抓取并上传
    bucketManager.fetch(imageUrl, QINIU_BUCKET, filename, (err, respBody, respInfo) => {
      if (err) {
        reject(err)
        return
      }
      
      if (respInfo.statusCode === 200) {
        resolve({
          key: filename,
          url: `${QINIU_DOMAIN}/${filename}`
        })
      } else {
        reject(new Error(`Upload failed: ${respInfo.statusCode}`))
      }
    })
  })
}

/**
 * 上传 Buffer 到七牛云
 */
export async function uploadBuffer(buffer, key) {
  return new Promise((resolve, reject) => {
    formUploader.put(QINIU_BUCKET, key, buffer, putExtra, (err, respBody, respInfo) => {
      if (err) {
        reject(err)
        return
      }
      
      if (respInfo.statusCode === 200) {
        resolve({
          key,
          url: `${QINIU_DOMAIN}/${key}`
        })
      } else {
        reject(new Error(`Upload failed: ${respInfo.statusCode}`))
      }
    })
  })
}

/**
 * 检查文件是否已存在
 */
export async function fileExists(key) {
  return new Promise((resolve) => {
    bucketManager.stat(QINIU_BUCKET, key, (err, respBody, respInfo) => {
      resolve(respInfo.statusCode === 200)
    })
  })
}

export default {
  uploadImageFromUrl,
  uploadBuffer,
  fileExists
}
