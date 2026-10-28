"use client";

import { useOS } from "../store/os-store";
import DoorWindow from "./DoorWindow";

export default function WindowManager() {
  const wins = useOS((s) => s.wins);

  return (
    <>
      {wins
        .filter((w) => !w.min)
        .map((w) => (
          <DoorWindow key={w.id} win={w} />
        ))}
    </>
  );
}
