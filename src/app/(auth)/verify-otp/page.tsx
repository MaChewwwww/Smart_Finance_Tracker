"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type VerifyOtpInput } from "@/lib/validators";
import { toast } from "sonner";
import axios from "axios";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MailCheck, ShieldAlert, ArrowLeft, RefreshCw, Send } from "lucide-react";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const emailParam = searchParams.get("email") || "";
  const purposeParam = (searchParams.get("purpose") as VerifyOtpInput["purpose"]) || "register";

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Set up resend cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: emailParam,
      code: "",
      purpose: purposeParam,
    },
  });

  // Ensure email and purpose fields are in sync with query parameters
  useEffect(() => {
    if (emailParam) setValue("email", emailParam);
    if (purposeParam) setValue("purpose", purposeParam);
  }, [emailParam, purposeParam, setValue]);

  const onSubmit = async (data: VerifyOtpInput) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/verify-otp", data);
      if (response.data.success) {
        toast.success("Account verified successfully! Logging you in...");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(response.data.error?.message || "Verification failed.");
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.error?.message : undefined;
      toast.error(
        errorMessage || "Incorrect verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResending(true);
    try {
      let endpoint = "/api/auth/register";
      let payload: Record<string, string> = { email: emailParam };

      if (purposeParam === "password_reset") {
        endpoint = "/api/auth/forgot-password";
      } else if (purposeParam === "login") {
        endpoint = "/api/auth/register";
        payload = { name: "Resend", email: emailParam, password: "PlaceholderPassword123!" };
      } else {
        endpoint = "/api/auth/register";
        payload = { name: "Resend", email: emailParam, password: "PlaceholderPassword123!" };
      }

      const response = await axios.post(endpoint, payload);
      if (response.data.success) {
        toast.success("A new verification code has been sent!");
        setCooldown(60);
      } else {
        toast.error(response.data.error?.message || "Failed to resend code.");
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.error?.message : undefined;
      toast.error(
        errorMessage || "An error occurred. Please try again later."
      );
    } finally {
      setResending(false);
    }
  };

  if (!emailParam) {
    return (
      <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-rose-500/20 text-center rounded-2xl p-2">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-455 neon-glow-rose">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-rose-400 font-bold">Missing Parameters</CardTitle>
          <CardDescription className="text-slate-400 font-semibold">
            This verification link is invalid. No email address was supplied.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/register">
            <Button variant="outline" size="sm" className="font-bold border-white/10 text-white hover:bg-white/5 cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Sign Up
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl shadow-black/85 rounded-2xl p-2 animate-in fade-in zoom-in duration-300">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 neon-glow-blue">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Verify your email</CardTitle>
        <CardDescription className="px-2 text-slate-400 font-semibold">
          We sent a 6-digit OTP code to <strong className="text-white font-bold">{emailParam}</strong>.
          Please enter it below to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-center block text-xs font-bold uppercase tracking-wider text-slate-400">
              One-Time Password (OTP)
            </Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl font-bold tracking-[10px] h-12 bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              autoFocus
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs font-bold text-rose-400 text-center">{errors.code.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 font-bold mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-white/5 px-6 py-4 text-center">
        <div className="text-sm font-semibold text-slate-450">
          Didn&apos;t receive the email?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className={`font-bold hover:underline inline-flex items-center gap-1 ${
              cooldown > 0
                ? "text-slate-500 cursor-not-allowed"
                : "text-blue-400 hover:text-blue-305 cursor-pointer"
            }`}
          >
            {resending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Resend Code {cooldown > 0 ? `(${cooldown}s)` : ""}
          </button>
        </div>
        <div>
          <Link
            href="/register"
            className="text-xs font-bold text-slate-500 hover:text-slate-300 inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 overflow-x-hidden relative text-white">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[100px] animate-drift-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px] animate-drift-2 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 neon-glow-blue" />
            <p className="mt-2 text-sm text-slate-400 font-bold">Loading verification screen...</p>
          </div>
        }>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}
