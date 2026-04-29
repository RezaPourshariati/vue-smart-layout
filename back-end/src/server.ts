import mongoose from 'mongoose'
import app from './app.js'
import 'dotenv/config'

const port = Number(process.env.PORT || 4000)

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI
    // console.log(mongoUri)
    if (!mongoUri)
      throw new Error('MONGO_URI is not defined')
    await mongoose.connect(mongoUri)
    console.log('Database Connected Successfully.')
    app.listen(port, () => {
      console.log(`Auth server running on http://localhost:${port}`)
    })
  }
  catch (error) {
    console.error((error as Error).message)
  }
}

start().then(() => console.log('Done.'))
