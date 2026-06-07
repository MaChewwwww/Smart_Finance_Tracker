"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators";
import { toast } from "sonner";
import axios from "axios";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, Wallet, UserPlus, Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const clientRegisterSchema = registerSchema.extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientRegisterInput>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ClientRegisterInput) => {
    setLoading(true);
    try {
      const { name, email, password } = data;
      const response = await axios.post("/api/auth/register", { name, email, password });
      if (response.data.success) {
        toast.success(response.data.message || "Registration successful!");
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=register`);
      } else {
        toast.error(response.data.error?.message || "Registration failed.");
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.error?.message : undefined;
      toast.error(
        errorMessage || "An error occurred during registration. Please try again."
      );
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
            Calm Financial Clarity, Powered by AI
          </h1>
          <p className="text-md font-semibold text-slate-400 leading-relaxed">
            Take back control of your spending. Track expenses, coordinate debts, design budgets, and consult our
            integrated Gemini AI chatbot for customized guidance.
          </p>

          {/* Testimonial/Quote Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
            <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 text-sm font-bold text-slate-200">
              &quot;An investment in knowledge pays the best interest.&quot;
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                BF
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Benjamin Franklin</h4>
                <p className="text-[10px] font-bold text-slate-500">Writer & Inventor</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-600">
          © 2026 Smart Finance Tracker. All rights reserved.
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-12 bg-slate-950/20 backdrop-blur-sm">
        <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl shadow-black/80 rounded-2xl p-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Create an account
            </CardTitle>
            <CardDescription className="text-sm font-semibold text-slate-400">
              Let&apos;s set up your personal financial tracker profile. We&apos;ll send a 6-digit OTP to verify your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    className="pl-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs font-bold text-rose-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.delacruz@example.com"
                    className="pl-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-bold text-rose-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </Label>
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-11 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 font-semibold"
                    {...register("confirmPassword")}
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
                {errors.confirmPassword && (
                  <p className="text-xs font-bold text-rose-400">{errors.confirmPassword.message}</p>
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
                    Sending OTP code...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-white/5 px-6 py-4">
            <div className="text-center text-sm font-semibold text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
              >
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
