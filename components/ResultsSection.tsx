import React from 'react';
import { AnalysisResult } from '../types';
import { Button } from './Button';

interface ResultsSectionProps {
  result: AnalysisResult;
  onReset: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-slate-800' }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-lg font-bold truncate ${color}`}>{value}</p>
  </div>
);

const ImageCard: React.FC<{ title: string; src?: string }> = ({ title, src }) => (
  <div className="group relative bg-slate-900 rounded-xl overflow-hidden aspect-square border border-slate-700 shadow-lg">
    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all z-10 flex items-center justify-center">
        {!src && <span className="text-slate-400 text-sm animate-pulse">Generating Visualization...</span>}
    </div>
    {src && (
      <img src={src} alt={title} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-110" />
    )}
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-20">
      <h4 className="text-white font-semibold text-sm">{title}</h4>
    </div>
  </div>
);

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result, onReset }) => {
  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Analysis Report</h2>
          <p className="text-slate-500">
            {result.cancerType} • {result.cancerClass} • {result.receptorUsed}
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>New Analysis</Button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Binding Energy" 
          value={`${result.bindingEnergy.toFixed(2)} kcal/mol`} 
          color="text-teal-600"
        />
        <StatCard 
          label="Ligand Centroid" 
          value={`[${result.ligandCentroid.map(n => n.toFixed(1)).join(', ')}]`} 
        />
        <StatCard 
          label="Interaction Count" 
          value={result.interactingResidues.length} 
        />
        <StatCard 
          label="Cell Response" 
          value={result.predictedCellResponse} 
          color={result.predictedCellResponse.toLowerCase().includes('apoptosis') ? 'text-red-500' : 'text-blue-600'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Main Content: Summary & Residues */}
        <div className="lg:col-span-2 space-y-6">
            
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Executive Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {result.summary}
            </p>
          </div>

          {/* Residues Table */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Interacting Residues</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Residue</th>
                    <th className="px-6 py-3">Coordinates (XYZ)</th>
                    <th className="px-6 py-3">Interaction Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.interactingResidues.map((res, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-700">{res.residue}</td>
                      <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                        {res.xyz.map(n => n.toFixed(1)).join(', ')}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                          {res.interactionType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pathway Details */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pathway Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Activated Genes</h4>
                    <div className="flex flex-wrap gap-2">
                        {result.genesActivated.map((g, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">{g}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Enzymes Involved</h4>
                    <div className="flex flex-wrap gap-2">
                        {result.enzymesInvolved.map((e, i) => (
                            <span key={i} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">{e}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Primary Pathway</h4>
                <p className="text-slate-800 font-semibold">{result.pathwayName}</p>
            </div>
          </div>

        </div>

        {/* Visualizations Column */}
        <div className="space-y-4">
            <div className="bg-teal-700 rounded-xl p-4 text-white mb-4">
                <h3 className="font-bold text-lg mb-1">Visual Intelligence</h3>
                <p className="text-teal-200 text-xs">AI-generated structural and cellular projections.</p>
            </div>
            <ImageCard title="3D Docking Visualization" src={result.visualization3D} />
            <ImageCard title="Pathway Diagram" src={result.pathwayDiagram} />
            <ImageCard title="Cellular Response (Apoptosis/Necrosis)" src={result.cellularIllustration} />
        </div>
      </div>
    </div>
  );
};
