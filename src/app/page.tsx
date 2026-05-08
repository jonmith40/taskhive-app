"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TaskHiveLogo from "@/components/TaskHiveLogo";

export default function PremiumLanding() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Canvas Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    let animationFrameId: number;
    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    class Particle {
      x!: number;
      y!: number;
      vx!: number;
      vy!: number;
      r!: number;
      life!: number;
      maxLife!: number;
      color!: string;

      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.r = Math.random() * 1.5 + 0.5;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 200;
        this.color =
          Math.random() > 0.6
            ? "125,249,170"
            : Math.random() > 0.5
            ? "56,189,248"
            : "167,139,250";
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (
          this.life > this.maxLife ||
          this.x < 0 ||
          this.x > W ||
          this.y < 0 ||
          this.y > H
        ) {
          this.reset();
        }
      }
      draw() {
        if (!ctx) return;
        const prog = this.life / this.maxLife;
        const alpha = Math.sin(prog * Math.PI) * 0.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) {
      const p = new Particle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    function drawConnections() {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            const alpha = (1 - d / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(125,249,170,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Counters
  useEffect(() => {
    function countUp(
      el: HTMLElement | null,
      target: number,
      suffix = "",
      duration = 1800
    ) {
      if (!el) return;
      let start = 0;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const timer = setTimeout(() => {
      countUp(s1Ref.current, 12400, "+");
      countUp(s2Ref.current, 98000, "+");
      countUp(s3Ref.current, 47, "");
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Cursor Glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + "px";
        glowRef.current.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parallax Handlers
  const handleCardMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    ref.current.style.transform = `translateY(-4px) scale(1.01) perspective(600px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg)`;
  };

  const handleCardMouseLeave = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    ref.current.style.transform = "";
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* Base Resets are handled by Tailwind, but let's ensure body matches template */
        body {
          background: #050508;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        canvas#bg {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .wrapper {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          background: linear-gradient(180deg, rgba(5,5,8,0.9) 0%, transparent 100%);
          backdrop-filter: blur(10px);
          animation: slideDown 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideDown {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #7DF9AA;
          box-shadow: 0 0 12px #7DF9AA, 0 0 24px rgba(125,249,170,0.4);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          transition: color 0.3s;
          letter-spacing: 0.3px;
        }

        .nav-links a:hover { color: #fff; }

        .nav-cta {
          background: rgba(125,249,170,0.1);
          border: 1px solid rgba(125,249,170,0.3);
          color: #7DF9AA !important;
          padding: 8px 20px;
          border-radius: 100px;
          transition: all 0.3s !important;
        }

        .nav-cta:hover {
          background: rgba(125,249,170,0.2) !important;
          color: #7DF9AA !important;
        }

        /* HERO */
        .hero {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: fadeUp 0.8s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #7DF9AA;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(48px, 8vw, 88px);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -3px;
          margin-bottom: 28px;
          animation: fadeUp 0.8s 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        .gradient-text {
          background: linear-gradient(135deg, #7DF9AA 0%, #38BDF8 50%, #A78BFA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sub {
          font-size: 18px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 48px;
          font-weight: 300;
          animation: fadeUp 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* CARDS */
        .cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          width: 100%;
          max-width: 680px;
          margin: 0 auto 64px;
          animation: fadeUp 0.8s 0.65s cubic-bezier(0.16,1,0.3,1) both;
        }
        
        @media(min-width: 640px) {
          .cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        .card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 32px 28px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s;
          text-align: left;
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(125,249,170,0.08) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s;
          border-radius: inherit;
        }

        .card:hover::before { opacity: 1; }
        .card:hover {
          border-color: rgba(125,249,170,0.2);
        }

        .card-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(125,249,170,0.08);
          border: 1px solid rgba(125,249,170,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 22px;
          transition: all 0.3s;
        }

        .card:hover .card-icon {
          background: rgba(125,249,170,0.15);
          border-color: rgba(125,249,170,0.3);
          transform: scale(1.08) rotate(-3deg);
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .card-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-arrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #7DF9AA;
          font-weight: 500;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.3s;
        }

        .card:hover .card-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .card-tag {
          position: absolute;
          top: 20px; right: 20px;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.07);
        }

        /* STATS */
        .stats {
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: center;
          margin-bottom: 64px;
          animation: fadeUp 0.8s 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        
        @media(min-width: 640px) {
          .stats {
            flex-direction: row;
            gap: 48px;
          }
        }

        .stat { text-align: center; }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        /* GLOW ORBS */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
          animation: orbFloat 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(125,249,170,0.12) 0%, transparent 70%);
          top: -100px; right: -100px;
          animation-duration: 9s;
        }

        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%);
          bottom: 100px; left: -80px;
          animation-duration: 11s;
          animation-delay: -3s;
        }

        .orb-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-duration: 7s;
          animation-delay: -5s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-20px) scale(1.05); }
          66% { transform: translateY(15px) scale(0.97); }
        }

        /* GRID LINES */
        .grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        /* FOOTER */
        .footer-line {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 2px;
          text-transform: uppercase;
          animation: fadeUp 0.8s 1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .footer-line::before,
        .footer-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        /* Ticker */
        .ticker-wrap {
          width: 100%;
          max-width: 680px;
          overflow: hidden;
          margin-bottom: 48px;
          animation: fadeUp 0.8s 0.75s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
        }

        .ticker-wrap::before, .ticker-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          z-index: 2;
        }

        .ticker-wrap::before { left: 0; background: linear-gradient(90deg, #050508, transparent); }
        .ticker-wrap::after { right: 0; background: linear-gradient(-90deg, #050508, transparent); }

        .ticker {
          display: flex;
          gap: 24px;
          animation: tickerMove 18s linear infinite;
          white-space: nowrap;
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          flex-shrink: 0;
        }

        .ticker-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #7DF9AA;
          opacity: 0.6;
        }

        @keyframes tickerMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* SCAN LINE */
        .scan-line {
          position: fixed;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(125,249,170,0.4), transparent);
          pointer-events: none;
          z-index: 200;
          animation: scan 6s linear infinite;
          top: 0;
        }

        @keyframes scan {
          0% { top: 0%; opacity: 1; }
          95% { opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
        `
      }} />

      {/* Global animated background elements */}
      <div className="scan-line"></div>
      <div className="grid-overlay"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <canvas id="bg" ref={canvasRef}></canvas>

      <div
        ref={glowRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 999,
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(125,249,170,0.04) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          transition: "left 0.15s ease, top 0.15s ease",
          top: "50%",
          left: "50%",
        }}
      ></div>

      <nav>
        <div className="logo">
          <TaskHiveLogo height={36} />
        </div>
        <ul className="nav-links">
          <li>
            <a href="#">How it works</a>
          </li>
          <li>
            <a href="#">Explore</a>
          </li>
          <li>
            <a href="#">Pricing</a>
          </li>
          <li>
            <a href="#" className="nav-cta">
              Get started
            </a>
          </li>
        </ul>
      </nav>

      <div className="wrapper">
        <div className="hero">
          <div className="badge">
            <div className="badge-dot"></div>
            Premium Local Service Platform
          </div>

          <h1>
            Micro-Job
            <br />
            <span className="gradient-text">Network</span>
          </h1>

          <p className="sub">
            Connecting local talent with immediate opportunities. Seamless, secure, and incredibly fast.
          </p>

          <div className="ticker-wrap">
            <div className="ticker" id="ticker">
              <span className="ticker-item">
                <span className="ticker-dot"></span> Web Design
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Home Repair
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Delivery
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Tutoring
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Photography
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Cleaning
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Cooking
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> IT Support
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Translation
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Writing
              </span>
              {/* Duplicate for infinite effect */}
              <span className="ticker-item">
                <span className="ticker-dot"></span> Web Design
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Home Repair
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Delivery
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Tutoring
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Photography
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Cleaning
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Cooking
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> IT Support
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Translation
              </span>
              <span className="ticker-item">
                <span className="ticker-dot"></span> Writing
              </span>
            </div>
          </div>

          <div className="cards">
            <div
              className="card"
              ref={card1Ref}
              onMouseMove={(e) => handleCardMouseMove(e, card1Ref)}
              onMouseLeave={() => handleCardMouseLeave(card1Ref)}
              onClick={() => router.push("/worker-dashboard")}
            >
              <div className="card-tag">Worker</div>
              <div className="card-icon">💼</div>
              <div className="card-title">Find Work</div>
              <p className="card-desc">
                Browse local micro-jobs and start earning today. Your skills, your schedule.
              </p>
              <div className="card-arrow">Access dashboard &rarr;</div>
            </div>
            <div
              className="card"
              ref={card2Ref}
              onMouseMove={(e) => handleCardMouseMove(e, card2Ref)}
              onMouseLeave={() => handleCardMouseLeave(card2Ref)}
              onClick={() => router.push("/employer-dashboard")}
            >
              <div className="card-tag">Employer</div>
              <div className="card-icon">🏢</div>
              <div className="card-title">Hire Talent</div>
              <p className="card-desc">
                Post a job in minutes and connect with verified local professionals instantly.
              </p>
              <div className="card-arrow">Access dashboard &rarr;</div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-number" ref={s1Ref}>0</div>
              <div className="stat-label">Active Workers</div>
            </div>
            {/* Inline styling converted for React */}
            <div
              className="stat"
              style={{
                borderLeft: "1px solid rgba(255,255,255,0.07)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                padding: "0 48px",
              }}
            >
              <div className="stat-number" ref={s2Ref}>0</div>
              <div className="stat-label">Jobs Completed</div>
            </div>
            <div className="stat">
              <div className="stat-number" ref={s3Ref}>0</div>
              <div className="stat-label">Cities Covered</div>
            </div>
          </div>

          <div className="footer-line">Trusted &middot; Verified &middot; Local</div>
        </div>
      </div>
    </>
  );
}
