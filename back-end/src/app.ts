import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import errorHandler from './middleware/error.middleware.js'
import authRoutes from './routes/auth.routes.js'

const app = express()
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.FRONTEND_URL || 'http://localhost:5173',
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/users', authRoutes)
app.use('/api/auth', authRoutes)
app.use(errorHandler)

export default app
