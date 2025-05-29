import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Interface for the raw Category data structure
export interface ICategoryAttributes {
  name: string;
}

// Interface for the Mongoose Document
export interface ICategoryDocument extends ICategoryAttributes, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the Mongoose Model
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICategoryModel extends Model<ICategoryDocument> {}

const CategorySchema: Schema<ICategoryDocument> = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true, 
    },
  },
  {
    timestamps: true,
  }
);

const CategoryModel = (mongoose.models.Category as ICategoryModel) || mongoose.model<ICategoryDocument, ICategoryModel>('Category', CategorySchema);

export default CategoryModel;