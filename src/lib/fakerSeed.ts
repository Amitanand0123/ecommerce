import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { faker } from '@faker-js/faker';
import dbConnect from '@/server/db';
import Category from '@/server/db/models/Category';
import mongoose from 'mongoose';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const DESIRED_CATEGORIES = 100;
interface MongoError extends Error {
    code?: number;
}

async function seedCategories() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB for seeding.');

    const categories = Array.from({ length: DESIRED_CATEGORIES }, () => ({
      name: faker.commerce.department(),
    }));

    console.log(`Attempting to insert ${categories.length} new categories…`);
    try {
      const inserted = await Category.insertMany(categories, { ordered: false });
      console.log(`Successfully inserted ${inserted.length} categories (duplicates skipped).`);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as MongoError).code === 11000) {
        console.warn(
          'Duplicate key errors occurred during seeding; non-duplicate categories were inserted.'
        );
      } else {
        throw err;
      }
    }

  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedCategories()
  .then(() => console.log('Seed script finished.'))
  .catch((err) => {
    console.error('Seed script encountered an unhandled error:', err);
    process.exit(1);
  });