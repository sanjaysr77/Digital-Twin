const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadReport, getReportsByPatient, getPatientSummary } = require('../controllers/reportController');

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${safeOriginal}`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadReport);

router.get('/:patientId', getReportsByPatient);

router.get('/:patientId/summary', getPatientSummary);

module.exports = router;


