"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export default function ComingSoonPage() {
	const [glitchText, setGlitchText] = useState("COMING::SOON");

	useEffect(() => {
		const intervals = [
			setInterval(() => {
				const glitchVariations = [
					"BLAST.FUN",
					"COMING::SOON",
				];
				setGlitchText(glitchVariations[Math.floor(Math.random() * glitchVariations.length)]);
			}, 3000),

			setInterval(() => {
				const glitchEffect = document.querySelector(".glitch-effect");
				if (glitchEffect) {
					glitchEffect.classList.add("glitch-active");
					setTimeout(() => {
						glitchEffect.classList.remove("glitch-active");
					}, 200);
				}
			}, 5000)
		];

		return () => intervals.forEach(clearInterval);
	}, []);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Glitch overlay effects */}
			<div className="absolute inset-0 bg-primary/5 blur-3xl animate-pulse" />
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-2xl rounded-full animate-float" />
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 blur-2xl rounded-full animate-float-reverse" />

			{/* Scan lines effect */}
			<div className="scanlines fixed inset-0 pointer-events-none opacity-10" />

			<Card className="relative z-10 max-w-lg w-full border-2 bg-background/80 backdrop-blur-md shadow-2xl">
				<CardContent className="p-8">
					<div className="text-center space-y-4">
						<div className="relative inline-block">
							<div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
							<Logo className="relative w-24 h-24 mx-auto animate-float-slow" />
						</div>

						<h1 className="glitch-effect text-4xl font-bold font-mono uppercase tracking-wider text-foreground/90">
							{glitchText}
						</h1>
					</div>
				</CardContent>
			</Card>

			<style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        .scanlines::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            transparent 50%,
            rgba(255, 255, 255, 0.03) 50%
          );
          background-size: 100% 4px;
          animation: scanlines 8s linear infinite;
        }

        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }

        .glitch-effect {
          position: relative;
          color: inherit;
          text-shadow: 
            0.05em 0 0 rgba(255, 0, 0, 0.75),
            -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
            0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
        }

        .glitch-active {
          animation: glitch 0.2s ease-in-out;
        }

        @keyframes glitch {
          0%, 100% {
            text-shadow: 
              0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
              0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          }
          20% {
            text-shadow: 
              0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
              0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          }
          40% {
            text-shadow: 
              -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
              0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
              -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          60% {
            text-shadow: 
              0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
              0.05em 0 0 rgba(0, 255, 0, 0.75),
              -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          80% {
            text-shadow: 
              -0.025em 0 0 rgba(255, 0, 0, 0.75),
              -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
              -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
        }
      `}</style>
		</div>
	);
}