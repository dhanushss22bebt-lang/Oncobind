export enum CancerType {
  LUNG_CANCER = 'Lung Cancer',
  BREAST_CANCER = 'Breast Cancer',
  PROSTATE_CANCER = 'Prostate Cancer',
  COLORECTAL_CANCER = 'Colorectal Cancer',
  PANCREATIC_CANCER = 'Pancreatic Cancer',
  GLIOBLASTOMA = 'Glioblastoma',
  LEUKEMIA = 'Leukemia'
}

export enum CancerClass {
  ADENOCARCINOMA = 'Adenocarcinoma',
  SQUAMOUS_CELL_CARCINOMA = 'Squamous Cell Carcinoma',
  SMALL_CELL_CARCINOMA = 'Small Cell Carcinoma',
  TRIPLE_NEGATIVE = 'Triple-Negative Breast Cancer',
  DUCTAL_CARCINOMA = 'Ductal Carcinoma',
  SARCOMA = 'Sarcoma'
}

export interface InteractingResidue {
  residue: string;
  xyz: [number, number, number];
  interactionType: string;
}

export interface AnalysisResult {
  bindingEnergy: number; // kcal/mol
  ligandCentroid: [number, number, number];
  interactingResidues: InteractingResidue[];
  pathwayName: string;
  genesActivated: string[];
  enzymesInvolved: string[];
  predictedCellResponse: string;
  receptorUsed: string;
  cancerType: string;
  cancerClass: string;
  // Images will be stored here as base64 strings
  visualization3D?: string;
  pathwayDiagram?: string;
  cellularIllustration?: string;
  // Human readable summary
  summary?: string;
}

export interface AppState {
  step: 'input' | 'analyzing' | 'results';
  loadingMessage: string;
  error: string | null;
  result: AnalysisResult | null;
}

export interface FormData {
  ligandFile: File | null;
  receptorMode: 'preset' | 'upload';
  selectedReceptor: string;
  receptorFile: File | null;
  cancerType: CancerType;
  cancerClass: CancerClass;
}
