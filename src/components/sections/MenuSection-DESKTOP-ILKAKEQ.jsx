import { motion } from 'framer-motion';
import { useState } from 'react';
import menuData from '../../data/menu.json';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MenuSection = () => {
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState(null);

    // Show only 6 featured items on the main page
    const dishes = menuData.slice(0, 6);

    return (
        <section id="menu" className="py-24 bg-transparent relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl">Signature Dishes</h2>
                    <h3 className="text-4xl md:text-5xl font-asian font-bold text-black tracking-widest">Culinary Masterpieces</h3>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {dishes.map((dish) => (
                        <motion.div
                            key={dish.id}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.95 },
                                visible: { opacity: 1, y: 0, scale: 1 }
                            }}
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 }
                            }}
                            className="group relative p-8 rounded-xl bg-white border border-primary hover:border-gold-500 transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(255,193,7,0.15)] hover:shadow-[0_0_40px_rgba(255,193,7,0.3)]"
                        >
                            {/* Animated Background Highlight */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-2xl rounded-full group-hover:bg-primary/20 transition-all duration-500" />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full border ${dish.dietary === 'Non-Veg' ? 'border-red-500 bg-red-500/20' : 'border-green-500 bg-green-500/20'
                                                } flex items-center justify-center`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${dish.dietary === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'
                                                    }`} />
                                            </div>
                                            <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-primary border border-primary/20 rounded-full uppercase bg-yellow-50/50">
                                                {dish.category || 'Specialty'}
                                            </span>
                                        </div>
                                        <span className="text-primary font-serif font-bold text-xl">
                                            {dish.price}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl md:text-3xl font-asian font-bold text-[#FF8F00] mb-4 uppercase tracking-tight">
                                        {dish.name}
                                    </h4>
                                    <p className="text-zinc-600 font-serif font-light leading-relaxed min-h-[4rem] line-clamp-3 text-base">
                                        {dish.description || 'A chef-curated masterpiece crafted with the finest ingredients and authentic spices.'}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-primary/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary group-hover:text-gold-600 transition-colors">
                                        <div className="w-8 h-[1px] bg-primary scale-x-100 transition-transform origin-left duration-500" />
                                        <span className="text-[10px] tracking-widest uppercase font-bold">
                                            Asia By Gram
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/menu')}
                        className="px-12 py-4 bg-black text-white hover:bg-zinc-800 transition-all rounded-sm font-medium tracking-widest uppercase text-sm shadow-lg"
                    >
                        View Full Menu
                    </button>
                </div>
            </div>
        </section>
    );
};

export default MenuSection;
