"use client";

import { FLAG_STYLES } from "@/lib/i18n";

export default function TopRiskCard({ risk, lang, t }) {
  const style = risk.severity === "critical" ? FLAG_STYLES.red : FLAG_STYLES.yellow;

  return (
    <div className={`rounded-xl ring-1 ${style.ring} ${style.bg} p-5 sm:p-6 print-avoid-break`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.badgeBg} ${style.badgeText} font-black text-base`}
        >
          {risk.rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">{risk.clauseTitle?.[lang]}</h3>
            <span
              className={`rounded-full ${style.badgeBg} ${style.badgeText} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide`}
            >
              {risk.severity === "critical" ? t.filterRed : t.filterYellow}
            </span>
          </div>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {t.quoteLabel}
          </p>
          <blockquote className="mt-1 border-l-4 border-slate-300 bg-white/70 rounded-r-md px-3 py-2 text-sm italic text-slate-700">
            &ldquo;{risk.quote}&rdquo;
          </blockquote>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {t.whatsWrongLabel}
          </p>
          <p className="text-sm text-slate-700 mt-0.5">{risk.whatsWrong?.[lang]}</p>

          {risk.lawBasis?.[lang] && (
            <p className="mt-3 inline-block rounded-md bg-slate-900 text-white text-[11px] font-medium px-2 py-1">
              ⚖ {risk.lawBasis[lang]}
            </p>
          )}

          <div className="mt-4 rounded-lg bg-white ring-1 ring-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.cheatSheetLabel}</p>
            {risk.counterLanguage?.[lang] && (
              <div className="mt-2">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                  {t.counterLanguageLabel}
                </p>
                <p className="mt-1 text-sm text-slate-700 bg-emerald-50 rounded-md p-2.5 ring-1 ring-emerald-100 font-mono">
                  {risk.counterLanguage[lang]}
                </p>
              </div>
            )}
            {risk.walkAwayTrigger?.[lang] && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">
                  {t.walkAwayLabel}
                </p>
                <p className="mt-1 text-sm text-slate-700 bg-red-50 rounded-md p-2.5 ring-1 ring-red-100">
                  {risk.walkAwayTrigger[lang]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
