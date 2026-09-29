import { CVData } from '../types/cv';

export interface AiRefineRequest {
  provider: 'gemini' | 'openai';
  apiKey: string;
  model?: string;
  task: 'enhance_summary' | 'improve_bullet' | 'ats_keywords' | 'polish_all' | 'custom_prompt';
  context: {
    cv?: Partial<CVData>;
    targetText?: string;
    jobTitle?: string;
    jobDescription?: string;
    jobUrl?: string;
    jobDescriptionType?: 'content' | 'url';
    customPrompt?: string;
  };
}

export interface AiRefineResult {
  success: boolean;
  content?: string;
  error?: string;
}

export const callAiRefinement = async (req: AiRefineRequest): Promise<AiRefineResult> => {
  const { provider, apiKey, task, context } = req;

  if (!apiKey || apiKey.trim() === '') {
    return {
      success: false,
      error: `Please enter your ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI ChatGPT'} API Key to use AI refinement.`
    };
  }

  const systemPrompt = "You are an elite executive career coach and professional CV writer specializing in high-converting resumes and ATS optimization. Provide concise, impactful, professional outputs formatted cleanly without conversational fluff.";

  let userPrompt = "";

  if (task === 'enhance_summary') {
    userPrompt = `Please enhance the following professional summary for a ${context.jobTitle || 'professional'}.
Current Summary:
"${context.targetText || ''}"

Candidate Skills/Background context:
${context.cv?.skills?.map(s => s.items.join(', ')).join(' | ') || 'N/A'}

Provide:
1. "Impact & Executive" version (punchy, high-achieving, strong action words)
2. "Concise & Modern" version (2-3 sentences, direct value proposition)
3. "Technical / Specialist" version (emphasizing domain mastery and metrics)

Present each option clearly numbered with a short headline so the user can easily select and copy one.`;
  } else if (task === 'improve_bullet') {
    userPrompt = `Transform this work experience bullet point into a high-impact, quantifiable accomplishment using the XYZ formula (Accomplished [X] measured by [Y] by doing [Z]) with strong action verbs:
Original bullet:
"${context.targetText || ''}"

Role context: ${context.jobTitle || 'Professional'}

Provide 3 improved variations (e.g., Metrics-focused, Leadership-focused, Technical-focused). Only output the bullet options directly, starting with a strong past-tense action verb (e.g. Spearheaded, Engineered, Accelerated).`;
  } else if (task === 'ats_keywords') {
    const targetSource = context.jobDescriptionType === 'url'
      ? `Target Job Posting URL:\n${context.jobUrl || 'N/A'}\n\nRole & Company Notes:\n${context.jobDescription || 'Analyze the job role requirements and expected candidate profile from this posting'}`
      : `Target Job Description Content:\n${context.jobDescription || 'N/A'}`;

    userPrompt = `Compare this candidate's CV profile against the Target Job Description below.

${targetSource}

Candidate Profile:
- Current Job Title: ${context.cv?.personalDetails?.jobTitle || 'N/A'}
- Professional Summary: ${context.cv?.summary || 'N/A'}
- Skills & Technologies: ${context.cv?.skills?.map(s => `${s.category}: ${s.items.join(', ')}`).join('\n') || 'N/A'}
- Work Experience & Highlights: ${context.cv?.experiences?.map(e => `${e.jobTitle} at ${e.employer}: ${e.highlights.join('; ')}`).join('\n') || 'N/A'}

Analyze thoroughly and return:
1. 📊 Estimated ATS Match Score (e.g. "82% - Strong Match") with a 1-sentence assessment.
2. ✅ Key Requirements & Hard Skills Already Matched in the CV.
3. ⚠️ Top Missing Keywords / Hard Skills from the Job Posting (Add these to pass ATS recruiter screening).
4. ✍️ Tailored Professional Summary:
[Write a ready-to-use 3-4 sentence professional summary tailored specifically to this job posting that the candidate can immediately paste into their CV]
5. 💡 3 Actionable Recommendations for Experience Bullets & Targeting.

Keep formatting clean with clear headings and bullet points.`;
  } else if (task === 'polish_all') {
    userPrompt = `Review and proofread the following CV text for grammar, punctuation, active voice, and professional corporate tone:
"${context.targetText || ''}"

Return the polished text directly with a brief note highlighting what was enhanced.`;
  } else if (task === 'custom_prompt') {
    userPrompt = `${context.customPrompt || ''}

Current CV / Text Context:
Role: ${context.jobTitle || ''}
Text: "${context.targetText || ''}"`;
  }

  try {
    if (provider === 'gemini') {
      const modelName = req.model || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }
          ]
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('No response text received from Gemini.');
      }

      return { success: true, content };
    } else {
      // OpenAI ChatGPT implementation
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: req.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API returned status ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response text received from OpenAI.');
      }

      return { success: true, content };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to communicate with AI provider.'
    };
  }
};
