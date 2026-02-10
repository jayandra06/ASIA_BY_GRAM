'use client';

import { motion } from 'framer-motion';
import { TicketPercent, Heart, Calendar, Send } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const EventsSection = () => {
    const { openReservation } = useModal();
    return (
        <section id="events" className="py-24 bg-transparent relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl text-center mx-auto flex items-center justify-center gap-4">
                        <span className="w-12 h-[1px] bg-primary opacity-50 hidden md:block"></span>
                        Special Offers & Gatherings
                        <span className="w-12 h-[1px] bg-primary opacity-50 hidden md:block"></span>
                    </h2>
                    <h3 className="text-4xl md:text-6xl font-asian font-bold text-black tracking-widest text-center mx-auto">
                        Discounts & Events
                    </h3>
                </div>

                <div className="flex justify-center w-full">
                    {/* Valentine's Day Event */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="group relative rounded-2xl bg-white border border-primary/20 hover:border-primary transition-all duration-500 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(230,25,46,0.1)] flex flex-col p-8 max-w-md w-full"
                    >
                        <div className="mb-6">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                <Heart size={28} />
                            </div>
                        </div>
                        <h4 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
                            Valentine's Day Special
                        </h4>
                        <p className="text-zinc-600 font-medium leading-relaxed italic mb-8">
                            Plan your date night on Valentine's Day. Experience a cinematic evening with our specially curated 5-course Asian fusion menu.
                        </p>
                        <div className="mt-auto flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                <span className="text-sm font-bold text-primary tracking-widest uppercase">Feb 14, 2026</span>
                            </div>

                            <button
                                onClick={openReservation}
                                className="w-full py-4 bg-black text-white hover:bg-zinc-800 transition-all rounded-sm font-medium tracking-widest uppercase text-sm shadow-md active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                Reserve your table
                                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default EventsSection;
