import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { uploadVideo } from './platforms/youtubeAPI.js'
import { uploadReel } from './platforms/OfficialInstagramAPI.js'
import * as tiktokAPI from './platforms/tiktokAPI.js'


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

        //const data = readVideos()
        //onst video = data.videos.find(v => v.id === video.id)

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

            await uploadReel(videoFile, accessToken, instagramUserId, options)
        }

        console.log('Video successfully published to ' + video.platforms.join(', '))
    } catch (error) {
        console.error('Error publishing post:', error)
        throw new Error('Error publishing post')
    }

}

(async () => {
    const videos = await getScheduledVideos();
    //console.log(videos);
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

uploadReel({ path: '/Users/alexpolan/social-media-manager/backend/uploads/1760506481796-105686547.MP4' }, process.env.INSTAGRAM_ACCESS_TOKEN, process.env.INSTAGRAM_USER_ID, { caption: 'Test reel upload' });