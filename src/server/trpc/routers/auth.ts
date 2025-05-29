// src/server/trpc/routers/auth.ts
import User from "@/server/db/models/User";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { z } from 'zod'; // Make sure z is imported
import { TRPCError } from "@trpc/server";
import { comparePassword, generateToken, generateVerificationCode, hashPassword } from "@/server/utils/authUtils";
import { sendVerificationEmail } from "@/server/utils/mailer";

// Define a Zod schema for the user object that will be returned
const UserOutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
});

export const authRouter = router({
    // ... (register and verifyEmail mutations) ...
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
            try {
                await sendVerificationEmail(input.email,verificationCode);
            } catch (emailError) {
                console.error("Failed to send verification email during registration:", emailError);
                // Decide if you want to throw an error that stops registration
                // or just log it and let registration proceed.
                // For now, let's assume registration can proceed even if email fails.
            }
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

    login: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string()
        }))
        // Add the output schema here
        .output(z.object({
            success: z.boolean(),
            token: z.string(),
            user: UserOutputSchema, // Use the defined schema for the user object
        }))
        .mutation(async ({ input }) => {
            const user = await User.findOne({ email: input.email });
            if (!user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invalid credentials'
                });
            }
            if (!user.isVerified) {
                // It's good to send the email here for the client to use in the verify-email redirect
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Please verify your email before logging in.',
                    cause: { email: user.email } // Pass email in cause
                });
            }
            const isPasswordValid = await comparePassword(input.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid credentials'
                });
            }
            const token = generateToken(user._id.toString());
            return {
                success: true,
                token,
                user: { // This structure will now be validated against UserOutputSchema
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                },
            };
        }),
    getCurrentUser: protectedProcedure
        // Also add output schema here for consistency
        .output(UserOutputSchema.nullable()) // User can be null if not authenticated/found (though protectedProcedure handles this)
        .query(async ({ ctx }) => {
            // ctx.user should already match UserOutputSchema if token verification is correct
            // but if ctx.user can be null before this, ensure the types match.
            // The `protectedProcedure` should ensure ctx.user is not null.
            if (!ctx.user) return null; // Should not happen with protectedProcedure
            return {
                id: ctx.user._id.toString(), // Ensure _id is converted
                name: ctx.user.name,
                email: ctx.user.email,
            };
        })
});