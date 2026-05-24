import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { signInWithGoogle } from "@/hooks/useAuth";
import gsap from "gsap";
import { useLocation } from "wouter";

const NAV_LINKS = ['Features', 'Pricing', 'GitHub', 'Docs', 'Blog'];

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_080827_a9e5ad52-b6ee-4e79-b393-d936f179cfd7.mp4';

function LogoMark() {
  return (
    <svg width="44" height="26" viewBox="0 0 44 26" fill="none">
      <rect x="0" y="3" width="14" height="20" rx="3" fill="white" />
      <rect x="16" y="3" width="12" height="20" rx="3" fill="white" />
      <rect x="30" y="3" width="14" height="20" rx="3" fill="white" />
    </svg>
  );
}

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

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [prUrl, setPrUrl] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBgRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (capturing) {
        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
          (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number })
            .requestVideoFrameCallback(onFrame);
        } else {
          rafHandle = requestAnimationFrame(onFrame);
        }
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

  function handlePrSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocation('/app');
  }

  return (
    <div className="min-h-screen bg-black text-white font-body overflow-x-hidden">

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

      {/* Hero title */}
      <div
        className={`fixed left-0 right-0 z-20 w-full px-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ top: '126px' }}
      >
        <h1 className="hero-title select-none">Review</h1>
        <h1 className="hero-title select-none">Smarter.</h1>
      </div>

      {/* Nav */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap">
        <div className="liquid-glass flex items-center gap-6 rounded-full px-4 py-2.5">
          <LogoMark />
          <span className="text-sm font-body font-medium text-white">ReviewBot</span>
          <span
            className="liquid-glass-strong rounded-full px-2 py-0.5 text-xs text-white/70"
            style={{ borderRadius: '9999px' }}
          >
            AI
          </span>

          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-body font-light text-white/70 hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-4">
            <a
              href="#"
              className="text-sm font-body font-light text-white/70 hover:text-white transition-colors duration-200"
            >
              Sign in
            </a>
            <button
              className="liquid-glass-strong text-sm font-body font-medium text-white rounded-full px-4 py-1.5 transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_16px_2px_rgba(255,255,255,0.12)] active:scale-[0.97]"
              style={{ borderRadius: '9999px' }}
            >
              Start reviewing →
            </button>
          </div>
        </div>
      </nav>

      {/* Login card */}
      <div
        className="fixed inset-0 z-30 flex items-center justify-center"
        style={{ top: '200px' }}
      >
        <div
          className="liquid-glass-strong p-8 w-full max-w-sm mx-4"
          style={{ borderRadius: '20px' }}
        >
          <div className="text-center mb-8">
            <p className="text-white/40 text-xs tracking-widest uppercase font-body font-light mb-2">
              Welcome back
            </p>
            <p className="text-white/60 text-sm font-body font-light leading-relaxed">
              Sign in to start reviewing code smarter
            </p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="liquid-glass-strong w-full flex items-center justify-center gap-3 px-6 py-3.5 text-white text-sm font-body font-medium transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.07)] active:scale-[0.97]"
            style={{ borderRadius: '9999px' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-body">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form
            onSubmit={handlePrSubmit}
            className="liquid-glass flex items-center gap-3 pl-4 pr-2 py-2"
            style={{ borderRadius: '9999px' }}
          >
            <input
              type="text"
              placeholder="Paste GitHub PR URL..."
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm font-body font-light placeholder:text-white/30 outline-none"
            />
            <button
              type="submit"
              className="bg-white rounded-full p-2.5 text-black transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ borderRadius: '9999px' }}
            >
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-white/25 text-xs font-body font-light mt-6 leading-relaxed">
            By signing in you agree to our{' '}
            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">Terms</span>
            {' '}and{' '}
            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div
        className={`fixed bottom-12 left-0 right-0 px-10 flex items-end justify-between z-20 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <p className="text-sm font-body font-light text-white/75 max-w-[220px] leading-relaxed">
          ReviewBot scans every line of your pull request for bugs, vulnerabilities, and performance issues — instantly.
        </p>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-3">
          <button className="group relative bg-white text-black text-sm font-body font-medium rounded-full px-6 py-3 overflow-hidden active:scale-[0.97] transition-all duration-200 shadow-[0_0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_24px_4px_rgba(255,255,255,0.25)] hover:scale-[1.03]">
            <span className="relative z-10">Review a PR now</span>
            <span className="absolute inset-0 bg-gradient-to-b from-white to-white/85 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />
          </button>
          <button className="liquid-glass group text-white text-sm font-body font-medium rounded-full px-6 py-3 active:scale-[0.97] transition-all duration-200 hover:scale-[1.03] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_2px_rgba(255,255,255,0.07)]">
            Watch demo
          </button>
        </div>

        <p className="text-sm font-body font-light text-white/75 max-w-[220px] leading-relaxed text-right">
          Paste any GitHub pull request URL and get AI-powered review comments posted back in seconds.
        </p>
      </div>
    </div>
  );
}
