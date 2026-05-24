import { useState, useEffect, useRef } from "react";
import { signInWithGoogle } from "@/hooks/useAuth";
import gsap from "gsap";

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_080827_a9e5ad52-b6ee-4e79-b393-d936f179cfd7.mp4';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" />
    </svg>
  );
}

const pillInput =
  "liquid-glass w-full text-white text-sm font-body font-light placeholder:text-white/60 outline-none bg-transparent pl-5 pr-4 py-3 border border-white/20 focus:border-white/50 transition-colors duration-200";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [framesReady, setFramesReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBgRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setError("");
    setName("");
    setPassword("");
    setConfirmPassword("");
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let capturing = true;
    let lastTime = -1;
    const MAX_WIDTH = 960;
    const frames: HTMLCanvasElement[] = [];
    let rafHandle = 0;

    function captureFrame() {
      if (!capturing || !video) return;
      if (video.readyState < 2) return;
      if (video.currentTime === lastTime) return;
      lastTime = video.currentTime;
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0, w, h);
      frames.push(offscreen);
    }

    function onFrame() {
      captureFrame();
      if (!capturing) return;
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
          .requestVideoFrameCallback(onFrame);
      } else {
        rafHandle = requestAnimationFrame(onFrame);
      }
    }

    function onEnded() {
      capturing = false;
      framesRef.current = frames;
      setFramesReady(true);
    }

    function onLoaded() {
      video!.play().catch(() => {});
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
          .requestVideoFrameCallback(onFrame);
      } else {
        rafHandle = requestAnimationFrame(onFrame);
      }
    }

    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
    }

    return () => {
      capturing = false;
      cancelAnimationFrame(rafHandle);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    if (!framesReady) return;
    const canvas = displayCanvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;

    canvas.width = frames[0].width;
    canvas.height = frames[0].height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let index = 0;
    let direction = 1;
    let last = performance.now();
    const interval = 1000 / 30;
    let rafHandle = 0;

    function render(now: number) {
      rafHandle = requestAnimationFrame(render);
      if (now - last < interval) return;
      last = now;
      ctx!.drawImage(frames[index], 0, 0);
      index += direction;
      if (index >= frames.length - 1) { index = frames.length - 1; direction = -1; }
      if (index <= 0) { index = 0; direction = 1; }
    }

    rafHandle = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafHandle);
  }, [framesReady]);

  useEffect(() => {
    const strength = 20;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafHandle = 0;

    function onMouseMove(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * strength;
      targetY = ((e.clientY - cy) / cy) * strength;
    }

    function loop() {
      rafHandle = requestAnimationFrame(loop);
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      if (videoBgRef.current) {
        gsap.set(videoBgRef.current, { x: currentX, y: currentY });
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    rafHandle = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafHandle);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const endpoint = mode === "login" ? "login" : "register";
    const body = mode === "login"
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        window.location.href = "/app";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">

      {/* Video background */}
      <div
        ref={videoBgRef}
        className="fixed top-0 left-0 w-full h-full z-0 scale-[1.08] origin-center"
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          style={{ display: framesReady ? 'none' : 'block' }}
        />
        <canvas
          ref={displayCanvasRef}
          className="w-full h-full object-cover"
          style={{ display: framesReady ? 'block' : 'none' }}
        />
      </div>

      {/* Centered login card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          width: '100%',
          maxWidth: '400px',
          padding: '0 16px',
        }}
      >
        <div className="liquid-glass-strong p-8" style={{ borderRadius: '20px' }}>

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-white/90 text-xs tracking-widest uppercase font-body font-light mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </p>
            <p className="text-white/75 text-sm font-body font-light leading-relaxed">
              {mode === "login"
                ? "Sign in to start reviewing code smarter"
                : "Start reviewing code smarter today"}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={signInWithGoogle}
            className="liquid-glass-strong w-full flex items-center justify-center gap-3 px-6 py-3.5 text-white text-sm font-body font-medium transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.07)] active:scale-[0.97]"
            style={{ borderRadius: '9999px' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/60 text-xs font-body">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className={pillInput}
                style={{ borderRadius: '9999px' }}
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={pillInput}
              style={{ borderRadius: '9999px' }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={pillInput}
              style={{ borderRadius: '9999px' }}
            />

            {mode === "signup" && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={pillInput}
                style={{ borderRadius: '9999px' }}
              />
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <span className="text-xs font-body text-white/50 hover:text-white/80 cursor-pointer transition-colors duration-200">
                  Forgot password?
                </span>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 text-center px-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-sm font-body font-medium py-3 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              style={{ borderRadius: '9999px' }}
            >
              {loading
                ? (mode === "login" ? "Signing in…" : "Creating account…")
                : (mode === "login" ? "Sign in" : "Create account")}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-white/50 text-xs font-body font-light mt-6 leading-relaxed">
            By signing in you agree to our{' '}
            <span className="text-white/70 hover:text-white cursor-pointer transition-colors">Terms</span>
            {' '}and{' '}
            <span className="text-white/70 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          </p>

          {/* Mode toggle */}
          <div className="border-t border-white/10 mt-4 pt-4 text-center">
            {mode === "login" ? (
              <p className="text-white/50 text-sm font-body">
                Don't have an account?{' '}
                <span
                  onClick={() => switchMode("signup")}
                  className="text-white font-medium cursor-pointer underline-offset-2 hover:underline hover:text-white/80 transition-all duration-200"
                >
                  Sign up
                </span>
              </p>
            ) : (
              <p className="text-white/50 text-sm font-body">
                Already have an account?{' '}
                <span
                  onClick={() => switchMode("login")}
                  className="text-white font-medium cursor-pointer underline-offset-2 hover:underline hover:text-white/80 transition-all duration-200"
                >
                  Sign in
                </span>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
