"use client";

import { useState } from "react";
import { Search, Sparkles, LogOut, LogIn, LayoutGrid } from "lucide-react";
import { useOS } from "../store/os-store";
import { apps } from "../lib/apps";

export default function StartMenu() {
  const [q, setQ] = useState("");
  const { open, user, setAuthModalOpen, logout, customApps } = useOS();

  const list = apps.filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase())
  );

  const matchedCustom = customApps.filter((ca) =>
    ca.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <aside className="start-menu">
      <div className="start-top" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span className="door-mark tiny">
            D<span>·</span>
          </span>
          <div>
            <b>Door OS</b>
            <small>{user ? `Welcome, ${user.name}` : "Full-Stack Browser Desktop"}</small>
          </div>
        </div>

        {user ? (
          <button
            type="button"
            onClick={logout}
            style={{
              border: "1px solid var(--line)",
              background: "var(--field)",
              borderRadius: 8,
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: "var(--muted)",
            }}
            title="Log out"
          >
            <LogOut size={12} /> Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            style={{
              border: "1px solid rgba(167, 139, 250, 0.4)",
              background: "rgba(167, 139, 250, 0.15)",
              borderRadius: 8,
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: "#c4b5fd",
            }}
          >
            <LogIn size={12} /> Sign In
          </button>
        )}
      </div>

      <label className="start-search">
        <Search size={16} />
        <input
          autoFocus
          placeholder="Find an application..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <p className="section-label">
        YOUR APPLICATIONS <span>{list.length + matchedCustom.length}</span>
      </p>

      <div className="app-grid">
        {list.map((a) => {
          const I = a.icon;
          return (
            <button key={a.id} onClick={() => open(a.id)}>
              <span style={{ color: a.color, background: a.color + "20" }}>
                <I size={21} />
              </span>
              <b>{a.name}</b>
            </button>
          );
        })}

        {matchedCustom.map((ca) => (
          <button
            key={ca._id}
            onClick={() => open("about", `Custom App: ${ca.name}`)}
          >
            <span style={{ color: "#ec4899", background: "#ec489920" }}>
              <Sparkles size={21} />
            </span>
            <b>{ca.name}</b>
          </button>
        ))}
      </div>

      <div className="start-bottom">
        <span>
          <LayoutGrid size={11} style={{ display: "inline", marginRight: 4 }} />
          {user ? `${user.email} (Cloud Sync)` : "Local Workspace"}
        </span>
        <button onClick={() => open("settings")}>Settings ↗</button>
      </div>
    </aside>
  );
}
