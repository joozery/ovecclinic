
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Line from "next-auth/providers/line"

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Line({
            clientId: process.env.LINE_CLIENT_ID,
            clientSecret: process.env.LINE_CLIENT_SECRET,
        }),
        {
            id: "thaid",
            name: "ThaiD",
            type: "oidc",
            issuer: "https://imauth.bora.dopa.go.th",
            clientId: process.env.THAID_CLIENT_ID,
            clientSecret: process.env.THAID_CLIENT_SECRET,
            wellKnown: "https://imauth.bora.dopa.go.th/.well-known/openid-configuration",
            authorization: {
                params: {
                    scope: "openid profile pid", // Added pid scope which is common in ThaiD
                },
            },
            profile(profile) {
                return {
                    id: profile.sub || profile.pid,
                    name: profile.name || `${profile.given_name} ${profile.family_name}`,
                    email: profile.email || `${profile.sub || profile.pid}@thaid.go.th`,
                    image: profile.picture,
                    role: "teacher",
                    isProfileComplete: false,
                }
            },
        },
    ],
    pages: {
        signIn: "/login",
        newUser: "/onboarding",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isProfileComplete = auth?.user?.isProfileComplete;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
            const isOnLogin = nextUrl.pathname.startsWith("/login");

            if (isOnDashboard) {
                if (!isLoggedIn) return false;
                if (!isProfileComplete) return Response.redirect(new URL("/onboarding", nextUrl));
                return true;
            }

            if (isOnOnboarding) {
                if (!isLoggedIn) return false;
                if (isProfileComplete) return Response.redirect(new URL("/dashboard", nextUrl));
                return true;
            }

            if (isOnLogin) {
                if (isLoggedIn) {
                    if (isProfileComplete) return Response.redirect(new URL("/dashboard", nextUrl));
                    return Response.redirect(new URL("/onboarding", nextUrl));
                }
                return true;
            }

            return true;
        },
        jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                if (session.user) {
                    token = { ...token, ...session.user }
                } else {
                    token = { ...token, ...session }
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
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isProfileComplete = token.isProfileComplete as boolean;
                (session.user as any).position = token.position as string;
            }
            return session;
        },
    },
    session: { strategy: "jwt" },
} satisfies NextAuthConfig
