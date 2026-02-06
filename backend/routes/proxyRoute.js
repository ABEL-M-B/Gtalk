const express = require('express');
const router = express.Router();
const https = require('https');

router.get('/avatar', (req, res) => {
    const imageUrl = req.query.url;
    
    if (!imageUrl || !imageUrl.includes('googleusercontent.com')) {
        return res.status(400).send('Invalid URL');
    }

    https.get(imageUrl, (response) => {
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        response.pipe(res);
    }).on('error', (err) => {
        res.status(500).send('Error fetching image');
    });
});

module.exports = router;
