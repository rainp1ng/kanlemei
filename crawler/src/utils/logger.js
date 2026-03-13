/**
 * 日志工具
 */
export const logger = {
  info(message, ...args) {
    console.log(`[${new Date().toISOString()}] ℹ️ ${message}`, ...args)
  },
  
  success(message, ...args) {
    console.log(`[${new Date().toISOString()}] ✅ ${message}`, ...args)
  },
  
  warn(message, ...args) {
    console.warn(`[${new Date().toISOString()}] ⚠️ ${message}`, ...args)
  },
  
  error(message, ...args) {
    console.error(`[${new Date().toISOString()}] ❌ ${message}`, ...args)
  },
  
  debug(message, ...args) {
    if (process.env.DEBUG) {
      console.log(`[${new Date().toISOString()}] 🔍 ${message}`, ...args)
    }
  }
}

export default logger
