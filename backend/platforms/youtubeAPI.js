import fs from 'fs/promises';
import { google } from 'googleapis';
import fs2 from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = path.join(__dirname, '..');
const TOKENS_DIR = path.join(BACKEND_DIR, 'tokens');

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = path.join(TOKENS_DIR, 'youtube_token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

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
        const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(content);
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:6709/api/oauth2callback/youtube');

        try {
            const token = await fs.readFile(TOKEN_PATH, 'utf-8');
            const tokenData = JSON.parse(token);

            if (!tokenData.refresh_token) {
                const authUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    prompt: 'consent',
                    scope: SCOPES,
                });
                return { authUrl };
            }

            oAuth2Client.setCredentials(tokenData);
            return oAuth2Client;
        } catch {
            console.log('No token found, need to get a new one');
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: SCOPES,
            });
            return { authUrl };
        }
    } catch (err) {
        console.error('Error loading credentials.json:', err);
        throw err;
    }
}

export async function getTokenFromCode(code) {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const { client_secret, client_id, redirect_uris } = JSON.parse(content);
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:6709/api/oauth2callback/youtube');

    const tokenResponse = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokenResponse.tokens);

    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenResponse.tokens, null, 2));
    console.log('Token stored to', TOKEN_PATH);
}

async function uploadToYouTube(auth, videoFile) {
    const youtube = google.youtube({ version: 'v3', auth });

    return new Promise((resolve, reject) => {
        youtube.videos.insert(
            {
                resource: {
                    snippet: {
                        title: 'My AI Reddit Story',
                        description: 'Automatically uploaded by my bot!',
                        tags: ['Reddit', 'Minecraft', 'AI Story'],
                        categoryId: '22',
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