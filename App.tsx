import React, { useState } from 'react';
import { AppState, FormData } from './types';
import { INITIAL_FORM_STATE } from './constants';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { analyzeInteraction, generateVisualization } from './services/geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [appState, setAppState] = useState<AppState>({
    step: 'input',
    loadingMessage: '',
    error: null,
    result: null
  });

  const handleAnalysis = async () => {
    if (!formData.ligandFile) return;

    setAppState({ ...appState, step: 'analyzing', loadingMessage: 'Initializing molecular dynamics simulation...', error: null });

    try {
      // 1. Perform Text Analysis
      setAppState(prev => ({ ...prev, loadingMessage: 'Analyzing ligand-receptor interaction & calculating binding energy...' }));
      
      const receptorName = formData.receptorMode === 'preset' 
        ? formData.selectedReceptor 
        : (formData.receptorFile?.name || 'Custom Receptor');

      const analysisResult = await analyzeInteraction(
        formData.ligandFile,
        receptorName,
        formData.cancerType,
        formData.cancerClass,
        formData.receptorFile || undefined
      );

      // 2. Generate Images in Parallel
      setAppState(prev => ({ ...prev, loadingMessage: 'Generating high-fidelity 3D visualizations and pathway maps...' }));

      // Prompt Engineering for Images based on Analysis
      const ligandName = formData.ligandFile.name.replace('.pdb', '');
      const is8HQ = analysisResult.predictedCellResponse.toLowerCase().includes('apoptosis') || analysisResult.predictedCellResponse.toLowerCase().includes('necrosis');
      
      const prompt3D = `
        A highly detailed, photorealistic 3D molecular visualization of the ligand ${ligandName} docked into the binding pocket of ${receptorName}.
        Show the protein secondary structure (alpha helices and beta sheets) in ribbon format (cyan/blue). 
        Show the ligand in stick representation (orange/yellow) with binding residues labeled.
        Visualize hydrogen bonds as dotted lines. 
        Scientific, medical illustration style, clean white background, high resolution.
      `;

      const promptPathway = `
        A biological pathway diagram illustrating the ${analysisResult.pathwayName}.
        Show signaling cascades involving ${analysisResult.genesActivated.join(', ')} and enzymes ${analysisResult.enzymesInvolved.join(', ')}.
        Flowchart style, professional scientific publication quality, clear arrows, distinct nodes for proteins/genes.
        White background.
      `;

      const promptCell = `
        A cellular organelle-level illustration showing ${analysisResult.predictedCellResponse} in a ${formData.cancerType} cell.
        ${is8HQ ? 'Show mitochondrial membrane damage, ROS generation (glowing red dots), cytochrome-c release, and chromatin condensation.' : 'Show cellular structural changes.'}
        Detailed cross-section of the cell showing Nucleus, ER, and Mitochondria. 
        Medical illustration style, high contrast.
      `;

      // Trigger generations
      const [img3D, imgPathway, imgCell] = await Promise.all([
        generateVisualization(prompt3D),
        generateVisualization(promptPathway),
        generateVisualization(promptCell)
      ]);

      setAppState({
        step: 'results',
        loadingMessage: '',
        error: null,
        result: {
          ...analysisResult,
          visualization3D: img3D,
          pathwayDiagram: imgPathway,
          cellularIllustration: imgCell
        }
      });

    } catch (error: any) {
      console.error(error);
      setAppState({
        step: 'input',
        loadingMessage: '',
        error: error.message || "An unexpected error occurred during analysis.",
        result: null
      });
    }
  };

  const reset = () => {
    setAppState({ step: 'input', loadingMessage: '', error: null, result: null });
    setFormData(INITIAL_FORM_STATE);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">OncoBind <span className="text-teal-600">AI</span></h1>
          </div>
          <div className="text-xs font-medium text-slate-500 hidden sm:block">
            Biomedical Interaction Analysis v2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {appState.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {appState.error}
          </div>
        )}

        {appState.step === 'input' && (
           <InputSection 
             formData={formData} 
             setFormData={setFormData} 
             onSubmit={handleAnalysis}
             isProcessing={false}
           />
        )}

        {appState.step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-8 h-8 text-teal-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Processing Data</h3>
            <p className="text-slate-500 max-w-md text-center animate-pulse">{appState.loadingMessage}</p>
          </div>
        )}

        {appState.step === 'results' && appState.result && (
          <ResultsSection result={appState.result} onReset={reset} />
        )}

      </main>

      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 OncoBind AI. Research Use Only. Not for Clinical Diagnostics.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;