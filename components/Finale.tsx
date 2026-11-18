"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createConfetti } from "../lib/confetti";

gsap.registerPlugin(ScrollTrigger);

// ---- Edit these ----
const LABEL = "HAPPY BIRTHDAY";
const MAIN_LINES = ["Many happy", "returns."];
const SUB = "The cape goes back on tomorrow.";
const WITH_LOVE = "With love,";
const SIGNED_BY = "Swift";
const REPLAY = "Watch it again";
// --------------------

const HIDDEN = "inset(-30% 100% -40% -10%)";
const SHOWN = "inset(-30% -10% -40% -10%)";

function Mask({ text, cls }: { text: string; cls: string }) {
    return (
        <span aria-hidden="true" className="inline-flex overflow-hidden px-[0.05em] py-[0.06em]">
            {text.split("").map((ch, i) =>
                ch === " " ? (
                    <span key={i} className="inline-block w-[0.3em]" />
                ) : (
                    <span key={i} className={`${cls} inline-block will-change-transform`}>
                        {ch}
                    </span>
                )
            )}
        </span>
    );
}

function Heart({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}

export default function Finale() {
    const root = useRef<HTMLElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
        const el = root.current!;
        const confetti = createConfetti(canvas.current!);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const q = gsap.utils.selector(el);

        // A soft shower of confetti that stops by itself.
        let shower = 0;
        const stopShower = () => {
            window.clearInterval(shower);
            shower = 0;
        };
        const startShower = () => {
            stopShower();
            const started = performance.now();
            shower = window.setInterval(() => {
                if (performance.now() - started > 8000) {
                    stopShower();
                    return;
                }
                confetti.burst(Math.random() * window.innerWidth, -10, {
                    count: 3,
                    angle: Math.PI / 2,
                    spread: 0.7,
                    power: 140,
                });
            }, 260);
        };

        const ctx = gsap.context(() => {
            // Reduced motion: show everything still, no confetti.
            if (reduce) return;

            gsap.set(q(".fin-l"), { yPercent: 115 });
            gsap.set(q(".fin-label, .fin-love, .fin-replay"), { opacity: 0 });
            gsap.set(q(".fin-sub"), { opacity: 0, y: 14 });
            gsap.set(q(".fin-sign"), { clipPath: HIDDEN });
            gsap.set(q(".fin-heart"), { opacity: 0, scale: 0.4 });

            // The heart beats gently.
            gsap.to(q(".fin-heart-i"), {
                scale: 1.14,
                duration: 0.7,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            const tl = gsap.timeline({ paused: true });
            tl.to(q(".fin-label"), { opacity: 1, duration: 0.8 }, 0)
                .to(q(".fin-l"), { yPercent: 0, duration: 1.1, stagger: 0.045, ease: "power3.out" }, 0.2)
                .to(q(".fin-sub"), { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 1.6)
                .to(q(".fin-love"), { opacity: 1, duration: 0.8 }, 2.4)
                .to(q(".fin-sign"), { clipPath: SHOWN, duration: 1.8, ease: "power1.inOut" }, 2.8)
                .to(q(".fin-heart"), { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }, 4.4)
                .to(q(".fin-replay"), { opacity: 1, duration: 1 }, 5.2);

            ScrollTrigger.create({
                trigger: el,
                start: "top 55%",
                once: true,
                onEnter: () => {
                    tl.play();
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    confetti.burst(w * 0.05, h * 0.95, {
                        count: 60,
                        angle: -Math.PI * 0.36,
                        spread: 0.7,
                        power: 1000,
                    });
                    confetti.burst(w * 0.95, h * 0.95, {
                        count: 60,
                        angle: -Math.PI * 0.64,
                        spread: 0.7,
                        power: 1000,
                    });
                    window.setTimeout(startShower, 900);
                },
            });
        }, el);

        return () => {
            stopShower();
            ctx.revert();
            confetti.destroy();
        };
    }, []);

    return (
        <section
            ref={root}
            className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-28 text-center"
        >
            <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="grain pointer-events-none absolute inset-0 z-30" aria-hidden="true" />
            <canvas
                ref={canvas}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-10 h-full w-full"
            />

            <div className="relative z-20 flex flex-col items-center">
                <p className="fin-label font-display text-[clamp(0.9rem,3.4vw,1.9rem)] tracking-[0.32em] text-ivory/90">
                    {LABEL}
                </p>

                <h2 className="mt-[2.5vh] font-display text-[clamp(2.8rem,11vw,8.5rem)] italic leading-[0.98] text-accent">
                    <span className="sr-only">{MAIN_LINES.join(" ")}</span>
                    {MAIN_LINES.map((line) => (
                        <span key={line} className="block">
                            <Mask text={line} cls="fin-l" />
                        </span>
                    ))}
                </h2>

                <p className="fin-sub mt-[4vh] max-w-[28ch] text-balance text-[clamp(0.85rem,2.2vw,1.15rem)] font-light leading-relaxed text-ivory/75">
                    {SUB}
                </p>

                <p className="fin-love mt-[6vh] text-[0.7rem] uppercase tracking-[0.4em] text-ivory/60">
                    {WITH_LOVE}
                </p>

                <p
                    className="mt-2 flex items-center gap-3 text-accent"
                    style={{ fontFamily: "var(--font-greatvibes), cursive" }}
                >
                    <span className="fin-sign inline-block text-[clamp(3rem,10vw,5.5rem)] leading-none">
                        {SIGNED_BY}
                    </span>
                    <span className="fin-heart inline-block">
                        <Heart className="fin-heart-i h-[clamp(1.2rem,3vw,2rem)] w-[clamp(1.2rem,3vw,2rem)]" />
                    </span>
                </p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="fin-replay mt-[9vh] cursor-pointer text-[0.65rem] uppercase tracking-[0.4em] text-ivory/50 underline-offset-8 hover:text-accent hover:underline focus-visible:text-accent focus-visible:underline"
                >
                    {REPLAY}
                </button>
            </div>
        </section>
    );
}