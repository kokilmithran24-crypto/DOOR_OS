import { Schema, model, models } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 500 },
    kind: { type: String, enum: ["notes", "planner", "widget", "custom"], default: "custom" },
    manifest: { type: Schema.Types.Mixed, default: {} },
    source: { type: String, default: "", maxlength: 50000 },
  },
  { timestamps: true }
);

schema.index({ userId: 1, name: 1 }, { unique: true });

export const App = models.App || model("App", schema);
