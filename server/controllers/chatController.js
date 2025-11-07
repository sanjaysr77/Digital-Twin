const express = require('express');
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/chat
// body: { summary: string, messages: [{ role: 'user'|'assistant', content: string }] }
module.exports.chatWithSummary = async (req, res) => {
  try {
    const { summary, messages } = req.body || {};
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
    }
    if (!summary || typeof summary !== 'string') {
      return res.status(400).json({ error: 'summary is required' });
    }
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const systemPrompt = `You are a medical report assistant. Use the following overall summary as authoritative context for the conversation. Provide clear, concise, patient-friendly explanations, and do not invent facts not supported by the summary. If unsure, suggest consulting a clinician.\n\nOVERALL SUMMARY:\n${summary}`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: String(m.content || '') })),
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.3,
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    console.error('OpenAI chat error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to get chat response' });
  }
};
