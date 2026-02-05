import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

import QuatrefoilBackground from '../ui/QuatrefoilBackground';
import SparticlesEffect from '../ui/SparticlesEffect';

const Hero = () => {
    const navigate = useNavigate();
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
        <section id="home" className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-transparent perspective-1000">
            <QuatrefoilBackground />
            <SparticlesEffect className="absolute inset-0 pointer-events-none z-40" />

            {/* Content Overlay - Centered and elegant */}
            <motion.div
                style={{ y: y1, opacity }}
                className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-center text-center pt-20 md:pt-28"
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
                    className="space-y-4 max-w-4xl"
                >
                    {/* Top Tagline */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
                        className="flex items-center justify-center gap-4"
                    >
                        <div className="w-12 h-[1px] bg-black/60"></div>
                        <h2 className="text-black/80 font-serif tracking-[0.3em] uppercase text-xs font-semibold">
                            Est. 2026
                        </h2>
                        <div className="w-12 h-[1px] bg-black/60"></div>
                    </motion.div>

                    {/* Main Heading - The "Wow" Factor with 3D Reveal */}
                    <div className="relative perspective-1000 mt-2 md:mt-4">
                        <motion.h1
                            variants={titleVariants}
                            className="flex justify-center pb-2"
                        >
                            <img src="/logo.png" alt="Asia By Gram" className="w-[180px] md:w-[240px] lg:w-[280px] h-auto object-contain mx-auto drop-shadow-2xl" />
                        </motion.h1>
                    </div>

                    {/* Subheading / Description */}
                    <motion.p
                        variants={{ hidden: { opacity: 0, y: 30, filter: "blur(10px)" }, visible: { opacity: 1, y: 0, filter: "blur(0)" } }}
                        className="text-black font-bold text-sm md:text-lg font-serif italic max-w-2xl mx-auto leading-relaxed pt-2 pb-8"
                    >
                        "A culinary journey through the soul of Asia, crafted with passion and served with elegance in the heart of Hyderabad."
                    </motion.p>

                    {/* Action Bar - Centered below content */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        className="flex w-[90%] md:w-[500px] h-14 shadow-2xl mx-auto rounded-sm overflow-hidden"
                    >
                        <div
                            onClick={() => navigate('/menu')}
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
