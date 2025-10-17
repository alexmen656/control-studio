import dotenv from 'dotenv';
dotenv.config({ path: '.env' })

export function InstagramAuth() {
    const appId = process.env.IG_APP_ID;
    const appSecret = process.env.IG_APP_SECRET;
    const redirectUri = 'http://localhost:6709/api/oauth2callback/instagram';

    if (!appId || !appSecret) {
        console.error('Instagram App ID and App Secret must be set in environment variables.');
        process.exit(1);
    }


    const scope = 'instagram_basic,instagram_content_publish,pages_read_engagement';
    let authUrl = 'https://www.facebook.com/v14.0/dialog/oauth';
    authUrl += '?client_id=' + encodeURIComponent(appId);
    authUrl += '&redirect_uri=' + encodeURIComponent(redirectUri);
    authUrl += '&scope=' + encodeURIComponent(scope);
    //authUrl += '&state=' + encodeURIComponent(state);

    return { auth_url: authUrl };
}

//console.log(InstagramAuth());