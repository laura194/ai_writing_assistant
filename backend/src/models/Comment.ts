import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  projectId: mongoose.Types.ObjectId;
  username: string;
  content: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema: Schema = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    username: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<IComment>("Comment", commentSchema);
