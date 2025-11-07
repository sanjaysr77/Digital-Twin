const express = require('express');
const { chatWithSummary, chatInsight } = require('../controllers/chatController');

const router = express.Router();

router.post('/', chatWithSummary);
router.post('/insight', chatInsight);

module.exports = router;
