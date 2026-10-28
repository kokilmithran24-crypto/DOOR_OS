"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Minus, Square, X, Grip } from "lucide-react";
import type { Win } from "../store/os-store";
import { useOS } from "../store/os-store";
import AppContent from "./AppContent";

export default function DoorWindow({ win: w }: { win: Win }) {
  const { close, minimize, maximize, focus, move, resize } = useOS();
  const drag = useRef<{ x: number; y: number; wx: number; wy: number } | null>(null);
  const size = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  return (
    <motion.article
      className={"window " + (w.max ? "maximized" : "")}
      style={{
        left: w.max ? 8 : w.x,
        top: w.max ? 8 : w.y,
        width: w.max ? "calc(100% - 16px)" : w.w,
        height: w.max ? "calc(100% - 92px)" : w.h,
        zIndex: w.z,
      }}
      onPointerDown={() => focus(w.id)}
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <header
        className="window-head"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            wx: w.x,
            wy: w.y,
          };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current && !w.max) {
            move(
              w.id,
              Math.max(0, drag.current.wx + e.clientX - drag.current.x),
              Math.max(0, drag.current.wy + e.clientY - drag.current.y)
            );
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <div className="traffic">
          <button className="red" onClick={() => close(w.id)}>
            <X size={10} />
          </button>
          <button className="yellow" onClick={() => minimize(w.id)}>
            <Minus size={10} />
          </button>
          <button className="green" onClick={() => maximize(w.id)}>
            <Square size={9} />
          </button>
        </div>
        <span className="window-title">
          <Grip size={13} />
          {w.title}
        </span>
        <span className="window-spacer" />
      </header>

      <div className="window-body">
        <AppContent app={w.app} />
      </div>

      {!w.max && (
        <div
          className="resize-handle"
          onPointerDown={(e) => {
            e.stopPropagation();
            size.current = {
              x: e.clientX,
              y: e.clientY,
              w: w.w,
              h: w.h,
            };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (size.current) {
              resize(
                w.id,
                size.current.w + e.clientX - size.current.x,
                size.current.h + e.clientY - size.current.y
              );
            }
          }}
          onPointerUp={() => {
            size.current = null;
          }}
        />
      )}
    </motion.article>
  );
}
