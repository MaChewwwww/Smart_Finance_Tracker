"use client";

import React, { useState } from "react";
import { toast } from "sonner";

// Icons
import {
  User,
  Lock,
  Bell,
  Trash2,
  Download,
  ShieldAlert,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toggle states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [name, setName] = useState("Juan Dela Cruz");
  const [email, setEmail] = useState("juan.delacruz@example.com");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setTimeout(() => {
      setProfileLoading(false);
      toast.success("Profile details updated successfully!");
    }, 1200);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    }, 1500);
  };

  const handleDeleteData = () => {
    if (confirm("Are you absolutely sure you want to delete all financial data? This cannot be undone.")) {
      toast.success("All financial records have been deleted.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm font-semibold text-slate-400">
          Manage your account profile, configure notifications, and handle data privacy controls.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Profile & Security */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <User className="h-5 w-5 text-slate-400" /> Profile Information
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-500">Update your account&apos;s profile name and email address.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-455">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 bg-white/40 dark:bg-slate-950/40 border-border text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-white/40 dark:bg-slate-950/40 border-border text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border py-4 flex justify-end">
                <Button type="submit" disabled={profileLoading} className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] h-10 px-4">
                  {profileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Lock className="h-5 w-5 text-slate-400" /> Change Password
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-500">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="curr-pass" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="curr-pass"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-11 h-11 bg-white/40 dark:bg-slate-950/40 border-border text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pass" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-pass"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-11 h-11 bg-white/40 dark:bg-slate-950/40 border-border text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conf-pass" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="conf-pass"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-11 h-11 bg-white/40 dark:bg-slate-950/40 border-border text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border py-4 flex justify-end">
                <Button type="submit" disabled={passwordLoading} className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] h-10 px-4">
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Preferences & Data Controls */}
        <div className="space-y-6">
          {/* Notifications Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Bell className="h-5 w-5 text-slate-400" /> Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-550">Control how we contact you for reminders and alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 font-semibold">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Email Reminders</h4>
                  <p className="text-xs text-slate-400">Send upcoming debt payment schedules via email.</p>
                </div>
                <Switch defaultChecked className="cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Budget Limit Warnings</h4>
                  <p className="text-xs text-slate-400">Notify when spending exceeds 90% of category bounds.</p>
                </div>
                <Switch defaultChecked className="cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Weekly Reports Summary</h4>
                  <p className="text-xs text-slate-400">Send automated savings summaries every Sunday morning.</p>
                </div>
                <Switch className="cursor-pointer" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data Actions */}
          <Card className="glass-card border-rose-500/20 dark:border-rose-500/15 bg-gradient-to-br from-rose-500/[0.03] to-transparent shadow-rose-500/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-450">
                <ShieldAlert className="h-5 w-5 text-rose-500 neon-glow-rose" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-500">Irreversible actions relating to your personal financial records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-semibold">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Financial Records</h4>
                  <p className="text-[11px] text-slate-500">Download a full JSON backup of transactions, debts, and goals.</p>
                </div>
                <Button variant="outline" size="sm" className="font-bold text-xs border-border dark:border-border dark:hover:bg-white/5 rounded-xl cursor-pointer">
                  <Download className="mr-1 h-3.5 w-3.5" /> Export Data
                </Button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-rose-500">Delete Account & Data</h4>
                  <p className="text-[11px] text-slate-500">Permanently delete your profile and purge all database entries.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteData} className="font-bold text-xs rounded-xl cursor-pointer">
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
