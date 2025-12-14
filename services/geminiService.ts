import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to encode file to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:application/octet-stream;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeInteraction = async (
  ligandFile: File,
  receptorName: string,
  cancerType: string,
  cancerClass: string,
  receptorFile?: File
): Promise<AnalysisResult> => {

  // We process the file but primarily use the metadata for this simulation to keep it fast
  const ligandBase64 = await fileToGenerativePart(ligandFile);
  let receptorContext = `Receptor: ${receptorName}`;

  if (receptorFile) {
    receptorContext += ` (Custom file: ${receptorFile.name})`;
  }

  const prompt = `
    Perform a complete ligand–receptor interaction analysis for oncology research.
    
    Context:
    - Ligand File: ${ligandFile.name}
    - Receptor: ${receptorContext}
    - Cancer Type: ${cancerType}
    - Cancer Class: ${cancerClass}

    Rules:
    1. Analyze the ligand structure (assume standard PDB format content).
    2. CHECK FOR 8-HYDROXYQUINOLINE (8-HQ) SCAFFOLD. 
       - IF DETECTED: The predicted cellular outcome MUST be 'Apoptosis' or 'Necrosis'. 
       - Metabolic pathway MUST include: ROS generation, mitochondrial membrane damage, cytochrome-c release, caspase activation.
    3. Predict binding energy (kcal/mol) and interacting residues.
    4. Predict downstream pathways.

    Output format: JSON ONLY. No markdown fencing. 
    Structure:
    {
      "bindingEnergy": number,
      "ligandCentroid": [x, y, z],
      "interactingResidues": [{"residue": string, "xyz": [x, y, z], "interactionType": string}],
      "pathwayName": string,
      "genesActivated": [string],
      "enzymesInvolved": [string],
      "predictedCellResponse": string,
      "summary": string (A clear, concise human-readable summary explaining the mechanism)
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bindingEnergy: { type: Type.NUMBER },
          ligandCentroid: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          interactingResidues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                residue: { type: Type.STRING },
                xyz: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                interactionType: { type: Type.STRING }
              }
            }
          },
          pathwayName: { type: Type.STRING },
          genesActivated: { type: Type.ARRAY, items: { type: Type.STRING } },
          enzymesInvolved: { type: Type.ARRAY, items: { type: Type.STRING } },
          predictedCellResponse: { type: Type.STRING },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis generated");

  const jsonResult = JSON.parse(text);

  return {
    ...jsonResult,
    receptorUsed: receptorName,
    cancerType,
    cancerClass
  };
};

export const generateVisualization = async (prompt: string): Promise<string | undefined> => {
  try {
    // Use Imagen 3.0 via generateImages for reliable image generation
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return `data:image/jpeg;base64,${imageBytes}`;
    }
    return undefined;
  } catch (e) {
    console.error("Image generation failed", e);
    return undefined;
  }
};