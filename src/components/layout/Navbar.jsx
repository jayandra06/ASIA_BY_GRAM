import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openReservation } = useModal();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '#about' },
        { name: 'Menu', path: '#menu' },
        { name: 'Social Feeds', path: '#social-feeds' },
        { name: 'Gallery', path: '#gallery' },
        { name: 'Contact', path: '#visit' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={clsx(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 md:px-12",
                    isScrolled ? "bg-white/80 backdrop-blur-md py-3 border-b border-black/5 shadow-sm" : "bg-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <img
                            src="/logo.png"
                            alt="Asia By Gram"
                            width="64"
                            height="34"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>


                    {/* Desktop Nav - Left Aligned */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path}
                                className="text-sm font-medium tracking-[0.15em] uppercase text-zinc-600 hover:text-black transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Actions - Right Aligned */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="https://www.instagram.com/p/DQieC8XCb8B/" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-black transition-colors">
                            <Instagram size={22} strokeWidth={1.5} />
                        </a>
                        <button
                            onClick={openReservation}
                            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black px-10 py-3 skew-x-[-12deg] font-asian font-bold uppercase tracking-[0.2em] text-xs transition-transform hover:shadow-lg hover:-translate-y-1"
                        >
                            <span className="block skew-x-[12deg]">Book a Table</span>
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={clsx(
                            "md:hidden p-2 transition-colors",
                            isScrolled || isMobileMenuOpen ? "text-black" : "text-white"
                        )}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-3xl font-asian font-bold text-white hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex gap-6 mt-8">
                            <Instagram size={32} />
                            <MapPin size={32} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
