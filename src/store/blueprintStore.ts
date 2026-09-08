"use client";

import { create } from "zustand";
import type { BlueprintOverview, GenerateRequest } from "@/app/api/generate/route";

export type { BlueprintOverview, GenerateRequest };

interface BlueprintState {
  // The last successful blueprint result from /api/generate
  blueprint: BlueprintOverview | null;
  // The intake data that produced the current blueprint
  intakeData: GenerateRequest | null;
  // Generation state
  isGenerating: boolean;
  error: string | null;

  // Actions
  setBlueprint: (data: BlueprintOverview, intake: GenerateRequest) => void;
  setGenerating: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useBlueprintStore = create<BlueprintState>()((set) => ({
  blueprint: null,
  intakeData: null,
  isGenerating: false,
  error: null,

  setBlueprint: (data, intake) =>
    set({ blueprint: data, intakeData: intake, isGenerating: false, error: null }),

  setGenerating: (v) => set({ isGenerating: v, error: null }),

  setError: (msg) => set({ error: msg, isGenerating: false }),

  reset: () =>
    set({ blueprint: null, intakeData: null, isGenerating: false, error: null }),
}));
