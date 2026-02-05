import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import menuData from '../data/menu.json';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Menu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Signature Bowls', 'Starters', 'Seafood Specials', 'Beverages', 'Mocktails', 'Steam Boat'];
    const dietaryOptions = ['All', 'Veg', 'Non-Veg'];

    const filteredDishes = menuData.filter(dish => {
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
                        {filteredDishes.length > 0 ? (
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
                                    className="group relative p-8 rounded-2xl bg-white border border-primary hover:border-gold-500 transition-all duration-500 shadow-[0_0_30px_rgba(255,193,7,0.15)] hover:shadow-[0_0_40px_rgba(255,193,7,0.3)] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full border ${dish.dietary === 'Non-Veg' ? 'border-red-500 bg-red-500/20' : 'border-green-500 bg-green-500/20'
                                                        } flex items-center justify-center`}>
                                                        <div className={`w-1 h-1 rounded-full ${dish.dietary === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'
                                                            }`} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-yellow-50/50 px-2 py-0.5 rounded-full border border-primary/20">
                                                        {dish.category || 'Specialty'}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-asian font-bold text-[#FF8F00] uppercase tracking-tight">
                                                    {dish.name}
                                                </h3>
                                            </div>
                                            <p className="text-xl font-asian font-medium text-primary shadow-sm">{dish.price}</p>
                                        </div>

                                        <p className="text-zinc-600 text-sm leading-relaxed mb-8 min-h-[3rem] line-clamp-2 drop-shadow-sm font-medium">
                                            {dish.description || 'A chef curated masterpiece with authentic flavors and fresh ingredients.'}
                                        </p>

                                        <div className="flex items-center gap-4 text-primary group-hover:text-gold-600 transition-colors border-t border-primary/20 pt-4">
                                            <div className="h-[1px] flex-1 bg-primary/20" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold">Asia By Gram</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
