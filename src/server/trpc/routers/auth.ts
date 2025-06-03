import UserModel from "@/server/db/models/User";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { z } from 'zod';
import { TRPCError } from "@trpc/server";
import { comparePassword, generateToken, generateVerificationCode, hashPassword } from "@/server/utils/authUtils";
import { sendVerificationEmail } from "@/server/utils/mailer";
import { serialize } from 'cookie';

const UserOutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
});

const TOKEN_COOKIE_NAME = 'token';

export const authRouter = router({
    register: publicProcedure
        .input(z.object({
            name: z.string().min(3, { message: "Name must be at least 3 characters" }),
            email: z.string().email({ message: "Invalid email" }),
            password: z
                .string()
                .min(6, { message: "Password must be at least 6 characters" })
                .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, {
                    message: "Password must have at least 1 uppercase letter, 1 digit, and 1 special character",
                })
        }))
        .mutation(async ({ input }) => {
            const existingUser = await UserModel.findOne({ email: input.email });
            if (existingUser) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Email already exists. If you havent verified your account, please check your email or try logging in to resend verification.',
                    cause: { email: input.email, isConflict: true }
                });
            }
            const passwordHash = await hashPassword(input.password);
            const verificationCode = generateVerificationCode();
            const verificationCodeExpires = new Date(Date.now() + 3600000); // 1 hour

            const newUser = new UserModel({
                name: input.name,
                email: input.email,
                passwordHash,
                verificationCode,
                verificationCodeExpires,
                interestedCategories: []
            });
            await newUser.save();

            try {
                await sendVerificationEmail(input.email, verificationCode);
            } catch (emailError: unknown) {
                let errorMessage = "An unknown error occurred while sending the verification email.";
                if (emailError instanceof Error) {
                    errorMessage = emailError.message;
                } else if (typeof emailError === 'string') {
                    errorMessage = emailError;
                }
                console.error("Failed to send verification email during registration:", errorMessage);
                if (!(emailError instanceof Error)) {
                    console.error("Full email sending error object:", emailError);
                }
            }

            return {
                success: true,
                email: input.email,
                message: 'Registration successful. Please check your email to verify your account.'
            };
        }),

    verifyEmail: publicProcedure
        .input(z.object({
            email: z.string().email(),
            code: z.string().length(8)
        }))
        .mutation(async ({ input }) => {
            const user = await UserModel.findOne({
                email: input.email,
                verificationCode: input.code,
                verificationCodeExpires: { $gt: new Date() }
            });
            if (!user) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid or expired verification code.'
                });
            }
            user.isVerified = true;
            user.verificationCode = null;
            user.verificationCodeExpires = null;
            await user.save();
            return {
                success: true,
                message: 'Email verified successfully.'
            };
        }),

    login: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string()
        }))
        .output(z.object({
            success: z.boolean(),
            user: UserOutputSchema,
        }))
        .mutation(async ({ input, ctx }) => { 
            const user = await UserModel.findOne({ email: input.email });
            if (!user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invalid credentials'
                });
            }
            if (!user.isVerified) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Please verify your email before logging in.',
                    cause: { email: user.email }
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
            ctx.resHeaders.append('Set-Cookie', serialize(TOKEN_COOKIE_NAME, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, 
                path: '/',
            }));

            return {
                success: true,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                },
            };
        }),

    logout: publicProcedure
        .mutation(async ({ ctx }) => {
            ctx.resHeaders.append('Set-Cookie', serialize(TOKEN_COOKIE_NAME, '', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'lax',
                maxAge: -1,
                path: '/',
            }));
            return { success: true, message: 'Logged out successfully' };
        }),

    getCurrentUser: protectedProcedure
        .output(UserOutputSchema.nullable())
        .query(async ({ ctx }) => {
            return {
                id: ctx.user._id.toString(),
                name: ctx.user.name,
                email: ctx.user.email,
            };
        })
});