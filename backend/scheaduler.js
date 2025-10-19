import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function getScheduledPosts() {
    console.log('Fetching scheduled posts...');
    try {
        const DB_PATH = path.join(__dirname, 'videos.json')
        const data = fs.readFileSync(DB_PATH, 'utf8')
        let videos = JSON.parse(data).videos;
        //console.log('Fetched videos: ', videos);
        videos = videos.filter(video => video.status === 'scheduled');
        console.log(`1. ${new Date()}`, videos);
        videos = videos.filter(video => new Date(video.scheduledDate) > new Date());
        console.log('2. ', videos);
        videos = videos.filter(video => new Date(video.scheduledDate) - new Date() < 5 * 60 * 1000);
        console.log('3. ', videos);
        return videos;
    } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        return [];
    }
}
(async () => {
    const videos = await getScheduledPosts();
    console.log(videos);
    videos.forEach(video => {
        const delay = new Date(video.scheduledDate) - new Date();
        if (delay > 0) {
            setTimeout(() => {
                console.log(`Publishing scheduled video ID: ${video.id} in delay of ${delay} ms`);
                //publishPost(video);
            }, delay);
        } else {
            console.log(`Publishing scheduled video ID: ${video.id}`);
            //publishPost(video);
        }
    });
})();