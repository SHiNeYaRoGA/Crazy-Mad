"use client";
import { useEffect, useState } from "react";

export type VoiceKind = "female" | "male" | "voicevox";
export type SpeakLang = "th" | "karaoke";

export type AISettings = {
  voice: VoiceKind;
  speakLang: SpeakLang;
  rate: number;
  vvSpeaker: string;
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  voice: "female",
  speakLang: "th",
  rate: 1,
  vvSpeaker: "3",
};

const KEY = "ai-settings";

export function loadAISettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_AI_SETTINGS; }
}

export function saveAISettings(s: AISettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("ai-settings-changed"));
  } catch {}
}

export function useAISettings() {
  const [s, setS] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  useEffect(() => {
    setS(loadAISettings());
    const on = () => setS(loadAISettings());
    window.addEventListener("ai-settings-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("ai-settings-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return s;
}
