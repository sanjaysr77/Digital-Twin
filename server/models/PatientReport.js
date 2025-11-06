const mongoose = require('mongoose');

const EmotionHintsSchema = new mongoose.Schema(
  {
    keywords: [{ type: String }],
    inferredTone: { type: String },
  },
  { _id: false }
);

const ClinicalMetricStringSchema = new mongoose.Schema(
  {
    value: { type: String },
    unit: { type: String },
    normalRange: { type: String },
    organ: { type: String },
  },
  { _id: false }
);

const ClinicalMetricNumberSchema = new mongoose.Schema(
  {
    value: { type: Number },
    unit: { type: String },
    normalRange: { type: String },
    organ: { type: String },
  },
  { _id: false }
);

const ClinicalMetricsSchema = new mongoose.Schema(
  {
    BP: { type: ClinicalMetricStringSchema },
    TSH: { type: ClinicalMetricNumberSchema },
    HbA1c: { type: ClinicalMetricNumberSchema },
  },
  { _id: false }
);

const ParsedDataSchema = new mongoose.Schema(
  {
    diagnosisSummary: { type: String },
    remarks: { type: String },
    riskLevel: { type: String },
    contextText: { type: String },
    emotionHints: { type: EmotionHintsSchema },
    clinicalMetrics: { type: ClinicalMetricsSchema },
  },
  { _id: false }
);

const PatientReportSchema = new mongoose.Schema(
  {
    patientId: { type: String },
    hospitalId: { type: String },
    reportHash: { type: String },
    hederaTxId: { type: String },
    uploadedAt: { type: Date },
    parsedData: { type: ParsedDataSchema },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('PatientReport', PatientReportSchema);


