import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IUserAttributes {
  name: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationCode?: string | null;
  verificationCodeExpires?: Date | null;
  interestedCategories: Types.ObjectId[];
}


export interface IUserDocument extends IUserAttributes, Document {
  _id: Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserModel extends Model<IUserDocument> {}

const UserSchema: Schema<IUserDocument> = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
    },
    interestedCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  {
    timestamps: true, 
  }
);

const UserModel = (mongoose.models.User as IUserModel) || mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default UserModel;