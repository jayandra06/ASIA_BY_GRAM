'use client';

import { Instagram, Play, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const feedItems = [
    { type: 'image', src: '/d1.jpeg' },
    { type: 'video', src: '/feed_video_1.mp4' },
    { type: 'image', src: '/d3.jpeg' },
    { type: 'image', src: '/d4.jpeg' },
    { type: 'video', src: '/feed_video_2.mp4' },
    { type: 'image', src: '/d5.jpeg' },
    { type: 'image', src: '/d6.jpeg' },
];

const InstagramSection = () => {
    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <section id="social-feeds" className="py-24 bg-transparent relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
                    <div>
                        <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl mb-4">Social Feed</h2>
                        <h3 className="text-3xl md:text-4xl font-asian font-bold text-black flex items-center justify-center gap-3">
                            <a href="https://www.instagram.com/p/DQieC8XCb8B/" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors">
                                <Instagram className="text-primary" /> @AsiaByGram
                            </a>
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {feedItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            onClick={() => setSelectedItem(item)}
                            className="relative aspect-square group overflow-hidden cursor-pointer rounded-xl bg-zinc-100 shadow-sm"
                        >
                            {item.type === 'video' ? (
                                <video
                                    src={item.src}
                                    width="400"
                                    height="400"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={item.src}
                                    alt={`Asia By Gram Instagram post showing ${item.src.includes('d') ? 'delicious Asian food' : 'restaurant vibes'}`}
                                    width="400"
                                    height="400"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                {item.type === 'video' ? (
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                ) : (
                                    <Instagram className="text-white w-8 h-8" />
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* "Follow Us" Card to fill the 8th slot */}
                    <motion.a
                        href="https://www.instagram.com/p/DQieC8XCb8B/"
                        target="_blank"
                        rel="noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="relative aspect-square flex flex-col items-center justify-center text-center p-6 bg-black text-white hover:bg-zinc-900 transition-colors rounded-xl group"
                    >
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Instagram size={24} />
                        </div>
                        <span className="font-asian font-bold text-xl mb-1">Join Us</span>
                        <span className="text-xs uppercase tracking-widest text-zinc-400 group-hover:text-[#E53935] transition-colors">On Instagram</span>
                        <ArrowRight className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" size={20} />
                    </motion.a>
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedItem(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 text-white hover:text-primary transition-colors p-2 z-10"
                        >
                            <X size={40} />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()} // Prevent close on click content
                            className="relative max-w-5xl w-full max-h-[85vh] rounded-lg overflow-hidden flex items-center justify-center bg-black"
                        >
                            {selectedItem.type === 'video' ? (
                                <video
                                    src={selectedItem.src}
                                    className="w-full h-full max-h-[85vh] object-contain"
                                    controls
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={selectedItem.src}
                                    alt="Social Feed Full"
                                    className="w-full h-full max-h-[85vh] object-contain"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default InstagramSection;
