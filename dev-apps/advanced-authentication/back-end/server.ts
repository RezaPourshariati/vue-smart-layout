import type { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import errorHandler from './middleware/errorMiddleware.js'
import userRoute from './routes/userRoute.js'
import 'dotenv/config'

const app = express()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())

const allowedOrigins = ['http://localhost:3000', 'https://reza-secureone.vercel.app']
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
)

// Routes
app.use('/api/v1/users', userRoute)

app.get('/', (_req: Request, res: Response) => {
  res.send('Home Page')
})

// Error Middleware
app.use(errorHandler)

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined')
    }

    await mongoose.connect(mongoUri)
    console.log('Database Connected Successfully.')

    const port = process.env.PORT ? Number(process.env.PORT) : 5000
    app.listen(port, () => console.log(`Server is listening on port ${port}....`))
  }
  catch (error) {
    console.error((error as Error).message)
  }
}

start().then(() => console.log('Done.'))
