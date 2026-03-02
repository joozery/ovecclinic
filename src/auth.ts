
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
            console.log("SignIn Callback Trial:", { provider: account?.provider, email: user.email });
            try {
                if (account?.provider === "thaid") {
                    console.log("Connecting to DB...");
                    await dbConnect();
                    console.log("DB Connected.");

                    const profileData = profile as any;
                    const firstName = profileData.firstNameTH || profileData?.given_name || profileData?.th_fname || "";
                    const lastName = profileData.lastNameTH || profileData?.family_name || profileData?.th_lname || "";
                    const firstNameEN = profileData.firstNameEN || profileData?.given_name_en || profileData?.en_fname || "";
                    const lastNameEN = profileData.lastNameEN || profileData?.family_name_en || profileData?.en_lname || "";
                    const prefixTH = profileData.prefixTH || profileData?.title || profileData?.th_title || "";
                    const prefixEN = profileData.prefixEN || profileData?.title_en || profileData?.en_title || "";
                    const birthdate = profileData?.birthdate || ""; // Standardize name to match RegisterForm
                    const idCardFromProfile = profileData?.idCard || profileData?.pid || account.providerAccountId;

                    // 1. Try to find user by provider ID first
                    console.log("Searching for user by provider ID:", account.providerAccountId);
                    let existingUser = await User.findOne({
                        "providerAccounts.provider": account.provider,
                        "providerAccounts.providerAccountId": account.providerAccountId
                    });

                    // 2. If not found, try to find by email if available
                    if (!existingUser && user.email) {
                        console.log("User not found by provider ID, searching by email:", user.email);
                        existingUser = await User.findOne({ email: user.email });
                    }

                    // 3. If still not found, search by idCard (VERY IMPORTANT to prevent duplicate error)
                    if (!existingUser && idCardFromProfile) {
                        console.log("User not found by email, searching by idCard:", idCardFromProfile);
                        existingUser = await User.findOne({ idCard: idCardFromProfile });
                    }

                    if (!existingUser) {
                        console.log("Creating new user...");
                        const userEmail = user.email || `${account.providerAccountId}@thaid.go.th`;

                        const newUser = await User.create({
                            name: user.name || `${firstName} ${lastName}`.trim() || "User",
                            email: userEmail,
                            idCard: idCardFromProfile,
                            image: user.image,
                            role: "teacher",
                            providerAccounts: [{
                                provider: account.provider,
                                providerAccountId: account.providerAccountId
                            }],
                            profile: {
                                firstNameTH: firstName,
                                lastNameTH: lastName,
                                firstNameEN: firstNameEN,
                                lastNameEN: lastNameEN,
                                prefixTH: prefixTH,
                                prefixEN: prefixEN,
                                birthDate: birthdate ? new Date(birthdate) : null,
                                registrantType: "Thai",
                            },
                            isProfileComplete: false,
                        });
                        console.log("New user created successfully:", newUser._id);

                        user.role = newUser.role;
                        user.isProfileComplete = newUser.isProfileComplete;
                        user.id = newUser._id.toString();
                        user.email = userEmail;
                        (user as any).idCard = idCardFromProfile;
                        (user as any).firstNameTH = firstName;
                        (user as any).lastNameTH = lastName;
                        (user as any).firstNameEN = firstNameEN;
                        (user as any).lastNameEN = lastNameEN;
                        (user as any).prefixTH = prefixTH;
                        (user as any).prefixEN = prefixEN;
                        (user as any).birthdate = birthdate;
                    } else {
                        console.log("Existing user found:", existingUser._id);
                        user.role = existingUser.role;
                        user.isProfileComplete = existingUser.isProfileComplete;
                        user.id = existingUser._id.toString();
                        user.email = existingUser.email;
                        (user as any).position = existingUser.profile?.position;
                        (user as any).idCard = existingUser.idCard;
                        (user as any).firstNameTH = existingUser.profile?.firstNameTH;
                        (user as any).lastNameTH = existingUser.profile?.lastNameTH;
                        (user as any).firstNameEN = existingUser.profile?.firstNameEN;
                        (user as any).lastNameEN = existingUser.profile?.lastNameEN;
                        (user as any).prefixTH = existingUser.profile?.prefixTH;
                        (user as any).prefixEN = existingUser.profile?.prefixEN;
                        (user as any).birthdate = existingUser.profile?.birthDate ? existingUser.profile.birthDate.toISOString().split('T')[0] : null;

                        if (existingUser.image) {
                            user.image = existingUser.image;
                        }

                        // Link provider account if not already linked
                        const hasProvider = existingUser.providerAccounts.some(
                            (pa: any) => pa.provider === account.provider
                        );
                        if (!hasProvider) {
                            console.log("Linking new provider account to existing user...");
                            existingUser.providerAccounts.push({
                                provider: account.provider,
                                providerAccountId: account.providerAccountId
                            });
                            // If user didn't have idCard yet, add it
                            if (!existingUser.idCard && idCardFromProfile) {
                                existingUser.idCard = idCardFromProfile;
                            }
                            await existingUser.save();
                            console.log("Provider account linked successfully.");
                        }
                    }
                }
                return true;
            } catch (error) {
                console.error("SignIn Callback FATAL Error:", error);
                return false;
            }
        },
        async jwt({ token, user, trigger, session }) {
            // Reuse the logic from auth.config.ts for initial token population from 'user' object
            // But also add DB lookup capability if needed (though avoiding DB in JWT callback is faster)

            if (trigger === "update" && session) {
                // Handle both { user: { ... } } and direct { ... } updates so image is synced
                if (session.user) {
                    token = { ...token, ...session.user };
                    if (session.user.image) token.picture = session.user.image;
                } else {
                    token = { ...token, ...session };
                    if (session.image) token.picture = session.image;
                }
            }

            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isProfileComplete = user.isProfileComplete;
                token.idCard = (user as any).idCard;
                token.firstNameTH = (user as any).firstNameTH;
                token.lastNameTH = (user as any).lastNameTH;
                token.firstNameEN = (user as any).firstNameEN;
                token.lastNameEN = (user as any).lastNameEN;
                token.prefixTH = (user as any).prefixTH;
                token.prefixEN = (user as any).prefixEN;
                token.birthdate = (user as any).birthdate;
                token.position = (user as any).position;
                if (user.image) token.picture = user.image;
            }
            return token;
        },
    },
})
