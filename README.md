# Control Studio
Control Studio is very basic app which lets to upload videos to multiple plattforms at once or even to schedule them, currently supported plattforms are: Instagram, Facebook, TikTok and YouTube

## Project Setup

```sh
npm install
```

### Start frontend on port 5185, it has to be 5185!!!

```sh
npm run dev -- --port 5185
```

### Go to backend dir
```sh
cd backend
```

### Start backend
```sh
node server.js
```

### Additionally you need to add your .env file, with this values:

```sh
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here

IG_APP_ID=your_instagram_app_id_here
IG_APP_SECRET=your_instagram_app_secret_here
```

### And in backend/plattforms/ you need to add credentials.json, you can this file from Google Cloud, it looks like this:

```sh
{
  "client_id": "",
  "project_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_secret": "",
  "redirect_uris": [ your redirects uris here ],
  "javascript_origins": [
   your origins here
  ]
}
```

### Start scheduler script

```sh
cd backend
```

```sh
node scheduler.js
```



## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
