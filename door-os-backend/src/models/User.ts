import { Schema, model, models, Types } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      wallpaper: { type: Number, default: 0 },
      desktopIcons: {
        type: [String],
        default: ["assistant", "files", "browser", "notes", "settings"],
      },
      openApps: { type: [Schema.Types.Mixed], default: [] },
    },
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  preferences: {
    theme: "dark" | "light";
    wallpaper: number;
    desktopIcons: string[];
    openApps: unknown[];
  };
};

export const User = models.User || model("User", schema);
