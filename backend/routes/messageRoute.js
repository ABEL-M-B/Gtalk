const express = require('express');
const router  = express.Router()
const messageController = require('../controllers/messageController')

router.get('/',messageController.getMessages)

router.post('/',messageController.sendMessage)

router.put('/mark-read',messageController.markMessagesAsRead)

router.get('/unread-count',messageController.getUnreadCount)

router.get('/unread-by-user',messageController.getUnreadByUser)

module.exports = router;