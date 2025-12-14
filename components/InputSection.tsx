import React, { ChangeEvent } from 'react';
import { FormData } from '../types';
import { CANCER_TYPES, CANCER_CLASSES, PRESET_RECEPTORS } from '../constants';
import { Button } from './Button';

interface InputSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  formData, 
  setFormData, 
  onSubmit,
  isProcessing 
}) => {

  const handleFileChange = (field: 'ligandFile' | 'receptorFile') => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Configure Analysis</h2>
        <p className="text-slate-500">Upload PDB structures and define biological context.</p>
      </div>

      <div className="space-y-6">
        {/* Ligand Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Ligand Structure (PDB) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdb"
              onChange={handleFileChange('ligandFile')}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-50 file:text-teal-700
                hover:file:bg-teal-100
                cursor-pointer border border-dashed border-slate-300 rounded-lg p-2"
            />
          </div>
          {formData.ligandFile && (
            <p className="text-xs text-teal-600 font-medium">Loaded: {formData.ligandFile.name}</p>
          )}
        </div>

        {/* Cancer Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Cancer Type</label>
            <select
              value={formData.cancerType}
              onChange={(e) => handleChange('cancerType', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
            >
              {CANCER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Cancer Class</label>
            <select
              value={formData.cancerClass}
              onChange={(e) => handleChange('cancerClass', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
            >
              {CANCER_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Receptor Configuration */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-sm font-semibold text-slate-700">Receptor Selection</label>
          <div className="flex gap-4">
            <button
              onClick={() => handleChange('receptorMode', 'preset')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                formData.receptorMode === 'preset' 
                  ? 'bg-teal-100 text-teal-800 border-teal-200 border' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Select from Database
            </button>
            <button
              onClick={() => handleChange('receptorMode', 'upload')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                formData.receptorMode === 'upload' 
                  ? 'bg-teal-100 text-teal-800 border-teal-200 border' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Upload Receptor PDB
            </button>
          </div>

          {formData.receptorMode === 'preset' ? (
            <select
              value={formData.selectedReceptor}
              onChange={(e) => handleChange('selectedReceptor', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
            >
              {PRESET_RECEPTORS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdb"
                onChange={handleFileChange('receptorFile')}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-slate-100 file:text-slate-700
                  hover:file:bg-slate-200
                  cursor-pointer border border-slate-300 rounded-lg p-2"
              />
            </div>
          )}
        </div>

        <div className="pt-6">
          <Button 
            onClick={onSubmit} 
            disabled={!formData.ligandFile || isProcessing}
            fullWidth
            className="h-12 text-lg"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Start Analysis"}
          </Button>
        </div>
      </div>
    </div>
  );
};
