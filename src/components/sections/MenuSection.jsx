import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=800";

const MenuSection = () => {
    const navigate = useNavigate();
    const [dishes, setDishes] = useState(() => {
        // Hydrate from cache immediately for instant render
        const cached = localStorage.getItem('abg_featured_menu');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(!localStorage.getItem('abg_featured_menu'));

    useEffect(() => {
        const fetchFeatured = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
                if (res.ok) {
                    const data = await res.json();
                    const featured = data.slice(0, 6);
                    setDishes(featured);
                    // Update cache for next visit
                    localStorage.setItem('abg_featured_menu', JSON.stringify(featured));
                }
            } catch (error) {
                console.error("Error fetching featured menu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <section id="menu" className="py-24 bg-transparent relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-primary font-bold tracking-widest uppercase text-3xl md:text-4xl text-center mx-auto">Signature Dishes</h2>
                    <h3 className="text-4xl md:text-5xl font-asian font-bold text-black tracking-widest text-center mx-auto">Culinary Masterpieces</h3>
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
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={`feat-skeleton-${i}`} className="animate-pulse bg-white border border-primary/10 rounded-2xl h-[450px] flex flex-col">
                                <div className="h-64 bg-zinc-100 rounded-t-2xl" />
                                <div className="p-8 space-y-4 flex-1">
                                    <div className="flex justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="h-2 w-12 bg-zinc-100 rounded" />
                                            <div className="h-6 w-3/4 bg-zinc-100 rounded" />
                                        </div>
                                        <div className="h-6 w-12 bg-zinc-100 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-zinc-100 rounded" />
                                        <div className="h-3 w-3/4 bg-zinc-100 rounded" />
                                    </div>
                                    <div className="mt-auto h-4 w-full bg-zinc-50 rounded" />
                                </div>
                            </div>
                        ))
                    ) : dishes.map((dish) => (
                        <motion.div
                            key={dish.id}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.95 },
                                visible: { opacity: 1, y: 0, scale: 1 }
                            }}
                            className="group relative rounded-2xl bg-white border border-primary/20 hover:border-gold-500 transition-all duration-500 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(255,193,7,0.2)] flex flex-col"
                        >
                            {/* Image Wrapper */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={dish.image || DEFAULT_IMAGE}
                                    alt={dish.name}
                                    width="400"
                                    height="300"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute top-4 right-4 z-20">
                                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${dish.dietary === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'}`} />
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1 relative z-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-20 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-yellow-50/50 px-2 py-0.5 rounded-full border border-primary/20">
                                                {dish.category || 'Specialty'}
                                            </span>
                                            <h4 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight group-hover:text-[#FF8F00] transition-colors mt-1">
                                                {dish.name}
                                            </h4>
                                        </div>
                                        <span className="text-xl font-bold text-primary font-serif">
                                            {dish.price}
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 font-medium leading-relaxed min-h-[4rem] line-clamp-3 text-sm italic">
                                        {dish.description || 'A chef-curated masterpiece crafted with the finest ingredients and authentic spices.'}
                                    </p>
                                </div>

                                <div className="relative z-20 mt-8 pt-6 border-t border-primary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary group-hover:text-gold-600 transition-colors">
                                        <div className="w-8 h-[1px] bg-primary/20" />
                                        <span className="text-[10px] tracking-widest uppercase font-bold opacity-60">
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
                        className="px-12 py-4 bg-black text-white hover:bg-zinc-800 transition-all rounded-sm font-medium tracking-widest uppercase text-sm shadow-lg active:scale-95"
                    >
                        View Full Menu
                    </button>
                </div>
            </div>
        </section>
    );
};

export default MenuSection;
