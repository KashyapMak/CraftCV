import templatesData from './templates.json';
import { TemplateConfig } from '../types/cv';

export const TEMPLATES: TemplateConfig[] = templatesData as TemplateConfig[];

export const getTemplateById = (id: string): TemplateConfig => {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
};

export const COLOR_PRESETS = [
  { name: 'Royal Sapphire', hex: '#2563eb' },
  { name: 'Classic Navy', hex: '#1e3a8a' },
  { name: 'Emerald Forest', hex: '#0f766e' },
  { name: 'Crimson Slate', hex: '#b91c1c' },
  { name: 'Obsidian Black', hex: '#0f172a' },
  { name: 'Indigo Dream', hex: '#4f46e5' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Cool Teal', hex: '#0284c7' }
];

export const FONT_OPTIONS: { id: 'inter' | 'jakarta' | 'garamond' | 'mono' | 'cinzel'; name: string; style: string }[] = [
  { id: 'inter', name: 'Inter (Modern Sans)', style: "font-family: 'Inter', sans-serif;" },
  { id: 'jakarta', name: 'Plus Jakarta Sans (Crisp Clean)', style: "font-family: 'Plus Jakarta Sans', sans-serif;" },
  { id: 'garamond', name: 'EB Garamond (Executive Serif)', style: "font-family: 'EB Garamond', serif;" },
  { id: 'cinzel', name: 'Cinzel (Prestigious Classic)', style: "font-family: 'Cinzel', serif;" },
  { id: 'mono', name: 'Roboto Mono (Tech / Code)', style: "font-family: 'Roboto Mono', monospace;" }
];
