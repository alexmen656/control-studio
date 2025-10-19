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

async function publishVideo(video) {
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
            await uploadVideo(video)
        }

        if (video.platforms.includes('tiktok')) {
            console.log('Publishing to TikTok:', video.title)
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

            await uploadReel({ path: videoFile }, accessToken, instagramUserId, options)
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

        console.log('Video successfully published to ' + video.platforms.join(', '))
    } catch (error) {
        console.error('Error publishing post:', error)
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