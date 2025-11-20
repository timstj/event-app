import { faker } from "@faker-js/faker";
import { pool } from "../config/db.js";
import { slugify } from "../utils/slugify.js";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
dotenv.config();

const NUM_USERS = 10; // Number of users to create

async function seedUsers() {
  for (let i = 0; i < NUM_USERS; i++) {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    const email = faker.internet.email({
      firstName: first_name,
      lastName: last_name,
    });
    const password = await bcrypt.hash("password123", 10); // Default password for all
    let baseSlug = slugify(first_name, last_name);
    let uniqueSlug = baseSlug;
    let count = 1;

    // Ensure slug is unique
    while (
      (await pool.query("SELECT 1 FROM users WHERE slug = $1", [uniqueSlug]))
        .rowCount > 0
    ) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, slug) VALUES ($1, $2, $3, $4, $5)",
      [first_name, last_name, email, password, uniqueSlug]
    );
    console.log(`Created user: ${first_name} ${last_name} (${email})`);
  }
  console.log("Seeding complete!");
  process.exit();
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
