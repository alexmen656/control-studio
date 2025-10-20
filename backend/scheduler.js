import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

import { uploadVideo } from './platforms/YoutubeAPI.js'
import { uploadReel } from './platforms/InstagramAPI.js'
import * as tiktokAPI from './platforms/TiktokAPI.js'
import { uploadVideo as uploadFacebookVideo } from './platforms/FacebookAPI.js'

async function getScheduledVideos() {
    console.log('Fetching scheduled videos...');
    try {
        const DB_PATH = path.join(__dirname, 'videos.json')
        const data = fs.readFileSync(DB_PATH, 'utf8')
        let videos = JSON.parse(data).videos;

        videos = videos.filter(video => video.status === 'scheduled');
        videos = videos.filter(video => new Date(video.scheduledDate) > new Date());
        videos = videos.filter(video => new Date(video.scheduledDate) - new Date() < 5 * 60 * 1000);
        return videos;
    } catch (error) {
        console.error('Error fetching scheduled videos:', error);
        return [];
    }
}

function updateVideoStatus(videoId, platformStatuses) {
    const DB_PATH = path.join(__dirname, 'videos.json')
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    const videoIndex = data.videos.findIndex(v => v.id === videoId)

    if (videoIndex !== -1) {
        const currentDate = new Date().toISOString()

        const publishStatusWithDates = {}
        Object.entries(platformStatuses).forEach(([platform, status]) => {
            if (status === 'success') {
                publishStatusWithDates[platform] = currentDate
            } else {
                publishStatusWithDates[platform] = 'failed'
            }
        })

        data.videos[videoIndex].publishStatus = publishStatusWithDates
        data.videos[videoIndex].updatedAt = currentDate

        const allSuccess = Object.values(platformStatuses).every(status => status === 'success')
        const anySuccess = Object.values(platformStatuses).some(status => status === 'success')

        if (allSuccess) {
            data.videos[videoIndex].status = 'published'
            data.videos[videoIndex].publishedAt = currentDate
        } else if (anySuccess) {
            data.videos[videoIndex].status = 'partially-published'
            data.videos[videoIndex].publishedAt = currentDate
        } else {
            data.videos[videoIndex].status = 'failed'
        }

        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    }
}

async function publishVideo(video) {
    const platformStatuses = {}

    try {
        if (!video.id) {
            throw new Error('videoId is required')
        }

        if (!video) {
            throw new Error('Video not found')
        }

        if (!video.platforms || video.platforms.length === 0) {
            throw new Error('No platforms selected for publishing')
        }

        if (video.platforms.includes('youtube')) {
            console.log('Publishing to YouTube:', video.title)
            try {
                await uploadVideo(video)
                platformStatuses.youtube = 'success'
                console.log(`✓ YouTube: Published successfully at ${new Date().toLocaleString()}`)
            } catch (error) {
                platformStatuses.youtube = 'failed'
                console.error('✗ YouTube: Failed -', error.message)
            }
        }

        if (video.platforms.includes('tiktok')) {
            console.log('Publishing to TikTok:', video.title)
            try {
                await tiktokAPI.uploadVideo(video.path, video.title)
                platformStatuses.tiktok = 'success'
                console.log(`✓ TikTok: Published successfully at ${new Date().toLocaleString()}`)
            } catch (error) {
                platformStatuses.tiktok = 'failed'
                console.error('✗ TikTok: Failed -', error.message)
            }
        }

        if (video.platforms.includes('instagram')) {
            console.log('Publishing to Instagram:', video.title)
            const videoFile = video.path;
            const options = {
                caption: video.description,
            };

            try {
                await uploadReel({ path: videoFile }, options)
                platformStatuses.instagram = 'success'
                console.log(`✓ Instagram: Published successfully at ${new Date().toLocaleString()}`)
            } catch (error) {
                platformStatuses.instagram = 'failed'
                console.error('✗ Instagram: Failed -', error.message)
            }
        }

        if (video.platforms.includes('facebook')) {
            console.log('Publishing to Facebook:', video.title)
            const videoFile = video.path;
            const options = {
                title: video.title,
                description: video.description,
            };

            try {
                await uploadFacebookVideo({ path: videoFile }, options)
                platformStatuses.facebook = 'success'
                console.log(`✓ Facebook: Published successfully at ${new Date().toLocaleString()}`)
            } catch (error) {
                platformStatuses.facebook = 'failed'
                console.error('✗ Facebook: Failed -', error.message)
            }
        }

        updateVideoStatus(video.id, platformStatuses)

        const successPlatforms = Object.entries(platformStatuses)
            .filter(([_, status]) => status === 'success')
            .map(([platform, _]) => platform)

        const failedPlatforms = Object.entries(platformStatuses)
            .filter(([_, status]) => status === 'failed')
            .map(([platform, _]) => platform)

        if (successPlatforms.length > 0) {
            console.log('Video successfully published to: ' + successPlatforms.join(', '))
        }
        if (failedPlatforms.length > 0) {
            console.log('Video failed to publish to: ' + failedPlatforms.join(', '))
        }
    } catch (error) {
        console.error('Error publishing post:', error)

        video.platforms.forEach(platform => {
            if (!platformStatuses[platform]) {
                platformStatuses[platform] = 'failed'
            }
        })
        updateVideoStatus(video.id, platformStatuses)
        throw new Error('Error publishing post')
    }

}

(async () => {
    const videos = await getScheduledVideos();

    videos.forEach(async video => {
        const delay = new Date(video.scheduledDate) - new Date();
        if (delay > 0) {
            console.log(`Scheduling video ID: ${video.id} to be published in ${delay} ms`);
            setTimeout(async () => {
                await publishVideo(video);
            }, delay);
        } else {
            await publishVideo(video);
        }
    });
})();