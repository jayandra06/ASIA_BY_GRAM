'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const sections = [
    { id: 'home', label: '01' },
    { id: 'about', label: '02' },
    { id: 'menu', label: '03' },
    { id: 'gallery', label: '04' },
    { id: 'visit', label: '05' },
];

const SideNav = () => {
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            // Find the current section
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            // Map section positions
            // Simplistic check: find the last section that is above the scroll line
            // Or use Intersection Observer for better logic, but scroll mapping is easier for quick impl
            // Assuming sections follow order in DOM.

            // Let's get elements
            let current = 'home';
            for (const sect of sections) {
                const el = document.getElementById(sect.id) || (sect.id === 'home' ? document.body : null);
                if (el && el.offsetTop <= scrollPosition) {
                    current = sect.id;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="fixed right-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6 items-center"
        >
            {sections.map((sect) => (
                <a
                    key={sect.id}
                    href={sect.id === 'home' ? '#' : `#${sect.id}`}
                    className="relative group flex items-center justify-center p-2"
                >
                    {/* Hover Label (Left side) */}
                    <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 whitespace-nowrap bg-zinc-900/90 border border-white/5 px-2 py-1 rounded shadow-lg backdrop-blur-sm">
                            {sect.id}
                        </span>
                    </div>

                    {/* Line */}
                    <div
                        className={`w-[2px] rounded-full transition-all duration-500 ${activeSection === sect.id ? 'h-12 bg-gold-400 shadow-[0_0_10px_#D4AF37]' : 'h-6 bg-zinc-800 group-hover:bg-zinc-600'}`}
                    />

                    {/* Active Indicator Label (Moved to Left) */}
                    {activeSection === sect.id && (
                        <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-[10px] font-display font-bold text-gold-400 -rotate-90 origin-center tracking-widest">
                            {sect.label}
                        </span>
                    )}
                </a>
            ))}

            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent my-2" />
        </motion.div>
    );
};

export default SideNav;
