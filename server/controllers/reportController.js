const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client, TopicMessageSubmitTransaction } = require('@hashgraph/sdk');
const PatientReport = require('../models/PatientReport');
const { parseReport } = require('../utils/parseReport');

async function computeFileSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

module.exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFilePath = path.resolve(req.file.path);
    const reportHash = await computeFileSha256(uploadedFilePath);

    const { patientId, hospitalId } = req.body || {};
    if (!patientId || !hospitalId) {
      return res.status(400).json({ error: 'patientId and hospitalId are required' });
    }

    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const topicId = process.env.HEDERA_TOPIC_ID; // Optional

    if (!accountId || !privateKey) {
      return res.status(500).json({ error: 'Hedera credentials not configured' });
    }

    let hederaTxId = null;
    const timestamp = new Date().toISOString();

    if (topicId) {
      // Connect to Hedera Testnet and submit message when topicId is available
      const client = Client.forTestnet().setOperator(accountId, privateKey);
      const messagePayload = JSON.stringify({ patientId, reportHash, timestamp });

      const txResponse = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(messagePayload)
        .execute(client);

      hederaTxId = txResponse.transactionId.toString();
    }

    // Parse the uploaded report to populate parsedData (mocked)
    const parsedData = await parseReport(uploadedFilePath);

    const record = new PatientReport({
      patientId,
      hospitalId,
      reportHash,
      hederaTxId,
      uploadedAt: new Date(),
      parsedData,
    });

    const saved = await record.save();

    return res.json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process file', details: err.message });
  }
};

module.exports.getReportsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const reports = await PatientReport.find({ patientId }).sort({ uploadedAt: -1 });
    return res.json({ status: 'success', reports });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
};

module.exports.getPatientSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    // Fetch all reports sorted by newest first
    const reports = await PatientReport.find({ patientId }).sort({ uploadedAt: -1 });

    // Build text corpus from diagnosisSummary + remarks across all reports
    const parts = [];
    for (const r of reports) {
      const pd = r.parsedData || {};
      if (pd.diagnosisSummary) parts.push(pd.diagnosisSummary);
      if (pd.remarks) parts.push(pd.remarks);
    }
    const textCorpus = parts.join(' ');

    // Latest health metrics by metric name
    const healthMetrics = {};
    const pickFirst = (getter) => {
      for (const r of reports) {
        const val = getter(r.parsedData || {});
        if (val != null) return val;
      }
      return null;
    };

    healthMetrics.BP = pickFirst((pd) => pd.clinicalMetrics && pd.clinicalMetrics.BP ? pd.clinicalMetrics.BP.value : null);
    healthMetrics.TSH = pickFirst((pd) => pd.clinicalMetrics && pd.clinicalMetrics.TSH ? pd.clinicalMetrics.TSH.value : null);
    healthMetrics.HbA1c = pickFirst((pd) => pd.clinicalMetrics && pd.clinicalMetrics.HbA1c ? pd.clinicalMetrics.HbA1c.value : null);

    return res.json({ textCorpus, healthMetrics });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to build summary', details: err.message });
  }
};


