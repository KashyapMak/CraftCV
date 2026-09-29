import React, { useState } from 'react';
import { AppSettings, CVData } from '../types/cv';
import { saveAppSettings, getStorageUsageBytes, exportAllCVsAsJson, importCVsFromJson } from '../utils/storage';
import { X, Settings, Shield, HardDrive, Key, Download, Upload, Check, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  currentCvCount: number;
  onReloadCVs: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentCvCount,
  onReloadCVs
}) => {
  if (!isOpen) return null;

  const [limit, setLimit] = useState<number>(settings.maxCvLimit || 99);
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const storageInfo = getStorageUsageBytes();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveAppSettings({
      maxCvLimit: Math.max(1, limit),
      geminiApiKey: geminiKey.trim(),
      openaiApiKey: openaiKey.trim()
    });
    onUpdateSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Importing...');
    const res = await importCVsFromJson(file);
    if (res.success) {
      setImportStatus(`Successfully imported ${res.count} CV(s)!`);
      onReloadCVs();
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus(`Import failed: ${res.error}`);
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all CVs and reset to default? Make sure to download a JSON backup first!'
      )
    ) {
      localStorage.clear();
      onReloadCVs();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs modal-backdrop">
      <div className="bg-white w-full max-w-xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Application & Storage Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure local CV limits, privacy settings, and AI tokens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* Max CV Limit Setting */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="max-cv-limit" className="text-xs font-bold text-slate-800">
                Maximum CV Creation Limit:
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                Current: {currentCvCount} / {limit} CVs
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="max-cv-limit"
                type="number"
                min={1}
                max={999}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
                className="w-28 p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500">
                Default: <strong>99</strong> (Configurable up to 999)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Limits the number of CVs retained concurrently in local browser storage.
            </p>
          </div>

          {/* Privacy & Storage Guarantee */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <div className="font-bold">100% Privacy Guarantee (Zero Cloud Sync)</div>
              <div className="text-emerald-700 mt-0.5 leading-relaxed">
                All resume details, personal info, and drafts are stored strictly inside your browser's private local storage. No data is sent to external cloud databases.
              </div>
            </div>
          </div>

          {/* AI Keys Config */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>AI Provider API Keys (Optional)</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Google Gemini API Key:</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">OpenAI API Key (ChatGPT):</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Backup & Import Tools */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span>Data Management (Usage: {storageInfo.formatted})</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportAllCVsAsJson}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Backup All CVs (JSON)
              </button>

              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Import JSON Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs rounded-lg transition ml-auto cursor-pointer"
              >
                Reset / Clear Data
              </button>
            </div>

            {importStatus && (
              <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 p-2 rounded-lg">
                {importStatus}
              </div>
            )}

            {/* GitHub Pages Deployment Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>🚀 GitHub Pages Ready</span>
              </div>
              <p className="text-[11px] text-slate-500">
                This app is configured with relative base paths (<code className="text-indigo-600">base: './'</code>). Running <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[10px]">npm run build</code> outputs a standalone <code className="font-mono text-[10px] text-slate-800">dist/</code> folder ready to deploy on any GitHub Pages repository branch or static host.
              </p>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Settings saved successfully!
              </span>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
