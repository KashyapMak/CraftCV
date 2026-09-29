import React, { useState, useEffect } from 'react';
import { CVData, AppSettings } from '../types/cv';
import { callAiRefinement, AiRefineResult } from '../utils/aiService';
import { saveAppSettings } from '../utils/storage';
import {
  X,
  Sparkles,
  Key,
  Check,
  Loader2,
  Bot,
  ArrowRight,
  Copy,
  Globe,
  FileText,
  Link,
  Target
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cv: CVData;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onApplySummary: (newSummary: string) => void;
  onApplyBullet: (newBullet: string) => void;
}

export const AiRefineModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cv,
  settings,
  onUpdateSettings,
  onApplySummary,
  onApplyBullet
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openai'>(settings.aiProvider || 'gemini');
  const [apiKey, setApiKey] = useState(
    provider === 'gemini' ? settings.geminiApiKey || '' : settings.openaiApiKey || ''
  );
  const [activeTab, setActiveTab] = useState<'summary' | 'bullet' | 'job_match' | 'custom'>('job_match');
  
  // Job match specific state: 'content' (text) vs 'url'
  const [jobInputType, setJobInputType] = useState<'content' | 'url'>('content');
  const [jobUrlInput, setJobUrlInput] = useState('');
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [jobNotesInput, setJobNotesInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchNotice, setUrlFetchNotice] = useState<string | null>(null);

  // Other input fields
  const [summaryInput, setSummaryInput] = useState(cv.summary || '');
  const [bulletInput, setBulletInput] = useState(
    cv.experiences[0]?.highlights[0] || 'Managed project development and led team members.'
  );
  const [customPromptInput, setCustomPromptInput] = useState('Suggest 5 power action verbs for a senior tech lead');

  // Execution states
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiRefineResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Sync inputs when modal opens or cv/settings change
  useEffect(() => {
    if (isOpen) {
      const p = settings.aiProvider || 'gemini';
      setProvider(p);
      setApiKey(p === 'gemini' ? settings.geminiApiKey || '' : settings.openaiApiKey || '');
      setSummaryInput(cv.summary || '');
      setBulletInput(cv.experiences[0]?.highlights[0] || 'Managed project development and led team members.');
      setResult(null);
    }
  }, [isOpen, cv.summary, cv.experiences, settings.aiProvider, settings.geminiApiKey, settings.openaiApiKey]);

  const handleProviderChange = (newProvider: 'gemini' | 'openai') => {
    setProvider(newProvider);
    setApiKey(newProvider === 'gemini' ? settings.geminiApiKey || '' : settings.openaiApiKey || '');
    setResult(null);
  };

  const handleSaveKey = () => {
    const patch = provider === 'gemini' ? { geminiApiKey: apiKey.trim() } : { openaiApiKey: apiKey.trim() };
    const updated = saveAppSettings({ ...patch, aiProvider: provider });
    onUpdateSettings(updated);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  // Attempt to fetch content from URL
  const handleFetchFromUrl = async () => {
    if (!jobUrlInput.trim()) return;
    setIsFetchingUrl(true);
    setUrlFetchNotice(null);

    try {
      const response = await fetch(jobUrlInput.trim(), { mode: 'cors' });
      if (!response.ok) throw new Error('Site did not return OK status');
      const text = await response.text();
      // Basic extraction of text from html
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const bodyText = doc.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 4000);
      if (bodyText) {
        setJobDescriptionInput(bodyText);
        setUrlFetchNotice('Successfully extracted text from URL! You can review or edit it below.');
      } else {
        throw new Error('No readable text found on page.');
      }
    } catch {
      setUrlFetchNotice(
        'Note: External job boards usually block browser direct scraping (CORS). No problem! Your URL will be analyzed directly by the AI model.'
      );
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleRunAi = async () => {
    if (!apiKey.trim()) {
      setResult({
        success: false,
        error: `Please enter your ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API key below to proceed.`
      });
      return;
    }

    // Auto-save key to local settings
    const patch = provider === 'gemini' ? { geminiApiKey: apiKey.trim() } : { openaiApiKey: apiKey.trim() };
    const updated = saveAppSettings({ ...patch, aiProvider: provider });
    onUpdateSettings(updated);

    setIsLoading(true);
    setResult(null);

    let task: 'enhance_summary' | 'improve_bullet' | 'ats_keywords' | 'custom_prompt' = 'enhance_summary';
    let targetText = '';
    let jobDescription = '';
    let customPrompt = '';

    if (activeTab === 'summary') {
      task = 'enhance_summary';
      targetText = summaryInput;
    } else if (activeTab === 'bullet') {
      task = 'improve_bullet';
      targetText = bulletInput;
    } else if (activeTab === 'job_match') {
      task = 'ats_keywords';
      jobDescription = jobInputType === 'url'
        ? (jobDescriptionInput ? `${jobNotesInput}\n${jobDescriptionInput}` : jobNotesInput)
        : jobDescriptionInput;
    } else {
      task = 'custom_prompt';
      customPrompt = customPromptInput;
      targetText = cv.summary;
    }

    const res = await callAiRefinement({
      provider,
      apiKey: apiKey.trim(),
      task,
      context: {
        cv,
        targetText,
        jobTitle: cv.personalDetails.jobTitle,
        jobDescription,
        jobUrl: jobUrlInput,
        jobDescriptionType: jobInputType,
        customPrompt
      }
    });

    setIsLoading(false);
    setResult(res);
  };

  const handleCopyResult = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to extract or apply tailored summary
  const handleApplyToCv = () => {
    if (!result?.content) return;
    if (activeTab === 'summary') {
      onApplySummary(result.content);
      onClose();
    } else if (activeTab === 'bullet') {
      onApplyBullet(result.content);
      onClose();
    } else if (activeTab === 'job_match') {
      // Try to extract tailored summary block from the response
      const lines = result.content.split('\n');
      const summaryStartIndex = lines.findIndex(l =>
        l.toLowerCase().includes('tailored professional summary') ||
        l.toLowerCase().includes('tailored summary')
      );
      if (summaryStartIndex !== -1) {
        const candidateLines = lines.slice(summaryStartIndex + 1, summaryStartIndex + 8)
          .filter(l => l.trim().length > 0 && !l.startsWith('#') && !l.startsWith('5.') && !l.startsWith('💡'));
        if (candidateLines.length > 0) {
          const extracted = candidateLines.join(' ').replace(/^["'\[]+|[\]"']+$/g, '').trim();
          onApplySummary(extracted);
          onClose();
          return;
        }
      }
      // Fallback: apply the whole content if short
      onApplySummary(result.content);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs modal-backdrop">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>AI CV Refinement & Job Match</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                  Client-Side Only
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Target job postings (via URL or text), analyze ATS keyword match, and refine your CV with your own AI key.
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

        {/* API Provider & Key Configuration Section */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Choose AI Model:</span>
              <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleProviderChange('gemini')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    provider === 'gemini'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Google Gemini (Free Tier / Flash)
                </button>
                <button
                  type="button"
                  onClick={() => handleProviderChange('openai')}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    provider === 'openai'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  OpenAI ChatGPT (GPT-4o)
                </button>
              </div>
            </div>

            <span className="text-[11px] text-slate-500">
              {provider === 'gemini' ? 'Default: gemini-2.5-flash' : 'Default: gpt-4o-mini'}
            </span>
          </div>

          {/* API Key Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API Key...`}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveKey}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              {keySaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
              <span>{keySaved ? 'Saved Locally' : 'Save Key'}</span>
            </button>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex gap-4 bg-white overflow-x-auto">
          <button
            onClick={() => { setActiveTab('job_match'); setResult(null); }}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'job_match'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Job Match & ATS Keywords</span>
          </button>
          <button
            onClick={() => { setActiveTab('summary'); setResult(null); }}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Refine Summary
          </button>
          <button
            onClick={() => { setActiveTab('bullet'); setResult(null); }}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'bullet'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Enhance Experience Bullet
          </button>
          <button
            onClick={() => { setActiveTab('custom'); setResult(null); }}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Prompt
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {/* ================= JOB MATCH TAB ================= */}
          {activeTab === 'job_match' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Target Job Information Source:
                </label>
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setJobInputType('content')}
                    className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                      jobInputType === 'content'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Text Content</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobInputType('url')}
                    className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                      jobInputType === 'url'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>Job Posting URL</span>
                  </button>
                </div>
              </div>

              {jobInputType === 'url' ? (
                <div className="space-y-2.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Job Posting URL (LinkedIn, Indeed, Company Careers, Greenhouse, Lever, etc.):
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={jobUrlInput}
                          onChange={(e) => setJobUrlInput(e.target.value)}
                          placeholder="https://www.linkedin.com/jobs/view/... or company jobs page"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isFetchingUrl || !jobUrlInput.trim()}
                        onClick={handleFetchFromUrl}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isFetchingUrl ? 'Fetching...' : 'Fetch Text'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Target Role Title & Company Notes (Optional):
                    </label>
                    <input
                      type="text"
                      value={jobNotesInput}
                      onChange={(e) => setJobNotesInput(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer at Tech Corp - High focus on React performance"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {urlFetchNotice && (
                    <div className="p-2.5 bg-indigo-50 text-indigo-800 rounded-lg text-[11px] font-medium border border-indigo-100">
                      {urlFetchNotice}
                    </div>
                  )}

                  {jobDescriptionInput && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Extracted / Supplied Job Text:
                      </label>
                      <textarea
                        rows={3}
                        value={jobDescriptionInput}
                        onChange={(e) => setJobDescriptionInput(e.target.value)}
                        placeholder="Extracted role requirements..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <textarea
                    rows={5}
                    value={jobDescriptionInput}
                    onChange={(e) => setJobDescriptionInput(e.target.value)}
                    placeholder="Paste the target job advertisement, responsibilities, and required qualifications here..."
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500">
                    AI matches your CV against these requirements, identifies missing ATS keywords, and generates a tailored summary.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= SUMMARY TAB ================= */}
          {activeTab === 'summary' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Current Professional Summary (or draft text to polish):
              </label>
              <textarea
                rows={4}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Enter or paste your summary to generate high-impact executive versions..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* ================= BULLET TAB ================= */}
          {activeTab === 'bullet' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Work Experience Bullet Point to Transform:
              </label>
              <input
                type="text"
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                placeholder="e.g. Led redesign of customer checkout flow and improved speed."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                AI transforms this into strong XYZ formula statements: "Accomplished [X], measured by [Y], by doing [Z]"
              </p>
            </div>
          )}

          {/* ================= CUSTOM PROMPT TAB ================= */}
          {activeTab === 'custom' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Custom Instruction or Prompt:
              </label>
              <textarea
                rows={3}
                value={customPromptInput}
                onChange={(e) => setCustomPromptInput(e.target.value)}
                placeholder="Ask anything, e.g. 'Write a 2-sentence cover letter opening for a Senior UX Designer role'..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRunAi}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with {provider === 'gemini' ? 'Google Gemini' : 'ChatGPT'}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {activeTab === 'job_match' ? 'Analyze & Match CV with Job' : 'Generate AI Refinement'}
                </>
              )}
            </button>
          </div>

          {/* AI Result Area */}
          {result && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              {result.success ? (
                <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-indigo-600" />
                      {activeTab === 'job_match' ? 'Job Match & ATS Keyword Analysis:' : 'Generated Refinements:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyResult}
                        className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      
                      <button
                        onClick={handleApplyToCv}
                        className="px-3 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        Apply to My CV <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto font-sans p-1">
                    {result.content}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                  <span className="font-bold">Error:</span>
                  <span>{result.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>🔒 100% Client-Side: API keys and CV data remain private in your browser.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
