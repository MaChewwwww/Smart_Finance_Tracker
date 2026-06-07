"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, LockKeyhole, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset successfully! Log in with your new password.");
      router.push("/login");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl shadow-black/85 rounded-2xl p-2 animate-in fade-in duration-300">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 neon-glow-blue">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Reset password</CardTitle>
        <CardDescription className="text-slate-400 font-semibold px-2">
          We sent a 6-digit OTP to reset your password. Enter the code and your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-slate-350">
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center font-bold tracking-widest text-lg h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-355">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-slate-355">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-bold mt-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 overflow-x-hidden relative text-white">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[100px] animate-drift-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px] animate-drift-2 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 neon-glow-blue" />
            <p className="mt-2 text-sm text-slate-400 font-bold">Loading reset screen...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
