import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "daily_reminder" | "motivation";
  email: string;
  subject: string;
  sentAt: Date;
  status: "sent" | "failed";
  errorMessage?: string;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Sorgu performansı için index
    },
    type: {
      type: String,
      enum: ["daily_reminder", "motivation"],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true, // Tarih bazlı sorgular için index
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index: userId ve type kombinasyonu için
notificationSchema.index({ userId: 1, type: 1, sentAt: -1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
