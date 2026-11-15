"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ---- Edit these ----
const SECONDS_PER_CHAR = 0.026; // writing speed: lower = faster
const HAND_IMAGE: string | null = null; // e.g. "/hand.png" (transparent PNG in /public)
const HAND_TIP = { x: 0.06, y: 0.94 }; // where the pen tip sits inside that image (0 to 1)

// {AR} = the Arabic phrase, {HEART} = the drawn heart
const PARAGRAPHS = [
    "Siblings are undoubtedly among the greatest gifts God has bestowed upon humanity, and having you in my life is more than enough proof of that. In fact, you are not your regular kind of blessing; you are the super-duper kind. Supermom, Super Sibling, Super Confident, Super Helper. You embody all these and so much more.",
    "I am immensely grateful for everything you have done for me and for all the things you continue to do. Every time I reach out with a simple “hi”, you already know there’s an underlying intention to request multiple Ks, yet you never turn me away. You show up, time and time again, and I cannot begin to express how much I appreciate that.",
    "Growing up, I used to take so many of the things you did for granted. The sacrifices, the guidance, the constant support. I suppose I simply assumed that was what having a sibling was supposed to look like. It wasn’t until I grew older that I realised just how fortunate I was. I came to understand that not everyone is blessed with a sibling who goes to such lengths for them. Some people don’t get that kind of love, commitment or support, and that realisation has only deepened my appreciation for you.",
    "Even now, as I’ve grown older, I still find that same love, comfort and sense of security in you. I am grateful to Allah for blessing me with you, and I am equally grateful to you for never leaving me stranded, especially during all those times I’ve come knocking for support.",
    "I pray that Allah makes it possible for me, someday, to reciprocate your kindness and appreciate you in ways that are truly deserving of all you’ve done for me. May Allah {AR} increase you in knowledge, strengthen your faith, expand your provision, grant you sobriety, preserve your health and shower you with every other form of goodness and blessing this life and the Hereafter have to offer.",
    "You are, without a doubt, one of a kind, and I hope you never forget just how much you mean to me.",
];
const SIGNOFF = ["Happy birthday, Egbon mi.", "Mo love yin daku. {HEART}"];
// --------------------

const HIDDEN = "inset(-30% 100% -40% -10%)";
const HIDDEN_RTL = "inset(-30% -10% -40% 100%)";
const SHOWN = "inset(-30% -10% -40% -10%)";

function Heart({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}

function Words({ text }: { text: string }) {
    return (
        <>
            {text.split(" ").map((t, i) => (
                <Fragment key={i}>
                    {t === "{AR}" ? (
                        <span lang="ar" dir="rtl" data-rtl="1" className="w inline-block">
                            عز وجل
                        </span>
                    ) : t === "{HEART}" ? (
                        <span className="w inline-block">
                            <Heart className="inline-block h-[0.8em] w-[0.8em] translate-y-[0.06em]" />
                        </span>
                    ) : (
                        <span className="w inline-block">{t}</span>
                    )}{" "}
                </Fragment>
            ))}
        </>
    );
}

function Pen() {
    if (HAND_IMAGE) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={HAND_IMAGE}
                alt=""
                aria-hidden="true"
                className="absolute left-0 top-0 w-[clamp(150px,30vw,300px)] max-w-none select-none"
                style={{ transform: `translate(${-HAND_TIP.x * 100}%, ${-HAND_TIP.y * 100}%)` }}
            />
        );
    }
    return (
        <svg
            viewBox="0 0 150 150"
            aria-hidden="true"
            className="absolute left-0 top-0 h-[clamp(90px,16vw,140px)] w-[clamp(90px,16vw,140px)] max-w-none drop-shadow-[0_6px_6px_rgba(0,0,0,0.25)]"
            style={{ transform: "translate(-5.3%,-94.7%)" }}
        >
            <path d="M28.9 114.1 L123.6 13.6 L136.4 26.4 L35.9 121.1 Z" fill="#2a1a26" />
            <path d="M46.1 94.7 L55.3 103.9" stroke="#d8a48f" strokeWidth="2.2" />
            <path d="M111.4 25.8 L124.2 38.6" stroke="#d8a48f" strokeWidth="1.6" />
            <path d="M8 142 L28.9 114.1 L35.9 121.1 Z" fill="#d8a48f" />
            <path d="M8 142 L32.4 117.6" stroke="#2a1a26" strokeWidth="0.9" />
        </svg>
    );
}

export default function Letter() {
    const root = useRef<HTMLElement>(null);
    const open = useRef<() => void>(() => { });
    const speed = useRef<() => void>(() => { });

    useLayoutEffect(() => {
        const el = root.current!;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const q = gsap.utils.selector(el);

        // Auto-scroll follows the pen until the visitor scrolls on their own.
        let auto = true;
        const stopAuto = () => {
            auto = false;
        };

        const ctx = gsap.context(() => {
            // Reduced motion: skip the envelope and pen, show the finished letter.
            if (reduce) {
                gsap.set(q(".env-wrap, .env-hint, .pen, .skip-hint"), { display: "none" });
                return;
            }

            gsap.set(q(".letter-body"), { display: "none" });
            gsap.set(q(".pen"), { opacity: 0 });
            (q(".w") as HTMLElement[]).forEach((w) => {
                gsap.set(w, { clipPath: w.dataset.rtl === "1" ? HIDDEN_RTL : HIDDEN });
            });

            gsap.fromTo(
                q(".env-in"),
                { opacity: 0, y: 36 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    stagger: 0.15,
                    scrollTrigger: { trigger: el, start: "top 60%" },
                }
            );

            // The pen writes the letter word by word.
            const write = () => {
                ScrollTrigger.refresh();
                window.addEventListener("wheel", stopAuto, { passive: true });
                window.addEventListener("touchmove", stopAuto, { passive: true });

                const area = q(".write-area")[0] as HTMLElement;
                const pen = q(".pen")[0] as HTMLElement;
                const words = q(".w") as HTMLElement[];

                const follow = () => {
                    if (!auto) return;
                    const r = pen.getBoundingClientRect();
                    const limit = window.innerHeight * 0.7;
                    if (r.top > limit) window.scrollBy(0, (r.top - limit) * 0.12);
                };

                const writing = gsap.timeline({ delay: 0.4 });
                let lastPara: Element | null = null;

                words.forEach((w) => {
                    const para = w.closest(".letter-p");
                    const rtl = w.dataset.rtl === "1";
                    const chars = (w.textContent || "").trim().length;
                    const dur = Math.max(0.09, Math.min(0.9, chars * SECONDS_PER_CHAR));
                    let x0 = 0;
                    let x1 = 0;
                    let y = 0;

                    if (para !== lastPara) {
                        if (lastPara) writing.to({}, { duration: 0.55 });
                        lastPara = para;
                    }

                    writing.to(w, {
                        clipPath: SHOWN,
                        duration: dur,
                        ease: "none",
                        onStart: () => {
                            const c = area.getBoundingClientRect();
                            const r = w.getBoundingClientRect();
                            x0 = (rtl ? r.right : r.left) - c.left;
                            x1 = (rtl ? r.left : r.right) - c.left;
                            y = r.top - c.top + r.height * 0.72;
                            gsap.set(pen, { x: x0, y, opacity: 1 });
                        },
                        onUpdate: function (this: gsap.core.Tween) {
                            const p = this.progress();
                            gsap.set(pen, { x: x0 + (x1 - x0) * p, y: y + Math.sin(p * 9) * 1.5 });
                            follow();
                        },
                    });
                    writing.to({}, { duration: 0.02 });
                });

                writing.to(pen, { opacity: 0, x: "+=90", y: "-=50", duration: 0.9, ease: "power2.in" });
                writing.to(q(".skip-hint"), { opacity: 0, duration: 0.4 }, "<");

                speed.current = () => writing.timeScale(8);
            };

            let opened = false;
            open.current = () => {
                if (opened) return;
                opened = true;
                ctx.add(() => {
                    const tl = gsap.timeline();
                    tl.to(q(".seal"), { scale: 0.6, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
                        .to(
                            q(".flap"),
                            {
                                rotationX: 180,
                                transformPerspective: 1000,
                                transformOrigin: "50% 0%",
                                duration: 0.8,
                                ease: "power2.inOut",
                            },
                            0.15
                        )
                        .to(
                            q(".env-wrap, .env-hint"),
                            { opacity: 0, y: 24, duration: 0.6, ease: "power2.in" },
                            1.2
                        )
                        .set(q(".env-wrap, .env-hint"), { display: "none" })
                        .set(q(".letter-body"), { display: "block" })
                        .fromTo(
                            q(".paper, .skip-hint"),
                            { opacity: 0, y: 60 },
                            { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 }
                        )
                        .call(() => {
                            ctx.add(write);
                        });
                });
            };
        }, el);

        return () => {
            window.removeEventListener("wheel", stopAuto);
            window.removeEventListener("touchmove", stopAuto);
            ctx.revert();
        };
    }, []);

    return (
        <section
            ref={root}
            className="relative flex min-h-svh flex-col items-center justify-center overflow-x-clip px-4 py-24 text-center sm:px-6"
        >
            <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />

            <p className="env-label env-in text-xs uppercase tracking-[0.5em] text-accent">
                A letter for you
            </p>

            <button
                type="button"
                onClick={() => open.current()}
                aria-label="Open the letter"
                className="env-wrap env-in relative mt-16 block aspect-[3/2] w-[min(78vw,26rem)] cursor-pointer rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.5)] outline-offset-8 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
            >
                <span className="absolute inset-0 bg-[#efe3da]" />
                <span className="absolute inset-0 bg-[#e2d1c5] [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]" />
                <span className="flap absolute left-0 top-0 h-[55%] w-full bg-[#f6eee9] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                <span className="seal absolute left-1/2 top-[55%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-ink">
                    <Heart className="h-5 w-5" />
                </span>
            </button>

            <p className="env-hint env-in mt-8 text-[0.65rem] uppercase tracking-[0.4em] text-ivory/50">
                Tap to open
            </p>

            <article
                onPointerDown={() => speed.current()}
                className="letter-body relative z-10 mx-auto w-full max-w-[42rem] pb-16 text-left"
            >
                <p className="skip-hint mb-6 text-center text-[0.65rem] uppercase tracking-[0.4em] text-ivory/50">
                    Tap the page to speed up
                </p>

                <div className="paper relative rounded-sm bg-[#f4eae2] px-[clamp(1.5rem,6vw,4rem)] py-[clamp(2rem,7vw,4.5rem)] text-[#2b1f26] shadow-[0_40px_100px_rgba(0,0,0,0.55)]">
                    <div
                        className="write-area relative text-[clamp(1.55rem,4.4vw,2.2rem)] leading-[1.55] [word-spacing:0.08em]"
                        style={{ fontFamily: "var(--font-greatvibes), cursive" }}
                    >
                        <div className="space-y-[0.9em]">
                            {PARAGRAPHS.map((p, i) => (
                                <p key={i} className="letter-p">
                                    <Words text={p} />
                                </p>
                            ))}
                            {SIGNOFF.map((p, i) => (
                                <p key={i} className="letter-p pt-3 text-[1.25em] text-[#9b4f5a]">
                                    <Words text={p} />
                                </p>
                            ))}
                        </div>

                        <div className="pen pointer-events-none absolute left-0 top-0 z-10 h-0 w-0">
                            <Pen />
                        </div>
                    </div>
                </div>
            </article>
        </section>
    );
}