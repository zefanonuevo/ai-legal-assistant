"use client";

import { useEffect, useRef, useState } from "react";
import { UI_TEXT } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

const MAX_BYTES = 15 * 1024 * 1024;

export default function UploadScreen({ lang, setLang, status, errorMsg, onFile }) {
  const t = UI_TEXT[lang];
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [prevLoading, setPrevLoading] = useState(false);
  const inputRef = useRef(null);
  const isLoading = status === "loading";

  if (isLoading !== prevLoading) {
    setPrevLoading(isLoading);
    setMessageIndex(0);
  }

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % t.loadingMessages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [isLoading, t.loadingMessages.length]);

  function validateAndSet(file) {
    setLocalError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setLocalError(lang === "tl" ? "PDF file lang ang tinatanggap." : "Only PDF files are accepted.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(lang === "tl" ? "Masyadong malaki ang file (max 15MB)." : "File is too large (max 15MB).");
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    validateAndSet(file);
  }

  function handleSubmit() {
    if (selectedFile) onFile(selectedFile);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
              PH
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">{t.appName}</p>
              <p className="text-xs text-slate-500 leading-none mt-1">{t.tagline}</p>
            </div>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.uploadTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">{t.uploadSubtitle}</p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isLoading) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isLoading && inputRef.current?.click()}
            className={`mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-slate-900 bg-slate-50"
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
            } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
          >
            <svg
              className="h-9 w-9 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
            <p className="text-sm font-medium text-slate-700">{t.dropHint}</p>
            <p className="text-xs text-slate-400">{t.fileTypeHint}</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => validateAndSet(e.target.files?.[0])}
            />
          </div>

          {selectedFile && !isLoading && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 ring-1 ring-slate-200 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="truncate text-sm text-slate-700">{selectedFile.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 shrink-0 ml-3"
              >
                {t.removeFile}
              </button>
            </div>
          )}

          {(localError || errorMsg) && (
            <p className="mt-3 text-sm font-medium text-red-600">{localError || errorMsg}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                {t.loadingMessages[messageIndex]}
              </span>
            ) : (
              t.analyzeButton
            )}
          </button>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t.stepsHeading}
            </p>
            <ul className="mt-3 space-y-2">
              {t.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {lang === "tl"
            ? "Pangkalahatang impormasyon lamang ito, hindi legal advice. Kumonsulta sa abugado para sa tiyak na payo."
            : "For general informational purposes only, not legal advice. Consult a lawyer for advice specific to your situation."}
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}
