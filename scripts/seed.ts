import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env file automatically
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
} catch {
  // Ignore fallback error
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensetracker";

// Schemas for seeding
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    image: { type: String },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const TransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    note: { type: String },
    date: { type: Date, required: true },
    recurring: { type: Boolean, default: false },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const BudgetSchema = new mongoose.Schema(
  {
    limit: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
const Budget = mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);

async function main() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { dbName: "expensetracker" });
  console.log("Connected successfully to expensetracker database.");

  // Clear demo data
  await Promise.all([
    User.deleteMany({ email: "demo@Expense Trackerledger.com" }),
  ]);

  // Create demo user
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const user = await User.create({
    name: "Alex Vance",
    email: "demo@Expense Trackerledger.com",
    passwordHash,
    currency: "INR",
  });
  console.log("Created demo user:", user.email);

  // Clear demo user's existing records if any
  await Promise.all([
    Category.deleteMany({ userId: user._id }),
    Transaction.deleteMany({ userId: user._id }),
    Budget.deleteMany({ userId: user._id }),
  ]);

  const categoryData = [
    {
      name: "Food & Dining",
      color: "#FF8A5C",
      icon: "Utensils",
      type: "EXPENSE",
    },
    { name: "Housing & Rent", color: "#7C5CFF", icon: "Home", type: "EXPENSE" },
    {
      name: "Transportation",
      color: "#38D5FF",
      icon: "Plane",
      type: "EXPENSE",
    },
    {
      name: "Shopping",
      color: "#FF5C8A",
      icon: "ShoppingBag",
      type: "EXPENSE",
    },
    {
      name: "Bills & Utilities",
      color: "#FFC857",
      icon: "Receipt",
      type: "EXPENSE",
    },
    {
      name: "Health & Fitness",
      color: "#2EF2B0",
      icon: "HeartPulse",
      type: "EXPENSE",
    },
    {
      name: "Entertainment",
      color: "#C77DFF",
      icon: "Gamepad2",
      type: "EXPENSE",
    },
    {
      name: "Education & Tech",
      color: "#5C8AFF",
      icon: "GraduationCap",
      type: "EXPENSE",
    },
    {
      name: "General Expense",
      color: "#8B93B8",
      icon: "MoreHorizontal",
      type: "EXPENSE",
    },
    {
      name: "Monthly Salary",
      color: "#2EF2B0",
      icon: "Briefcase",
      type: "INCOME",
    },
    {
      name: "Freelance & Consulting",
      color: "#38D5FF",
      icon: "Laptop",
      type: "INCOME",
    },
    {
      name: "Investments & Dividends",
      color: "#FFC857",
      icon: "TrendingUp",
      type: "INCOME",
    },
    { name: "Gifts & Bonuses", color: "#C77DFF", icon: "Gift", type: "INCOME" },
    { name: "Other Inflow", color: "#8B93B8", icon: "Coins", type: "INCOME" },
  ];

  const categories = await Category.insertMany(
    categoryData.map(c => ({ ...c, userId: user._id }))
  );
  console.log(`Created ${categories.length} categories.`);

  const catMap = new Map(categories.map(c => [c.name, c._id]));

  // Build realistic 3-month transaction history
  const now = new Date();
  const transactions = [];

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const year = now.getFullYear();
    const month = now.getMonth() - monthOffset;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Primary Salary
    transactions.push({
      amount: 145000,
      type: "INCOME",
      note: "Monthly primary tech salary (direct deposit)",
      date: new Date(year, month, 1, 9, 30),
      recurring: true,
      categoryId: catMap.get("Monthly Salary"),
      userId: user._id,
    });

    // Secondary Freelance Consulting
    transactions.push({
      amount: 42000 + monthOffset * 4500,
      type: "INCOME",
      note: "UI/UX Architecture retainer",
      date: new Date(year, month, 14, 15, 0),
      recurring: false,
      categoryId: catMap.get("Freelance & Consulting"),
      userId: user._id,
    });

    // Investment Dividend
    transactions.push({
      amount: 8500 + monthOffset * 1200,
      type: "INCOME",
      note: "Index Fund & Equity dividend payout",
      date: new Date(year, month, 22, 11, 0),
      recurring: false,
      categoryId: catMap.get("Investments & Dividends"),
      userId: user._id,
    });

    // Realistic monthly expenses
    const expenseData = [
      {
        cat: "Housing & Rent",
        amount: 48000,
        note: "Luxury apartment rental & maintenance",
        day: 3,
        recurring: true,
      },
      {
        cat: "Food & Dining",
        amount: 6200,
        note: "Artisan gourmet grocery haul",
        day: 5,
        recurring: false,
      },
      {
        cat: "Bills & Utilities",
        amount: 4200,
        note: "Fiber gigabit internet & cloud compute",
        day: 7,
        recurring: true,
      },
      {
        cat: "Food & Dining",
        amount: 3400,
        note: "Omakase tasting dinner with colleagues",
        day: 9,
        recurring: false,
      },
      {
        cat: "Transportation",
        amount: 5600,
        note: "Executive cab & airport express commute",
        day: 11,
        recurring: false,
      },
      {
        cat: "Bills & Utilities",
        amount: 3800,
        note: "Smart electricity & climate control",
        day: 13,
        recurring: true,
      },
      {
        cat: "Health & Fitness",
        amount: 4500,
        note: "Crossfit & wellness spa membership",
        day: 15,
        recurring: true,
      },
      {
        cat: "Shopping",
        amount: 12500,
        note: "Ergonomic workspace monitor upgrade",
        day: 17,
        recurring: false,
      },
      {
        cat: "Food & Dining",
        amount: 4800,
        note: "Weekly organic fresh produce & provisions",
        day: 19,
        recurring: false,
      },
      {
        cat: "Entertainment",
        amount: 2400,
        note: "IMAX premiere tickets & streaming suite",
        day: 21,
        recurring: false,
      },
      {
        cat: "Education & Tech",
        amount: 3900,
        note: "AI research lab subscription & books",
        day: 23,
        recurring: true,
      },
      {
        cat: "Transportation",
        amount: 3200,
        note: "Weekend electric vehicle charging & tolls",
        day: 25,
        recurring: false,
      },
      {
        cat: "Food & Dining",
        amount: 2900,
        note: "Artisan espresso & cafe workspace sessions",
        day: 27,
        recurring: false,
      },
    ];

    for (const e of expenseData) {
      const day = Math.min(e.day, daysInMonth);
      transactions.push({
        amount: e.amount,
        type: "EXPENSE",
        note: e.note,
        date: new Date(year, month, day, 14, 0),
        recurring: e.recurring,
        categoryId: catMap.get(e.cat),
        userId: user._id,
      });
    }
  }

  await Transaction.insertMany(transactions);
  console.log(`Created ${transactions.length} transactions.`);

  // Create monthly budgets
  const budgetData = [
    { cat: "Housing & Rent", limit: 50000 },
    { cat: "Food & Dining", limit: 20000 },
    { cat: "Transportation", limit: 12000 },
    { cat: "Shopping", limit: 15000 },
    { cat: "Bills & Utilities", limit: 10000 },
    { cat: "Health & Fitness", limit: 6000 },
  ];

  await Budget.insertMany(
    budgetData.map(b => ({
      limit: b.limit,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      categoryId: catMap.get(b.cat),
      userId: user._id,
    }))
  );
  console.log(`Created ${budgetData.length} budgets.`);

  console.log("\n==========================================");
  console.log("Expense Tracker LEDGER SEEDING COMPLETE");
  console.log("Demo Account Credentials:");
  console.log("Email:    demo@Expense Trackerledger.com");
  console.log("Password: Password123!");
  console.log("==========================================\n");

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
