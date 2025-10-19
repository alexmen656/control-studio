import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { uploadVideo, authorize, getTokenFromCode } from './platforms/YoutubeAPI.js'
import { InstagramAuth, InstagramTokenExchange, uploadReel } from './platforms/InstagramAPI.js'
import { FacebookAuth, FacebookTokenExchange, uploadVideo as uploadFacebookVideo } from './platforms/FacebookAPI.js'
import * as tiktokAPI from './platforms/TiktokAPI.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')
const TOKENS_DIR = path.join(__dirname, 'tokens')

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const app = express()
const PORT = process.env.PORT || 6709

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true })
}

const DB_PATH = path.join(__dirname, 'videos.json')

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ videos: [] }, null, 2))
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only video files are allowed!'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
})

app.use(cors())
app.use(bodyParser.json())
app.use('/uploads', express.static(uploadsDir))

const readVideos = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { videos: [] }
  }
}

const writeVideos = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

const getVideoStats = (filePath) => {
  const stats = fs.statSync(filePath)
  const fileSizeInBytes = stats.size
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)
  return {
    size: `${fileSizeInMB} MB`,
    sizeBytes: fileSizeInBytes
  }
}

app.get('/', (req, res) => {
  res.send('Control Studio API - Social Media Manager')
})

app.get('/api/videos', (req, res) => {
  try {
    const data = readVideos()
    res.json(data.videos)
  } catch (error) {
    console.error('Error reading videos:', error)
    res.status(500).json({ error: 'Error reading videos' })
  }
})

app.get('/api/videos/:id', (req, res) => {
  try {
    const data = readVideos()
    const video = data.videos.find(v => v.id === req.params.id)
    if (video) {
      res.json(video)
    } else {
      res.status(404).json({ error: 'Video not found' })
    }
  } catch (error) {
    console.error('Error reading video:', error)
    res.status(500).json({ error: 'Error reading video' })
  }
})

app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' })
    }

    const data = readVideos()
    const stats = getVideoStats(req.file.path)

    const newVideo = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      filename: req.file.filename,
      originalName: req.file.originalname,
      thumbnail: req.body.thumbnail || 'https://via.placeholder.com/400x225',
      duration: req.body.duration || '0:00',
      size: stats.size,
      sizeBytes: stats.sizeBytes,
      uploadDate: new Date().toISOString(),
      status: 'awaiting-details',
      progress: 100,
      platforms: req.body.platforms ? JSON.parse(req.body.platforms) : [],
      views: 0,
      path: req.file.path
    }

    data.videos.push(newVideo)
    writeVideos(data)

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: newVideo
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({ error: 'Error uploading video' })
  }
})

app.get('/api/accounts/status', (req, res) => {
  try {
    res.json({
      youtube: fs.existsSync(path.join(TOKENS_DIR, 'youtube_token.json')),
      tiktok: fs.existsSync(path.join(TOKENS_DIR, 'tiktok_token.json')),
      instagram: fs.existsSync(path.join(TOKENS_DIR, 'instagram_token.json')),
      facebook: fs.existsSync(path.join(TOKENS_DIR, 'facebook_token.json'))
    })
  } catch (error) {
    console.error('Error checking account status:', error)
    res.status(500).json({ error: 'Error checking account status' })
  }
})

app.post('/api/upload-multiple', upload.array('videos', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No video files uploaded' })
    }

    const data = readVideos()
    const uploadedVideos = []

    req.files.forEach((file, index) => {
      const stats = getVideoStats(file.path)
      const newVideo = {
        id: (Date.now() + index).toString(),
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        filename: file.filename,
        originalName: file.originalname,
        thumbnail: 'https://via.placeholder.com/400x225',
        duration: '0:00',
        size: stats.size,
        sizeBytes: stats.sizeBytes,
        uploadDate: new Date().toISOString(),
        status: 'awaiting-details',
        progress: 100,
        platforms: [],
        views: 0,
        path: file.path
      }

      data.videos.push(newVideo)
      uploadedVideos.push(newVideo)
    })

    writeVideos(data)

    res.status(201).json({
      message: `${uploadedVideos.length} videos uploaded successfully`,
      videos: uploadedVideos
    })
  } catch (error) {
    console.error('Error uploading videos:', error)
    res.status(500).json({ error: 'Error uploading videos' })
  }
})

app.put('/api/videos/:id', (req, res) => {
  try {
    const data = readVideos()
    const videoIndex = data.videos.findIndex(v => v.id === req.params.id)

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' })
    }

    data.videos[videoIndex] = {
      ...data.videos[videoIndex],
      ...req.body,
      id: req.params.id
    }

    writeVideos(data)
    res.json({
      message: 'Video updated successfully',
      video: data.videos[videoIndex]
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.patch('/api/videos/:id', (req, res) => {
  try {
    const data = readVideos()
    const videoIndex = data.videos.findIndex(v => v.id === req.params.id)

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' })
    }

    data.videos[videoIndex] = {
      ...data.videos[videoIndex],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    }

    writeVideos(data)
    res.json({
      message: 'Video details updated successfully',
      video: data.videos[videoIndex]
    })
  } catch (error) {
    console.error('Error updating video:', error)
    res.status(500).json({ error: 'Error updating video' })
  }
})

app.delete('/api/videos/:id', (req, res) => {
  try {
    const data = readVideos()
    const videoIndex = data.videos.findIndex(v => v.id === req.params.id)

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const video = data.videos[videoIndex]

    if (fs.existsSync(video.path)) {
      fs.unlinkSync(video.path)
    }

    data.videos.splice(videoIndex, 1)
    writeVideos(data)

    res.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Error deleting video:', error)
    res.status(500).json({ error: 'Error deleting video' })
  }
})

app.get('/api/used-storage', (req, res) => {
  try {
    const data = readVideos()
    const totalBytes = data.videos.reduce((acc, video) => acc + (video.sizeBytes || 0), 0)

    res.json({ used_storage: totalBytes, total_storage: 5 * 1024 * 1024 * 1024 })
  } catch (error) {
    console.error('Error calculating used storage:', error)
    res.status(500).json({ error: 'Error calculating used storage' })
  }
})

app.post('/api/videos/bulk-delete', (req, res) => {
  try {
    const { videoIds } = req.body
    if (!videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Invalid video IDs' })
    }

    const data = readVideos()
    let deletedCount = 0

    videoIds.forEach(id => {
      const videoIndex = data.videos.findIndex(v => v.id === id)
      if (videoIndex !== -1) {
        const video = data.videos[videoIndex]

        if (fs.existsSync(video.path)) {
          fs.unlinkSync(video.path)
        }

        data.videos.splice(videoIndex, 1)
        deletedCount++
      }
    })

    writeVideos(data)
    res.json({
      message: `${deletedCount} videos deleted successfully`,
      deletedCount
    })
  } catch (error) {
    console.error('Error bulk deleting videos:', error)
    res.status(500).json({ error: 'Error bulk deleting videos' })
  }
})

app.post('/api/connect/:platform', async (req, res) => {
  try {

    const { platform } = req.params

    switch (platform) {
      case 'youtube':
        const result = await authorize();

        if (result.authUrl) {
          return res.json({ authUrl: result.authUrl });
        } else {
          return res.json({ message: 'Connected to YouTube successfully' });
        }

      case 'instagram':
        const instagramAuth = InstagramAuth();
        if (instagramAuth.auth_url) {
          return res.json({ authUrl: instagramAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Instagram successfully' });
        }

      case 'facebook':
        const facebookAuth = FacebookAuth();
        if (facebookAuth.auth_url) {
          return res.json({ authUrl: facebookAuth.auth_url });
        } else {
          res.json({ message: 'Connected to Facebook successfully' });
        }
      case 'tiktok':
        const tiktokResult = await tiktokAPI.authorize();

        if (tiktokResult.authUrl) {
          return res.json({ authUrl: tiktokResult.authUrl });
        } else {
          return res.json({ message: 'Connected to TikTok successfully' });
        }

      default:
        return res.status(400).json({ error: 'Unsupported platform' })
        break;
    }
  } catch (error) {
    console.error('Error connecting to platform:', error)
    res.status(500).json({ error: 'Error connecting to platform' })
  }
})

app.get('/api/oauth2callback/youtube', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await fs.promises.writeFile(path.join(TOKENS_DIR, 'youtube_code.json'), JSON.stringify(code));
    await getTokenFromCode(code);
    res.redirect('http://localhost:5185/accounts');
    //res.send('YouTube authorization successful! You can close this tab.');
  } catch (error) {
    console.error('Error during YouTube OAuth2 callback:', error);
    res.status(500).send('Error during YouTube authorization');
  }
});

app.get('/api/oauth2callback/tiktok', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('TikTok OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await tiktokAPI.exchangeCodeForToken(code, state);

    res.redirect('http://localhost:5185/accounts?tiktok=connected');
  } catch (error) {
    console.error('Error during TikTok OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=tiktok_auth_failed');
  }
});

app.get('/api/oauth2callback/instagram', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Instagram OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }
  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await fs.promises.writeFile(path.join(TOKENS_DIR, 'instagram_code.json'), JSON.stringify(code));
    axios.get(InstagramTokenExchange(code)).then(response => {
      fs.promises.writeFile(path.join(TOKENS_DIR, 'instagram_token.json'), JSON.stringify(response.data));
    });
    //return res.redirect();
    res.redirect('http://localhost:5185/accounts?instagram=connected');
  } catch (error) {
    console.error('Error during Instagram OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=instagram_auth_failed');
  }
});

app.get('/api/oauth2callback/facebook', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('Facebook OAuth error:', error, error_description);
    return res.redirect(`http://localhost:5185/accounts?error=${error}`);
  }
  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await fs.promises.writeFile(path.join(TOKENS_DIR, 'facebook_code.json'), JSON.stringify(code));
    axios.get(FacebookTokenExchange(code)).then(response => {
      fs.promises.writeFile(path.join(TOKENS_DIR, 'facebook_token.json'), JSON.stringify(response.data));
    });
    //return res.redirect();
    res.redirect('http://localhost:5185/accounts?facebook=connected');
  } catch (error) {
    console.error('Error during Facebook OAuth2 callback:', error);
    res.redirect('http://localhost:5185/accounts?error=facebook_auth_failed');
  }
});

app.post('/api/publish', async (req, res) => {
  try {
    if (!req.body.videoId) {
      return res.status(400).send('videoId is required')
    }

    const data = readVideos()
    const video = data.videos.find(v => v.id === req.body.videoId)

    if (!video) {
      return res.status(404).send('Video not found')
    }

    if (!video.platforms || video.platforms.length === 0) {
      return res.status(400).send('No platforms selected for publishing')
    }

    if (video.platforms.includes('youtube')) {
      console.log('Publishing to YouTube:', video.title);
      await uploadVideo(video)
    }

    if (video.platforms.includes('tiktok')) {
      console.log('Publishing to TikTok:', video.title);
      await tiktokAPI.uploadVideo(video.path, video.title)
    }

    if (video.platforms.includes('instagram')) {
      console.log('Publishing to Instagram:', video.title)
      const videoFile = video.path;
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      const instagramUserId = process.env.INSTAGRAM_USER_ID;
      const options = {
        caption: video.description,
      };

      await uploadReel(videoFile, accessToken, instagramUserId, options)
    }

    if (video.platforms.includes('facebook')) {
      console.log('Publishing to Facebook:', video.title)
      const videoFile = video.path;
      const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      const facebookPageId = process.env.FACEBOOK_PAGE_ID;
      const options = {
        title: video.title,
        description: video.description,
      };

      await uploadFacebookVideo({ path: videoFile }, facebookAccessToken, facebookPageId, options)
    }


    res.status(200).send('Video successfully published to ' + video.platforms.join(', '))
  } catch (error) {
    console.error('Error publishing post:', error)
    res.status(500).send('Error publishing post')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Uploads directory: ${uploadsDir}`)
  console.log(`Database file: ${DB_PATH}`)
})
