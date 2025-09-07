"use client";

import { motion } from "framer-motion";
import React from "react";

export default function GlassBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated dark colorful gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, rgba(40, 0, 80, 0.9), rgba(0, 150, 255, 0.7))", // deep purple + blue
            "linear-gradient(135deg, rgba(0, 60, 90, 0.9), rgba(200, 80, 200, 0.7))", // dark teal + magenta
            "linear-gradient(135deg, rgba(90, 0, 50, 0.9), rgba(255, 120, 0, 0.7))",  // wine red + warm orange
            "linear-gradient(135deg, rgba(0, 20, 60, 0.9), rgba(100, 200, 150, 0.7))", // midnight blue + mint green
          ],
        }}
        transition={{
          duration: 20, // very slow, relaxing
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />

      {/* Glassmorphism container */}
      <div className="relative z-10 flex h-full w-full items-center justify-center bg-white/10 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/20">
        {children}
      </div>
    </div>
  );
}
