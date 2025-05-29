import User from "@/server/db/models/User";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import {z} from 'zod'
import { TRPCError } from "@trpc/server";
import { comparePassword, generateToken, generateVerificationCode, hashPassword } from "@/server/utils/authUtils";
import { sendVerificationEmail } from "@/server/utils/mailer";


export const authRouter=router({
    register:publicProcedure
        .input(z.object({
            name:z.string().min(3,{message:"Name must be at least 3 characters"}),
            email:z.string().email({message:"Invalid email"}),
            password: z
                .string()
                .min(6, { message: "Password must be at least 6 characters" })
                .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, {
                    message: "Password must have at least 1 uppercase letter, 1 digit, and 1 special character",
                })
        }))
        .mutation(async ({input})=>{
            const existingUser=await User.findOne({email:input.email})
            if(existingUser){
                throw new TRPCError({code:'CONFLICT',message:'Email already exists'})
            }
            const passwordHash=await hashPassword(input.password)
            const verificationCode=generateVerificationCode()
            const verificationCodeExpires=new Date(Date.now()+3600000)

            const newUser=new User({
                name:input.name,
                email:input.email,
                passwordHash,
                verificationCode,
                verificationCodeExpires
            })
            await newUser.save()
            await sendVerificationEmail(input.email,verificationCode)
            return {
                success:true,
                email:input.email,
                message:'Registration successful. Please check your email to verify your account.'
            }
        }),
    verifyEmail:publicProcedure
        .input(z.object({
            email:z.string().email(),
            code:z.string().length(8)
        }))
        .mutation(async ({input})=>{
            const user=await User.findOne({
                email:input.email,
                verificationCode:input.code,
                verificationCodeExpires:{$gt:new Date()}
            })
            if(!user){
                throw new TRPCError({
                    code:'BAD_REQUEST',
                    message:'Invalid or expired verification code.'
                })
            }
            user.isVerified=true;
            user.verificationCode=null;
            user.verificationCodeExpires=null;
            await user.save()
            return {
                success:true,
                message:'Email verified successfully.'
            }
        }),
    login:publicProcedure
        .input(z.object({
            email:z.string().email(),
            password:z.string()
        }))
        .mutation(async({input})=>{
            const user=await User.findOne({email:input.email})
            if(!user){
                throw new TRPCError({
                    code:'NOT_FOUND',
                    message:'Invalid credentials'
                })
            }
            if(!user.isVerified){
                throw new TRPCError({
                    code:'FORBIDDEN',
                    message:'Please verify your email before logging in.'
                })
            }
            const isPasswordValid=await comparePassword(input.password,user.passwordHash)
            if(!isPasswordValid){
                throw new TRPCError({
                    code:'UNAUTHORIZED',
                    message:'Invalid credentials'
                })
            }
            const token=generateToken(user._id.toString())
            return {
                success:true,
                token,
                user:{
                    id:user._id.toString(),
                    name:user.name,
                    email:user.email
                },
            }
        }),
        getCurrentUser:protectedProcedure
            .query(async({ctx})=>{
                return ctx.user
            })
})