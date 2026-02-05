import { motion, useScroll, useTransform } from 'framer-motion';

const AboutSection = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <section id="about" className="py-24 bg-transparent relative overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="relative h-[600px] w-full perspective-1000">
                        <motion.div
                            style={{ y: y1, rotate: -5 }}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute top-0 left-0 w-2/3"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800"
                                alt="Chef Cooking"
                                className="rounded-2xl shadow-2xl object-cover h-[400px] w-full border border-white/20"
                            />
                        </motion.div>
                        <motion.div
                            style={{ y: y2, rotate: 5 }}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute bottom-0 right-0 w-2/3 z-10"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=800"
                                alt="Noodles Bowl"
                                className="rounded-2xl shadow-2xl object-cover h-[400px] w-full border border-white/20"
                            />
                        </motion.div>


                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.2
                                }
                            }
                        }}
                        className="space-y-8"
                    >
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, x: 20 },
                                visible: { opacity: 1, x: 0 }
                            }}
                        >
                            <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl flex items-center justify-center gap-4">
                                <span className="w-16 h-1 bg-primary"></span>
                                Our Legacy
                                <span className="w-16 h-1 bg-primary"></span>
                            </h2>
                        </motion.div>

                        <motion.h3
                            variants={{
                                hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                                visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
                            }}
                            className="text-5xl md:text-7xl font-asian font-bold text-black leading-[0.9] tracking-tighter text-center"
                        >
                            Crafting the Perfect <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold-400 to-primary drop-shadow-[0_0_20px_rgba(230,25,46,0.5)] italic">
                                Bowl of Happiness
                            </span>
                        </motion.h3>

                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            className="space-y-6"
                        >
                            <p className="text-black leading-relaxed text-xl font-light">
                                At Asia By Gram, we believe that food is an art form. Every strand of noodle is hand-pulled, every drop of broth is simmered for 18 hours, and every dish tells a story of tradition meeting modern innovation.
                            </p>
                            <p className="text-black leading-relaxed text-xl font-light">
                                Located in the heart of Hyderabad, we bring the authentic street flavors of Asia into a premium, cinematic dining setting designed to ignite all your senses.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: { opacity: 1, scale: 1 }
                            }}
                            className="pt-8"
                        >
                            <span className="font-cursive text-6xl text-primary/80 rotate-[-5deg] block hover:text-primary transition-colors cursor-default drop-shadow-[0_0_15px_rgba(230,25,46,0.3)]">
                                Asia By Gram Signature
                            </span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
