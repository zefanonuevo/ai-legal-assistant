"use client";

export default function LangToggle({ lang, setLang }) {
  return (
    <div className="no-print flex items-center rounded-full bg-slate-200 p-1 text-xs font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("tl")}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "tl" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
        }`}
      >
        TL
      </button>
    </div>
  );
}
