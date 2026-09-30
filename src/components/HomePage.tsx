import React from 'react';
import { TEMPLATES } from '../templates/templatesRegistry';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Download,
  Copy,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileDown,
  LayoutTemplate,
  Check,
  CreditCard,
  Ban,
  Eye
} from 'lucide-react';

interface Props {
  totalExistingCvs: number;
  maxLimit: number;
  onStartBlank: () => void;
  onStartSample: () => void;
  onSelectTemplateToStart: (templateId: string) => void;
  onOpenDashboard: () => void;
  onPreviewTemplate?: (templateId: string) => void;
}

export const HomePage: React.FC<Props> = ({
  totalExistingCvs,
  maxLimit,
  onStartBlank,
  onStartSample,
  onSelectTemplateToStart,
  onOpenDashboard,
  onPreviewTemplate
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Hero Header Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              CraftCV <span className="text-indigo-600">PRO</span>
            </span>
            <span className="ml-2 hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Free Forever • No Subscription
            </span>
          </div>

          <div className="flex items-center gap-3">
            {totalExistingCvs > 0 && (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>My Saved CVs</span>
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full font-bold text-[10px]">
                  {totalExistingCvs}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onStartBlank}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Build My CV (Free)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 lg:pt-16 lg:pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>100% Free to Use • No Subscription • No Credit Card Required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Create a Recruiter-Approved CV <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              100% Free — No Subscription, No Payment
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Unlike other resume builders that lure you in with free editing only to demand £15–£25/month when you try to download, CraftCV PRO is completely free to use. Build, customize, and export high-resolution <strong>PDF, native Word (.docx), and standalone HTML</strong> with zero subscriptions, zero hidden fees, and zero watermarks.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStartBlank}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Create Free CV Now</span>
            </button>

            <button
              type="button"
              onClick={onStartSample}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Try with Pre-Filled Sample</span>
            </button>
          </div>

          {/* Quick Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-emerald-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-indigo-600" />
              <span>No recurring monthly charges</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unlimited PDF & Word exports</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>100% private local browser storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEDICATED ZERO COST & NO SUBSCRIPTION BENEFIT SECTION ================= */}
      <section className="py-12 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-y border-emerald-100/90 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>True Zero-Cost Guarantee</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              No Subscription. No Payment. Free to Use Forever.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Most online CV tools trap you after spending hours building a document by holding your download behind an expensive auto-renewing subscription. Here is our 100% free promise to jobseekers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Benefit Card 1 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-100">
                  £0
                </div>
                <h3 className="text-base font-bold text-slate-900">No Subscription Trap</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Never get locked into £14.99–£24.99/month recurring auto-charges or surprise trial renewals. We never request debit/credit cards or payment details.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                  Always £0 • Free Forever
                </span>
              </div>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Download Paywall</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download as many times as you need in vector PDF, editable Microsoft Word (.docx), and standalone HTML. No artificial limits or single-download paywalls.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                  Unlimited Free Downloads
                </span>
              </div>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Zero Watermarks</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your CV represents your professional reputation. Every exported document is 100% clean, crisp, and recruiter-ready with zero intrusive website branding or stamps.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full inline-block">
                  Clean & Watermark-Free
                </span>
              </div>
            </div>

            {/* Benefit Card 4 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Sign Up Required</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jump right in and start writing. No account creation, no password to remember, and no email verification. All data stays secure inside your browser storage.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                  No Registration Needed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-100/60 border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Everything You Need to Land Your Next Role
            </h2>
            <p className="text-sm text-slate-600">
              Recruiter-tested CV features engineered for modern jobseekers with complete privacy and zero paywalls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Live Profile & ATS Meter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch your profile score update in real-time. Check for essential metrics, clear summaries, and recruiter keywords before sending applications.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">8 ATS Layouts & Color Themes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose from 8 professionally crafted templates (Executive, Timeline, Accent, Minimalist, Corporate, Tech, Creative, Academic). Select matching color themes with instant live preview.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Export (PDF, Word, HTML)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download your CV in direct high-resolution PDFs with page footer and margin controls, native Microsoft Word (.docx), or standalone HTML with zero watermark or surprise paywalls.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Copy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1-Click CV Duplication</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Easily clone your master CV into tailored versions for specific job postings. Store up to 99 CVs directly in your browser.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Refinement (Gemini & ChatGPT)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use your own free Google Gemini or OpenAI key to enhance bullet points, polish summaries, or benchmark against target job descriptions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Cloud Data Risk</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All records stay strictly in your local computer storage. Full JSON export and backup tools let you transfer or restore your data anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Template Gallery Showcase */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Recruiter-Approved Templates
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Click any template to launch the builder with that style pre-selected:
              </p>
            </div>
            <button
              onClick={onStartBlank}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore all templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplateToStart(tmpl.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {tmpl.name}
                    </span>
                    {tmpl.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {tmpl.description}
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <span className="font-semibold text-slate-700">Best for: </span>
                    {tmpl.recommendedFor}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {tmpl.accentColors.map((c, idx) => (
                      <div
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {onPreviewTemplate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewTemplate(tmpl.id);
                        }}
                        className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                        title="Preview this layout with Alexander Wright's complete sample JSON profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Preview</span>
                      </button>
                    )}
                    <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Use Layout →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 text-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free Forever • No Subscription • No Payment Required</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Build Your Professional CV?
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Takes under 5 minutes. No payment required, no subscription lock-in, and completely free to download in PDF and Word docx formats.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartBlank}
              className="px-7 py-3.5 bg-white text-emerald-950 hover:bg-slate-100 font-bold rounded-xl text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Get Started Free</span>
            </button>
            <button
              onClick={onStartSample}
              className="px-7 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-600 font-bold rounded-xl text-sm transition cursor-pointer"
            >
              Explore with Sample Data
            </button>
          </div>
        </div>
      </section>

      {/* Application Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>CraftCV Pro • 100% Free Forever • Zero Subscriptions • Complete Client-Side Privacy</p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/kashyapMak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition hover:underline"
            >
              Explore more projects
            </a>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Alpha v0.1.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
