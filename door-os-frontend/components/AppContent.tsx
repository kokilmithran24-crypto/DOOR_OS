"use client";

import { useEffect, useState, useCallback } from "react";
import { useOS, type AppId } from "../store/os-store";
import { apps } from "../lib/apps";
import { api, type VirtualFileItem } from "../lib/api";
import {
  ArrowUpRight,
  Folder,
  HardDrive,
  Plus,
  Play,
  Command,
  Trash2,
  Save,
  Sparkles,
} from "lucide-react";

export default function AppContent({ app }: { app: AppId }) {
  const {
    open,
    theme,
    setTheme,
    wall,
    setWall,
    user,
    setAuthModalOpen,
    backendOnline,
    activeFile,
    setActiveFile,
    customApps,
    refreshCustomApps,
  } = useOS();

  // Assistant states
  const [query, setQuery] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMsg, setAssistantMsg] = useState<string | null>(null);
  const [pendingAppCreate, setPendingAppCreate] = useState<string | null>(null);

  // Files states
  const [files, setFiles] = useState<VirtualFileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileSearch, setFileSearch] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  // Notes states
  const [noteContent, setNoteContent] = useState(
    activeFile?.content || "A fresh page, just for you.\n\nStart writing..."
  );
  const [noteSaved, setNoteSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Other apps states
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [cmd, setCmd] = useState("");
  const [output, setOutput] = useState(
    "Door OS Terminal 1.0\nType help to see available commands."
  );
  const [url, setUrl] = useState("https://example.com");
  const [cam, setCam] = useState(false);

  // Sync activeFile into noteContent
  useEffect(() => {
    if (activeFile) {
      setNoteContent(activeFile.content || "");
      setNoteSaved(true);
    }
  }, [activeFile]);

  // Load files from backend or defaults
  const loadFiles = useCallback(async () => {
    if (user) {
      setFilesLoading(true);
      try {
        const list = await api.fs.list();
        if (list.length === 0) {
          const seeded = await api.fs.create(
            "Welcome to Door OS.txt",
            "file",
            null,
            "Welcome to Door OS!\n\nThis virtual workspace stores your notes and documents securely in MongoDB.\nDouble-click any file to open and edit it in Notes.",
            "text/plain"
          );
          setFiles([seeded]);
        } else {
          setFiles(list);
        }
      } catch (e) {
        console.warn("Using offline file fallback:", e);
        setFiles([
          { _id: "1", name: "Welcome.txt", type: "file", content: "Welcome to Door OS local edition." },
          { _id: "2", name: "Ideas.md", type: "file", content: "# My Project Ideas\n- Full stack Door OS\n- Real-time window sync" },
          { _id: "3", name: "Projects", type: "folder" },
        ]);
      } finally {
        setFilesLoading(false);
      }
    } else {
      setFiles([
        { _id: "1", name: "Welcome.txt", type: "file", content: "Welcome to Door OS!\n\nSign in to synchronize your files across sessions and devices." },
        { _id: "2", name: "Ideas.md", type: "file", content: "# Offline Scratchpad\nSign in to persist your notes to MongoDB." },
        { _id: "3", name: "Workspace Notes.txt", type: "file", content: "Local temporary workspace." },
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (app === "files") {
      loadFiles();
    }
    if (app === "store") {
      refreshCustomApps();
    }
  }, [app, loadFiles, refreshCustomApps]);

  // Camera effect
  useEffect(() => {
    if (app === "camera" && cam) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((stream) => {
          const video = document.querySelector("video[data-camera]") as HTMLVideoElement | null;
          if (video) video.srcObject = stream;
        })
        .catch(() => setOutput("Camera permission was denied or no camera was found."));
    }
  }, [app, cam]);

  // --- 1. ASSISTANT APP ---
  if (app === "assistant") {
    const handleAssistantSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;

      setAssistantLoading(true);
      setAssistantMsg(null);
      setPendingAppCreate(null);

      try {
        if (user && backendOnline) {
          const res = await api.assistant.ask(q);
          if (res.intent === "open" && res.app) {
            open(res.app as AppId);
            setAssistantMsg(`Opened ${res.app}`);
          } else if (res.intent === "open_custom" && res.appId) {
            const found = customApps.find((a) => a._id === res.appId);
            open("about", found ? found.name : "Custom App");
            setAssistantMsg(`Opened custom app: ${found?.name || "App"}`);
          } else if (res.intent === "create") {
            setPendingAppCreate(res.name || q);
            setAssistantMsg(res.message);
          }
        } else {
          // Local fallback
          const match = apps.find(
            (a) =>
              a.name.toLowerCase().includes(q.toLowerCase()) ||
              q.toLowerCase().includes(a.id)
          );
          if (match) {
            open(match.id);
          } else {
            setPendingAppCreate(q);
            setAssistantMsg(`No built-in app matches "${q}". You can create a custom workspace for it.`);
          }
        }
      } catch {
        const match = apps.find(
          (a) =>
            a.name.toLowerCase().includes(q.toLowerCase()) ||
            q.toLowerCase().includes(a.id)
        );
        if (match) open(match.id);
        else open("about", "Made for you: " + q);
      } finally {
        setAssistantLoading(false);
        setQuery("");
      }
    };

    const handleCreateCustomApp = async () => {
      if (!pendingAppCreate) return;
      if (user && backendOnline) {
        try {
          await api.apps.create({
            name: pendingAppCreate,
            description: `Custom app workspace for ${pendingAppCreate}`,
            kind: "custom",
          });
          await refreshCustomApps();
        } catch (e) {
          console.warn("Could not save custom app to backend:", e);
        }
      }
      open("about", pendingAppCreate);
      setPendingAppCreate(null);
      setAssistantMsg(null);
    };

    return (
      <div className="assistant">
        <div className="assistant-orb">
          D<span>·</span>
        </div>
        <span className="eyebrow">YOUR FULL-STACK AI OS ASSISTANT</span>
        <h2>
          What application
          <br />
          would you like to use?
        </h2>
        <p>Tell me what you need. I’ll open a built-in tool or build a dedicated workspace for it.</p>

        <form className="assistant-input" onSubmit={handleAssistantSubmit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. open Notes, calculator, files, project planner..."
            autoFocus
          />
          <button aria-label="Launch" type="submit" disabled={assistantLoading}>
            {assistantLoading ? "…" : "↗"}
          </button>
        </form>

        {assistantMsg && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 14px",
              background: "var(--field)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              fontSize: 11,
              maxWidth: 390,
              color: "#c4b5fd",
            }}
          >
            {assistantMsg}
            {pendingAppCreate && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="primary"
                  style={{ padding: "6px 12px", fontSize: 10 }}
                  onClick={handleCreateCustomApp}
                >
                  Create App Workspace “{pendingAppCreate}” ↗
                </button>
              </div>
            )}
          </div>
        )}

        <div className="suggestions">
          {[
            { label: "Take a note", app: "notes" as AppId },
            { label: "Calculate something", app: "calculator" as AppId },
            { label: "Browse files", app: "files" as AppId },
            { label: "Settings & Cloud", app: "settings" as AppId },
          ].map((item) => (
            <button key={item.label} onClick={() => open(item.app)}>
              {item.label} <ArrowUpRight size={12} />
            </button>
          ))}
        </div>
        <div className="voice-hint">
          {backendOnline
            ? "✳ Connected to Door OS API & MongoDB"
            : "✳ Operating in standalone mode (start backend for full persistence)"}
        </div>
      </div>
    );
  }

  // --- 2. FILES APP (Virtual Filesystem connected to backend MongoDB) ---
  if (app === "files") {
    const handleOpenFile = (f: VirtualFileItem) => {
      if (f.type === "folder") return;
      open("notes", f.name, {
        id: f._id,
        name: f.name,
        content: f.content || "",
      });
    };

    const handleCreateNewFile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFileName.trim()) return;
      const fileName = newFileName.trim().endsWith(".txt") || newFileName.trim().endsWith(".md")
        ? newFileName.trim()
        : `${newFileName.trim()}.txt`;

      if (user && backendOnline) {
        try {
          const created = await api.fs.create(fileName, "file", null, "New note content...");
          setFiles((prev) => [created, ...prev]);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error creating file";
          alert("Error creating file: " + msg);
        }
      } else {
        const localFile: VirtualFileItem = {
          _id: String(Date.now()),
          name: fileName,
          type: "file",
          content: "Local note content...",
        };
        setFiles((prev) => [localFile, ...prev]);
      }
      setNewFileName("");
      setShowNewFileInput(false);
    };

    const handleDeleteFile = async (id: string) => {
      if (!confirm("Are you sure you want to delete this file?")) return;
      if (user && backendOnline) {
        try {
          await api.fs.delete(id);
          setFiles((prev) => prev.filter((f) => f._id !== id));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error deleting file";
          alert("Error deleting file: " + msg);
        }
      } else {
        setFiles((prev) => prev.filter((f) => f._id !== id));
      }
    };

    const filteredFiles = files.filter((f) =>
      f.name.toLowerCase().includes(fileSearch.toLowerCase())
    );

    return (
      <div className="files-app">
        <aside className="file-side">
          {["Home", "Documents", "Notes", "Cloud Drive"].map((v, i) => (
            <button key={v} className={i === 0 ? "selected" : ""}>
              <Folder size={15} />
              {v}
            </button>
          ))}
          <hr />
          <small>STORAGE</small>
          <p>
            <HardDrive size={14} />
            {user ? "Cloud MongoDB" : "Local Workspace"}
          </p>
          <div className="storage">
            <i style={{ width: user ? "45%" : "20%" }} />
          </div>
          <small>{user ? "Online & Synchronized" : "Local Storage"}</small>

          {!user && (
            <button
              onClick={() => setAuthModalOpen(true)}
              style={{
                marginTop: 16,
                padding: "6px 8px",
                background: "rgba(167, 139, 250, 0.15)",
                border: "1px solid rgba(167, 139, 250, 0.3)",
                color: "#c4b5fd",
                borderRadius: 8,
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Sign In to Sync
            </button>
          )}
        </aside>

        <div className="file-main">
          <div className="app-toolbar">
            <b>Home</b>
            <input
              placeholder="Search files..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
            />
            <button onClick={() => setShowNewFileInput((v) => !v)}>
              <Plus size={12} style={{ display: "inline", marginRight: 4 }} />
              New File
            </button>
          </div>

          {showNewFileInput && (
            <form onSubmit={handleCreateNewFile} style={{ display: "flex", gap: 6, margin: "12px 0" }}>
              <input
                autoFocus
                placeholder="File name (e.g. Ideas.txt)..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "var(--field)",
                  color: "var(--text)",
                  fontSize: 11,
                  outline: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: 0,
                  background: "#a78bfa",
                  color: "#1e1738",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewFileInput(false)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontSize: 11,
                }}
              >
                Cancel
              </button>
            </form>
          )}

          <p className="muted">
            {filesLoading
              ? "Loading cloud files..."
              : `Files in workspace (${filteredFiles.length}) · Double-click to open in Notes`}
          </p>

          <div className="file-list">
            {filteredFiles.map((f) => (
              <div
                key={f._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid var(--line)",
                  padding: "6px 4px",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onDoubleClick={() => handleOpenFile(f)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                    border: 0,
                    background: "transparent",
                    textAlign: "left",
                    padding: "6px 0",
                    cursor: "pointer",
                  }}
                >
                  <span className="file-emoji">
                    {f.type === "folder" ? "📁" : f.name.endsWith(".md") ? "📝" : "📄"}
                  </span>
                  <span style={{ flex: 1 }}>
                    {f.name}
                    <small style={{ display: "block", color: "var(--muted)", fontSize: 9, marginTop: 3 }}>
                      {user
                        ? `Cloud file · ${f.updatedAt ? new Date(f.updatedAt).toLocaleDateString() : "Just now"}`
                        : "Local file"}
                    </small>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(f._id)}
                  title="Delete file"
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    border: 0,
                    background: "transparent",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 3. NOTES APP (connected to Virtual Filesystem in MongoDB) ---
  if (app === "notes") {
    const handleSaveNote = async () => {
      setIsSaving(true);
      try {
        if (activeFile?.id && user && backendOnline) {
          await api.fs.update(activeFile.id, { content: noteContent });
          setActiveFile({ ...activeFile, content: noteContent });
          setNoteSaved(true);
        } else if (user && backendOnline) {
          const name = `Note_${new Date().toLocaleTimeString().replace(/:/g, "-")}.txt`;
          const created = await api.fs.create(name, "file", null, noteContent);
          setActiveFile({ id: created._id, name: created.name, content: noteContent });
          setNoteSaved(true);
        } else {
          setNoteSaved(true);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save";
        alert("Failed to save note: " + msg);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="notes-app">
        <div className="notes-top" style={{ alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>
            {activeFile?.name || "UNTITLED NOTE"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: noteSaved ? "#34d399" : "var(--muted)" }}>
              {isSaving
                ? "Saving..."
                : noteSaved
                ? user
                  ? "✓ Saved to MongoDB"
                  : "✓ Saved locally"
                : "• Unsaved changes"}
            </span>
            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              style={{
                border: "1px solid var(--line)",
                background: "var(--field)",
                color: "var(--text)",
                padding: "4px 8px",
                borderRadius: 7,
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Save size={11} /> Save
            </button>
          </div>
        </div>

        <textarea
          value={noteContent}
          onChange={(e) => {
            setNoteContent(e.target.value);
            setNoteSaved(false);
          }}
          placeholder="Start typing your thoughts here..."
          spellCheck={false}
        />
      </div>
    );
  }

  // --- 4. SETTINGS APP (Theme, Wallpaper & Cloud User Sync) ---
  if (app === "settings") {
    return (
      <div className="settings-app">
        <p className="muted">PERSONALIZATION & FULL-STACK CONNECTIVITY</p>
        <h2>Make Door yours.</h2>

        {/* User Account / Auth Section */}
        <div className="setting-row">
          <div>
            <b>User Account & Cloud Sync</b>
            <small>
              {user
                ? `Logged in as ${user.name} (${user.email})`
                : "Running in Guest mode. Sign in to save settings, notes & apps."}
            </small>
          </div>
          {user ? (
            <button
              onClick={() => useOS.getState().logout()}
              style={{
                border: "1px solid var(--line)",
                background: "var(--field)",
                padding: "8px 14px",
                borderRadius: 9,
                fontSize: 11,
              }}
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="primary"
              style={{ padding: "8px 14px", fontSize: 11 }}
            >
              Sign In / Register ↗
            </button>
          )}
        </div>

        {/* Server & Database Status */}
        <div className="setting-row">
          <div>
            <b>Backend API & Database</b>
            <small>
              {backendOnline
                ? "Express API & MongoDB connected at http://localhost:4000"
                : "Backend API offline or connecting... Start with: npm run dev"}
            </small>
          </div>
          <span
            className="status-pill"
            style={{
              background: backendOnline ? "#10b98125" : "#f59e0b25",
              color: backendOnline ? "#34d399" : "#fbbf24",
            }}
          >
            {backendOnline ? "● API Online" : "○ Offline"}
          </span>
        </div>

        {/* Appearance */}
        <div className="setting-row">
          <div>
            <b>Appearance</b>
            <small>Choose the mood of your workspace</small>
          </div>
          <div className="segmented">
            <button
              className={theme === "dark" ? "chosen" : ""}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              className={theme === "light" ? "chosen" : ""}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>

        {/* Wallpaper */}
        <div className="setting-row">
          <div>
            <b>Desktop wallpaper</b>
            <small>Change your desktop atmosphere</small>
          </div>
          <div className="wall-swatches">
            {["#32276b", "#385d7c", "#8e5b5f"].map((c, i) => (
              <button
                key={c}
                style={{ background: c }}
                className={wall === i ? "swatch-on" : ""}
                onClick={() => setWall(i)}
              />
            ))}
          </div>
        </div>

        {/* Desktop experience */}
        <div className="setting-row">
          <div>
            <b>Desktop experience</b>
            <small>Glass windows, multi-windowing, and live socket sync</small>
          </div>
          <span className="status-pill">Enabled</span>
        </div>
      </div>
    );
  }

  // --- 5. APP STORE & CUSTOM APPS ---
  if (app === "store") {
    const handleDeleteCustom = async (id: string) => {
      try {
        await api.apps.delete(id);
        refreshCustomApps();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to delete";
        alert("Failed to delete custom app: " + msg);
      }
    };

    return (
      <div className="store-app">
        <span className="eyebrow">THE DOOR COLLECTION</span>
        <h2>Small apps. Big ideas.</h2>
        <p className="muted">Your built-in and cloud-custom application suite.</p>

        {customApps.length > 0 && (
          <>
            <h4 style={{ margin: "16px 0 8px", font: "600 13px Manrope", color: "#ec4899" }}>
              YOUR CUSTOM CREATED APPS ({customApps.length})
            </h4>
            <div className="store-grid" style={{ marginBottom: 24 }}>
              {customApps.map((ca) => (
                <article key={ca._id}>
                  <span style={{ color: "#ec4899", background: "#ec489920" }}>
                    <Sparkles size={22} />
                  </span>
                  <b>{ca.name}</b>
                  <small>{ca.description || "Created with Door Assistant"}</small>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <button onClick={() => open("about", `Custom App: ${ca.name}`)}>
                      Open ↗
                    </button>
                    <button
                      onClick={() => handleDeleteCustom(ca._id)}
                      style={{ color: "#f87171" }}
                      title="Delete app"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <h4 style={{ margin: "16px 0 8px", font: "600 13px Manrope", color: "var(--muted)" }}>
          BUILT-IN SYSTEM APPS
        </h4>
        <div className="store-grid">
          {apps
            .filter((a) => a.id !== "store")
            .map((a) => {
              const I = a.icon;
              return (
                <article key={a.id}>
                  <span style={{ color: a.color, background: a.color + "20" }}>
                    <I size={22} />
                  </span>
                  <b>{a.name}</b>
                  <small>{a.desc}</small>
                  <button onClick={() => open(a.id)}>Open ↗</button>
                </article>
              );
            })}
        </div>
      </div>
    );
  }

  // --- 6. CALCULATOR ---
  if (app === "calculator") {
    const calculate = (exprStr: string): string => {
      try {
        const safe = exprStr
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-");
        if (!/^[0-9+\-*/().%\s]+$/.test(safe)) return "Invalid";
        // eslint-disable-next-line no-new-func
        const val = Function(`'use strict'; return (${safe})`)();
        return typeof val === "number" && !isNaN(val) ? String(val) : "Error";
      } catch {
        return "Invalid expression";
      }
    };

    return (
      <div className="calc-app">
        <div className="calc-screen">
          <small>DOOR CALCULATOR</small>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="0"
          />
          <strong>{result}</strong>
        </div>
        <div className="calc-grid">
          {[
            "C",
            "(",
            ")",
            "÷",
            "7",
            "8",
            "9",
            "×",
            "4",
            "5",
            "6",
            "−",
            "1",
            "2",
            "3",
            "+",
            "±",
            "0",
            ".",
            "=",
          ].map((k) => (
            <button
              key={k}
              className={
                ["=", "÷", "×", "−", "+", "C"].includes(k) ? "calc-accent" : ""
              }
              onClick={() => {
                if (k === "C") {
                  setExpr("");
                  setResult("");
                } else if (k === "=") {
                  setResult(calculate(expr));
                } else if (k === "±") {
                  setExpr((v) => (v.startsWith("-") ? v.slice(1) : "-" + v));
                } else {
                  setExpr((v) => v + k);
                }
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- 7. TERMINAL ---
  if (app === "terminal") {
    const handleCommand = (e: React.FormEvent) => {
      e.preventDefault();
      const c = cmd.trim();
      let res = "";

      switch (c.toLowerCase()) {
        case "help":
          res = "Available commands: help, status, whoami, apps, date, clear";
          break;
        case "status":
          res = `Backend API: ${backendOnline ? "Online (http://localhost:4000)" : "Offline"}\nAuth State: ${user ? `Logged in as ${user.email}` : "Guest Mode"}\nTheme: ${theme}\nWallpaper: Space 0${wall + 1}`;
          break;
        case "whoami":
          res = user ? `${user.name} <${user.email}>` : "guest@door-os";
          break;
        case "apps":
          res = apps.map((a) => a.name).join(", ");
          break;
        case "date":
          res = new Date().toString();
          break;
        case "clear":
          setOutput("");
          setCmd("");
          return;
        default:
          res = `Command not recognized: "${c}". Type "help" for a list of commands.`;
      }

      setOutput((v) => `${v}\n\n$ ${c}\n${res}`);
      setCmd("");
    };

    return (
      <div className="terminal-app">
        <div className="terminal-caption">
          door@{user ? user.name.toLowerCase().replace(/\s+/g, "-") : "workspace"}: ~
        </div>
        <pre>{output}</pre>
        <form onSubmit={handleCommand}>
          <span>$</span>
          <input
            autoFocus
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="enter command..."
          />
        </form>
      </div>
    );
  }

  // --- 8. BROWSER ---
  if (app === "browser") {
    return (
      <div className="browser-app">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            let u = url.trim();
            if (!/^https?:\/\//i.test(u)) u = "https://" + u;
            setUrl(u);
          }}
        >
          <button type="button">‹</button>
          <button type="button">›</button>
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
          <button type="submit">↗</button>
        </form>
        <iframe
          src={url}
          title="Door browser"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          referrerPolicy="no-referrer"
        />
        <p className="browser-hint">
          Some websites restrict embedding via X-Frame-Options. Use external tab if blank.
        </p>
      </div>
    );
  }

  // --- 9. CAMERA ---
  if (app === "camera") {
    return (
      <div className="camera-app">
        {cam ? (
          <>
            <video data-camera autoPlay playsInline />
            <button onClick={() => setCam(false)}>Stop camera</button>
          </>
        ) : (
          <>
            <div className="camera-placeholder">
              ◉<p>Your camera, when you’re ready.</p>
            </div>
            <button onClick={() => setCam(true)}>
              <Play size={14} /> Enable camera
            </button>
          </>
        )}
      </div>
    );
  }

  // --- 10. ABOUT / CUSTOM APP VIEW ---
  return (
    <div className="about-app">
      <div className="about-logo">
        D<span>·</span>
      </div>
      <span className="eyebrow">DOOR OS FULL-STACK PLATFORM</span>
      <h2>A personal universe in your browser.</h2>
      <p>
        Connected to an Express + MongoDB backend with real-time Socket.IO synchronization,
        virtual cloud filesystem, and intelligent assistant routing.
      </p>
      <button
        className="primary"
        onClick={() => open("notes", "New Note")}
      >
        Open Notes ↗
      </button>
      <div className="about-foot">
        <Command size={14} /> Door OS · Full-Stack Edition · v1.0
      </div>
    </div>
  );
}
