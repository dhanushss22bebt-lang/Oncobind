import { CancerType, CancerClass } from './types';

export const CANCER_TYPES = Object.values(CancerType);
export const CANCER_CLASSES = Object.values(CancerClass);

export const PRESET_RECEPTORS = [
  { id: 'STAT3', name: 'STAT3 (Signal Transducer and Activator of Transcription 3)' },
  { id: 'EGFR', name: 'EGFR (Epidermal Growth Factor Receptor)' },
  { id: 'VEGFR', name: 'VEGFR (Vascular Endothelial Growth Factor Receptor)' },
  { id: 'PD-L1', name: 'PD-L1 (Programmed Death-Ligand 1)' },
  { id: 'KRAS', name: 'KRAS (Kirsten Rat Sarcoma Viral Oncogene)' }
];

export const INITIAL_FORM_STATE = {
  ligandFile: null,
  receptorMode: 'preset' as const,
  selectedReceptor: 'STAT3',
  receptorFile: null,
  cancerType: CancerType.LUNG_CANCER,
  cancerClass: CancerClass.ADENOCARCINOMA
};
