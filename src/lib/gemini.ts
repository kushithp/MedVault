import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RadiologyAnalysis {
  reportType: string;
  bodyPart: string;
  simpleSummary: string;
  keyFindings: string[];
  abnormalFindings: string[];
  normalFindings: string[];
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidenceScore: number;
  recommendations: string[];
  questionsForDoctor: string[];
  medicalTerms: Record<string, string>;
  fullSummary: string; // Markdown formatted for detailed view
}

export const analyzeMedicalReport = async (text: string): Promise<RadiologyAnalysis> => {
  const prompt = `You are an expert radiologist and medical assistant. Analyze the following medical report text and provide a structured JSON response.
  
  IMPORTANT RULES:
  - Explain findings in SIMPLE, non-medical language for the "simpleSummary" and "fullSummary".
  - Be specific about "abnormalFindings" (e.g. "Mild disc bulge at L4-L5").
  - Be specific about "normalFindings" (e.g. "Lungs are clear").
  - Assign a "riskLevel": 'Low' (mild findings), 'Moderate' (requires follow-up), 'High' (urgent intervention suggested), 'Critical' (emergency).
  - Provide a "confidenceScore" between 0 and 1 based on the clarity of the input text.
  - Generate "questionsForDoctor" that the patient can ask.
  - Explain difficult medical terms in "medicalTerms" object.
  - In "fullSummary", provide a detailed Markdown explanation including lifestyle tips.
  
  Report Text:
  ${text}
  
  Required JSON Schema:
  {
    "reportType": "string (e.g. MRI, X-Ray, Blood Report)",
    "bodyPart": "string (e.g. Brain, Lumbar Spine)",
    "simpleSummary": "string",
    "keyFindings": ["string"],
    "abnormalFindings": ["string"],
    "normalFindings": ["string"],
    "riskLevel": "Low | Moderate | High | Critical",
    "confidenceScore": number,
    "recommendations": ["string"],
    "questionsForDoctor": ["string"],
    "medicalTerms": { "term": "easy explanation" },
    "fullSummary": "string (Markdown)"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "{}");
};

export const compareReports = async (oldText: string, newText: string) => {
  const prompt = `Compare these two medical reports and highlight major changes, improvements, or worsening conditions.
  
  Old Report:
  ${oldText}
  
  New Report:
  ${newText}
  
  Provide the comparison in Markdown with sections:
  ### 📈 Progression Analysis
  ### ✅ Improvements
  ### ⚠️ New Findings or Worsening
  ### 🩺 Doctor Discussion Points`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "";
};

export const summarizeReport = async (text: string) => {
  const analysis = await analyzeMedicalReport(text);
  return analysis.fullSummary;
};

export const extractDataFromText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract medicine names, dosages, and schedules from this medical text. Return a JSON array of objects with keys: name, dosage, schedule.
    
    Text:
    ${text}`,
    config: {
      responseMimeType: "application/json",
    }
  });
  
  return JSON.parse(response.text || "[]");
};
