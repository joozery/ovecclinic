
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  FileCheck,
  Award,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-6">
            <Zap className="mr-2 h-4 w-4" />
            <span>Digital Transformation for OVEC</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Digital Supervision <br /> & Training Platform
          </h1>
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-400 mb-10">
            Streamlining teacher professional development, supervision workflows, and digital certification for the Office of the Vocational Education Commission.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {session ? (
              <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/dashboard">
                  Go to Dashboard <LayoutDashboard className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-slate-700 text-white hover:bg-slate-800" asChild>
                  <Link href="/activities/public">Browse Activities</Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-8 text-lg text-slate-400 hover:text-white" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats/Logo Cloud Section Placeholder */}
      <section className="py-12 border-y bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-slate-500 font-medium text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900">100%</span>
              <span className="text-sm">Digital Workflow</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900">Fast</span>
              <span className="text-sm">Review Cycle</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900">Secure</span>
              <span className="text-sm">Storage</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900">Verify</span>
              <span className="text-sm">QR Certification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need for Supervision</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A comprehensive platform designed specifically for vocational education standards and professional growth tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border bg-slate-50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Activity Registration</h3>
              <p className="text-slate-600">
                Browse and register for training sessions, seminars, and workshops with automatic quota management.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border bg-slate-50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white mb-6">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Online Supervision</h3>
              <p className="text-slate-600">
                Seamlessly submit work, links, and documents for review. Get real-time feedback from qualified supervisors.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border bg-slate-50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center text-white mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">E-Certificates</h3>
              <p className="text-slate-600">
                Earn verifiable digital certificates with QR codes upon successful completion of activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">Secured and Verified</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">Role-based Access Control</h4>
                    <p className="text-slate-400">Granular permissions for Teachers, Supervisors, and Admins.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">Transparent Processes</h4>
                    <p className="text-slate-400">Every submission and review is tracked with real-time notifications.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 p-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl">
              <div className="bg-slate-950 rounded-[22px] p-8 h-full flex flex-col justify-center">
                <div className="text-center space-y-4">
                  <Award className="w-16 h-16 mx-auto text-blue-500" />
                  <h3 className="text-2xl font-bold italic">Official Certification</h3>
                  <p className="text-slate-400">Our platform ensures that all certificates issued meet the verification standards set by the commission.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to professionalize your workflow?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of vocational teachers and supervisors in the digital transition.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-lg font-bold" asChild>
              <Link href={session ? "/dashboard" : "/register"}>
                {session ? "Dashboard" : "Create Account"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <div className="font-bold text-slate-900 text-lg">OVEC PLATFORM</div>
          <div>© 2026 Office of the Vocational Education Commission. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
