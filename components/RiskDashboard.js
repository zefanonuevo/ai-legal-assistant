"use client";

import { useState } from "react";
import { UI_TEXT, FLAG_STYLES } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import TopRiskCard from "@/components/TopRiskCard";
import ClauseCard from "@/components/ClauseCard";

const VERDICT_STYLES = {
  SIGN: { grad: "from-emerald-500 to-emerald-700" },
  NEGOTIATE: { grad: "from-amber-400 to-amber-600" },
  WALK_AWAY: { grad: "from-red-500 to-red-700" },
};

export default function RiskDashboard({ analysis, fileName, lang, setLang, onReset }) {
  const t = UI_TEXT[lang];
  const [filter, setFilter] = useState("all");

  const verdict = analysis.verdict;
  const verdictStyle = VERDICT_STYLES[verdict] || VERDICT_STYLES.NEGOTIATE;
  const allClauses = analysis.allClauses || [];
  const filteredClauses = allClauses.filter((c) => filter === "all" || c.flag === filter);

  const counts = { red: 0, yellow: 0, green: 0 };
  allClauses.forEach((c) => {
    if (counts[c.flag] !== undefined) counts[c.flag]++;
  });

  return (
    <div className="flex flex-1 flex-col items-center px-3 sm:px-6 py-6 sm:py-10">
      <div className="w-full max-w-4xl">
        <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <span aria-hidden>←</span> {t.newUpload}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-white ring-1 ring-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.print}
            </button>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>

        <div className="print-page rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-5 sm:px-10 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.tagline}</p>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate max-w-[16rem] sm:max-w-md">
                {fileName}
              </h1>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.contractTypeLabel}
              </p>
              <p className="text-sm font-semibold text-slate-700">{analysis.contractType}</p>
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${verdictStyle.grad} text-white px-5 sm:px-10 py-8 sm:py-10 print-avoid-break`}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/80">
                  {lang === "tl" ? "Pasya" : "Verdict"}
                </p>
                <p className="mt-1 text-5xl sm:text-6xl font-black tracking-tight break-words">
                  {t.verdictLabels[verdict]}
                </p>
                <p className="mt-3 max-w-xl text-sm sm:text-base text-white/90">{analysis.summary?.[lang]}</p>
              </div>
              <div className="shrink-0 rounded-2xl bg-white/15 backdrop-blur px-6 py-4 text-center ring-1 ring-white/25">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  {t.riskScoreLabel}
                </p>
                <p className="text-4xl font-black leading-tight">
                  {analysis.riskScore}
                  <span className="text-lg font-semibold">/100</span>
                </p>
                <p className="text-xs font-semibold mt-1">{t.riskLevelLabels[analysis.riskLevel]}</p>
              </div>
            </div>
            <RiskBar score={analysis.riskScore} />
          </div>

          <section className="px-5 sm:px-10 py-8 sm:py-10 border-b border-slate-100">
            <SectionHeading title={t.topRisksHeading} subtitle={t.topRisksSubheading} />
            <div className="mt-5 space-y-5">
              {[...(analysis.topRisks || [])]
                .sort((a, b) => a.rank - b.rank)
                .map((risk) => (
                  <TopRiskCard key={risk.rank} risk={risk} lang={lang} t={t} />
                ))}
            </div>
          </section>

          <section className="px-5 sm:px-10 py-8 sm:py-10 border-b border-slate-100">
            <SectionHeading title={t.allClausesHeading} subtitle={t.allClausesSubheading} />
            <div className="no-print mt-4 flex flex-wrap gap-2">
              <FilterPill
                label={`${t.filterAll} (${allClauses.length})`}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <FilterPill
                label={`${t.filterRed} (${counts.red})`}
                active={filter === "red"}
                onClick={() => setFilter("red")}
                flag="red"
              />
              <FilterPill
                label={`${t.filterYellow} (${counts.yellow})`}
                active={filter === "yellow"}
                onClick={() => setFilter("yellow")}
                flag="yellow"
              />
              <FilterPill
                label={`${t.filterGreen} (${counts.green})`}
                active={filter === "green"}
                onClick={() => setFilter("green")}
                flag="green"
              />
            </div>
            <div className="mt-5 space-y-3">
              {filteredClauses.length === 0 && (
                <p className="text-sm text-slate-400">{t.noneFlagged}</p>
              )}
              {filteredClauses.map((clause) => (
                <ClauseCard key={clause.id} clause={clause} lang={lang} t={t} />
              ))}
            </div>
          </section>

          <section className="px-5 sm:px-10 py-8 sm:py-10 border-b border-slate-100">
            <SectionHeading title={t.missingHeading} subtitle={t.missingSubheading} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(analysis.missingClauses || []).map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4 print-avoid-break"
                >
                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <span className="text-slate-400">+</span>
                    {m.title?.[lang]}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t.missingWhyLabel}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">{m.why?.[lang]}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t.missingSuggestLabel}
                  </p>
                  <p className="text-sm text-slate-700 mt-0.5 font-mono bg-white rounded-md p-2 ring-1 ring-slate-200">
                    {m.suggestedLanguage?.[lang]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="px-5 sm:px-10 py-6 bg-slate-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.disclaimerLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{analysis.disclaimer?.[lang]}</p>
            <p className="mt-3 text-[11px] text-slate-400">{t.footerNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function RiskBar({ score }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="mt-6 h-2.5 w-full rounded-full bg-white/25 overflow-hidden">
      <div
        className="h-full rounded-full bg-white transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function FilterPill({ label, active, onClick, flag }) {
  const dotClass = flag ? FLAG_STYLES[flag]?.dot : "bg-slate-500";
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
        active
          ? "bg-slate-900 text-white ring-slate-900"
          : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
      }`}
    >
      {flag && <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
      {label}
    </button>
  );
}
