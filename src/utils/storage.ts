import { CVData, AppSettings } from '../types/cv';
import { SAMPLE_CV, createBlankCV } from '../data/sampleCV';

const CVS_STORAGE_KEY = 'craftcv_stored_cvs_v1';
const ACTIVE_CV_KEY = 'craftcv_active_cv_id_v1';
const SETTINGS_STORAGE_KEY = 'craftcv_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  maxCvLimit: 99,
  defaultTemplateId: 'modern-executive',
  aiProvider: 'gemini',
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini'
};

export const getAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings from storage', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveAppSettings = (settings: Partial<AppSettings>): AppSettings => {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
  return updated;
};

export const getAllCVs = (): CVData[] => {
  try {
    const raw = localStorage.getItem(CVS_STORAGE_KEY);
    if (!raw) {
      // First time user: initialize with the rich sample CV
      const initial = [SAMPLE_CV];
      localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(ACTIVE_CV_KEY, SAMPLE_CV.id);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [SAMPLE_CV];
  } catch (e) {
    console.error('Failed to load CVs from localStorage', e);
    return [SAMPLE_CV];
  }
};

export const getActiveCvId = (): string => {
  try {
    const stored = localStorage.getItem(ACTIVE_CV_KEY);
    if (stored) return stored;
    const all = getAllCVs();
    return all[0]?.id || SAMPLE_CV.id;
  } catch (e) {
    return SAMPLE_CV.id;
  }
};

export const setActiveCvId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_CV_KEY, id);
  } catch (e) {
    console.error('Failed to save active CV ID', e);
  }
};

export const saveCV = (cv: CVData): { success: boolean; error?: string } => {
  try {
    const all = getAllCVs();
    const index = all.findIndex((item) => item.id === cv.id);
    const updatedCV = { ...cv, updatedAt: Date.now() };

    let updatedList: CVData[];
    if (index >= 0) {
      updatedList = [...all];
      updatedList[index] = updatedCV;
    } else {
      const settings = getAppSettings();
      if (all.length >= settings.maxCvLimit) {
        return {
          success: false,
          error: `CV creation limit reached (${settings.maxCvLimit} max). You can adjust this limit in Settings or delete unused CVs.`
        };
      }
      updatedList = [updatedCV, ...all];
    }

    localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(updatedList));
    return { success: true };
  } catch (e: any) {
    console.error('Error saving CV to storage', e);
    return { success: false, error: e?.message || 'Storage error' };
  }
};

export const createNewCV = (fromSample = false): { cv: CVData; error?: string } => {
  const all = getAllCVs();
  const settings = getAppSettings();

  if (all.length >= settings.maxCvLimit) {
    throw new Error(`Maximum CV limit reached (${settings.maxCvLimit}). You can raise this limit in Settings.`);
  }

  let newCV: CVData;
  if (fromSample) {
    newCV = {
      ...SAMPLE_CV,
      id: `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `Sample CV (${all.length + 1})`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  } else {
    newCV = createBlankCV(all.length + 1);
  }

  const updatedList = [newCV, ...all];
  localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(updatedList));
  setActiveCvId(newCV.id);
  return { cv: newCV };
};

export const duplicateCV = (sourceId: string): CVData => {
  const all = getAllCVs();
  const settings = getAppSettings();

  if (all.length >= settings.maxCvLimit) {
    throw new Error(`Maximum CV limit reached (${settings.maxCvLimit}). You can raise this limit in Settings.`);
  }

  const source = all.find((item) => item.id === sourceId) || all[0];
  const newCV: CVData = {
    ...JSON.parse(JSON.stringify(source)),
    id: `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${source.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const updatedList = [newCV, ...all];
  localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(updatedList));
  setActiveCvId(newCV.id);
  return newCV;
};

export const deleteCV = (id: string): { remainingCVs: CVData[]; activeId: string } => {
  const all = getAllCVs();
  if (all.length <= 1) {
    // If only one left, replace it with a fresh blank one
    const fresh = createBlankCV(1);
    localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify([fresh]));
    setActiveCvId(fresh.id);
    return { remainingCVs: [fresh], activeId: fresh.id };
  }

  const filtered = all.filter((item) => item.id !== id);
  localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(filtered));

  const currentActive = getActiveCvId();
  const newActiveId = currentActive === id ? filtered[0].id : currentActive;
  setActiveCvId(newActiveId);

  return { remainingCVs: filtered, activeId: newActiveId };
};

export const exportAllCVsAsJson = (): void => {
  const cvs = getAllCVs();
  const settings = getAppSettings();
  const exportData = {
    app: 'CraftCV Pro',
    exportedAt: new Date().toISOString(),
    version: '1.0',
    settings: {
      maxCvLimit: settings.maxCvLimit
    },
    cvs
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `craftcv_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportSingleCvJson = (cv: CVData): void => {
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (cv.personalDetails.fullName || cv.title || 'CV')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  a.download = `${safeTitle}_resume.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importCVsFromJson = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    let incomingList: CVData[] = [];
    if (Array.isArray(data)) {
      incomingList = data;
    } else if (data && Array.isArray(data.cvs)) {
      incomingList = data.cvs;
    } else if (data && data.id && data.personalDetails) {
      incomingList = [data];
    } else {
      return { success: false, count: 0, error: 'Unrecognized JSON CV format' };
    }

    if (incomingList.length === 0) {
      return { success: false, count: 0, error: 'No CV records found in file' };
    }

    const current = getAllCVs();
    const settings = getAppSettings();

    // Merge without duplicate IDs
    const merged = [...current];
    let addedCount = 0;

    for (const item of incomingList) {
      if (merged.length >= settings.maxCvLimit) break;
      const validItem: CVData = {
        ...item,
        id: `cv_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: Date.now()
      };
      merged.push(validItem);
      addedCount++;
    }

    localStorage.setItem(CVS_STORAGE_KEY, JSON.stringify(merged));
    if (merged.length > 0) {
      setActiveCvId(merged[merged.length - 1].id);
    }

    return { success: true, count: addedCount };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'Failed to parse JSON file' };
  }
};

export const getStorageUsageBytes = (): { usedBytes: number; formatted: string } => {
  let total = 0;
  for (const x in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
      total += (localStorage[x].length + x.length) * 2;
    }
  }
  const kb = total / 1024;
  return {
    usedBytes: total,
    formatted: kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`
  };
};
