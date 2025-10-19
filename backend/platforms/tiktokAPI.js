import fs from 'fs/promises';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const PROJECT_ROOT = path.join(__dirname, '..', '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const TOKEN_PATH = path.join(ROOT_DIR, 'tiktok_token.json');
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const REDIRECT_URI = 'https://alex.polan.sk/tiktok_redirect.php';

const SCOPES = [
    'user.info.basic',
    'video.upload',
    'video.publish'
].join(',');

function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function authorize() {
    try {
        try {
            const token = await fs.readFile(TOKEN_PATH, 'utf-8');
            console.log('TikTok token found');
            const tokenData = JSON.parse(token);

            if (tokenData.expires_at && Date.now() < tokenData.expires_at) {
                return { accessToken: tokenData.access_token };
            } else {
                console.log('TikTok token expired, need to refresh or get new one');
            }
        } catch {
            console.log('No TikTok token found, need to get a new one');
        }

        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const csrfState = crypto.randomBytes(16).toString('hex');

        await fs.writeFile(path.join(ROOT_DIR, 'tiktok_oauth_state.json'), JSON.stringify({
            code_verifier: codeVerifier,
            csrf_state: csrfState
        }));

        const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
        authUrl.searchParams.append('client_key', TIKTOK_CLIENT_KEY);
        authUrl.searchParams.append('scope', SCOPES);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('state', csrfState);
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');

        return { authUrl: authUrl.toString() };
    } catch (err) {
        console.error('Error during TikTok authorization:', err);
        throw err;
    }
}

export async function exchangeCodeForToken(code, state) {
    try {
        const oauthState = JSON.parse(await fs.readFile(path.join(ROOT_DIR, 'tiktok_oauth_state.json'), 'utf-8'));

        if (state !== oauthState.csrf_state) {
            throw new Error('State mismatch - possible CSRF attack');
        }

        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                client_secret: TIKTOK_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code_verifier: oauthState.code_verifier
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to exchange code for token: ${errorText}`);
        }

        const tokenData = await response.json();

        const tokenWithExpiry = {
            ...tokenData,
            expires_at: Date.now() + (tokenData.expires_in * 1000)
        };

        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenWithExpiry, null, 2));
        console.log('TikTok token stored successfully');

        await fs.unlink(path.join(ROOT_DIR, 'tiktok_oauth_state.json')).catch(() => { });

        return tokenWithExpiry;
    } catch (err) {
        console.error('Error exchanging code for token:', err);
        throw err;
    }
}

export async function refreshAccessToken() {
    try {
        const tokenData = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));

        if (!tokenData.refresh_token) {
            throw new Error('No refresh token available');
        }

        const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            },
            body: new URLSearchParams({
                client_key: TIKTOK_CLIENT_KEY,
                client_secret: TIKTOK_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: tokenData.refresh_token
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to refresh token: ${errorText}`);
        }

        const newTokenData = await response.json();

        const tokenWithExpiry = {
            ...newTokenData,
            expires_at: Date.now() + (newTokenData.expires_in * 1000)
        };

        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenWithExpiry, null, 2));
        console.log('TikTok token refreshed successfully');

        return tokenWithExpiry;
    } catch (err) {
        console.error('Error refreshing token:', err);
        throw err;
    }
}

export async function uploadVideo(videoPath, title, description, privacyLevel = 'SELF_ONLY') {
    try {
        const tokenData = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
        const accessToken = tokenData.access_token;

        let chunkSize = 128 * 1024 * 1024; // 4MB
        const fileStat = await fs.stat(videoPath);
        let fileSize = fileStat.size;
        if (fileSize < chunkSize) {
            chunkSize = fileSize;
        }
        console.log({
            video: {
                title: title,
                //description: description,
                privacy_level: privacyLevel,
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000
            },
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: fileSize,
                chunk_size: String(chunkSize),
                total_chunk_count: Math.ceil(fileSize / chunkSize)
            }
        });

        console.log(`Uploading video of size ${fileSize} bytes in chunks of ${chunkSize} bytes`, String(Math.ceil(fileSize / chunkSize)));
        const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                post_info: {
                    title: title,
                    privacy_level: privacyLevel,
                    disable_duet: false,
                    disable_comment: true,
                    disable_stitch: false,
                    video_cover_timestamp_ms: 1000
                },
                source_info: {
                    source: 'FILE_UPLOAD',
                    video_size: fileSize,
                    chunk_size: chunkSize,
                    total_chunk_count: Math.ceil(fileSize / chunkSize)
                }
            })


        });

        if (!initResponse.ok) {
            const errorText = await initResponse.text();
            console.log('Init response status:', initResponse.status);
            console.log('Init response error:', errorText);
            throw new Error(`Failed to initialize upload: ${errorText}`);
        }

        const initData = await initResponse.json();
        console.log('Init response data:', JSON.stringify(initData, null, 2));
        const uploadUrl = initData.data.upload_url;
        const publishId = initData.data.publish_id;

        console.log('Upload URL:', uploadUrl);
        console.log('Publish ID:', publishId);

        const videoBuffer = await fs.readFile(videoPath);
        console.log('Video buffer size:', videoBuffer.length);

        const totalChunks = Math.ceil(fileSize / chunkSize);
        console.log(`Uploading ${totalChunks} chunk(s)`);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, fileSize);
            const chunk = videoBuffer.slice(start, end);

            console.log(`Uploading chunk ${i + 1}/${totalChunks}: bytes ${start}-${end - 1}/${fileSize}`);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/mp4',
                    'Content-Length': chunk.length.toString(),
                    'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
                },
                body: chunk
            });

            console.log('Upload response status:', uploadResponse.status);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.log('Upload response error:', errorText);
                throw new Error(`Failed to upload video chunk ${i + 1} (status ${uploadResponse.status}): ${errorText}`);
            }

            console.log(`Chunk ${i + 1} uploaded successfully`);
        }

        console.log('All chunks uploaded to TikTok successfully');
        return {
            publish_id: publishId,
            message: 'Video uploaded successfully'
        };
    } catch (err) {
        console.error('Error uploading video to TikTok:', err);
        throw err;
    }
}

export async function getUserInfo() {
    try {
        const tokenData = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
        const accessToken = tokenData.access_token;

        const response = await fetch('https://open.tiktokapis.com/v2/user/info/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get user info: ${errorText}`);
        }

        const userData = await response.json();
        return userData.data;
    } catch (err) {
        console.error('Error getting TikTok user info:', err);
        throw err;

    }
}

/*uploadVideo('/Users/alexpolan/social-media-manager/backend/uploads/1760536394562-892602474.MP4', 'Test Video', 'This is a test video upload', 'SELF_ONLY').then(response => {
    console.log('Upload response:', response);
}).catch(err => {
    console.error('Error uploading video:', err);
});*/