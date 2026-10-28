"use client";

import { useEffect, useState } from "react";
import { Grid2X2, Wifi, BatteryFull, Search, Volume2, User as UserIcon } from "lucide-react";
import { useOS } from "../store/os-store";
import { apps } from "../lib/apps";

export default function Taskbar() {
  const { wins, open, toggleStart, theme, user, backendOnline, setAuthModalOpen } = useOS();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="taskbar">
      <button className="start-button" onClick={toggleStart} title="Start Menu">
        <Grid2X2 size={20} />
      </button>

      <button className="task-search" onClick={() => open("assistant")}>
        <Search size={15} /> <span>Ask Door anything</span>
      </button>

      <div className="task-apps">
        {apps
          .filter((a) => wins.some((w) => w.app === a.id))
          .map((a) => {
            const I = a.icon;
            return (
              <button
                key={a.id}
                title={a.name}
                className={
                  "task-app " +
                  (wins.some((w) => w.app === a.id && !w.min) ? "active" : "")
                }
                onClick={() => {
                  const w = wins.find((win) => win.app === a.id);
                  if (w) useOS.getState().focus(w.id);
                  else open(a.id);
                }}
              >
                <I size={19} />
              </button>
            );
          })}
      </div>

      <div className="tray">
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          style={{
            border: 0,
            background: user ? "rgba(167, 139, 250, 0.18)" : "transparent",
            color: user ? "#c4b5fd" : "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 8px",
            borderRadius: 8,
            fontSize: 10,
            cursor: "pointer",
          }}
          title={user ? `Signed in as ${user.name} (${user.email})` : "Sign In to Door OS"}
        >
          <UserIcon size={13} />
          <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user ? user.name.split(" ")[0] : "Sign In"}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: backendOnline ? "#34d399" : "#fbbf24",
              display: "inline-block",
            }}
            title={backendOnline ? "Door API Online" : "Local Mode (Backend Offline)"}
          />
        </button>

        <Wifi size={15} style={{ opacity: backendOnline ? 1 : 0.6 }} />
        <Volume2 size={15} />
        <BatteryFull size={17} />

        <span className="clock">
          {time}
          <small>
            {new Date().toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </small>
        </span>

        <button
          className="theme-mini"
          title="Toggle Theme"
          onClick={() =>
            useOS.getState().setTheme(theme === "dark" ? "light" : "dark")
          }
        >
          ◐
        </button>
      </div>
    </footer>
  );
}
