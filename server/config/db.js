import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongodInstance = null;

export const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  // Try connecting to provided URI if present
  if (uri && uri.trim() !== '') {
    // Ensure database name is present for Atlas URIs
    let formattedUri = uri.trim();
    if (formattedUri.includes('.mongodb.net/') && formattedUri.endsWith('/')) {
      formattedUri = `${formattedUri}toystore?retryWrites=true&w=majority`;
    }

    try {
      const conn = await mongoose.connect(formattedUri, {
        serverSelectionTimeoutMS: 20000,
      });
      console.log(` MongoDB Connected to specified URI: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`\n⚠️  Could not connect to MONGO_URI (${err.message}).`);
      if (err.message.includes('SSL') || err.message.includes('alert number 80')) {
        console.warn(`   👉 Atlas Tip: Make sure your current IP address is allowed in your MongoDB Atlas Dashboard:`);
        console.warn(`      Go to Atlas -> "Network Access" -> "+ Add IP Address" -> "Allow Access From Anywhere" (0.0.0.0/0).\n`);
      }
      console.warn(`👉 Automatically switching to In-Memory MongoDB engine for uninterrupted operation...\n`);
    }
  }

  // Fallback to In-Memory MongoDB engine
  try {
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'toystore',
      },
    });
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(` Connected to MongoDB (In-Memory Engine): ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(` Error initializing MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
