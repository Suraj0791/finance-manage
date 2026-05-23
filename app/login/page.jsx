import React from "react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Chrome } from "lucide-react";

export default async function LoginPage({ searchParams }) {
  // If there's a callbackUrl, we can redirect back to it after sign in
  const resolvedParams = await searchParams;
  const callbackUrl = resolvedParams?.callbackUrl || "/dashboard";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-tr from-slate-550 via-blue-50 to-indigo-100">
      {/* Background blobs for premium glassmorphism aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-75 pointer-events-none"></div>

      <Card className="w-full max-w-md border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Finance Logo"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500">
            Sign in to manage your budgets and split expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {/* Google Login Form */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="w-full py-6 text-base font-semibold border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                {/* SVG for Google Logo */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.57 15.03 1 12 1 7.24 1 3.2 3.74 1.25 7.75l3.85 2.99C6.01 7.27 8.78 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-1.99 3.43-4.92 3.43-8.56z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.1 10.74c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.25 5.17C.45 6.78 0 8.59 0 10.5s.45 3.72 1.25 5.33l3.85-3.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.11.75-2.53 1.19-4.26 1.19-3.22 0-5.99-2.23-6.96-5.24l-3.85 3C3.2 19.8 7.24 23 12 23z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>

            {/* GitHub Login Form */}
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: callbackUrl });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="w-full py-6 text-base font-semibold border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                {/* SVG for GitHub Logo */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                Sign in with GitHub
              </Button>
            </form>
          </div>

          <div className="text-xs text-center text-slate-400 mt-4 leading-normal">
            By signing in, you agree to our Terms of Service <br />
            and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
