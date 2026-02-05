import { MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '../../context/ModalContext';

const LocationSection = () => {
    const { openReservation } = useModal();
    return (
        <section id="visit" className="py-24 bg-transparent border-t border-white/5">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 rounded-3xl overflow-hidden bg-white shadow-2xl border border-zinc-100">
                    {/* Info Side */}
                    <div className="p-8 md:p-12 space-y-8">
                        <div className="text-center">
                            <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl mb-4">Visit Us</h2>
                            <h3 className="text-4xl font-asian font-bold text-black">Find Your Way</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <MapPin />
                                </div>
                                <div>
                                    <h4 className="text-lg font-asian font-bold text-black mb-1">Location</h4>
                                    <p className="text-zinc-700 drop-shadow-sm">25-35/11/A/1 RC Puram, Main Road,<br />opposite ICICI BANK, Beeramguda, Colony,<br />Ramachandrapuram, Hyderabad, Telangana 502032</p>
                                    <a href="https://maps.app.goo.gl/bUKaeYGuyhho9ZyJ6" target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-2 inline-block hover:underline font-bold">Get Directions</a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <Clock />
                                </div>
                                <div>
                                    <h4 className="text-lg font-asian font-bold text-black mb-1">Opening Hours</h4>
                                    <p className="text-zinc-700 drop-shadow-sm">Mon - Thu: 12:00 PM - 10:30 PM</p>
                                    <p className="text-zinc-700 drop-shadow-sm">Fri - Sun: 12:00 PM - 11:30 PM</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <Phone />
                                </div>
                                <div>
                                    <h4 className="text-lg font-asian font-bold text-black mb-1">Contact</h4>
                                    <p className="text-zinc-700 drop-shadow-sm font-bold">+91 83090 57182</p>
                                    <p className="text-zinc-700 drop-shadow-sm font-medium">reservations@asiabygram.com</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={openReservation}
                            className="w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-zinc-800 transition-colors"
                        >
                            Reserve a Table
                        </button>
                    </div>

                    {/* Map Side */}
                    <div className="relative min-h-[400px] lg:min-h-full bg-zinc-800">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.282504810057!2d78.2863!3d17.498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93a890a59969%3A0xe54e601831498064!2sBeeramguda%20Main%20Rd%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1706341234567!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(80%)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 w-full h-full opacity-70 hover:opacity-100 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0a0a09] to-transparent lg:w-20" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LocationSection;
