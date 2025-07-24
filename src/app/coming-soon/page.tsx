"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ComingSoonPage() {
	const [password, setPassword] = useState("");
	const [error, setError] = useState(false);
	const [glitchText, setGlitchText] = useState("COMING::SOON");
	const router = useRouter();

	useEffect(() => {
		const intervals = [
			setInterval(() => {
				const glitchVariations = [
					"COMING::SOON",
					"ACCESS::DENIED",
					"AWAITING::INPUT",
					"X::PUMP"
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(false);

		try {
			const response = await fetch("/api/auth/verify-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			if (response.ok) {
				router.push("/");
				router.refresh(); // refresh to re-run middleware
			} else {
				setError(true);
				setPassword("");
			}
		} catch {
			setError(true);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Glitch overlay effects */}
			<div className="absolute inset-0 bg-primary/5 blur-3xl animate-pulse" />
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-2xl rounded-full animate-float" />
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 blur-2xl rounded-full animate-float-reverse" />

			{/* Scan lines effect */}
			<div className="scanlines fixed inset-0 pointer-events-none opacity-10" />

			<Card className="relative z-10 max-w-lg w-full border-2 bg-background/80 backdrop-blur-md shadow-2xl">
				<CardContent className="p-8 space-y-6">
					{/* Logo and title */}
					<div className="text-center space-y-4">
						<div className="relative inline-block">
							<div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
							<Skull className="relative w-24 h-24 mx-auto text-foreground/80 animate-float-slow" />
						</div>

						<h1 className="glitch-effect text-4xl font-bold font-mono uppercase tracking-wider text-foreground/90">
							{glitchText}
						</h1>

						<p className="font-mono text-sm uppercase text-muted-foreground/80 tracking-widest">
							SYSTEM::MAINTENANCE_IN_PROGRESS
						</p>
					</div>

					{/* Warning message */}
					<div className="border-t border-b py-4">
						<p className="font-mono text-xs uppercase text-center text-foreground/60 leading-relaxed">
							THIS_SITE_IS_CURRENTLY_UNDER_CONSTRUCTION.<br />
							AUTHORIZED_PERSONNEL_ONLY.<br />
							ENTER_ACCESS_CODE_TO_PROCEED.
						</p>
					</div>

					{/* Password form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="font-mono text-xs uppercase text-muted-foreground">
								ACCESS::CODE
							</label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="[ENTER_PASSWORD]"
								className="font-mono uppercase placeholder:text-muted-foreground/40 border-2 bg-background/50"
								required
							/>
						</div>

						<Button
							type="submit"
							className="w-full font-mono uppercase tracking-wider"
							variant="outline"
						>
							AUTHENTICATE::ACCESS
						</Button>
					</form>

					{/* Error message */}
					{error && (
						<Alert variant="destructive" className="border-2">
							<Skull className="h-4 w-4" />
							<AlertTitle className="font-mono uppercase">ACCESS::DENIED</AlertTitle>
							<AlertDescription className="font-mono text-xs uppercase">
								INVALID_CREDENTIALS._TRY_AGAIN.
							</AlertDescription>
						</Alert>
					)}

					{/* Footer */}
					<div className="pt-4 border-t text-center">
						<p className="font-mono text-xs uppercase text-muted-foreground/60">
							IDENTITY::VERIFICATION_REQUIRED
						</p>
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