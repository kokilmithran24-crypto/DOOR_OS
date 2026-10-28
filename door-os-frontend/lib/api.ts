const API_BASE = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "/api")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

const TOKEN_KEY = "door_os_jwt_token";

export interface UserPreferences {
  theme?: "dark" | "light";
  wallpaper?: number;
  desktopIcons?: string[];
  openApps?: unknown[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  preferences?: UserPreferences;
}

export interface VirtualFileItem {
  _id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string | null;
  content?: string;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomAppItem {
  _id: string;
  name: string;
  description?: string;
  kind?: "notes" | "planner" | "widget" | "custom";
  manifest?: Record<string, unknown>;
  source?: string;
  createdAt?: string;
}

export interface AssistantResponse {
  intent: "open" | "open_custom" | "create";
  app?: string | null;
  appId?: string;
  name?: string;
  message: string;
  requiresGeneration: boolean;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let url = endpoint;
  if (!endpoint.startsWith("http")) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    if (API_BASE.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
      url = `${API_BASE.replace(/\/api$/, "")}${cleanEndpoint}`;
    } else {
      url = `${API_BASE}${cleanEndpoint}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message = (typeof data?.error === "string" && data.error) ||
      (typeof data?.message === "string" && data.message) ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as unknown as T;
}

export const api = {
  // Health
  async health(): Promise<boolean> {
    try {
      const res = await request<{ status: string }>("/api/health", { method: "GET" });
      return res.status === "ok";
    } catch {
      return false;
    }
  },

  // Auth
  auth: {
    async register(name: string, email: string, password: string): Promise<{ token: string; user: UserData }> {
      const res = await request<{ token: string; user: UserData }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setToken(res.token);
      return res;
    },

    async login(email: string, password: string): Promise<{ token: string; user: UserData }> {
      const res = await request<{ token: string; user: UserData }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      return res;
    },

    async me(): Promise<UserData> {
      const res = await request<{
        user: { _id?: string; id?: string; name: string; email: string; preferences?: UserPreferences };
      }>("/api/auth/me", { method: "GET" });
      const u = res.user;
      return {
        id: u._id || u.id || "",
        name: u.name,
        email: u.email,
        preferences: u.preferences,
      };
    },

    logout(): void {
      setToken(null);
    },
  },

  // Preferences
  preferences: {
    async get(): Promise<UserPreferences> {
      const res = await request<{ preferences: UserPreferences }>("/api/preferences", { method: "GET" });
      return res.preferences;
    },

    async update(preferences: UserPreferences): Promise<UserPreferences> {
      const res = await request<{ preferences: UserPreferences }>("/api/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });
      return res.preferences;
    },
  },

  // Virtual Filesystem
  fs: {
    async list(parentId?: string | null): Promise<VirtualFileItem[]> {
      const query = parentId ? `?parentId=${encodeURIComponent(parentId)}` : "";
      const res = await request<{ files: VirtualFileItem[] }>(`/api/fs${query}`, { method: "GET" });
      return res.files;
    },

    async create(
      name: string,
      type: "file" | "folder",
      parentId?: string | null,
      content = "",
      mimeType = "text/plain"
    ): Promise<VirtualFileItem> {
      const res = await request<{ file: VirtualFileItem }>("/api/fs", {
        method: "POST",
        body: JSON.stringify({ name, type, parentId, content, mimeType }),
      });
      return res.file;
    },

    async update(
      id: string,
      updates: { name?: string; content?: string; mimeType?: string; parentId?: string | null }
    ): Promise<VirtualFileItem> {
      const res = await request<{ file: VirtualFileItem }>(`/api/fs/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      return res.file;
    },

    async delete(id: string): Promise<void> {
      await request<void>(`/api/fs/${id}`, { method: "DELETE" });
    },
  },

  // Custom Apps
  apps: {
    async list(): Promise<CustomAppItem[]> {
      const res = await request<{ apps: CustomAppItem[] }>("/api/apps", { method: "GET" });
      return res.apps;
    },

    async create(app: {
      name: string;
      description?: string;
      kind?: "notes" | "planner" | "widget" | "custom";
      manifest?: Record<string, unknown>;
      source?: string;
    }): Promise<CustomAppItem> {
      const res = await request<{ app: CustomAppItem }>("/api/apps", {
        method: "POST",
        body: JSON.stringify(app),
      });
      return res.app;
    },

    async get(id: string): Promise<CustomAppItem> {
      const res = await request<{ app: CustomAppItem }>(`/api/apps/${id}`, { method: "GET" });
      return res.app;
    },

    async delete(id: string): Promise<void> {
      await request<void>(`/api/apps/${id}`, { method: "DELETE" });
    },
  },

  // Assistant
  assistant: {
    async ask(prompt: string): Promise<AssistantResponse> {
      return request<AssistantResponse>("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
    },
  },
};
