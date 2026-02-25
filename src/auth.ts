
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    await dbConnect();
                    const user = await User.findOne({ email }).select("+password");
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        isProfileComplete: user.isProfileComplete,
                        position: user.profile?.position,
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "line" || account?.provider === "thaid") {
                await dbConnect();

                // 1. Try to find user by provider ID first
                let existingUser = await User.findOne({
                    "providerAccounts.provider": account.provider,
                    "providerAccounts.providerAccountId": account.providerAccountId
                });

                // 2. If not found, try to find by email if available
                if (!existingUser && user.email) {
                    existingUser = await User.findOne({ email: user.email });
                }

                if (!existingUser) {
                    // Generate a placeholder email if none exists (required by User model)
                    const userEmail = user.email || `${account.providerAccountId}@line.me`;

                    const newUser = await User.create({
                        name: user.name || "User",
                        email: userEmail,
                        image: user.image,
                        role: "teacher",
                        providerAccounts: [{
                            provider: account.provider,
                            providerAccountId: account.providerAccountId
                        }],
                        isProfileComplete: false,
                    });

                    user.role = newUser.role;
                    user.isProfileComplete = newUser.isProfileComplete;
                    user.id = newUser._id.toString();
                    user.email = userEmail;
                } else {
                    user.role = existingUser.role;
                    user.isProfileComplete = existingUser.isProfileComplete;
                    user.id = existingUser._id.toString();
                    user.email = existingUser.email;
                    user.position = existingUser.profile?.position;

                    // If user was found by email but didn't have this provider account linked, add it
                    const hasProvider = existingUser.providerAccounts.some(
                        (pa: any) => pa.provider === account.provider
                    );
                    if (!hasProvider) {
                        existingUser.providerAccounts.push({
                            provider: account.provider,
                            providerAccountId: account.providerAccountId
                        });
                        await existingUser.save();
                    }
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Reuse the logic from auth.config.ts for initial token population from 'user' object
            // But also add DB lookup capability if needed (though avoiding DB in JWT callback is faster)

            if (trigger === "update" && session) {
                // Handle both { user: { ... } } and direct { ... } updates
                if (session.user) {
                    token = { ...token, ...session.user }
                } else {
                    token = { ...token, ...session }
                }
            }

            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isProfileComplete = user.isProfileComplete;
                token.position = (user as any).position;
            }
            return token;
        },
    },
})
