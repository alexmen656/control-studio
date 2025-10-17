
// stolen from my youtube bot project hehehehe

import fs from 'fs/promises';
import { google } from 'googleapis';
import readline from 'readline';
import fs2 from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = 'token.json';

/**
 * Authorize the app and upload a video.
 * @param {string} videoFile - The path to the video file.
 */
export async function uploadVideo(videoFile) {
    console.log('Starting upload process...');
    try {
        const auth = await authorize();

        if (auth.authUrl) {
            console.log('Authentication required. Visit:', auth.authUrl);
            return { authUrl: auth.authUrl };
        }

        console.log('Credentials loaded, uploading video...');
        return await uploadToYouTube(auth, videoFile);
    } catch (err) {
        console.error('Error during upload process:', err);
        throw err;
    }
}

export async function authorize() {
    try {
        const content = await fs.readFile('/Users/alexpolan/social-media-manager/backend/platforms/credentials.json', 'utf-8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(content);
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:6709/api/oauth2callback/youtube');

        try {
            const token = await fs.readFile(TOKEN_PATH, 'utf-8');
            console.log('Token found');
            oAuth2Client.setCredentials(JSON.parse(token));
            return oAuth2Client;
        } catch {
            console.log('No token found, need to get a new one');
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            return { authUrl };
        }
    } catch (err) {
        console.error('Error loading credentials.json:', err);
        throw err;
    }
}


function getNewToken(oAuth2Client) {//callback
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    return JSON.stringify({ 'authUrl': authUrl });
    /*console.log('Authorize this app by visiting this URL:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error('Error retrieving access token', err);
                return;
            }
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            console.log('Token stored to', TOKEN_PATH);
            callback(oAuth2Client);
        });
    });*/
}

async function uploadToYouTube(auth, videoFile) {
    const youtube = google.youtube({ version: 'v3', auth });

    //console.log('Reading video file into buffer... ', videoFile);
    // const videoBuffer = await fs.readFile(videoFile.path);

    return new Promise((resolve, reject) => {
        youtube.videos.insert(
            {
                resource: {
                    snippet: {
                        title: 'My AI Reddit Story',
                        description: 'Automatically uploaded by my bot!',
                        tags: ['Reddit', 'Minecraft', 'AI Story'],
                        categoryId: '22', // Category 22 = People & Blogs
                    },
                    status: {
                        privacyStatus: 'public',
                    },
                },
                part: 'snippet,status',
                media: {
                    body: fs2.createReadStream(videoFile.path),
                },
            },
            (err, response) => {
                if (err) {
                    console.error('YouTube API error:', err);
                    reject(err);
                    return;
                }
                console.log('Video uploaded:', response.data);
                resolve(response.data);
            }
        );
    });
}