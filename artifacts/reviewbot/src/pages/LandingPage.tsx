import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Code, Github, Twitter, Code2, ArrowUpRight } from "lucide-react";
import { useLocation } from "wouter";

const HERO_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";
const FEATURED_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4";
const PHILOSOPHY_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";
const CARD_VIDEO_1 = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const CARD_VIDEO_2 = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4";

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = "0";

    let fadeRaf: number;
    function fadeOpacity(from: number, to: number, duration: number, onDone?: () => void) {
      cancelAnimationFrame(fadeRaf);
      const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / duration, 1);
        video!.style.opacity = String(from + (to - from) * t);
        if (t < 1) fadeRaf = requestAnimationFrame(step);
        else onDone?.();
      }
      fadeRaf = requestAnimationFrame(step);
    }

    function onCanPlay() {
      video!.play().catch(() => {});
      fadeOpacity(0, 1, 500);
    }
    function onTimeUpdate() {
      if (video!.duration - video!.currentTime <= 0.55) {
        fadeOpacity(parseFloat(video!.style.opacity || "1"), 0, 500);
      }
    }
    function onEnded() {
      video!.style.opacity = "0";
      setTimeout(() => {
        video!.currentTime = 0;
        video!.play().catch(() => {});
        fadeOpacity(0, 1, 500);
      }, 100);
    }

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      cancelAnimationFrame(fadeRaf);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        muted
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        style={{ opacity: 0 }}
      />

      {/* Navbar */}
      <div className="relative z-20 px-6 py-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={24} className="text-white" />
            <span className="text-white font-semibold text-lg">ReviewBot</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 tracking-widest uppercase ml-1">AI</span>
            <nav className="hidden md:flex items-center gap-8 ml-8">
              {["Features", "Pricing", "GitHub"].map((link) => (
                <a key={link} href={link === "GitHub" ? "https://github.com" : "#"} className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                  {link}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/login?mode=register")} className="text-white text-sm font-medium hover:text-white/80 transition-colors">
              Sign Up
            </button>
            <button onClick={() => setLocation("/login")} className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%]">
        <h1
          className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap mb-8"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Review code then <em className="italic">smarter.</em>
        </h1>

        <div className="liquid-glass rounded-full max-w-xl w-full pl-6 pr-2 py-2 flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Paste GitHub PR URL and press Enter..."
            className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            onKeyDown={(e) => { if (e.key === "Enter") setLocation("/app"); }}
          />
          <button onClick={() => setLocation("/app")} className="bg-white rounded-full p-3 text-black hover:bg-white/90 transition-colors shrink-0">
            <ArrowRight size={20} />
          </button>
        </div>

        <p className="text-white/70 text-sm leading-relaxed px-4 max-w-md mb-8">
          Paste any GitHub pull request and get an AI-powered review in seconds. Security vulnerabilities, bugs, and performance issues — caught before they ship.
        </p>

        <button onClick={() => setLocation("/app")} className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
          See a live review →
        </button>
      </div>

      {/* Social icons */}
      <div className="relative z-10 flex justify-center gap-4 pb-12">
        {[
          { Icon: Github, href: "https://github.com" },
          { Icon: Twitter, href: "https://twitter.com" },
          { Icon: Code2, href: "#" },
        ].map(({ Icon, href }, i) => (
          <a key={i} href={href} className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all">
            <Icon size={20} />
          </a>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6 overflow-hidden">
      <div className="bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_70%)] max-w-6xl mx-auto">
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-sm tracking-widest uppercase mb-6"
        >
          About ReviewBot AI
        </motion.p>
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for{" "}
          <em className="italic text-white/60">engineers</em>
          {" "}who
          <br className="hidden md:block" />
          <em className="italic text-white/60">ship</em>{" "}fast,
          <br className="hidden md:block" />
          review{" "}
          <em className="italic text-white/60">faster.</em>
        </motion.h2>
      </div>
    </section>
  );
}

function FeaturedVideoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [, setLocation] = useLocation();

  return (
    <section className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          className="rounded-3xl overflow-hidden aspect-video relative"
        >
          <video
            src={FEATURED_VIDEO}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3">How It Works</p>
              <p className="text-white text-sm md:text-base leading-relaxed">
                Paste a GitHub PR URL. Our AI scans every line for SQL injection, hardcoded secrets, performance bottlenecks, and bugs — then generates corrected code instantly.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/login?mode=register")}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors shrink-0"
            >
              Try it free →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-black py-28 md:py-40 px-6 overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Security{" "}
          <em className="italic text-white/40">x</em>
          {" "}Speed.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-3xl overflow-hidden aspect-[4/3]"
          >
            <video
              src={PHILOSOPHY_VIDEO}
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
            />
          </motion.div>

          <motion.div
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col justify-center gap-8"
          >
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Catch what humans miss</p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Every critical vulnerability and hidden bug gets flagged with a severity score, CWE classification, and an exact corrected code snippet — not just a vague warning.
              </p>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Ship with confidence</p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                ReviewBot integrates directly with GitHub and posts inline comments on your pull request automatically. Your team sees the fixes exactly where they need them.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      video: CARD_VIDEO_1,
      tag: "Security",
      title: "Vulnerability Detection",
      description: "SQL injection, XSS, hardcoded secrets, path traversal, and OWASP Top 10 — caught instantly with CWE classifications and severity scores.",
    },
    {
      video: CARD_VIDEO_2,
      tag: "Performance",
      title: "Bug & Performance Analysis",
      description: "N+1 queries, unhandled promises, memory leaks, and inefficient loops — identified with corrected code suggestions ready to copy.",
    },
  ];

  return (
    <section className="bg-black py-28 md:py-40 px-6 overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]">
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-12"
        >
          <h2
            className="text-3xl md:text-5xl text-white tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            What we <em className="italic">catch.</em>
          </h2>
          <span className="text-white/40 text-sm hidden md:block">Our detections</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="liquid-glass rounded-3xl overflow-hidden group"
            >
              <div className="aspect-video relative overflow-hidden">
                <video
                  src={card.video}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/40 text-xs tracking-widest uppercase">{card.tag}</span>
                  <span className="liquid-glass rounded-full p-2 text-white/60">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
                <h3
                  className="text-white text-xl md:text-2xl mb-3 tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {card.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { number: "10x", label: "Faster than manual review" },
    { number: "94%", label: "Issue detection rate" },
    { number: "60s", label: "Average review time" },
  ];

  return (
    <section className="bg-black py-20 px-6 overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="liquid-glass rounded-2xl p-8 text-center"
            >
              <div
                className="text-5xl md:text-6xl text-white mb-3 tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {stat.number}
              </div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [, setLocation] = useLocation();

  return (
    <section className="bg-black py-32 md:py-48 px-6 overflow-hidden text-center" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white tracking-tight mb-6"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Ready to ship cleaner code?
        </motion.h2>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-white/50 text-lg mb-10"
        >
          Join developers who review smarter.
        </motion.p>
        <motion.button
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setLocation("/login?mode=register")}
          className="liquid-glass rounded-full px-10 py-4 text-white font-medium text-base hover:bg-white/5 transition-colors"
        >
          Start reviewing free →
        </motion.button>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-black">
      <HeroSection />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
      <StatsSection />
      <CTASection />
    </div>
  );
}
