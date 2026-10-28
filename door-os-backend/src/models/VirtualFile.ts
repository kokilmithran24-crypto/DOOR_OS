import { Schema, model, models } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    type: { type: String, enum: ["file", "folder"], required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "VirtualFile", default: null },
    content: { type: String, default: "", maxlength: 1000000 },
    mimeType: { type: String, default: "text/plain" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.index({ userId: 1, parentId: 1, name: 1, type: 1 });

export const VirtualFile = models.VirtualFile || model("VirtualFile", schema);
