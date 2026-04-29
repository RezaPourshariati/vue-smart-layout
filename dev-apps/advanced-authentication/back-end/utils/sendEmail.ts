import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'
// @ts-expect-error - no type declarations available for nodemailer-express-handlebars
import hbs from 'nodemailer-express-handlebars'

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function sendEmail(
  subject: string,
  send_to: string,
  sent_from: string,
  reply_to: string,
  template: string,
  name: string,
  link: string,
): Promise<void> {
  // Create Email Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  const handlebarOptions = {
    viewEngine: {
      extName: '.handlebars',
      partialsDir: path.resolve(__dirname, '../views'),
      defaultLayout: false as const,
    },
    viewPath: path.resolve(__dirname, '../views'),
    extName: '.handlebars',
  }

  transporter.use('compile', hbs(handlebarOptions))

  // Options for Sending Email
  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    template,
    subject,
    context: {
      name,
      link,
    },
  }

  // Send Email
  transporter.sendMail(options, (err, info) => {
    if (err)
      console.error(err)
    else
      console.log(info)
  })
}

export default sendEmail
