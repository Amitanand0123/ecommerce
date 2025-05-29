import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { verifyToken } from '../utils/authUtils';
import dbConnect from '../db';
import UserModel from '../db/models/User';
import { Types } from 'mongoose'; 


export type ContextUser = {
  _id: Types.ObjectId; 
  name: string;
  email: string;
  isVerified: boolean;
  interestedCategories: Types.ObjectId[];
};

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  await dbConnect();
  const { req, resHeaders } = opts;

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;


  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      const user = await UserModel.findById(decoded.userId)
        .select('-passwordHash')
        .lean<ContextUser>();
      
      if (user) {
        return { user, req, resHeaders };
      }
    }
  }
  return { user: null as ContextUser | null, req, resHeaders }; 
};

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) { 
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
