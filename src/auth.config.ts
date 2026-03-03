
import type { NextAuthConfig } from "next-auth"
export default {
    providers: [
        {
            id: "thaid",
            name: "ThaiD",
            type: "oidc",
            issuer: "https://imauth.bora.dopa.go.th",
            clientId: process.env.THAID_CLIENT_ID,
            clientSecret: process.env.THAID_CLIENT_SECRET,
            wellKnown: "https://imauth.bora.dopa.go.th/.well-known/openid-configuration",
            allowDangerousEmailAccountLinking: true,
            checks: ["pkce", "state", "nonce"],
            authorization: {
                params: {
                    scope: "openid pid title given_name family_name title_en given_name_en family_name_en gender birthdate",
                },
            },
            profile(profile) {
                console.log("ThaiD Raw Profile Received FULL:", JSON.stringify(profile, null, 2));
                return {
                    id: profile.pid || profile.sub,
                    name: `${profile.title || ""}${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
                    email: profile.email || `${profile.pid || profile.sub}@thaid.go.th`,
                    image: profile.picture,
                    idCard: profile.pid || profile.sub,
                    firstNameTH: profile.given_name || "",
                    lastNameTH: profile.family_name || "",
                    firstNameEN: profile.given_name_en || "",
                    lastNameEN: profile.family_name_en || "",
                    prefixTH: profile.title || "",
                    prefixEN: profile.title_en || "",
                    birthdate: profile.birthdate || "",
                    gender: profile.gender === "male" || profile.gender === "1" ? "ชาย" : profile.gender === "female" || profile.gender === "2" ? "หญิง" : (profile.gender || ""),
                    role: "teacher",
                    isProfileComplete: false,
                }
            },
        },
    ],
    pages: {
        signIn: "/login",
        newUser: "/dashboard",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isProfileComplete = auth?.user?.isProfileComplete;
            const pathname = nextUrl.pathname;

            const isOnDashboard = pathname.startsWith("/dashboard");
            const isOnLogin = pathname.startsWith("/login");
            const isOnRegister = pathname.startsWith("/register");

            if (isOnDashboard) {
                if (!isLoggedIn) return false;
                if (!isProfileComplete) return Response.redirect(new URL("/register", nextUrl));
                return true;
            }

            if (isOnRegister) {
                if (isLoggedIn && isProfileComplete) return Response.redirect(new URL("/dashboard", nextUrl));
                return true;
            }

            if (isOnLogin) {
                if (isLoggedIn) {
                    if (isProfileComplete) return Response.redirect(new URL("/dashboard", nextUrl));
                    return Response.redirect(new URL("/register", nextUrl));
                }
                return true;
            }

            return true;
        },
        jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                if (session.user) {
                    token = { ...token, ...session.user }
                    if (session.user.image) token.picture = session.user.image;
                    if (session.user.image) (token as any).image = session.user.image;
                } else {
                    token = { ...token, ...session }
                    if (session.image) token.picture = session.image;
                    if (session.image) (token as any).image = session.image;
                }
            }
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isProfileComplete = user.isProfileComplete;
                // Add all possible fields to token from user
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
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isProfileComplete = token.isProfileComplete as boolean;
                (session.user as any).idCard = token.idCard as string;
                (session.user as any).firstNameTH = token.firstNameTH as string;
                (session.user as any).lastNameTH = token.lastNameTH as string;
                (session.user as any).firstNameEN = token.firstNameEN as string;
                (session.user as any).lastNameEN = token.lastNameEN as string;
                (session.user as any).prefixTH = token.prefixTH as string;
                (session.user as any).prefixEN = token.prefixEN as string;
                (session.user as any).birthdate = token.birthdate as string;
                (session.user as any).gender = token.gender as string;
                (session.user as any).position = token.position as string;
                if (token.picture) session.user.image = token.picture as string;
                else if ((token as any).image) session.user.image = (token as any).image as string;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 วัน (วินาที)
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 วัน (วินาที)
    },
} satisfies NextAuthConfig
