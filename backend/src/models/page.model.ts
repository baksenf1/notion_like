import mongoose, { Document, Schema } from "mongoose";

export interface PageDocument extends Document {
  title: string;
  content: string;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<PageDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled",
    },
    content: {
      type: String,
      required: false,
      default: "",
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PageModel = mongoose.model<PageDocument>("Page", pageSchema);
export default PageModel;
