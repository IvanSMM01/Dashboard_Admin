"use client";
import { create } from "zustand";

interface UIState {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;

  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;

  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

export const useUI = create<UIState>((set) => ({
  paletteOpen: false,
  openPalette:  () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette:() => set(s => ({ paletteOpen: !s.paletteOpen })),

  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),

  mobileNavOpen: false,
  openMobileNav:   () => set({ mobileNavOpen: true }),
  closeMobileNav:  () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set(s => ({ mobileNavOpen: !s.mobileNavOpen })),
}));
