import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const Footer = () => {
    const { openReservation } = useModal();
    return (
        <footer className="bg-transparent border-t border-black/10 pt-20 pb-10 px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="mb-6">
                        <img src="/logo.png" alt="Asia By Gram" className="h-16 w-auto object-contain" />
                    </div>
                    <p className="text-black leading-relaxed">
                        The best noodle restaurant in Hyderabad. Premium ingredients, authentic broths, and an immersive dining atmosphere.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                            <Mail size={18} />
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-6 text-black uppercase tracking-wider">Explore</h3>
                    <ul className="space-y-4 text-black">
                        <li><a href="#" className="hover:text-gray-600 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-gray-600 transition-colors">Our Menu</a></li>
                        <li><button onClick={openReservation} className="hover:text-gray-600 transition-colors text-left uppercase tracking-wider text-sm">Reservations</button></li>
                        <li><a href="#" className="hover:text-gray-600 transition-colors">Gift Cards</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-6 text-black uppercase tracking-wider">Contact</h3>
                    <ul className="space-y-4 text-black">
                        <li className="flex items-start gap-3">
                            <MapPin className="shrink-0 text-black" size={20} />
                            <span>25-35/11/A/1 RC Puram, Main Road,<br />opposite ICICI BANK, Beeramguda, Colony,<br />Ramachandrapuram, Hyderabad, 502032</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="shrink-0 text-black" size={20} />
                            <span>+91 83090 57182</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="shrink-0 text-black" size={20} />
                            <span>asiabygram@gmail.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-6 text-black uppercase tracking-wider">Opening Hours</h3>
                    <ul className="space-y-2 text-black">
                        <li className="flex justify-between border-b border-black/10 pb-2">
                            <span>Mon - Thu</span>
                            <span>12:00 PM - 11:30 PM</span>
                        </li>
                        <li className="flex justify-between border-b border-black/10 pb-2">
                            <span>Fri - Sun</span>
                            <span>12:00 PM - 12:30 PM</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center text-black text-sm relative">
                {/* Left: Admin Login */}
                <div className="w-full md:w-auto flex justify-center md:justify-start">
                    {/* <a href="/admin/login" className="bg-primary px-3 py-1 rounded text-black font-bold text-xs uppercase hover:bg-primary/80 transition-colors">Admin Login</a> */}
                </div>

                {/* Center: Copyright */}
                <p className="mt-4 md:mt-0 md:absolute md:left-1/2 md:-translate-x-1/2 text-center text-black/60 font-medium">
                    &copy; {new Date().getFullYear()} Asia By Gram. All rights reserved.
                </p>

                {/* Right: Links */}
                <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-center md:justify-end">
                    <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-600">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
