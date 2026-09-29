# CraftCV Pro

> **A modern, privacy-first, 100% free web application for building recruiter-approved resumes and CVs.**  
> Create, customize, and export professional CVs directly in your browser with zero subscriptions, zero paywalls, and zero watermarks.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kashyapmak.github.io%2FCraftCV-emerald?style=for-the-badge&logo=github)](https://kashyapmak.github.io/CraftCV/)
[![Release](https://img.shields.io/badge/Release-Alpha%20v0.1.0-indigo?style=for-the-badge)](https://kashyapmak.github.io/CraftCV/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)

🔗 **Live Demo URL**: [https://kashyapmak.github.io/CraftCV/](https://kashyapmak.github.io/CraftCV/)

---

## 🌟 Why CraftCV Pro?

Most commercial CV builders entice users with free editing, only to demand recurring £15–£25 monthly subscriptions or lock the download button behind hidden paywalls after hours of work.

**CraftCV Pro** was created as an open, ethical alternative:
- **100% Free Forever**: No trial traps, no recurring fees, no surprise billing.
- **No Credit Card Required**: Never enter payment details or personal billing information.
- **No Account Mandatory**: Start building immediately without email verification or marketing spam.
- **Unlimited Document Exports**: Export as many versions as you need in high-resolution PDF, native Microsoft Word (`.docx`), and Print.
- **Zero Watermarks**: Your CV is your professional brand; exports are clean, crisp, and recruiter-ready.
- **Complete Client-Side Privacy**: All data is stored locally in your browser (`localStorage`). No personal records are stored on remote servers.

---

## ✨ Features

### 📄 8 Recruiter-Tested ATS Templates
1. **Modern Executive**: Dual-column layout with clean header accents, ideal for corporate leadership and managers.
2. **Edinburgh Timeline**: Vertical connecting timeline with visual milestone nodes for work history and education.
3. **Cambridge Accent**: Modern geometric banner with monogram avatar, categorized skill tags, and clean card dividers.
4. **Minimalist Clean**: Typography-driven, high-whitespace format for maximum readability and clean scanning.
5. **London Corporate**: Formal executive presentation with high-contrast header card and structured sections.
6. **Tech Compact**: Space-optimized format tailored for software engineers, devops, data scientists, and technical specialists.
7. **Creative Split**: Fixed sidebar layout with high-impact color blocking for designers and creative roles.
8. **Academic Classic**: Traditional serif layout formatted for university faculty, researchers, scholars, and medical professionals.

### 🎨 Color Themes & Typography
- **Interactive Color Palette**: Choose from template-recommended accent colors, popular presets, or pick any hex color using the integrated color picker.
- **Curated Font Pairings**: Support for *Inter*, *Plus Jakarta Sans*, *EB Garamond*, *Cinzel*, and *Roboto Mono*.
- **Adjustable Spacing**: Fine-tune line heights and typography scale to fit your content comfortably on 1 or 2 pages.

### 👁️ True-to-Life A4 Paper Preview & Multi-Page Margins
- **Pixel-Accurate A4 Dimensions**: Standard 210mm × 297mm paper rendering at 96 DPI.
- **Balanced Margins**: Automatic calculation of top and bottom margins across Page 1, Page 2, and Page 3 so text never cuts off awkwardly at paper edges.
- **Margin Presets Toolbar**: Switch between *14mm (Compact)*, *20mm (Standard)*, and *26mm (Spacious)* margins.
- **Margin Guide Overlays**: Toggle visual dashed boundaries to inspect printable safe zones.
- **Auto "Fit to Width"**: Responsive scaling that ensures the entire A4 sheet fits your screen width without horizontal scrolling.

### 💾 Export Options
- **High-Resolution PDF**: Multi-page PDF generation capturing exact preview dimensions and page margins.
- **Microsoft Word (.docx)**: Native OpenXML `.docx` files formatted with real headings, bullet lists, and contact tables.
- **Clean Browser Print**: Optimized `@media print` stylesheets for standard printers and "Save as PDF".
- **JSON Data Backup & Restore**: Export your full CV data as JSON files to keep local backups or load them on another device.

### 🎯 ATS Score & Keyword Match
- **Real-Time Profile Meter**: Live evaluation of summary length, measurable achievements, skill counts, and contact completeness.
- **Target Job Matcher**: Compare your CV against any job description (pasted text or URL) to identify missing keywords and receive tailored bullet recommendations.
- **Phrases & Action Verbs Library**: Hundreds of industry-tested bullet points across Engineering, Product, Marketing, Sales, Healthcare, Finance, and Design.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Document Generation**:
  - [`docx`](https://docx.js.org/) for Microsoft Word OpenXML document generation
  - [`jspdf`](https://github.com/parallax/jsPDF) & [`html2canvas`](https://html2canvas.hertzen.com/) for high-resolution PDF rendering
- **Storage**: Client-side `localStorage` with JSON export/import

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git

# Navigate into the project directory
cd <your-repo-name>

# Install dependencies
npm install
```

### Development
```bash
# Start the Vite local development server (runs on http://localhost:3000)
npm run dev
```

### Production Build
```bash
# Compile and bundle the application into the ./dist folder
npm run build

# Preview the production build locally
npm run preview
```

### Code Quality
```bash
# Type-check with TypeScript compiler
npm run lint
```

---

## 🌐 Deploying to GitHub Pages

CraftCV Pro is configured with `base: './'` in `vite.config.ts`, making it 100% compatible with GitHub Pages, custom domains, or subpath URLs without any configuration changes.

### Option 1: Automated Deployment via GitHub Actions (Recommended)

A GitHub Actions workflow is provided at `.github/workflows/deploy.yml`.

1. Push your repository to GitHub.
2. In your GitHub repository, navigate to **Settings** → **Pages** (under *Code and automation* in the left menu).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Every push to the `main` or `master` branch will automatically build and publish your site to:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

### Option 2: CLI Deployment Script

To deploy manually using the `gh-pages` branch:

```bash
npm run deploy
```

This runs `scripts/deploy-gh-pages.sh`, which:
1. Runs `npm run build`
2. Generates `dist/.nojekyll` to prevent Jekyll processing issues
3. Pushes the compiled `dist` directory to the `gh-pages` branch on your remote

In your GitHub repository settings under **Settings** → **Pages**, set **Source** to **Deploy from a branch** and select `gh-pages`.

### Option 3: Other Static Hosting Providers

Because the application compiles to purely static HTML, CSS, and JavaScript in `./dist`, it can also be deployed to:
- **Vercel**: Import repository and deploy with Vite presets.
- **Netlify**: Set publish directory to `dist` and build command to `npm run build`.
- **Cloudflare Pages**: Connect repository with framework preset set to *Vite*.
- **AWS S3 + CloudFront** or **Firebase Hosting**.

---

## 🔒 Privacy Architecture

CraftCV Pro is built with a strict privacy-by-design architecture:
- All resumes, drafts, custom sections, and settings remain solely within your local browser storage.
- No analytics trackers, behavioral trackers, or data-collection cookies are installed.
- Optional AI refinement features run entirely client-side using direct API calls with your own API key. Keys are saved locally on your device and are never transmitted to any proxy server.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

**CraftCV Pro** • Version Alpha 0.1.0  
*100% Free Forever • Zero Subscriptions • Complete Client-Side Privacy*  
🌐 [Live Demo](https://kashyapmak.github.io/CraftCV/) • 📦 [Repository](https://github.com/kashyapmak/CraftCV)

</div>
