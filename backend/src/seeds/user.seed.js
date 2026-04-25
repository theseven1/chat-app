// chat-app/backend/src/seeds/user.seed.js
import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

config();

const seedDatabase = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const seedUsers = [
      {
        email: "emma.thompson@example.com",
        fullName: "Emma Thompson",
        password: hashedPassword,
        profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
        isAdmin: true, // Assigning admin role
      },
      {
        email: "olivia.miller@example.com",
        fullName: "Olivia Miller",
        password: hashedPassword,
        profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
      },
      {
        email: "sophia.davis@example.com",
        fullName: "Sophia Davis",
        password: hashedPassword,
        profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      {
        email: "james.anderson@example.com",
        fullName: "James Anderson",
        password: hashedPassword,
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        email: "william.clark@example.com",
        fullName: "William Clark",
        password: hashedPassword,
        profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
      },
    ];

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully with an Admin account (emma.thompson@example.com)");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// seedDatabase();