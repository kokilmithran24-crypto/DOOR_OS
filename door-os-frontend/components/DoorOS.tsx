"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOS } from "../store/os-store";
import Desktop from "./Desktop";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import AuthModal from "./AuthModal";
import { api, getToken } from "../lib/api";
import { initSocket, disconnectSocket } from "../lib/socket";

export default function DoorOS() {
  const [boot, setBoot] = useState(true);
  const [welcome, setWelcome] = useState(false);
  const { theme, open, start } = useOS();

  useEffect(() => {
    // 1. Boot splash timer
    const t = setTimeout(() => {
      setBoot(false);
      setWelcome(true);
    }, 1600);

    // 2. Full-stack initialization: Backend check & Auth restoration
    const initializeFullStack = async () => {
      try {
        const isHealthy = await api.health();
        useOS.getState().setBackendOnline(isHealthy);

        if (isHealthy && getToken()) {
          try {
            const user = await api.auth.me();
            useOS.getState().setUser(user);
            await useOS.getState().refreshCustomApps();
          } catch {
            api.auth.logout();
          }
        }
      } catch (err) {
        console.warn("[Door OS] Backend health check:", err);
        useOS.getState().setBackendOnline(false);
      }

      // 3. Connect real-time socket events
      initSocket({
        onAppOpened: (data) => {
          console.log("[Door OS Socket] Remote app opened:", data);
        },
        onWindowMoved: (data) => {
          if (data?.payload?.id) {
            useOS.getState().applyRemoteMove(data.payload.id, data.payload.x, data.payload.y);
          }
        },
        onDesktopSync: (data) => {
          if (data?.payload?.theme) {
            useOS.getState().setTheme(data.payload.theme, false);
          }
          if (typeof data?.payload?.wallpaper === "number") {
            useOS.getState().setWall(data.payload.wallpaper, false);
          }
        },
      });
    };

    initializeFullStack();

    return () => {
      clearTimeout(t);
      disconnectSocket();
    };
  }, []);

  return (
    <main className={theme === "dark" ? "os dark" : "os light"}>
      {/* Boot Animation */}
      <AnimatePresence>
        {boot && (
          <motion.div
            className="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="door-mark">
              D<span>·</span>
            </div>
            <h1>
              door<span>OS</span>
            </h1>
            <p>Full-Stack Browser Desktop Operating System</p>
            <div className="loader" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Desktop and Windows */}
      <Desktop />

      {/* Taskbar */}
      <Taskbar />

      {/* Start Menu */}
      {start && <StartMenu />}

      {/* Auth / Cloud Account Modal */}
      <AuthModal />

      {/* Welcome Dialog */}
      {welcome && !boot && (
        <motion.div
          className="welcome-shade"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.section
            className="welcome"
            initial={{ y: 20, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
          >
            <button className="x" onClick={() => setWelcome(false)}>
              ×
            </button>
            <div className="door-mark small">
              D<span>·</span>
            </div>
            <p className="eyebrow">WELCOME TO YOUR SPACE</p>
            <h2>Good to see you.</h2>
            <p>Full-stack desktop environment with cloud notes, virtual files, and AI assistance.</p>
            <button
              className="primary"
              onClick={() => {
                setWelcome(false);
                open("assistant");
              }}
            >
              Meet Door Assistant <span>↗</span>
            </button>
            <button className="quiet" onClick={() => setWelcome(false)}>
              Explore desktop
            </button>
          </motion.section>
        </motion.div>
      )}
    </main>
  );
}
