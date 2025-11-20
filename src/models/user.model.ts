import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  // Notification preferences
  notificationPreferences?: {
    dailyReminder: boolean;
    reminderTime?: string; // Format: "HH:MM" (örn: "09:00")
    motivationMessages: boolean;
    motivationFrequency?: "daily" | "weekly" | "biweekly"; // Günlük, haftalık, iki haftada bir
    pushNotifications?: boolean; // Push notification tercihi
  };
  // FCM tokens for push notifications (birden fazla cihaz için array)
  fcmTokens?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "İsim zorunludur"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email zorunludur"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Geçerli bir email adresi giriniz",
      ],
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
      select: false, // Password varsayılan olarak getirilmez
    },
    resetPasswordToken: {
      type: String,
      select: false, // Varsayılan olarak getirilmez
    },
    resetPasswordExpire: {
      type: Date,
      select: false, // Varsayılan olarak getirilmez
    },
    notificationPreferences: {
      dailyReminder: {
        type: Boolean,
        default: false,
      },
      reminderTime: {
        type: String,
        default: "09:00", // Varsayılan saat: 09:00
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Geçerli bir saat formatı giriniz (HH:MM)",
        ],
      },
      motivationMessages: {
        type: Boolean,
        default: false,
      },
      motivationFrequency: {
        type: String,
        enum: ["daily", "weekly", "biweekly"],
        default: "weekly",
      },
      pushNotifications: {
        type: Boolean,
        default: true, // Varsayılan olarak açık
      },
    },
    fcmTokens: {
      type: [String],
      default: [],
      select: false, // Varsayılan olarak getirilmez (güvenlik için)
    },
  },
  { timestamps: true }
);

// Password hash'leme - Kayıt öncesi
userSchema.pre("save", async function (next) {
  // Eğer password değişmediyse hash'leme
  if (!this.isModified("password")) {
    return next();
  }

  // Password'ü hash'le
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password karşılaştırma metodu
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
