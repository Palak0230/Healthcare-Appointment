import dotenv from 'dotenv';
dotenv.config();
/**
 * Generate Pre-Visit AI Symptom Summary using Gemini/OpenAI or Fallback Engine
 */
export async function generatePreVisitSummary(symptoms) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const promptText = `You are a medical AI assistant. Analyze these patient symptoms and provide structured JSON response.
CRITICAL LLM INSTRUCTION:
"Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: ${symptoms}"

Format response STRICTLY as valid JSON matching this schema (do NOT include markdown formatting or backticks outside the JSON):
{
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH",
  "chiefComplaint": "Short summary of main symptom concern",
  "suggestedQuestions": [
    "Question 1 for doctor",
    "Question 2 for doctor",
    "Question 3 for doctor"
  ]
}`;
    if (geminiApiKey) {
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(promptText);
            const text = result.response.text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return {
                urgencyLevel: parsed.urgencyLevel?.toUpperCase() || 'MEDIUM',
                chiefComplaint: parsed.chiefComplaint || 'Patient presented with symptoms.',
                suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
                    ? parsed.suggestedQuestions.slice(0, 3)
                    : [
                        'What could be causing these symptoms?',
                        'Are there lifestyle modifications recommended?',
                        'What symptoms would require emergency evaluation?'
                    ]
            };
        }
        catch (err) {
            console.warn('Gemini API call failed, using graceful AI fallback:', err.message);
        }
    }
    else if (openaiApiKey) {
        try {
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: openaiApiKey });
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: promptText }],
                temperature: 0.2,
            });
            const content = response.choices[0]?.message?.content || '';
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return {
                urgencyLevel: parsed.urgencyLevel?.toUpperCase() || 'MEDIUM',
                chiefComplaint: parsed.chiefComplaint || 'Patient presented with symptoms.',
                suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
                    ? parsed.suggestedQuestions.slice(0, 3)
                    : [
                        'What could be causing these symptoms?',
                        'Are there lifestyle modifications recommended?',
                        'What symptoms would require emergency evaluation?'
                    ]
            };
        }
        catch (err) {
            console.warn('OpenAI API call failed, using graceful AI fallback:', err.message);
        }
    }
    // Fallback AI Symptom Analyzer when LLM API keys are not provided or error occurs
    return generateFallbackPreVisit(symptoms);
}
/**
 * Generate Post-Visit Patient-Friendly Summary from Doctor Clinical Notes
 */
export async function generatePostVisitSummary(notes, prescription) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const combinedInput = `Clinical Notes: ${notes}\nPrescription Details: ${prescription}`;
    const promptText = `You are a patient communication specialist.
CRITICAL LLM INSTRUCTION:
"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${combinedInput}"

Format response STRICTLY as valid JSON matching this schema:
{
  "patientFriendlySummary": "Clear, reassuring patient-friendly language explanation of the diagnosis and doctor's advice",
  "medicationSchedule": [
    {
      "medication": "Name of medicine",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. Twice daily after meals",
      "duration": "e.g. 7 days"
    }
  ],
  "followUpSteps": [
    "Step 1 (e.g. Drink plenty of water)",
    "Step 2 (e.g. Schedule follow-up visit in 2 weeks)"
  ]
}`;
    if (geminiApiKey) {
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(promptText);
            const text = result.response.text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return {
                patientFriendlySummary: parsed.patientFriendlySummary || 'Here is your post-visit summary based on doctor notes.',
                medicationSchedule: Array.isArray(parsed.medicationSchedule) ? parsed.medicationSchedule : [],
                followUpSteps: Array.isArray(parsed.followUpSteps) ? parsed.followUpSteps : ['Rest and hydrate well.']
            };
        }
        catch (err) {
            console.warn('Gemini API post-visit call failed, using fallback:', err.message);
        }
    }
    else if (openaiApiKey) {
        try {
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: openaiApiKey });
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: promptText }],
                temperature: 0.2,
            });
            const content = response.choices[0]?.message?.content || '';
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return {
                patientFriendlySummary: parsed.patientFriendlySummary || 'Here is your post-visit summary based on doctor notes.',
                medicationSchedule: Array.isArray(parsed.medicationSchedule) ? parsed.medicationSchedule : [],
                followUpSteps: Array.isArray(parsed.followUpSteps) ? parsed.followUpSteps : ['Rest and hydrate well.']
            };
        }
        catch (err) {
            console.warn('OpenAI API post-visit call failed, using fallback:', err.message);
        }
    }
    return generateFallbackPostVisit(notes, prescription);
}
// Heuristic Fallback for Pre-visit Symptoms
function generateFallbackPreVisit(symptoms) {
    const lower = symptoms.toLowerCase();
    let urgency = 'LOW';
    if (lower.includes('chest pain') ||
        lower.includes('shortness of breath') ||
        lower.includes('severe') ||
        lower.includes('high fever') ||
        lower.includes('bleeding') ||
        lower.includes('faint')) {
        urgency = 'HIGH';
    }
    else if (lower.includes('fever') ||
        lower.includes('cough') ||
        lower.includes('pain') ||
        lower.includes('vomiting') ||
        lower.includes('dizziness')) {
        urgency = 'MEDIUM';
    }
    const firstSentence = symptoms.split('.')[0] || symptoms;
    const chief = firstSentence.length > 80 ? firstSentence.substring(0, 77) + '...' : firstSentence;
    return {
        urgencyLevel: urgency,
        chiefComplaint: chief,
        suggestedQuestions: [
            `What are the key causes of ${chief}?`,
            'Are there specific food or activity restrictions during recovery?',
            'What symptoms indicate I should seek immediate follow-up care?'
        ]
    };
}
// Heuristic Fallback for Post-visit Clinical Notes
function generateFallbackPostVisit(notes, prescription) {
    const summaryText = `Thank you for attending your appointment. Your physician evaluated your condition (${notes}). Please follow the prescribed medication regimen and care guidelines below.`;
    const medsList = [];
    if (prescription && prescription.trim().length > 0) {
        const lines = prescription.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
        for (const line of lines) {
            medsList.push({
                medication: line,
                dosage: 'As prescribed',
                frequency: 'Daily',
                duration: '7 days'
            });
        }
    }
    if (medsList.length === 0) {
        medsList.push({
            medication: 'Prescribed Medication',
            dosage: 'Take as directed on packaging',
            frequency: 'Once or twice daily',
            duration: '5 to 7 days'
        });
    }
    return {
        patientFriendlySummary: summaryText,
        medicationSchedule: medsList,
        followUpSteps: [
            'Take all prescribed medications at scheduled times.',
            'Maintain proper hydration and adequate rest.',
            'Contact clinic or schedule follow-up if symptoms persist after 5 days.'
        ]
    };
}
