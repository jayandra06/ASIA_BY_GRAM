'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, ChevronRight, ChevronLeft, ChevronDown, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&q=80&w=800";

const FALLBACK_CATEGORIES = ['All', 'Starters', 'Fried Momos', 'Shawarma', 'Platters', 'Main Course', 'Desserts', 'Beverages'];

// Per-item customization options (e.g. for Boba)
const ITEM_OPTIONS = {
    'item-boba': [
        {
            id: 'milk',
            name: 'Type of milk',
            type: 'single',
            required: true,
            choices: ['Regular Milk', 'Toned Milk', 'Almond Milk', 'Oat Milk']
        },
        {
            id: 'flavour',
            name: 'Flavour',
            type: 'single',
            required: true,
            choices: ['Mango', 'Kiwi', 'Watermelon', 'Green Apple', 'Litchi', 'Passion Fruit', 'Coffee', 'Chocolate']
        },
        {
            id: 'addons',
            name: 'Add-ons',
            type: 'multi',
            required: false,
            choices: ['Tapioca Pearls', 'Popping Boba', 'Fruit Jelly', 'Extra Ice']
        }
    ],
    'item-boba-various-flavors': [
        {
            id: 'milk',
            name: 'Type of milk',
            type: 'single',
            required: true,
            choices: ['Regular Milk', 'Toned Milk', 'Almond Milk', 'Oat Milk']
        },
        {
            id: 'flavour',
            name: 'Flavour',
            type: 'single',
            required: true,
            choices: ['Mango', 'Kiwi', 'Watermelon', 'Green Apple', 'Litchi', 'Passion Fruit', 'Coffee', 'Chocolate']
        },
        {
            id: 'addons',
            name: 'Add-ons',
            type: 'multi',
            required: false,
            choices: ['Tapioca Pearls', 'Popping Boba', 'Fruit Jelly', 'Extra Ice']
        }
    ]
};

function parsePrice(priceStr) {
    if (typeof priceStr !== 'string') return 0;
    const num = priceStr.replace(/[^\d.]/g, '');
    return parseFloat(num) || 0;
}

const MobileMenu = ({ tableNumber, menuItems = [], categories: categoriesProp }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDietary, setSelectedDietary] = useState('All');
    const [cart, setCart] = useState([]); // { menuItemId, name, price, quantity, options? }
    const [showCartDrawer, setShowCartDrawer] = useState(false);
    const [step, setStep] = useState('menu'); // 'menu' | 'checkout' | 'success'
    const [checkoutForm, setCheckoutForm] = useState({ customerName: '', customerPhone: '', orderType: 'Dine-in', specialRequests: '' });
    const [orderSubmitting, setOrderSubmitting] = useState(false);
    const [lastOrderNumber, setLastOrderNumber] = useState(null);
    const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : FALLBACK_CATEGORIES;
    const dietaryOptions = ['All', 'Veg', 'Non-Veg'];

    const isTableOrder = Boolean(tableNumber);
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    const cartTotal = cart.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0);

    const [optionModal, setOptionModal] = useState({
        open: false,
        dish: null,
        selections: {}
    });

    const addToCart = (dish, selectedOptions = []) => {
        const id = dish.id || dish._id;
        const optionsKey = JSON.stringify(selectedOptions || []);
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === id && JSON.stringify(i.options || []) === optionsKey);
            if (existing) {
                return prev.map(i =>
                    i.menuItemId === id && JSON.stringify(i.options || []) === optionsKey
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { menuItemId: id, name: dish.name, price: dish.price, quantity: 1, options: selectedOptions }];
        });
    };
    const updateQuantity = (menuItemId, delta) => {
        setCart(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
    };
    const removeFromCart = (menuItemId) => setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));

    const openCheckout = () => {
        setShowCartDrawer(false);
        setStep('checkout');
    };
    const submitOrder = async () => {
        // For QR/table orders on the website, name and phone are mandatory
        if (!checkoutForm.customerName.trim() || !checkoutForm.customerPhone.trim()) {
            alert('Please enter your name and phone number to place the order.');
            return;
        }
        setOrderSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({
                        menuItemId: i.menuItemId,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                        options: i.options || []
                    })),
                    customerName: checkoutForm.customerName.trim(),
                    customerPhone: checkoutForm.customerPhone.trim(),
                    orderType: checkoutForm.orderType,
                    tableNumber: checkoutForm.orderType === 'Dine-in' ? tableNumber : null,
                    specialRequests: checkoutForm.specialRequests.trim() || null,
                    source: 'web'
                })
            });
            const data = await res.json();
            if (res.ok) {
                setLastOrderNumber(data.orderNumber);
                setCart([]);
                setStep('success');
            } else {
                alert(data.error || 'Failed to place order.');
            }
        } catch (e) {
            alert('Something went wrong. Please try again.');
        } finally {
            setOrderSubmitting(false);
        }
    };

    const filteredDishes = menuItems.filter(dish => {
        if (dish.category === 'Uncategorised') return false; // hide uncategorised from public menu
        if (selectedCategory && selectedCategory !== 'All' && dish.category !== selectedCategory) return false;
        if (selectedDietary === 'All') return true;
        const dietaryArr = Array.isArray(dish.dietary) ? dish.dietary : (dish.dietary ? [dish.dietary] : []);
        if (dietaryArr.length === 0) return true; // none (e.g. beverages) – show in Veg and Non-Veg filters
        if (dietaryArr.length === 2) return true; // both – show in Veg and Non-Veg filters
        return dietaryArr.includes(selectedDietary);
    });

    // Checkout step
    if (step === 'checkout') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-8">
                <div className="bg-[#FDC55E] pt-8 pb-6 px-6 rounded-b-[2rem] shadow-sm">
                    <button onClick={() => setStep('menu')} className="flex items-center gap-2 text-zinc-800 font-bold mb-2">
                        <ChevronLeft size={20} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>
                    <p className="text-sm text-zinc-800/80 mt-1">Table {tableNumber}</p>
                </div>
                <div className="flex-1 p-6 space-y-6">
                    <div className="bg-white rounded-xl border border-zinc-200 p-4">
                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Order summary</h2>
                        {cart.map(item => (
                            <div key={item.menuItemId} className="flex justify-between py-2 border-b border-zinc-100 last:border-0">
                                <span className="text-zinc-800">{item.name} × {item.quantity}</span>
                                <span className="font-bold text-primary-dark">{item.price}</span>
                            </div>
                        ))}
                        <div className="flex justify-between pt-3 mt-2 border-t border-zinc-200 font-bold text-zinc-900">
                            <span>Total</span>
                            <span>₹{cartTotal.toFixed(0)}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Name *</label>
                            <input
                                type="text"
                                value={checkoutForm.customerName}
                                onChange={e => setCheckoutForm(f => ({ ...f, customerName: e.target.value }))}
                                placeholder="Your name"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone *</label>
                            <input
                                type="tel"
                                value={checkoutForm.customerPhone}
                                onChange={e => setCheckoutForm(f => ({ ...f, customerPhone: e.target.value }))}
                                placeholder="10-digit mobile number"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Order type</label>
                            <div className="flex gap-2">
                                {['Dine-in', 'Take away'].map(type => (
                                    <button key={type} type="button" onClick={() => setCheckoutForm(f => ({ ...f, orderType: type }))} className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${checkoutForm.orderType === type ? 'bg-primary text-black border-primary' : 'bg-white text-zinc-500 border-zinc-200'}`}>{type}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Special requests (optional)</label>
                            <textarea value={checkoutForm.specialRequests} onChange={e => setCheckoutForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Any special instructions" rows={2} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                        </div>
                    </div>
                    <button onClick={submitOrder} disabled={orderSubmitting} className="w-full py-4 bg-primary text-black font-bold rounded-xl disabled:opacity-60">
                        {orderSubmitting ? 'Placing order...' : 'Place order'}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans items-center justify-center p-6 text-center">
                <div className="bg-white rounded-2xl border border-zinc-200 p-8 max-w-sm w-full shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">✓</div>
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">Order placed!</h1>
                    <p className="text-zinc-600 mb-1">Order number</p>
                    <p className="text-xl font-bold text-primary mb-6">{lastOrderNumber}</p>
                    <p className="text-sm text-zinc-500 mb-6">We will prepare your order shortly. You can show this number at the counter.</p>
                    <button onClick={() => { setStep('menu'); setCheckoutForm({ customerName: '', customerPhone: '', orderType: 'Dine-in', specialRequests: '' }); }} className="w-full py-3 bg-primary text-black font-bold rounded-xl">Order again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        {categories.filter(cat => cat !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={20} />
                                </div>
                            </div>

                            <div className="grid gap-4 pb-24">
                                {filteredDishes.map(dish => {
                                    const optionConfig = (Array.isArray(dish.options) && dish.options.length > 0)
                                        ? dish.options
                                        : ITEM_OPTIONS[dish.id];
                                    const hasOptions = !!optionConfig;
                                    return (
                                    <div key={dish.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex gap-4">
                                        {dish.image && (
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                                                <Image
                                                    src={dish.image}
                                                    alt={dish.name}
                                                    fill
                                                    sizes="96px"
                                                    className="object-cover"
                                                    loading="lazy"
                                                    placeholder="blur"
                                                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-zinc-900 leading-snug">{dish.name}</h3>
                                                    <div className="flex gap-1 mt-1.5 flex-shrink-0">
                                                        {(() => {
                                                            const arr = Array.isArray(dish.dietary) ? dish.dietary : (dish.dietary ? [dish.dietary] : []);
                                                            if (!arr.length) return null;
                                                            if (arr.length === 2) return (<div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><div className="w-2 h-2 rounded-full bg-red-500" /></div>);
                                                            return <div className={`w-2 h-2 rounded-full ${arr.includes('Non-Veg') ? 'bg-red-500' : 'bg-green-500'}`} />;
                                                        })()}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{dish.description}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-3">
                                                <span className="font-bold text-primary-dark">{dish.price}</span>
                                                {isTableOrder && (
                                                    <button
                                                        onClick={() => {
                                                            if (!hasOptions) {
                                                                addToCart(dish);
                                                            } else {
                                                                // open options modal
                                                                const initialSelections = {};
                                                                optionConfig.forEach(group => {
                                                                    if (group.type === 'single') {
                                                                        initialSelections[group.id] = group.choices[0] || '';
                                                                    } else {
                                                                        initialSelections[group.id] = [];
                                                                    }
                                                                });
                                                                setOptionModal({ open: true, dish, selections: initialSelections });
                                                            }
                                                        }}
                                                        className="bg-primary text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-500 transition-colors"
                                                    >
                                                        <Plus size={14} /> Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Cart bar (table order only) */}
            {isTableOrder && (
                <>
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-lg p-4 z-30 safe-area-pb">
                        <div className="flex items-center justify-between gap-4">
                            <button onClick={() => setShowCartDrawer(true)} className="flex items-center gap-2 flex-1">
                                <div className="relative">
                                    <ShoppingCart size={24} className="text-zinc-800" />
                                    {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
                                </div>
                                <span className="font-bold text-zinc-800">Cart {cartCount > 0 ? `(${cartCount} items)` : ''}</span>
                            </button>
                            {cartCount > 0 && (
                                <>
                                    <span className="font-bold text-primary">₹{cartTotal.toFixed(0)}</span>
                                    <button onClick={openCheckout} className="bg-primary text-black px-4 py-2 rounded-xl font-bold text-sm">Checkout</button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Cart drawer */}
                    <AnimatePresence>
                        {showCartDrawer && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartDrawer(false)} className="fixed inset-0 bg-black/50 z-40" />
                                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween' }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
                                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
                                        <h3 className="font-bold text-lg text-zinc-900">Your order</h3>
                                        <button onClick={() => setShowCartDrawer(false)} className="p-2 text-zinc-500 hover:text-zinc-900"><X size={20} /></button>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-4">
                                        {cart.length === 0 ? (
                                            <p className="text-zinc-500 text-center py-8">Cart is empty. Add items from the menu.</p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {cart.map(item => (
                                                    <li key={item.menuItemId} className="flex items-center justify-between gap-2 bg-zinc-50 rounded-xl p-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-zinc-900 truncate">{item.name}</p>
                                                            <p className="text-sm text-primary font-bold">{item.price}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => updateQuantity(item.menuItemId, -1)} className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold"><Minus size={14} /></button>
                                                            <span className="w-6 text-center font-bold text-zinc-900">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.menuItemId, 1)} className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold"><Plus size={14} /></button>
                                                            <button onClick={() => removeFromCart(item.menuItemId)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={18} /></button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {cart.length > 0 && (
                                        <div className="p-4 border-t border-zinc-200">
                                            <div className="flex justify-between font-bold text-zinc-900 mb-3">
                                                <span>Total</span>
                                                <span>₹{cartTotal.toFixed(0)}</span>
                                            </div>
                                            <button onClick={openCheckout} className="w-full py-3 bg-primary text-black font-bold rounded-xl">Proceed to checkout</button>
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Options modal */}
                    <AnimatePresence>
                        {optionModal.open && optionModal.dish && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black z-40"
                                    onClick={() => setOptionModal({ open: false, dish: null, selections: {} })}
                                />
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'tween' }}
                                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
                                >
                                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-900">{optionModal.dish.name}</h3>
                                            <p className="text-xs text-zinc-500 mt-0.5">Customize your drink before adding to cart.</p>
                                        </div>
                                        <button
                                            onClick={() => setOptionModal({ open: false, dish: null, selections: {} })}
                                            className="p-2 text-zinc-500 hover:text-zinc-900"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-4 space-y-4">
                                        {(Array.isArray(optionModal.dish.options) && optionModal.dish.options.length
                                            ? optionModal.dish.options
                                            : (ITEM_OPTIONS[optionModal.dish.id] || [])
                                        ).map(group => (
                                            <div key={group.id} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                                        {group.name}
                                                    </span>
                                                    {group.required && <span className="text-[10px] text-red-500 font-bold">Required</span>}
                                                </div>
                                                {group.type === 'single' ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.choices.map(choice => {
                                                            const active = optionModal.selections[group.id] === choice;
                                                            return (
                                                                <button
                                                                    key={choice}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOptionModal(prev => ({
                                                                            ...prev,
                                                                            selections: { ...prev.selections, [group.id]: choice }
                                                                        }))
                                                                    }
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                                                        active
                                                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                                                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                                                                    }`}
                                                                >
                                                                    {choice}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.choices.map(choice => {
                                                            const values = optionModal.selections[group.id] || [];
                                                            const active = values.includes(choice);
                                                            return (
                                                                <button
                                                                    key={choice}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setOptionModal(prev => {
                                                                            const current = prev.selections[group.id] || [];
                                                                            const next = active
                                                                                ? current.filter(v => v !== choice)
                                                                                : [...current, choice];
                                                                            return {
                                                                                ...prev,
                                                                                selections: { ...prev.selections, [group.id]: next }
                                                                            };
                                                                        })
                                                                    }
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                                                        active
                                                                            ? 'bg-primary text-black border-primary'
                                                                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                                                                    }`}
                                                                >
                                                                    {choice}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-zinc-200">
                                        <button
                                            onClick={() => {
                                                const config = (Array.isArray(optionModal.dish.options) && optionModal.dish.options.length
                                                    ? optionModal.dish.options
                                                    : (ITEM_OPTIONS[optionModal.dish.id] || []));
                                                // Build normalized options payload
                                                const selectedOptions = config.map(group => {
                                                    const sel = optionModal.selections[group.id];
                                                    const values = group.type === 'single'
                                                        ? (sel ? [sel] : [])
                                                        : Array.isArray(sel) ? sel : [];
                                                    return {
                                                        group: group.name,
                                                        values
                                                    };
                                                }).filter(o => o.values.length > 0);
                                                addToCart(optionModal.dish, selectedOptions);
                                                setOptionModal({ open: false, dish: null, selections: {} });
                                            }}
                                            className="w-full py-3 bg-primary text-black font-bold rounded-xl"
                                        >
                                            Add to cart
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

function MenuContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableNumber = searchParams.get('table');
    const [isMobile, setIsMobile] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDietary, setSelectedDietary] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/menu');
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
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(['All', ...(Array.isArray(data) ? data.map(c => c.name) : [])]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (loading && (tableNumber || isMobile)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Menu...</p>
            </div>
        );
    }

    if (tableNumber || isMobile) {
        return <MobileMenu tableNumber={tableNumber} menuItems={menuItems} categories={categories} />;
    }

    const dietaryOptions = ['All', 'Veg', 'Non-Veg'];

    const filteredDishes = menuItems.filter(dish => {
        if (dish.category === 'Uncategorised') return false; // hide uncategorised from public menu
        const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
        const dietaryArr = Array.isArray(dish.dietary) ? dish.dietary : (dish.dietary ? [dish.dietary] : []);
        const matchesDietary = selectedDietary === 'All' ? true : (dietaryArr.length === 0 || dietaryArr.length === 2 || dietaryArr.includes(selectedDietary));
        const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesDietary && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-4 group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </button>
                        <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-outfit)] font-extrabold text-black uppercase tracking-tight">
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

                <div className="space-y-8 mb-16">
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

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {loading ? (
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
                                    <div className="relative h-56 overflow-hidden">
                                        <Image
                                            src={dish.image || DEFAULT_IMAGE}
                                            alt={dish.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute top-4 right-4 z-20">
                                            {(() => {
                                                const arr = Array.isArray(dish.dietary) ? dish.dietary : (dish.dietary ? [dish.dietary] : []);
                                                if (!arr.length) return null;
                                                if (arr.length === 2) return (<div className="flex gap-1"><div className="w-3 h-3 rounded-full border-2 border-white shadow-sm bg-green-500" /><div className="w-3 h-3 rounded-full border-2 border-white shadow-sm bg-red-500" /></div>);
                                                return <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${arr.includes('Non-Veg') ? 'bg-red-500' : 'bg-green-500'}`} />;
                                            })()}
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
}

import { Suspense } from 'react';

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Menu...</p>
            </div>
        }>
            <MenuContent />
        </Suspense>
    );
}
