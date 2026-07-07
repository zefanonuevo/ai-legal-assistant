"use client";

import { useState } from "react";
import UploadScreen from "@/components/UploadScreen";
import RiskDashboard from "@/components/RiskDashboard";

export default function Home() {
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(file) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setResult({ analysis: data.analysis, fileName: data.fileName });
      setStatus("done");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  function reset() {
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
  }

  if (status === "done" && result) {
    return (
      <RiskDashboard
        analysis={result.analysis}
        fileName={result.fileName}
        lang={lang}
        setLang={setLang}
        onReset={reset}
      />
    );
  }

  return (
    <UploadScreen
      lang={lang}
      setLang={setLang}
      status={status}
      errorMsg={errorMsg}
      onFile={handleFile}
    />
  );
}
