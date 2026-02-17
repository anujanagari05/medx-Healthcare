import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-3-flash-preview";

export interface HealthAnalysisResponse {
  severity: 'normal' | 'moderate' | 'severe';
  advice: string;
  suggestedAction: string;
}

export const analyzeSymptoms = async (symptoms: string): Promise<HealthAnalysisResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Patient reports the following symptoms: "${symptoms}". Analyze the condition.`,
      config: {
        systemInstruction: `You are MedX AI, a medical triage assistant. 
        Analyze the user's symptoms and categorize them into one of three severity levels:
        1. 'normal': Mild issues like common cold, slight headache. Suggest home remedies.
        2. 'moderate': Persisting issues requiring professional look. Suggest doctor consultation.
        3. 'severe': Critical issues like chest pain, severe breathing trouble, major trauma. Suggest emergency dispatch immediately.
        
        Provide helpful, calm advice.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['normal', 'moderate', 'severe'] },
            advice: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
          },
          required: ['severity', 'advice', 'suggestedAction'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as HealthAnalysisResponse;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      severity: 'normal',
      advice: "I'm having trouble connecting to the medical database. Please consult a doctor manually if you feel unwell.",
      suggestedAction: "Monitor symptoms"
    };
  }
};