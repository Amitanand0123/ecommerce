import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { verifyToken } from '../utils/authUtils';
import dbConnect from '../db';
import User from '../db/models/User';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
    await dbConnect();
    const { req, resHeaders } = opts;
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    console.log('[SERVER] Authorization header:', authHeader);
    console.log('[SERVER] Extracted token:', token);

    if (token) {
        const decoded = verifyToken(token);
        console.log('[SERVER] Decoded token:', decoded);
        if (decoded && decoded.userId) {
            const user = await User.findById(decoded.userId).select('-passwordHash').lean();
            console.log('[SERVER] User found:', user);
            if (user) {
                return { user, req, resHeaders };
            }
        }
    }
    console.log('[SERVER] Returning unauthenticated context.');
    return { user: null, req, resHeaders };
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