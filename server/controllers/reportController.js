const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client, TopicMessageSubmitTransaction } = require('@hashgraph/sdk');
const PatientReport = require('../models/PatientReport');
const { parseReport } = require('../utils/parseReport');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeText(text) {
  if (!text || text.trim() === '') return null; // Return null for empty or whitespace-only text
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or another suitable model
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes medical information concisely. If the text is too brief to summarize meaningfully, just return the original text." },
        { role: "user", content: `Summarize the following medical text:

${text}` }
      ],
      temperature: 0.7,
      max_tokens: 300, // Increased for a more elaborated summary
    });
    const summary = completion.choices[0].message.content;
    // If the summary is very short or seems unhelpful, return the original text
    if (!summary || summary.split(' ').length < 5) { // Example: if summary is less than 5 words
      return text;
    }
    return summary;
  } catch (error) {
    console.error("Error summarizing text with OpenAI:", error);
    return text; // Return original text on error
  }
}

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

    const reportsWithSummaries = await Promise.all(reports.map(async (report) => {
      const parsedData = report.parsedData || {};
      const combinedText = [
        parsedData.diagnosis,
        parsedData.riskLevel,
        parsedData.remarks
      ].filter(Boolean).join(' ');

      const overallSummary = await summarizeText(combinedText);
      const summarizedPrecautions = await summarizeText(parsedData.precautions);
      const summarizedDosAndDonts = await summarizeText(parsedData.dosAndDonts);

      return {
        ...report.toObject(),
        overallSummary,
        summarizedPrecautions,
        summarizedDosAndDonts,
      };
    }));

    return res.json({ status: 'success', reports: reportsWithSummaries });
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


