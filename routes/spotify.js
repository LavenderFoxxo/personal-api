const router = require('express').Router()
const SpotifyWebApi = require("spotify-web-api-node");
require('dotenv').config()

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFYCLIENTID,
    clientSecret: process.env.SPOTIFYCLIENTSECRET,
    redirectUri: 'https://api.itsalexander.dev/spotify/callback'
});

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

let spotifytoken;

router.get('/toptracks', async (req, res) => {
    try {
        await spotifyApi.getMyTopTracks().then(function (data) {
            return res.status(200).json({ message: 'Success!', data: data })
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'A error has occured fetching the requested data.', error: err })
    }
})

router.get('/login', async (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
})

router.get('/callback', async (req, res) => {
    try {
        const error = req.query.error;
        const code = req.query.code;

        if (error) {
            return res.status(500).json({ message: 'A error occured while signing into Spotify.', err: error })
        }

        spotifyApi
            .authorizationCodeGrant(code)
            .then(data => {
                const access_token = data.body['access_token'];
                const refresh_token = data.body['refresh_token'];
                const expires_in = data.body['expires_in'];

                spotifyApi.setAccessToken(access_token);
                spotifyApi.setRefreshToken(refresh_token);

                res.status(200).json({ message: 'Success!' })

                setInterval(async () => {
                    const data = await spotifyApi.refreshAccessToken();
                    const access_token = data.body['access_token'];

                    spotifytoken = data.body['access_token'];

                    spotifyApi.setAccessToken(access_token);
                }, expires_in / 2 * 1000);
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'A error has occured fetching the requested data.', error: err })
    }
})

module.exports = router;