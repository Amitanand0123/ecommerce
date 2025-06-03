import {z} from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import CategoryModel, { ICategoryDocument } from '@/server/db/models/Category'; 
import UserModel from '@/server/db/models/User';
import { TRPCError } from '@trpc/server';
import mongoose from 'mongoose';

export const categoryRouter=router({
    getCategories:publicProcedure
        .input(z.object({
            page:z.number().min(1).default(1),
            limit:z.number().min(1).max(100).default(6),
        }))
        .query(async ({input})=>{
            const {page,limit}=input;
            const skip=(page-1)*limit;
            const categories = await CategoryModel.find().skip(skip).limit(limit).lean<ICategoryDocument[]>();
            const totalCategories = await CategoryModel.countDocuments()

            return {
                categories: categories.map(c => ({ ...c, _id: c._id.toString() })),
                totalPages:Math.ceil(totalCategories/limit),
                currentPage:page,
                totalCategories
            }
        }),
    getUserInterests:protectedProcedure
        .query(async ({ctx})=>{
            const user = await UserModel.findById(ctx.user._id).populate<{ interestedCategories: ICategoryDocument[] }>('interestedCategories');
            if(!user) throw new TRPCError({code:'NOT_FOUND',message:'User not found'});
            
            return user.interestedCategories.map((cat: ICategoryDocument) => cat._id.toString());
        }),
    updateUserInterests:protectedProcedure
        .input(z.object({
            categoryIds:z.array(z.string().refine(val=>mongoose.Types.ObjectId.isValid(val),{
                message:'Invalid ObjectId'
            }))
        }))
        .mutation(async ({ctx,input})=>{
            // Use UserModel for querying
            const user = await UserModel.findById(ctx.user._id);
            if(!user) throw new TRPCError({
                code:'NOT_FOUND',
                message:'User not found'
            })
            // Ensure user.interestedCategories is correctly typed or cast if necessary
            user.interestedCategories = input.categoryIds.map(id => new mongoose.Types.ObjectId(id));
            await user.save();
            return {
                success:true,
                message:'Interests updated successfully'
            }
        })
})