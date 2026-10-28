import type { AppId } from "../store/os-store";
import {
  Folder,
  Settings,
  Terminal,
  Globe,
  NotebookPen,
  Calculator,
  Camera,
  Store,
  Sparkles,
  Monitor,
} from "lucide-react";

export const apps: {
  id: AppId;
  name: string;
  icon: typeof Folder;
  color: string;
  desc: string;
}[] = [
  { id: "assistant", name: "Door Assistant", icon: Sparkles, color: "#a78bfa", desc: "Find your next app" },
  { id: "files", name: "Files", icon: Folder, color: "#60a5fa", desc: "Browse your workspace" },
  { id: "browser", name: "Browser", icon: Globe, color: "#38bdf8", desc: "Explore the web" },
  { id: "notes", name: "Notes", icon: NotebookPen, color: "#fbbf24", desc: "Capture a thought" },
  { id: "calculator", name: "Calculator", icon: Calculator, color: "#34d399", desc: "Quick calculations" },
  { id: "terminal", name: "Terminal", icon: Terminal, color: "#a3e635", desc: "A tiny command line" },
  { id: "settings", name: "Settings", icon: Settings, color: "#c4b5fd", desc: "Make it yours" },
  { id: "camera", name: "Camera", icon: Camera, color: "#fb7185", desc: "Use your camera" },
  { id: "store", name: "App Store", icon: Store, color: "#f472b6", desc: "Discover applications" },
  { id: "about", name: "About Door OS", icon: Monitor, color: "#94a3b8", desc: "Your browser desktop" },
];
