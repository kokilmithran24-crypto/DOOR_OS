"use client";

import { useOS } from "../store/os-store";
import { apps } from "../lib/apps";
import WindowManager from "./WindowManager";
import { motion } from "framer-motion";

const walls = [
  "radial-gradient(ellipse at 18% 22%,#5637a9 0,transparent 38%),radial-gradient(ellipse at 80% 76%,#075e78 0,transparent 36%),linear-gradient(135deg,#101127,#171c3a 55%,#08151e)",
  "radial-gradient(ellipse at 70% 20%,#be7c9a 0,transparent 35%),radial-gradient(ellipse at 20% 80%,#4e7199 0,transparent 40%),linear-gradient(135deg,#201a36,#172f47)",
  "radial-gradient(ellipse at 50% 30%,#a86e3b 0,transparent 35%),linear-gradient(135deg,#231b2c,#5c3946 60%,#131c2c)",
];

export default function Desktop() {
  const { open, wall } = useOS();

  return (
    <section
      className="desktop"
      style={{ backgroundImage: walls[wall % walls.length] }}
    >
      <div className="desktop-label">
        <span>DOOR / SPACE 01</span>
        <strong>
          Make room for <i>possibility.</i>
        </strong>
        <small>WEDNESDAY · YOUR PERSONAL WORKSPACE</small>
      </div>

      <div className="desktop-icons">
        {apps
          .filter((a) =>
            ["assistant", "files", "browser", "notes", "store", "settings"].includes(
              a.id
            )
          )
          .map((a) => (
            <motion.button
              whileHover={{ y: -3 }}
              key={a.id}
              className="desktop-icon"
              onDoubleClick={() => open(a.id)}
            >
              <span style={{ background: a.color + "25", color: a.color }}>
                <a.icon size={23} />
              </span>
              {a.name}
            </motion.button>
          ))}
      </div>

      <WindowManager />
      <div className="corner-note">
        DESIGNED TO OPEN POSSIBILITIES <span>✳</span>
      </div>
    </section>
  );
}
