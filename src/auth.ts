
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
                    const firstName = profileData.given_name || "";
                    const lastName = profileData.family_name || "";
                    const firstNameEN = profileData.given_name_en || "";
                    const lastNameEN = profileData.family_name_en || "";
                    const prefixTH = profileData.title || "";
                    const prefixEN = profileData.title_en || "";
                    const gender = profileData?.gender || "";
                    const birthdate = profileData?.birthdate || "";
                    const idCardFromProfile = profileData?.pid || profileData?.sub || account.providerAccountId;

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
                        console.log("Creating new user with prefix:", prefixTH, "and name:", firstName);
                        const userEmail = user.email || `${account.providerAccountId}@thaid.go.th`;

                        const formattedName = `${prefixTH}${firstName} ${lastName}`.trim();
                        const newUser = await User.create({
                            name: formattedName || "User",
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
                                gender: gender === "1" ? "ชาย" : gender === "2" ? "หญิง" : gender,
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
                        (user as any).gender = gender === "male" || gender === "1" ? "ชาย" : gender === "female" || gender === "2" ? "หญิง" : gender;
                    } else {
                        console.log("Existing user found:", existingUser._id);
                        const formattedName = `${prefixTH}${firstName} ${lastName}`.trim();
                        user.name = formattedName || existingUser.name;
                        user.role = existingUser.role;
                        user.isProfileComplete = existingUser.isProfileComplete;
                        user.id = existingUser._id.toString();
                        user.email = existingUser.email;
                        (user as any).position = existingUser.profile?.position;
                        (user as any).idCard = existingUser.idCard || idCardFromProfile;
                        (user as any).firstNameTH = firstName || existingUser.profile?.firstNameTH;
                        (user as any).lastNameTH = lastName || existingUser.profile?.lastNameTH;
                        (user as any).firstNameEN = firstNameEN || existingUser.profile?.firstNameEN;
                        (user as any).lastNameEN = lastNameEN || existingUser.profile?.lastNameEN;
                        (user as any).prefixTH = prefixTH || existingUser.profile?.prefixTH;
                        (user as any).prefixEN = prefixEN || existingUser.profile?.prefixEN;
                        (user as any).birthdate = (birthdate || (existingUser.profile?.birthDate ? existingUser.profile.birthDate.toISOString().split('T')[0] : null));
                        (user as any).gender = (gender === "male" || gender === "1" ? "ชาย" : gender === "female" || gender === "2" ? "หญิง" : gender) || existingUser.profile?.gender;

                        if (existingUser.image) {
                            user.image = existingUser.image;
                        }

                        // Update existing user with fresh ThaiID data if missing or if name format needs update
                        let needsUpdate = false;
                        if (existingUser.name !== formattedName) { existingUser.name = formattedName; needsUpdate = true; }
                        if (!existingUser.profile?.firstNameTH && firstName) { existingUser.profile.firstNameTH = firstName; needsUpdate = true; }
                        if (!existingUser.profile?.lastNameTH && lastName) { existingUser.profile.lastNameTH = lastName; needsUpdate = true; }
                        if (!existingUser.profile?.prefixTH && prefixTH) { existingUser.profile.prefixTH = prefixTH; needsUpdate = true; }
                        if (!existingUser.profile?.prefixEN && prefixEN) { existingUser.profile.prefixEN = prefixEN; needsUpdate = true; }
                        if (!existingUser.profile?.firstNameEN && firstNameEN) { existingUser.profile.firstNameEN = firstNameEN; needsUpdate = true; }
                        if (!existingUser.profile?.lastNameEN && lastNameEN) { existingUser.profile.lastNameEN = lastNameEN; needsUpdate = true; }
                        if (!existingUser.profile?.birthDate && birthdate) { existingUser.profile.birthDate = new Date(birthdate); needsUpdate = true; }
                        if (!existingUser.idCard && idCardFromProfile) { existingUser.idCard = idCardFromProfile; needsUpdate = true; }

                        if (needsUpdate) {
                            await existingUser.save();
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
                    if (session.user.image) (token as any).image = session.user.image;
                } else {
                    token = { ...token, ...session };
                    if (session.image) token.picture = session.image;
                    if (session.image) (token as any).image = session.image;
                }
            }

            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isProfileComplete = user.isProfileComplete;
                (token as any).idCard = (user as any).idCard;
                (token as any).firstNameTH = (user as any).firstNameTH;
                (token as any).lastNameTH = (user as any).lastNameTH;
                (token as any).firstNameEN = (user as any).firstNameEN;
                (token as any).lastNameEN = (user as any).lastNameEN;
                (token as any).prefixTH = (user as any).prefixTH;
                (token as any).prefixEN = (user as any).prefixEN;
                (token as any).birthdate = (user as any).birthdate;
                (token as any).gender = (user as any).gender;
                (token as any).position = (user as any).position;
                if (user.image) token.picture = user.image;
                if (user.image) (token as any).image = user.image;
            }
            return token;
        },
    },
})
