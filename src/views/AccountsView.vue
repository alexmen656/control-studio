<template>
    <div>
        <h1>Accounts</h1>
        <div>
            <p>YouTube</p>
            <button @click="connectYouTube">Connect</button>
        </div>
        <div>
            <p>Instagram</p>
            <button @click="connectInstagram">Connect</button>
        </div>
        <div>
            <p>Tiktok</p>
            <button @click="connectTiktok">Connect</button>
        </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            baseurl: 'http://localhost:6709/api/'
        }
    },
    methods: {
        connectYouTube() {
            axios.post(`${this.baseurl}connect/youtube`)
                .then(response => {
                    //window.location.href = response.data.authUrl;
                    console.log('YouTube connection initiated');
                })
                .catch(error => {
                    console.error('Error connecting to YouTube:', error);
                });
        },
        connectInstagram() {
            axios.post(`${this.baseurl}connect/instagram`)
                .then(response => {
                    //window.location.href = response.data.authUrl;
                    console.log('Instagram connection initiated');
                })
                .catch(error => {
                    console.error('Error connecting to Instagram:', error);
                });
        },
        connectTiktok() {
            axios.post(`${this.baseurl}connect/tiktok`)
                .then(response => {
                    //window.location.href = response.data.authUrl;
                    console.log('Tiktok connection initiated');
                })
                .catch(error => {
                    console.error('Error connecting to Tiktok:', error);
                });
        }
    }
}
</script>