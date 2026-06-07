"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Layers,
  Type,
  Palette,
  MousePointerClick,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DesignSystemPage() {
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const colors = [
    { name: "Primary Cobalt", hsl: "hsl(221.2 83.2% 53.3%)", bg: "bg-blue-600", text: "text-white" },
    { name: "Neon Emerald (Income)", hsl: "hsl(142.1 70.6% 45.3%)", bg: "bg-emerald-500", text: "text-white" },
    { name: "Aurora Amber (Warning)", hsl: "hsl(47.9 95.8% 51.2%)", bg: "bg-amber-500", text: "text-black" },
    { name: "Crimson Glow (Debt)", hsl: "hsl(0 84.2% 60.2%)", bg: "bg-rose-500", text: "text-white" },
    { name: "Obsidian Deep", hsl: "hsl(224 71.4% 4.1%)", bg: "bg-slate-950 border border-slate-800", text: "text-slate-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-500 dark:text-blue-400 w-fit backdrop-blur-md">
          <Sparkles className="h-4 w-4" /> Style System Showroom
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Aurora Glass Bento System
        </h1>
        <p className="text-md text-slate-500 dark:text-slate-400 max-w-2xl">
          A premium design pattern featuring obsidian-dark backdrops, double-bordered glass cards, glowing accents, robust typography (no thin or italic weights), and smooth interactive states.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Color Palette Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-500" /> Color Swatches
            </CardTitle>
            <CardDescription>
              Click any swatch to copy its HSL token. These tokens drive our high-fidelity financial dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {colors.map((color) => (
                <div
                  key={color.name}
                  onClick={() => copyToClipboard(color.hsl, color.name)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 p-3 hover:border-slate-350 dark:hover:border-slate-700 transition-all"
                >
                  <div className={`h-12 w-full rounded-xl ${color.bg} flex items-end p-2 transition-transform group-hover:scale-[1.02]`}>
                    <span className={`text-[10px] font-bold ${color.text} uppercase tracking-wider`}>
                      {color.name}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        {color.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {color.hsl}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedText === color.hsl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-emerald-500" /> Typography Hierarchy
            </CardTitle>
            <CardDescription>
              Geist Sans type scaling. Bold and Medium weights only. All thin and italic styles are disabled for clarity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Page Title (text-3xl font-bold)</span>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  $14,800.50 Balance
                </h1>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Section Header (text-xl font-semibold)</span>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Recent Monthly Spending
                </h2>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Body Medium (text-sm font-medium)</span>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-350">
                  Transactions log automatically and generate insights. Ask the AI assistant to refine your monthly budgets.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs">
              <h4 className="font-bold text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Banned Styling Reminder
              </h4>
              <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Standard browser serifs, italic text styles, and thin weights (below 400) must never be used. All text should use standard Medium (500), Semibold (600), or Bold (700) font weights.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Showroom */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-rose-500" /> Interactive Components Showroom
            </CardTitle>
            <CardDescription>
              A visual checklist of custom interactive cards, custom-gradient buttons, loading skeletons, and notification badges.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            {/* Column 1: Glass Cards & Gradients */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Glass Cards & Glows</h4>
              <div className="glass-card p-5 border-blue-500/20 dark:border-blue-500/10 hover:shadow-blue-500/5">
                <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 neon-glow-blue mr-2" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Glass Card (Cobalt Focus)</span>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Glassmorphic panel with subtle backdrop filters and light border glow states.
                </p>
              </div>
              <div className="glass-card p-5 border-emerald-500/20 dark:border-emerald-500/10 hover:shadow-emerald-500/5">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 neon-glow-emerald mr-2" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Glass Card (Emerald Focus)</span>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Perfect for representing monthly income and savings progress.
                </p>
              </div>
            </div>

            {/* Column 2: Button Variations */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Button Actions</h4>
              
              <div className="space-y-3">
                <Button className="w-full font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
                  Primary Gradient Button
                </Button>
                
                <Button className="w-full font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer">
                  Income Success Action
                </Button>

                <Button variant="outline" className="w-full font-bold border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-400 transition-all cursor-pointer">
                  Secondary Action
                </Button>

                <Button variant="ghost" className="w-full font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer">
                  Destructive Ghost Action
                </Button>
              </div>
            </div>

            {/* Column 3: Skeletons & Badges */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skeletons & Badges</h4>
              
              <div className="glass-card p-4 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-blue-100 text-blue-800 border-none dark:bg-blue-950/50 dark:text-blue-400 font-bold">
                    Primary
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none dark:bg-emerald-950/50 dark:text-emerald-400 font-bold">
                    Income
                  </Badge>
                  <Badge className="bg-rose-100 text-rose-800 border-none dark:bg-rose-950/50 dark:text-rose-450 font-bold">
                    Expense
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-[85%] bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <Skeleton className="h-2.5 w-[50%] bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Bento Layout */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" /> Live Bento Simulator
            </CardTitle>
            <CardDescription>
              Our dashboard layout uses a modular, multi-column grid system. Hovering over cards highlights their borders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 grid-rows-2">
              <div className="glass-card md:col-span-2 p-5 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 min-h-[120px] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Card 1 (Double Width)</span>
                <span className="text-xl font-bold">General Balance Info</span>
              </div>
              <div className="glass-card p-5 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 min-h-[120px] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Card 2</span>
                <span className="text-xl font-bold text-emerald-500">+8.2%</span>
              </div>
              <div className="glass-card p-5 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 min-h-[120px] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Card 3</span>
                <span className="text-xl font-bold text-rose-500">18 Logs</span>
              </div>
              <div className="glass-card md:col-span-3 p-5 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 min-h-[120px] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Card 4 (Triple Width)</span>
                <span className="text-xl font-bold">Comprehensive Spending Charts Area</span>
              </div>
              <div className="glass-card p-5 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 min-h-[120px] flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Card 5</span>
                <span className="text-xl font-bold text-amber-500">3 Alerts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
