/**
 * scoring.js
 * - Rule layer: up to 50 points
 * - AI layer: Gemini (map: High=50, Medium=30, Low=10)
 * - Final score = ruleScore + aiPoints (clamped to 100)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

function roleRelevance(roleStr) {
  if (!roleStr) return 0;
  const r = roleStr.toLowerCase();
  const decision = ['ceo','founder','co-founder','cto','cfo','chief','head of','vp','vice president','director','owner','managing director','president','head'];
  const influencer = ['manager','lead','principal','senior','associate','specialist','analyst','coordinator','consultant','evangelist','growth'];
  if (decision.some(k => r.includes(k))) return 20;
  if (influencer.some(k => r.includes(k))) return 10;
  return 0;
}

function industryMatch(leadIndustry, offer) {
  if (!leadIndustry) return 0;
  const lead = leadIndustry.toLowerCase();
  const cases = (offer.ideal_use_cases || []).map(s => s.toLowerCase());
  for (const ic of cases) {
    if (lead === ic) return 20; // exact
  }
  for (const ic of cases) {
    if (lead.includes(ic) || ic.includes(lead)) return 10;
  }
  const synonyms = {
    'saas': ['software','cloud'],
    'healthcare': ['health','medical'],
    'fintech': ['finance','bank','financial'],
  };
  for (const [k, arr] of Object.entries(synonyms)) {
    if (cases.join(' ').includes(k) && arr.some(s => lead.includes(s))) return 10;
  }
  return 0;
}

function dataCompleteness(lead) {
  const fields = ['name','role','company','industry','location','linkedin_bio'];
  for (const f of fields) {
    if (!lead[f] || String(lead[f]).trim() === '') return 0;
  }
  return 10;
}

// Build a concise prompt
function buildPrompt(lead, offer) {
  return `
Product / Offer:
Name: ${offer.name}
Value props: ${Array.isArray(offer.value_props) ? offer.value_props.join('; ') : offer.value_props}
Ideal use cases / ICP: ${Array.isArray(offer.ideal_use_cases) ? offer.ideal_use_cases.join('; ') : offer.ideal_use_cases}

Prospect:
Name: ${lead.name || 'N/A'}
Role: ${lead.role || 'N/A'}
Company: ${lead.company || 'N/A'}
Industry: ${lead.industry || 'N/A'}
Location: ${lead.location || 'N/A'}
LinkedIn bio: ${lead.linkedin_bio || ''}

Task:
Classify this prospect's buying intent for the product as exactly one of: High, Medium, Low.
Then provide a 1-2 sentence explanation tying back to role, industry, and fit.
Respond in the exact format:
Intent: <High|Medium|Low>
Explanation: <one or two sentences>
`.trim();
}

function parseAIResponse(text) {
  const out = { intent: 'Low', explanation: '' };
  if (!text) return out;
  if (/\bIntent\s*:\s*High\b/i.test(text) || /\bHigh\b/i.test(text) && !/\bLow\b/i.test(text)) out.intent = 'High';
  else if (/\bIntent\s*:\s*Medium\b/i.test(text) || /\bMedium\b/i.test(text)) out.intent = 'Medium';
  else if (/\bIntent\s*:\s*Low\b/i.test(text) || /\bLow\b/i.test(text)) out.intent = 'Low';
  // Try to pull explanation
  const m = text.match(/Explanation\s*:\s*([\s\S]*)/i);
  if (m && m[1]) out.explanation = m[1].trim().split('\n')[0];
  else {
    const parts = text.split('\n').map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) out.explanation = parts[1];
    else out.explanation = parts[0] || '';
  }
  return out;
}

function simpleHeuristicIntent(lead, offer) {
  const roleScore = roleRelevance(lead.role || '');
  const indScore = industryMatch(lead.industry || '', offer);
  const completeness = dataCompleteness(lead);
  const ruleScore = roleScore + indScore + completeness;
  if (ruleScore >= 35) return 'High';
  if (ruleScore >= 20) return 'Medium';
  return 'Low';
}

async function callAIForIntent(lead, offer) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!GEMINI_KEY) {
    const heuristic = simpleHeuristicIntent(lead, offer);
    return { intent: heuristic, explanation: 'Fallback heuristic used because GEMINI_API_KEY not set.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = buildPrompt(lead, offer);
    const result = await model.generateContent(prompt);
    // result.response may contain a text() helper
    const text = (result?.response?.text?.()) ? result.response.text().trim() : (result?.response?.content || '').toString();
    return parseAIResponse(text || '');
  } catch (err) {
    console.warn('Gemini call failed:', err?.message || err);
    const intent = simpleHeuristicIntent(lead, offer);
    return { intent, explanation: 'Gemini call failed; used heuristic.' };
  }
}

async function scoreLeads(leads, offer) {
  const results = [];
  for (const lead of leads) {
    const rRole = roleRelevance(lead.role);
    const rIndustry = industryMatch(lead.industry, offer);
    const rComplete = dataCompleteness(lead);
    const ruleScore = rRole + rIndustry + rComplete; // max 50

    let ai;
    try {
      ai = await callAIForIntent(lead, offer);
    } catch (err) {
      ai = { intent: simpleHeuristicIntent(lead, offer), explanation: 'AI failed; fallback used.' };
    }

    const aiPoints = ai.intent === 'High' ? 50 : (ai.intent === 'Medium' ? 30 : 10);
    const finalScore = Math.min(100, ruleScore + aiPoints);

    results.push({
      name: lead.name,
      role: lead.role,
      company: lead.company,
      intent: ai.intent,
      score: finalScore,
      reasoning: ai.explanation || ''
    });
  }
  return results;
}

module.exports = { scoreLeads, roleRelevance, industryMatch, dataCompleteness };
