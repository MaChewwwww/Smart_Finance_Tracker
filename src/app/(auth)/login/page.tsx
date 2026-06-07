"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { toast } from "sonner";
import axios from "axios";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, Wallet, LogIn, Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/login", data);
      if (response.data.success) {
        toast.success("Login successful! Welcome back.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(response.data.error?.message || "Login failed.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data?.error;
        if (errorData?.code === "UNVERIFIED_EMAIL") {
          toast.warning(errorData.message || "Email is unverified. Verification code sent.");
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&purpose=register`);
        } else {
          toast.error(errorData?.message || "Invalid email or password.");
        }
      } else {
        toast.error("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-slate-950 text-white overflow-x-hidden relative">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[100px] animate-drift-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px] animate-drift-2 pointer-events-none" />

      {/* Left side: Premium Brand Visual Panel (hidden on mobile) */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 md:flex bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border-r border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Smart Finance Tracker
          </span>
        </div>

        <div className="my-auto max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-bold text-blue-400 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-blue-400" /> Secure Financial Workspace
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight lg:text-5xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome back to Smart Finance
          </h1>
          <p className="text-md font-semibold text-slate-400 leading-relaxed">
            Log in to access your financial dashboard, log transactions, track goals, and chat with your AI assistant.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
            <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 text-sm font-bold text-slate-200">
              &quot;Do not save what is left after spending, but spend what is left after saving.&quot;
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                WB
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Warren Buffett</h4>
                <p className="text-[10px] font-bold text-slate-500">Investor & Philanthropist</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-600">
          © 2026 Smart Finance Tracker. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-12 bg-slate-950/20 backdrop-blur-sm">
        <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl shadow-black/80 rounded-2xl p-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Log in to your account
            </CardTitle>
            <CardDescription className="text-sm font-semibold text-slate-400">
              Enter your credentials to enter your finance tracker workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-bold text-rose-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                    {...register("password")}
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
                {errors.password && (
                  <p className="text-xs font-bold text-rose-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 font-bold mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-white/5 px-6 py-4">
            <div className="text-center text-sm font-semibold text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
