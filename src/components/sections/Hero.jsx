'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useModal } from '../../context/ModalContext';

import QuatrefoilBackground from '../ui/QuatrefoilBackground';
import SparticlesEffect from '../ui/SparticlesEffect';

const Hero = () => {
    const router = useRouter();
    const { openReservation } = useModal();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const titleVariants = {
        hidden: { opacity: 0, y: 100, rotateX: -20 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
                duration: 1.5
            }
        }
    };

    return (
        <section id="home" className="relative w-full overflow-x-hidden flex flex-col items-center justify-start bg-transparent perspective-1000 pt-[4.5rem] sm:pt-20 md:pt-[5.25rem] pb-6 md:pb-8">
            <QuatrefoilBackground />
            <SparticlesEffect className="absolute inset-0 pointer-events-none z-40" />

            {/* Content Overlay - Centered and elegant */}
            <motion.div
                style={{ y: y1, opacity }}
                className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-center text-center pt-2 md:pt-3 pb-2 md:pb-4"
            >
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 0.1
                            }
                        }
                    }}
                    className="space-y-2 md:space-y-3 max-w-4xl"
                >
                    {/* Top Tagline */}
                    <div
                        className="flex items-center justify-center gap-4"
                    >
                        <div className="w-12 h-[1px] bg-black/60"></div>
                        <span className="text-black/80 font-serif tracking-[0.3em] uppercase text-xs font-semibold">
                            Est. 2026
                        </span>
                        <div className="w-12 h-[1px] bg-black/60"></div>
                    </div>

                    {/* Main Heading - The "Wow" Factor with 3D Reveal */}
                    <div className="relative perspective-1000 mt-0 md:mt-1">
                        <motion.h1
                            variants={titleVariants}
                            className="flex justify-center pb-2"
                        >
                            <img
                                src="/logo.png"
                                alt="Asia By Gram"
                                width="320"
                                height="320"
                                fetchPriority="high"
                                className="w-[160px] sm:w-[200px] md:w-[220px] lg:w-[260px] h-auto object-contain mx-auto drop-shadow-2xl"
                            />
                        </motion.h1>
                    </div>

                    {/* Subheading / Description */}
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 30, filter: "blur(10px)" }, visible: { opacity: 1, y: 0, filter: "blur(0)" } }}
                        className="text-black font-bold text-sm md:text-base font-serif italic max-w-2xl mx-auto leading-relaxed pt-1 pb-2 md:pb-3"
                    >
                        "A culinary journey through the soul of Asia, crafted with passion and served with elegance in the heart of Hyderabad."
                    </motion.p>

                    {/* Action Bar - Centered below content */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="flex w-[90%] md:w-[500px] h-14 shadow-2xl mx-auto rounded-sm overflow-hidden"
                    >
                        <div
                            onClick={() => router.push('/menu')}
                            className="flex-1 bg-black text-white hover:bg-zinc-900 transition-colors flex items-center justify-center gap-3 cursor-pointer group"
                        >
                            <span className="font-asian font-bold uppercase tracking-[0.2em] text-xs">Explore Menu</span>
                            <ArrowRight className="group-hover:translate-x-2 transition-transform" size={14} />
                        </div>
                        <div
                            onClick={openReservation}
                            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-black hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <span className="font-asian font-bold uppercase tracking-[0.2em] text-xs">Book a Table</span>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
