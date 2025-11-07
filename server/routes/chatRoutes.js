const express = require('express');
const { chatWithSummary } = require('../controllers/chatController');

const router = express.Router();

router.post('/', chatWithSummary);

module.exports = router;
