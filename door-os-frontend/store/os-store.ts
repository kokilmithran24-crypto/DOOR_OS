import { create } from "zustand";
import { api, type UserData, type CustomAppItem } from "../lib/api";
import { emitAppOpened, emitWindowMoved, emitDesktopSync } from "../lib/socket";

export type AppId =
  | "assistant"
  | "files"
  | "settings"
  | "terminal"
  | "browser"
  | "notes"
  | "calculator"
  | "camera"
  | "store"
  | "about";

export type Win = {
  id: string;
  title: string;
  app: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
};

export type ActiveFile = {
  id: string;
  name: string;
  content: string;
} | null;

export type OSState = {
  wins: Win[];
  theme: "dark" | "light";
  wall: number;
  next: number;
  z: number;
  start: boolean;
  user: UserData | null;
  authModalOpen: boolean;
  backendOnline: boolean;
  activeFile: ActiveFile;
  customApps: CustomAppItem[];

  // Window actions
  open: (app: AppId, title?: string, file?: ActiveFile) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  maximize: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number, emitSocket?: boolean) => void;
  resize: (id: string, w: number, h: number) => void;

  // OS actions
  setTheme: (t: "dark" | "light", sync?: boolean) => void;
  setWall: (n: number, sync?: boolean) => void;
  toggleStart: () => void;
  setStart: (open: boolean) => void;

  // Full-Stack Auth & Data actions
  setUser: (user: UserData | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setBackendOnline: (status: boolean) => void;
  setActiveFile: (file: ActiveFile) => void;
  setCustomApps: (apps: CustomAppItem[]) => void;
  refreshCustomApps: () => Promise<void>;
  applyRemoteMove: (id: string, x: number, y: number) => void;
  logout: () => void;
};

export const useOS = create<OSState>()((set, get) => ({
  wins: [],
  theme: "dark",
  wall: 0,
  next: 1,
  z: 2,
  start: false,
  user: null,
  authModalOpen: false,
  backendOnline: false,
  activeFile: null,
  customApps: [],

  open: (app, title, file) => {
    const s = get();
    if (file !== undefined) {
      set({ activeFile: file });
    }

    const old = s.wins.find((w) => w.app === app && !w.min);
    if (old) {
      set({
        wins: s.wins.map((w) =>
          w.id === old.id ? { ...w, z: s.z + 1, title: title || w.title } : w
        ),
        z: s.z + 1,
        start: false,
      });
      emitAppOpened(app, title || old.title);
      return;
    }

    const id = String(s.next);
    const winTitle = title || app[0].toUpperCase() + app.slice(1);
    set({
      next: s.next + 1,
      z: s.z + 1,
      start: false,
      wins: [
        ...s.wins,
        {
          id,
          app,
          title: winTitle,
          x: 90 + ((s.next % 5) * 36),
          y: 55 + ((s.next % 4) * 28),
          w: app === "assistant" ? 500 : app === "browser" ? 760 : app === "files" ? 650 : 560,
          h: app === "assistant" ? 420 : app === "browser" ? 500 : 430,
          z: s.z + 1,
          min: false,
          max: false,
        },
      ],
    });

    emitAppOpened(app, winTitle);
  },

  close: (id) =>
    set((s) => ({
      wins: s.wins.filter((w) => w.id !== id),
    })),

  minimize: (id) =>
    set((s) => ({
      wins: s.wins.map((w) => (w.id === id ? { ...w, min: true } : w)),
    })),

  maximize: (id) =>
    set((s) => ({
      wins: s.wins.map((w) =>
        w.id === id ? { ...w, max: !w.max, min: false } : w
      ),
    })),

  focus: (id) =>
    set((s) => ({
      z: s.z + 1,
      wins: s.wins.map((w) =>
        w.id === id ? { ...w, z: s.z + 1, min: false } : w
      ),
    })),

  move: (id, x, y, emitSocket = true) => {
    set((s) => ({
      wins: s.wins.map((w) => (w.id === id ? { ...w, x, y } : w)),
    }));
    if (emitSocket) {
      emitWindowMoved(id, x, y);
    }
  },

  applyRemoteMove: (id, x, y) => {
    set((s) => ({
      wins: s.wins.map((w) => (w.id === id ? { ...w, x, y } : w)),
    }));
  },

  resize: (id, w, h) =>
    set((s) => ({
      wins: s.wins.map((a) =>
        a.id === id
          ? { ...a, w: Math.max(330, w), h: Math.max(240, h) }
          : a
      ),
    })),

  setTheme: (theme, sync = true) => {
    set({ theme });
    const s = get();
    if (sync && s.user) {
      api.preferences.update({ theme }).catch(() => {});
      emitDesktopSync({ theme });
    }
  },

  setWall: (wall, sync = true) => {
    set({ wall });
    const s = get();
    if (sync && s.user) {
      api.preferences.update({ wallpaper: wall }).catch(() => {});
      emitDesktopSync({ wallpaper: wall });
    }
  },

  toggleStart: () => set((s) => ({ start: !s.start })),
  setStart: (start) => set({ start }),

  setUser: (user) => {
    set({ user });
    if (user?.preferences) {
      if (user.preferences.theme) {
        set({ theme: user.preferences.theme });
      }
      if (typeof user.preferences.wallpaper === "number") {
        set({ wall: user.preferences.wallpaper });
      }
    }
  },

  setAuthModalOpen: (authModalOpen) => set({ authModalOpen }),
  setBackendOnline: (backendOnline) => set({ backendOnline }),
  setActiveFile: (activeFile) => set({ activeFile }),
  setCustomApps: (customApps) => set({ customApps }),

  refreshCustomApps: async () => {
    try {
      if (get().user) {
        const apps = await api.apps.list();
        set({ customApps: apps });
      }
    } catch (e) {
      console.warn("Could not load custom apps:", e);
    }
  },

  logout: () => {
    api.auth.logout();
    set({ user: null, activeFile: null, customApps: [] });
  },
}));
