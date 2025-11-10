import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Her iki değişken adını da kontrol et (MONGO_URI veya MONGODB_URI)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn(
        "⚠️  MONGO_URI veya MONGODB_URI environment variable is not set!"
      );
      console.warn(
        "⚠️  MongoDB connection skipped. Please set MONGO_URI or MONGODB_URI in .env file"
      );
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn("⚠️  Continuing without MongoDB connection...");
  }
};

export default connectDB;
