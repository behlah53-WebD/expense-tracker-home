import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb";
import Transaction from "../src/lib/models/Transaction";
import Category from "../src/lib/models/Category";
import Budget from "../src/lib/models/Budget";
import User from "../src/lib/models/User";

async function syncIndexes() {
  await connectDB();
  console.log("Connected to MongoDB. Syncing indexes...");

  await User.syncIndexes();
  console.log("✓ User indexes synced");

  await Category.syncIndexes();
  console.log("✓ Category indexes synced");

  await Budget.syncIndexes();
  console.log("✓ Budget indexes synced");

  await Transaction.syncIndexes();
  console.log("✓ Transaction indexes synced");

  console.log("\nAll indexes have been successfully created on MongoDB Atlas!");
  await mongoose.disconnect();
}

syncIndexes().catch((err) => {
  console.error("Error syncing indexes:", err);
  process.exit(1);
});

