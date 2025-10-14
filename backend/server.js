import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { instagramPost } from './InstagramAPI.js'

const app = express()
const PORT = process.env.PORT || 6709

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello, Worldgg!')
})

app.post('/instagram', async (req, res) => {
  try {
    await instagramPost()
    res.status(200).send('Instagram post published successfully!')
  } catch (error) {
    console.error('Error publishing Instagram post:', error)
    res.status(500).send('Error publishing Instagram post')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
