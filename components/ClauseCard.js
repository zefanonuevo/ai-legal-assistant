"use client";

import { FLAG_STYLES } from "@/lib/i18n";

export default function ClauseCard({ clause, lang, t }) {
  const style = FLAG_STYLES[clause.flag] || FLAG_STYLES.green;

  if (clause.flag === "green") {
    return (
      <div className={`rounded-lg ring-1 ${style.ring} ${style.bg} px-4 py-3 flex items-start gap-3 print-avoid-break`}>
        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${style.dot} shrink-0`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{clause.clauseTitle?.[lang]}</p>
          <p className="text-sm text-slate-600 mt-0.5">{clause.explanation?.[lang]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg ring-1 ${style.ring} ${style.bg} p-4 print-avoid-break`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot} shrink-0`} />
        <p className="text-sm font-semibold text-slate-800">{clause.clauseTitle?.[lang]}</p>
        <span
          className={`rounded-full ${style.badgeBg} ${style.badgeText} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide`}
        >
          {clause.flag === "red" ? t.filterRed : t.filterYellow}
        </span>
      </div>

      {clause.quote && (
        <blockquote className="mt-2 border-l-4 border-slate-300 bg-white/70 rounded-r-md px-3 py-2 text-sm italic text-slate-700">
          &ldquo;{clause.quote}&rdquo;
        </blockquote>
      )}

      <p className="mt-2 text-sm text-slate-700">{clause.explanation?.[lang]}</p>

      {clause.lawBasis?.[lang] && (
        <p className="mt-2 inline-block rounded-md bg-slate-900 text-white text-[11px] font-medium px-2 py-1">
          ⚖ {clause.lawBasis[lang]}
        </p>
      )}

      {(clause.counterLanguage?.[lang] || clause.walkAwayTrigger?.[lang]) && (
        <div className="mt-3 rounded-lg bg-white ring-1 ring-slate-200 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{t.cheatSheetLabel}</p>
          {clause.counterLanguage?.[lang] && (
            <div className="mt-1.5">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                {t.counterLanguageLabel}
              </p>
              <p className="mt-0.5 text-sm text-slate-700 bg-emerald-50 rounded-md p-2 ring-1 ring-emerald-100 font-mono">
                {clause.counterLanguage[lang]}
              </p>
            </div>
          )}
          {clause.walkAwayTrigger?.[lang] && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wide">
                {t.walkAwayLabel}
              </p>
              <p className="mt-0.5 text-sm text-slate-700 bg-red-50 rounded-md p-2 ring-1 ring-red-100">
                {clause.walkAwayTrigger[lang]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
