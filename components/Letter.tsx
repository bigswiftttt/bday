"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Heart({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}

export default function Letter() {
    const root = useRef<HTMLElement>(null);
    const open = useRef<() => void>(() => { });

    useLayoutEffect(() => {
        const el = root.current!;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const q = gsap.utils.selector(el);

        const ctx = gsap.context(() => {
            // Reduced motion: skip the envelope and show the letter.
            if (reduce) {
                gsap.set(q(".env-wrap, .env-hint"), { display: "none" });
                return;
            }

            gsap.set(q(".letter-body"), { display: "none" });

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
                        .call(() => {
                            ctx.add(() => {
                                const ps = q(".letter-p");
                                gsap.set(ps, { opacity: 0, y: 28 });
                                ps.forEach((p) => {
                                    gsap.to(p, {
                                        opacity: 1,
                                        y: 0,
                                        duration: 1.1,
                                        ease: "power3.out",
                                        scrollTrigger: { trigger: p, start: "top 88%", once: true },
                                    });
                                });
                                ScrollTrigger.refresh();
                            });
                        });
                });
            };
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={root}
            className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center"
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

            <article className="letter-body relative z-10 mx-auto mt-4 w-full max-w-[34rem] text-left">
                <span className="mb-12 block h-px w-16 bg-accent/80" aria-hidden="true" />

                <div className="space-y-8 text-[clamp(1rem,2.3vw,1.2rem)] font-light leading-[1.9] text-ivory/85">
                    <p className="letter-p">
                        Siblings are undoubtedly among the greatest gifts God has bestowed upon humanity, and
                        having you in my life is more than enough proof of that. In fact, you are not your
                        regular kind of blessing; you are the super-duper kind. Supermom, Super Sibling, Super
                        Confident, Super Helper. You embody all these and so much more.
                    </p>

                    <p className="letter-p">
                        I am immensely grateful for everything you have done for me and for all the things you
                        continue to do. Every time I reach out with a simple “hi”, you already know there’s an
                        underlying intention to request multiple Ks, yet you never turn me away. You show up,
                        time and time again, and I cannot begin to express how much I appreciate that.
                    </p>

                    <p className="letter-p">
                        Growing up, I used to take so many of the things you did for granted. The sacrifices,
                        the guidance, the constant support. I suppose I simply assumed that was what having a
                        sibling was supposed to look like. It wasn’t until I grew older that I realised just how
                        fortunate I was. I came to understand that not everyone is blessed with a sibling who
                        goes to such lengths for them. Some people don’t get that kind of love, commitment or
                        support, and that realisation has only deepened my appreciation for you.
                    </p>

                    <p className="letter-p">
                        Even now, as I’ve grown older, I still find that same love, comfort and sense of
                        security in you. I am grateful to Allah for blessing me with you, and I am equally
                        grateful to you for never leaving me stranded, especially during all those times I’ve
                        come knocking for support.
                    </p>

                    <p className="letter-p">
                        I pray that Allah makes it possible for me, someday, to reciprocate your kindness and
                        appreciate you in ways that are truly deserving of all you’ve done for me. May Allah{" "}
                        <span lang="ar" dir="rtl" className="inline-block">
                            عز وجل
                        </span>{" "}
                        increase you in knowledge, strengthen your faith, expand your provision, grant you
                        sobriety, preserve your health and shower you with every other form of goodness and
                        blessing this life and the Hereafter have to offer.
                    </p>

                    <p className="letter-p">
                        You are, without a doubt, one of a kind, and I hope you never forget just how much you
                        mean to me.
                    </p>

                    <p className="letter-p pt-6 font-display text-[clamp(1.6rem,5vw,2.4rem)] italic leading-snug text-accent">
                        Happy birthday, Egbon mi.
                        <span className="mt-2 block">
                            Mo love yin daku.{" "}
                            <Heart className="inline-block h-[0.8em] w-[0.8em] translate-y-[0.06em]" />
                        </span>
                    </p>
                </div>
            </article>
        </section>
    );
}