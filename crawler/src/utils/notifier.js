import nodemailer from 'nodemailer'

/**
 * 邮件通知工具
 */
export class Notifier {
  constructor() {
    this.transporter = null
    
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    }
  }
  
  /**
   * 发送错误通知
   */
  async sendError(subject, error) {
    if (!this.transporter || !process.env.NOTIFY_EMAIL) {
      console.log('Email notification not configured')
      return
    }
    
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.NOTIFY_EMAIL,
        subject: `[看了没爬虫] ${subject}`,
        text: `错误信息:\n${error.message}\n\n堆栈:\n${error.stack}`
      })
      console.log('Error notification sent')
    } catch (err) {
      console.error('Failed to send notification:', err.message)
    }
  }
  
  /**
   * 发送爬虫完成通知
   */
  async sendReport(stats) {
    if (!this.transporter || !process.env.NOTIFY_EMAIL) {
      return
    }
    
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.NOTIFY_EMAIL,
        subject: `[看了没爬虫] 爬取完成 - ${stats.added} 新增 / ${stats.updated} 更新`,
        text: `
爬取报告:
- 发现演出: ${stats.found}
- 新增: ${stats.added}
- 更新: ${stats.updated}
- 错误: ${stats.errors}
        `.trim()
      })
    } catch (err) {
      console.error('Failed to send report:', err.message)
    }
  }
}

export const notifier = new Notifier()
export default notifier
