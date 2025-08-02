import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { categories } from "@/db/schema";

// Load environment variables
config({ path: '.env.local' });

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events"
]

async function main() {
  console.log("Seeding categories...");
  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `This is the ${name.toLowerCase()} category`,
    }));
    await db.insert(categories).values(values);
    console.log("Categories seeded successfully");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

main();