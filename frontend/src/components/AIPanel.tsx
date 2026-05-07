import { useResume } from '../context/ResumeContext';
import { Sparkles, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';

export const AIPanel = () => {
  const { aiScore, aiSuggestions, aiSkillRecommendations, isAnalyzing } = useResume();

  if (isAnalyzing) {
    return (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-6 text-cyan-100 shadow-[0_16px_40px_rgba(6,182,212,0.12)] backdrop-blur-xl">
        <BrainCircuit className="animate-pulse text-cyan-300" size={24} />
        <span className="font-medium">AI is analyzing your resume...</span>
      </div>
    );
  }

  if (aiScore === null && aiSuggestions.length === 0 && !aiSkillRecommendations) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-100 bg-emerald-400/10 border-emerald-400/15';
    if (score >= 70) return 'text-amber-100 bg-amber-400/10 border-amber-400/15';
    return 'text-rose-100 bg-rose-500/10 border-rose-400/15';
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <Sparkles className="text-cyan-300" size={20} />
          AI Resume Suggestions
        </h3>
        {aiScore !== null && (
          <div className={`rounded-full border px-4 py-1.5 text-sm font-bold backdrop-blur-md ${getScoreColor(aiScore)}`}>
            Score: {aiScore}/100
          </div>
        )}
      </div>

      {aiSkillRecommendations && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Recommended Skills</h4>
          <div className="space-y-3">
            {aiSkillRecommendations.languages?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400">Languages:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {aiSkillRecommendations.languages.map(skill => (
                    <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {aiSkillRecommendations.tools?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400">Tools/Frameworks:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {aiSkillRecommendations.tools.map(skill => (
                    <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {aiSkillRecommendations.databases?.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400">Databases:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {aiSkillRecommendations.databases.map(skill => (
                    <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {aiSuggestions.length > 0 ? (
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">Improvement Areas</h4>
          <div className="space-y-4">
            {aiSuggestions.map((section, sectionIdx) => (
              <div key={sectionIdx} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <span className="mb-2 block text-xs font-bold uppercase text-cyan-300">
                  {section.section} #{section.index + 1}
                </span>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="flex gap-2 text-sm text-slate-300">
                      {tip.type === 'weak-verb' || tip.type === 'length' ? (
                        <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} />
                      ) : (
                        <AlertTriangle className="mt-0.5 shrink-0 text-cyan-300" size={16} />
                      )}
                      <span>
                        {tip.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4 text-emerald-100">
          <CheckCircle size={20} />
          <span className="font-medium">No pressing improvements detected. Great job.</span>
        </div>
      )}
    </div>
  );
};
