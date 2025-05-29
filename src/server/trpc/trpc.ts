import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { verifyToken } from '../utils/authUtils';
import dbConnect from '../db';
import UserModel from '../db/models/User'; // Changed import to UserModel to match export
import { Types } from 'mongoose'; // Import Types

// Define a specific type for the user object in the tRPC context (after .lean())
export type ContextUser = {
  _id: Types.ObjectId; // Mongoose _id is Types.ObjectId
  name: string;
  email: string;
  isVerified: boolean;
  interestedCategories: Types.ObjectId[];
  // Add any other fields from IUser that are selected and needed by procedures
};

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  await dbConnect();
  const { req, resHeaders } = opts;

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // console.log('[SERVER] Authorization header:', authHeader); // Keep for debugging if needed
  // console.log('[SERVER] Extracted token:', token);

  if (token) {
    const decoded = verifyToken(token);
    // console.log('[SERVER] Decoded token:', decoded);
    if (decoded && decoded.userId) {
      // Use .lean<ContextUser>() to get a plain object with the correct type
      const user = await UserModel.findById(decoded.userId)
        .select('-passwordHash') // Ensure all necessary fields for ContextUser are selected
        .lean<ContextUser>();
      
      // console.log('[SERVER] User found:', user);
      if (user) {
        return { user, req, resHeaders };
      }
    }
  }
  // console.log('[SERVER] Returning unauthenticated context.');
  return { user: null as ContextUser | null, req, resHeaders }; // Ensure consistent type for user
};

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) { // ctx.user is ContextUser | null here
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // ctx.user is now ContextUser (non-null)
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);