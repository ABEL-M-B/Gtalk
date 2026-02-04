const express = require('express');
const router = express.Router();
const {uploadImageMessage} = require('../controllers/imageController');
const upload = require('../middleware/uploadImage');

// future include  middleware isauthenticated check
router.post('/upload', upload.single('image'),uploadImageMessage);

module.exports = router;