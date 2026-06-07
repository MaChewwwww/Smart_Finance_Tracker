"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset code sent to your email!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 overflow-x-hidden relative text-white">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[100px] animate-drift-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px] animate-drift-2 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center animate-in fade-in duration-300">
        <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl shadow-black/85 rounded-2xl p-2">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 neon-glow-blue">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Forgot password?</CardTitle>
            <CardDescription className="text-slate-400 font-semibold px-2">
              Enter your email address and we&apos;ll send you a 6-digit OTP code to verify and reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-bold mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-white/5 py-4">
            <a
              href="/login"
              className="text-xs font-bold text-slate-500 hover:text-slate-350 inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Login
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
