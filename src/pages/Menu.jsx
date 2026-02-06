import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import menuData from '../data/menu.json';
import { ArrowLeft, Search, Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Mobile Menu Component (Only for QR Code Users)
const MobileMenu = ({ tableNumber, menuItems = [] }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDietary, setSelectedDietary] = useState('All');
    const categories = ['All', 'Starters', 'Fried Momos', 'Shawarma', 'Platters', 'Main Course', 'Desserts', 'Beverages'];
    const dietaryOptions = ['All', 'Veg', 'Non-Veg'];

    const filteredDishes = menuItems.filter(dish => {
        // Filter by Category
        if (selectedCategory && selectedCategory !== 'All' && dish.category !== selectedCategory) return false;

        // Filter by Dietary
        if (selectedDietary === 'All') return true;
        if (selectedDietary === 'Veg' && (dish.dietary === 'Veg' || dish.dietary === 'Vegan')) return true;
        if (selectedDietary === 'Non-Veg' && dish.dietary === 'Non-Veg') return true;

        return false;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-[#FDC55E] pt-8 pb-6 px-6 rounded-b-[2rem] shadow-sm flex flex-col items-center relative z-10">
                <div className="bg-white/90 p-2 rounded-full shadow-lg mb-3">
                    <img src="/logo.png" alt="Asia By Gram" className="w-16 h-16 object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Asia By Gram</h1>
                <p className="text-sm text-zinc-800/80 font-medium mb-1">Taste the Best of Asia</p>
                {tableNumber && (
                    <div className="bg-black/10 px-3 py-1 rounded-full mt-2">
                        <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Table {tableNumber}</p>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            {/* Dietary Filters */}
                            <div className="flex gap-2 mb-6 justify-center">
                                {dietaryOptions.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedDietary(option)}
                                        className={`flex-1 max-w-[100px] py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${selectedDietary === option
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <h2 className="text-lg font-bold text-zinc-900 mb-4 px-1">Menu Categories</h2>
                            <div className="grid gap-3">
                                {categories.map((cat, i) => (
                                    <motion.button
                                        key={cat}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedCategory(cat)}
                                        className="w-full bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex items-center justify-between group active:scale-[0.98] transition-all"
                                    >
                                        <span className="font-bold text-zinc-800 text-left">{cat}</span>
                                        <div className="bg-gray-50 p-1.5 rounded-full text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                            <ChevronRight size={16} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Review Button */}
                            <div className="pt-6 pb-10">
                                <a
                                    href="https://g.page/r/Cd0d32QitG9SEAE/review"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition-colors active:scale-[0.98]"
                                >
                                    <span>Rate your experience</span>
                                    <div className="flex">★★★★★</div>
                                </a>
                                <p className="text-center text-xs text-zinc-400 mt-2">Tap to leave a Google Review</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="items"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <h2 className="text-xl font-bold text-zinc-900">{selectedCategory}</h2>
                            </div>

                            <div className="grid gap-4 pb-20">
                                {filteredDishes.map(dish => (
                                    <div key={dish.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex gap-4">
                                        {dish.image && (
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                <img
                                                    src={dish.image}
                                                    alt={dish.name}
                                                    width="150"
                                                    height="150"
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-zinc-900 leading-snug">{dish.name}</h3>
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dish.dietary === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{dish.description}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-3">
                                                <span className="font-bold text-primary-dark">{dish.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=800";

import { Helmet } from 'react-helmet-async';

const Menu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table');
    const [isMobile, setIsMobile] = useState(false);

    // Default Desktop View State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
                if (res.ok) {
                    const data = await res.json();
                    setMenuItems(data);
                }
            } catch (error) {
                console.error("Error fetching menu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // If table number exists OR detection checks mobile width, show Mobile Menu
    if (loading && (tableNumber || isMobile)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Menu...</p>
            </div>
        );
    }

    if (tableNumber || isMobile) {
        return <MobileMenu tableNumber={tableNumber} menuItems={menuItems} />;
    }

    const categories = ['All', 'Starters', 'Fried Momos', 'Shawarma', 'Platters', 'Main Course', 'Desserts', 'Beverages'];
    const dietaryOptions = ['All', 'Veg', 'Non-Veg'];

    const filteredDishes = menuItems.filter(dish => {
        const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
        const matchesDietary = selectedDietary === 'All' ||
            (selectedDietary === 'Veg' && (dish.dietary === 'Veg' || dish.dietary === 'Vegan')) ||
            (selectedDietary === 'Non-Veg' && dish.dietary === 'Non-Veg');
        const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesDietary && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 px-6 md:px-12">
            <Helmet>
                <title>Menu | Asia By Gram - Authentic Asian Delicacies</title>
                <meta name="description" content="Explore our curated selection of authentic Asian noodles, broths, and specialties. Hand-crafted with the finest ingredients in Hyderabad." />
                <meta property="og:title" content="Our Menu | Asia By Gram" />
                <meta property="og:description" content="View our full menu of authentic Asian delicacies. From hand-pulled noodles to premium broths." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Menu",
                        "name": "Asia By Gram Menu",
                        "mainEntityOfPage": "https://asiabygram.in/menu",
                        "offers": {
                            "@type": "Offer",
                            "availability": "https://schema.org/InStock"
                        }
                    })}
                </script>
            </Helmet>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-4 group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </button>
                        <h1 className="text-5xl md:text-6xl font-asian font-bold text-black uppercase tracking-tighter">
                            Our <span className="text-primary italic">Menu</span>
                        </h1>
                        {tableNumber && (
                            <div className="mt-2 text-2xl font-bold bg-primary/20 text-primary-dark inline-block px-4 py-2 rounded-lg border border-primary/20">
                                Table #{tableNumber}
                            </div>
                        )}
                        <p className="text-zinc-600 mt-4 max-w-lg">
                            Explore our curated selection of authentic Asian delicacies, hand-crafted with the finest ingredients.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/50 backdrop-blur-sm border border-black/10 rounded-full pl-12 pr-6 py-3 text-black placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-all w-full sm:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="space-y-8 mb-16">
                    {/* Dietary Selector */}
                    <div className="flex gap-4">
                        {dietaryOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => setSelectedDietary(option)}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all border ${selectedDietary === option
                                    ? 'bg-black text-white border-black'
                                    : 'bg-transparent text-zinc-500 border-black/10 hover:border-black/30 text-black'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Categories Scroll */}
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide no-scrollbar border-b border-black/5">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-2 py-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap relative ${selectedCategory === category
                                    ? 'text-primary font-bold'
                                    : 'text-zinc-500 hover:text-black'
                                    }`}
                            >
                                {category}
                                {selectedCategory === category && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            // Loading Skeletons
                            Array.from({ length: 9 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="animate-pulse bg-white border border-primary/10 rounded-2xl h-[400px] flex flex-col">
                                    <div className="h-56 bg-zinc-100 rounded-t-2xl" />
                                    <div className="p-6 space-y-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 w-16 bg-zinc-100 rounded-full" />
                                                <div className="h-6 w-3/4 bg-zinc-100 rounded" />
                                            </div>
                                            <div className="h-6 w-12 bg-zinc-100 rounded" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 w-full bg-zinc-100 rounded" />
                                            <div className="h-3 w-2/3 bg-zinc-100 rounded" />
                                        </div>
                                        <div className="mt-auto h-4 w-full bg-zinc-50 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : filteredDishes.length > 0 ? (
                            filteredDishes.map((dish, index) => (
                                <motion.div
                                    key={dish.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{
                                        opacity: { duration: 0.4 },
                                        layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                                    }}
                                    className="group relative rounded-2xl bg-white border border-primary/20 hover:border-gold-500 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(255,193,7,0.2)] overflow-hidden flex flex-col"
                                >
                                    {/* Image Wrapper */}
                                    <div className="relative h-56 overflow-hidden">
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

                                        {/* Dietary Badge on Image */}
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${dish.dietary === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'}`} />
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1 relative z-10">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative z-20 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-yellow-50/50 px-2 py-0.5 rounded-full border border-primary/20">
                                                        {dish.category || 'Specialty'}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight group-hover:text-[#FF8F00] transition-colors mt-1">
                                                        {dish.name}
                                                    </h3>
                                                </div>
                                                <p className="text-lg font-bold text-primary">{dish.price}</p>
                                            </div>

                                            <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">
                                                {dish.description || 'A chef curated masterpiece with authentic flavors and fresh ingredients.'}
                                            </p>
                                        </div>

                                        <div className="relative z-20 flex items-center gap-4 text-primary group-hover:text-gold-600 transition-colors border-t border-primary/10 pt-4 mt-auto">
                                            <div className="h-[1px] flex-1 bg-primary/10" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Asia By Gram</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-1/2 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center"
                            >
                                <p className="text-zinc-500 text-lg">No dishes found matching your criteria.</p>
                                <button
                                    onClick={() => { setSelectedCategory('All'); setSelectedDietary('All'); setSearchQuery(''); }}
                                    className="text-primary mt-4 hover:underline font-bold uppercase tracking-widest text-xs"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Menu;
