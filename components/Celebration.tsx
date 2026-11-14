"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createConfetti } from "../lib/confetti";
import { palette } from "../lib/palette";

gsap.registerPlugin(ScrollTrigger);

// ---- Edit these ----
const WORDS = ["MOM", "SIBLING", "CONFIDENT", "HELPER"];
const WISH_BEFORE = "Make a wish.";
const WISH_AFTER = "Wish made.";
// --------------------

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

export default function Celebration() {
    const root = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const blow = useRef<() => void>(() => { });

    useLayoutEffect(() => {
        const el = root.current!;
        const confetti = createConfetti(canvas.current!);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const q = gsap.utils.selector(el);

        const ctx = gsap.context(() => {
            gsap.set(q(".smoke"), { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 });
            gsap.set(q(".wish-after"), { opacity: 0 });

            // ---- The "Super" reveal (pinned, scroll-scrubbed) ----
            if (reduce) {
                gsap.set(q(".words, .super-label"), { display: "none" });
                gsap.set(q(".static-line"), { display: "block" });
                gsap.set(q(".finale"), { position: "relative" });
            } else {
                gsap.set(q(".word-l, .finale-l"), { yPercent: 115 });
                gsap.set(q(".super-label, .finale-sub"), { opacity: 0 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: q(".statement")[0],
                        start: "top top",
                        end: "+=360%",
                        pin: true,
                        scrub: 0.6,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });

                tl.to(q(".super-label"), { opacity: 1, duration: 0.6 }, 0);
                q(".word").forEach((w, i) => {
                    const letters = w.querySelectorAll(".word-l");
                    const t = i * 3;
                    tl.to(letters, { yPercent: 0, duration: 1, stagger: 0.05, ease: "power3.out" }, t);
                    tl.to(letters, { yPercent: -115, duration: 0.8, stagger: 0.03, ease: "power3.in" }, t + 2);
                });

                const tF = WORDS.length * 3;
                tl.to(q(".super-label"), { opacity: 0, duration: 0.5 }, tF - 0.5);
                tl.to(q(".finale-sub"), { opacity: 1, duration: 0.8 }, tF);
                tl.to(q(".finale-l"), { yPercent: 0, duration: 1.1, stagger: 0.07, ease: "power3.out" }, tF);
                tl.to({}, { duration: 1.6 });
            }

            // ---- The wish ----
            if (!reduce) {
                gsap.fromTo(
                    q(".candle-in"),
                    { opacity: 0, y: 36 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power3.out",
                        stagger: 0.15,
                        scrollTrigger: { trigger: q(".candle-sec")[0], start: "top 60%" },
                    }
                );
                gsap.to(q(".flame"), {
                    scaleY: 1.1,
                    scaleX: 0.93,
                    rotation: 2.5,
                    svgOrigin: "60 102",
                    duration: 0.22,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                });
                gsap.to(q(".candle-glow"), {
                    opacity: 0.7,
                    duration: 0.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                });
            }

            let out = false;
            blow.current = () => {
                if (out) return;
                out = true;
                const flame = q(".flame");
                const r = flame[0].getBoundingClientRect();
                ctx.add(() => {
                    const t = gsap.timeline();
                    t.to(
                        flame,
                        {
                            scaleY: 0.1,
                            scaleX: 0.4,
                            opacity: 0,
                            svgOrigin: "60 102",
                            duration: 0.28,
                            ease: "power2.in",
                            overwrite: true,
                        },
                        0
                    )
                        .to(q(".candle-glow"), { opacity: 0, duration: 0.5, overwrite: true }, 0)
                        .fromTo(
                            q(".smoke"),
                            { opacity: 0.6, strokeDashoffset: 1 },
                            { strokeDashoffset: 0, duration: 1.1, ease: "power1.out" },
                            0.1
                        )
                        .to(q(".smoke"), { opacity: 0, y: -20, duration: 0.9 }, 0.8)
                        .to(q(".wish-before, .wish-hint"), { opacity: 0, duration: 0.4 }, 0.1)
                        .fromTo(
                            q(".wish-after"),
                            { opacity: 0, y: 14 },
                            { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
                            0.7
                        )
                        .call(
                            () =>
                                confetti.burst(r.left + r.width / 2, r.top + r.height / 2, {
                                    count: 80,
                                    power: 850,
                                    spread: Math.PI * 1.4,
                                }),
                            [],
                            0.15
                        );
                });
            };
        }, el);

        return () => {
            ctx.revert();
            confetti.destroy();
        };
    }, []);

    return (
        <div ref={root} className="relative">
            <div className="grain pointer-events-none absolute inset-0 z-20" aria-hidden="true" />
            <canvas
                ref={canvas}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-30 h-full w-full"
            />

            {/* The "Super" reveal */}
            <section className="statement relative flex h-svh flex-col items-center justify-center overflow-hidden px-4 text-center">
                <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />
                <h2 className="sr-only">
                    Supermom. Super Sibling. Super Confident. Super Helper. Happy birthday, Egbon mi.
                </h2>

                <p
                    aria-hidden="true"
                    className="super-label font-display text-[clamp(1.4rem,5vw,3.2rem)] italic text-accent"
                >
                    Super
                </p>

                <div
                    aria-hidden="true"
                    className="words relative mt-[1vh] h-[1em] w-full font-display text-[clamp(2.6rem,12.4vw,10.5rem)] leading-none tracking-tight text-ivory"
                >
                    {WORDS.map((w) => (
                        <div
                            key={w}
                            className="word absolute inset-0 flex items-center justify-center whitespace-nowrap"
                        >
                            <Mask text={w} cls="word-l" />
                        </div>
                    ))}
                </div>

                <div
                    aria-hidden="true"
                    className="finale absolute inset-0 flex flex-col items-center justify-center"
                >
                    <p className="finale-sub font-display text-[clamp(0.9rem,3.4vw,1.9rem)] tracking-[0.32em] text-ivory/90">
                        HAPPY BIRTHDAY
                    </p>
                    <p className="mt-[1.5vh] font-display text-[clamp(3rem,15vw,11rem)] italic leading-[0.95] text-accent">
                        <Mask text="Egbon mi." cls="finale-l" />
                    </p>
                </div>

                <p className="static-line mb-10 hidden max-w-[22ch] font-display text-[clamp(1.6rem,6vw,3rem)] italic leading-tight text-ivory">
                    Supermom. Super Sibling. Super Confident. Super Helper.
                </p>
            </section>

            {/* The wish */}
            <section className="candle-sec relative flex min-h-svh flex-col items-center justify-center px-6 text-center">
                <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />

                <div className="grid place-items-center">
                    <p className="wish-before candle-in text-xs uppercase tracking-[0.5em] text-accent [grid-area:1/1]">
                        {WISH_BEFORE}
                    </p>
                    <p className="wish-after font-display text-[clamp(2rem,7vw,4rem)] italic text-accent [grid-area:1/1]">
                        {WISH_AFTER}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => blow.current()}
                    aria-label="Blow out the candle"
                    className="candle candle-in mt-10 cursor-pointer rounded outline-offset-8 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
                >
                    <svg
                        viewBox="0 0 120 260"
                        className="h-[min(46svh,22rem)] w-auto overflow-visible"
                        aria-hidden="true"
                    >
                        <defs>
                            <radialGradient id="candle-glow-grad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={palette.accent} stopOpacity="0.45" />
                                <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <circle className="candle-glow" cx="60" cy="84" r="90" fill="url(#candle-glow-grad)" />
                        <rect x="48" y="112" width="24" height="138" rx="2" fill={palette.ivory} />
                        <path d="M60 112 L60 100" stroke="#3a2f33" strokeWidth="2" strokeLinecap="round" />
                        <path
                            className="smoke"
                            d="M60 98 C 50 78 70 58 58 38 S 66 8 60 -14"
                            fill="none"
                            stroke={palette.ivory}
                            strokeOpacity="0.5"
                            strokeWidth="1.5"
                            pathLength="1"
                        />
                        <g className="flame">
                            <path d="M60 64 C 71 80 72 96 60 102 C 48 96 49 80 60 64 Z" fill={palette.accent} />
                            <path d="M60 80 C 65 88 65 96 60 100 C 55 96 55 88 60 80 Z" fill="#fff4ea" />
                        </g>
                    </svg>
                </button>

                <p className="wish-hint candle-in mt-8 text-[0.65rem] uppercase tracking-[0.4em] text-ivory/50">
                    Tap the candle
                </p>
            </section>
        </div>
    );
}