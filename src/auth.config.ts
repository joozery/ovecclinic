
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
                    scope: "openid profile pid",
                },
            },
            profile(profile) {
                console.log("ThaiD Raw Profile Received FULL:", JSON.stringify(profile, null, 2));
                return {
                    id: profile.sub || profile.pid,
                    name: profile.name || `${profile.given_name || profile.th_fname} ${profile.family_name || profile.th_lname}`,
                    email: profile.email || `${profile.sub || profile.pid}@thaid.go.th`,
                    image: profile.picture,
                    idCard: profile.pid || profile.sub,
                    firstNameTH: profile.given_name || profile.th_fname,
                    lastNameTH: profile.family_name || profile.th_lname,
                    firstNameEN: profile.given_name_en || profile.en_fname,
                    lastNameEN: profile.family_name_en || profile.en_lname,
                    prefixTH: profile.title || profile.th_title,
                    prefixEN: profile.title_en || profile.en_title,
                    birthdate: profile.birthdate,
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
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
            const isOnLogin = nextUrl.pathname.startsWith("/login");
            const isOnRegister = nextUrl.pathname.startsWith("/register");

            if (isOnDashboard) {
                if (!isLoggedIn) return false;
                return true;
            }

            if (isOnOnboarding) {
                if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
                return false;
            }

            if (isOnLogin || isOnRegister) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
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
                } else {
                    token = { ...token, ...session }
                    if (session.image) token.picture = session.image;
                }
            }
            // Note: We cannot query DB in Edge runtime here easily without an adapter.
            // However, for the initial sign-in, the full user object (returned from authorize or OAuth profile)
            // is passed to jwt callback.
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isProfileComplete = user.isProfileComplete;
                token.position = (user as any).position;
                if (user.image) token.picture = user.image;
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
                (session.user as any).position = token.position as string;
                if (token.picture) session.user.image = token.picture as string;
                else if (token.image) session.user.image = token.image as string;
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
