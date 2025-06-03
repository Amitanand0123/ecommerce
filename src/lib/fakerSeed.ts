import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { faker } from '@faker-js/faker';
import dbConnect from '@/server/db';
import CategoryModel from '@/server/db/models/Category';
import mongoose from 'mongoose';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const DESIRED_CATEGORIES = 100;

interface MongoWriteError {
  code: number;
  errmsg: string;
  index: number;
}

interface MongoError extends Error {
    code?: number;
    writeErrors?: MongoWriteError[];
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
      const inserted = await CategoryModel.insertMany(categories, { ordered: false });
      console.log(`Successfully inserted ${inserted.length} categories (duplicates might have been skipped if name is unique and 'ordered:false').`);
    } catch (err: unknown) {
      const mongoErr = err as MongoError;
      if (mongoErr.code === 11000 || (mongoErr.writeErrors && mongoErr.writeErrors.some(e => e.code === 11000))) {
        console.warn(
          'Duplicate key errors occurred during seeding; non-duplicate categories were inserted (if any).'
        );
      } else {
        console.error('Full seeding error:', err);
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