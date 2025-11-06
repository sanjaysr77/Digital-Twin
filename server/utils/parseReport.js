const fs = require('fs');
// With pdf-parse@1.1.1 the module is a callable function in CJS
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function parseReport(filePath) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    assert(!!apiKey, 'OPENAI_API_KEY is not set');

    // Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    assert(typeof pdfParse === 'function', 'pdf-parse module did not resolve to a function');
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData && pdfData.text ? pdfData.text : '';

    assert(!!pdfText && pdfText.trim().length > 0, 'PDF text extraction yielded empty content');

    const client = new OpenAI({ apiKey });

    const prompt = `You are a medical report parser. Read the following hospital report and extract key clinical information as structured JSON.\n\nReturn ONLY JSON with these keys:\n{\n  "diagnosisSummary": string,\n  "remarks": string,\n  "riskLevel": "Low" | "Moderate" | "High",\n  "contextText": string,\n  "emotionHints": {\n    "keywords": [string],\n    "inferredTone": string\n  },\n  "clinicalMetrics": {\n    "BP": { "value": string, "unit": string, "normalRange": string, "organ": "heart" },\n    "TSH": { "value": number, "unit": string, "normalRange": string, "organ": "thyroid" },\n    "HbA1c": { "value": number, "unit": string, "normalRange": string, "organ": "pancreas" }\n  }\n}\n\nUse the actual content of the PDF to fill these fields.\nIf a metric is missing, exclude it.\n\nReport Text:\n\n"""${pdfText}"""`;

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      text: { format: { type: 'json_object' } },
    });

    const text = response.output_text || '';
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error('parseReport failed:', err);
    throw err;
  }
}

module.exports = { parseReport };


