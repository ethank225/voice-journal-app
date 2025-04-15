"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLogoHomeClick = () => {
    router.push("/");
  };

  const handleGetStartedClick = () => {
    router.push("/onboarding");
  };

 

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            onClick={handleLogoHomeClick}
            className="text-6xl md:text-8xl font-bold text-white tracking-tight cursor-pointer transition-transform hover:scale-105"
          >
            Journalyze
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-4 text-xl text-slate-300"
          >
            Track your progress. Achieve your goals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8"
          >
            <button
              onClick={handleGetStartedClick}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-lg transition"
            >
              Get Started
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
