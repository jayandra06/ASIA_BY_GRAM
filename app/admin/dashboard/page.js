'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UtensilsCrossed, CalendarDays, LogOut, Plus, Trash2, Edit2, Search, X, Check, QrCode, Printer, Copy, Upload, Download, Save } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../../../src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { storage } from '../../../src/firebaseConfig.js';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';
import QuatrefoilBackground from '../../../src/components/ui/QuatrefoilBackground';
import SparticlesEffect from '../../../src/components/ui/SparticlesEffect';

// --- Sub-components ---

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', subcategories: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, subcategories: category.subcategories.join(', ') });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', subcategories: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const subcategoriesArray = formData.subcategories.split(',').map(s => s.trim()).filter(s => s !== '');

        try {
            const method = editingCategory ? 'PUT' : 'POST';
            const url = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : `/api/categories`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: formData.name, subcategories: subcategoriesArray })
            });

            if (res.ok) {
                fetchCategories();
                setIsModalOpen(false);
            } else {
                alert("Failed to save category");
            }
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This might affect menu items using this category.')) return;
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Category Management</h2>
                <button onClick={() => handleOpenModal()} className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <div key={cat._id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-zinc-900">{cat.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(cat)} className="p-1 text-zinc-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(cat._id)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {cat.subcategories && cat.subcategories.map((sub, idx) => (
                                <span key={idx} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">{sub}</span>
                            ))}
                            {(!cat.subcategories || cat.subcategories.length === 0) && <span className="text-xs text-zinc-400 italic">No subcategories</span>}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-zinc-900 text-lg">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Category Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 outline-none focus:border-primary focus:ring-1" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Subcategories (comma separated)</label>
                                    <input type="text" value={formData.subcategories} onChange={e => setFormData({ ...formData, subcategories: e.target.value })} placeholder="e.g. Veg, Non-Veg, Chicken, Prawns" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 outline-none focus:border-primary focus:ring-1" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 rounded-lg font-bold">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary/90 text-black rounded-lg font-bold">Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BulkMenuEditor = ({ items, categories, onRefresh }) => {
    const [localItems, setLocalItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [imageEditModal, setImageEditModal] = useState({ open: false, itemId: null, currentUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        setLocalItems(items.map(item => ({ ...item })));
    }, [items]);

    const handleChange = (id, field, value) => {
        setLocalItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'category') {
                    const newCat = categories.find(c => c.name === value);
                    if (!newCat?.subcategories?.includes(item.subcategory)) {
                        updated.subcategory = '';
                    }
                }
                return updated;
            }
            return item;
        }));
    };

    const handleImageChange = (id, newUrl) => {
        handleChange(id, 'image', newUrl);
        setImageEditModal({ open: false, itemId: null, currentUrl: '' });
    };

    const handleBatchImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !imageEditModal.itemId) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const options = {
                maxSizeMB: 0.2,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
                fileType: 'image/webp'
            };

            const compressedFile = await imageCompression(file, options);
            const storageRef = ref(storage, `menu-items/${file.name.split('.')[0]}-${Date.now()}.webp`);
            const uploadTask = uploadBytesResumable(storageRef, compressedFile, { cacheControl: 'public,max-age=31536000' });

            uploadTask.on('state_changed',
                (snapshot) => { setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
                (error) => { console.error("Upload failed", error); setUploading(false); },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        handleImageChange(imageEditModal.itemId, downloadURL);
                        setUploading(false);
                    });
                }
            );
        } catch (error) {
            console.error("Compression failed", error);
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = localItems
                .filter(item => {
                    const original = items.find(o => o.id === item.id);
                    return JSON.stringify(item) !== JSON.stringify(original);
                })
                .map(item => ({
                    id: item.id,
                    updates: {
                        name: item.name,
                        price: item.price,
                        description: item.description,
                        category: item.category,
                        subcategory: item.subcategory,
                        dietary: item.dietary,
                        image: item.image
                    }
                }));

            if (updates.length === 0) {
                alert("No changes to save.");
                setSaving(false);
                return;
            }

            const res = await fetch('/api/menu/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ updates })
            });

            if (res.ok) {
                alert("Bulk update successful!");
                onRefresh();
            } else {
                const err = await res.json();
                alert(`Error: ${err.message || 'Failed to save updates'}`);
            }
        } catch (error) {
            console.error("Bulk save error:", error);
            alert("An error occurred during save.");
        } finally {
            setSaving(false);
        }
    };

    const filteredItems = localItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <span className="text-sm text-zinc-500 self-center">
                        {localItems.filter(item => {
                            const original = items.find(o => o.id === item.id);
                            return JSON.stringify(item) !== JSON.stringify(original);
                        }).length} changes pending
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-zinc-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        Save All Changes
                    </button>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-16 text-center">Image</th>
                                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider min-w-[200px]">Item Details</th>
                                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Category</th>
                                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Subcategory</th>
                                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-24">Price</th>
                                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">Dietary</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredItems.map(item => {
                                const categoryData = categories.find(c => c.name === item.category);
                                return (
                                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setImageEditModal({ open: true, itemId: item.id, currentUrl: item.image })}
                                                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-zinc-100 relative group active:scale-95 transition-all shadow-sm"
                                            >
                                                <img src={item.image || '/logo.png'} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit2 size={12} className="text-white" />
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 space-y-2">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={e => handleChange(item.id, 'name', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-primary outline-none font-bold text-zinc-900 transition-all text-sm"
                                            />
                                            <textarea
                                                value={item.description}
                                                onChange={e => handleChange(item.id, 'description', e.target.value)}
                                                placeholder="Description..."
                                                className="w-full bg-zinc-50/50 border border-transparent hover:border-zinc-200 focus:border-primary focus:bg-white outline-none text-[11px] text-zinc-500 resize-none h-6 focus:h-24 transition-all rounded px-2 py-1 leading-normal"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={item.category}
                                                onChange={e => handleChange(item.id, 'category', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                                            >
                                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={item.subcategory || ''}
                                                onChange={e => handleChange(item.id, 'subcategory', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                                            >
                                                <option value="">None</option>
                                                {categoryData?.subcategories?.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={item.price}
                                                onChange={e => handleChange(item.id, 'price', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/30 font-bold text-primary"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex bg-zinc-50 border border-zinc-200 rounded p-0.5 overflow-hidden">
                                                {['Veg', 'Non-Veg', 'Vegan'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => handleChange(item.id, 'dietary', type)}
                                                        className={`flex-1 text-[9px] py-1 px-1 font-bold rounded transition-all ${item.dietary === type ? (type === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-green-600 text-white') : 'text-zinc-400 hover:bg-zinc-100'}`}
                                                    >
                                                        {type === 'Non-Veg' ? 'NV' : type === 'Vegan' ? 'VN' : 'V'}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {imageEditModal.open && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-200">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                                <h3 className="font-bold text-zinc-900">Edit Dish Image</h3>
                                <button onClick={() => setImageEditModal({ open: false, itemId: null, currentUrl: '' })} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="aspect-video rounded-xl overflow-hidden border-4 border-zinc-100 shadow-inner bg-zinc-50 relative">
                                        <img src={imageEditModal.currentUrl || '/logo.png'} className="w-full h-full object-cover" />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                <span className="text-white font-bold text-sm">{Math.round(uploadProgress)}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Image URL</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={imageEditModal.currentUrl} onChange={e => setImageEditModal(prev => ({ ...prev, currentUrl: e.target.value }))} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter URL here..." />
                                                <button onClick={() => handleImageChange(imageEditModal.itemId, imageEditModal.currentUrl)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800">Apply</button>
                                            </div>
                                        </div>
                                        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className="flex flex-col items-center justify-center pt-1">
                                                <Upload className="text-zinc-400 mb-1" size={24} />
                                                <p className="text-sm font-bold text-zinc-600">Click to upload photo</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleBatchImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MenuManagement = () => {
    const [subTab, setSubTab] = useState('items');
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [formData, setFormData] = useState({ name: '', price: '', description: '', category: '', subcategory: '', image: '', dietary: 'Veg' });
    const [bulkFormData, setBulkFormData] = useState({ category: '', subcategory: '', price: '' });
    const [uploading, setUploading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleExport = async () => {
        try {
            window.location.href = '/api/menu/export';
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export menu.");
        }
    };

    const handleBulkImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/menu/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });

            if (res.ok) {
                const result = await res.json();
                alert(`Import successful! ${result.stats.updated} updated, ${result.stats.created} created.`);
                fetchItems();
            } else {
                const error = await res.json();
                alert(`Import failed: ${error.error}`);
            }
        } catch (error) {
            console.error("Import error:", error);
            alert("An error occurred during import.");
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset file input
        }
    };

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/menu');
            if (res.ok) setItems(await res.json());
        } catch (error) { console.error("Error fetching menu:", error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) setCategories(await res.json());
        } catch (error) { console.error("Error fetching categories:", error); }
    };

    const handleOpenModal = (item = null) => {
        setUploading(false);
        setUploadProgress(0);
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({ name: '', price: '', description: '', category: categories[0]?.name || '', subcategory: '', image: '', dietary: 'Veg' });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/webp' };
            const compressedFile = await imageCompression(file, options);
            const storageRef = ref(storage, `menu-items/${file.name.split('.')[0]}-${Date.now()}.webp`);
            const uploadTask = uploadBytesResumable(storageRef, compressedFile, { cacheControl: 'public,max-age=31536000' });

            uploadTask.on('state_changed',
                (snapshot) => { setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
                (error) => { console.error("Upload failed", error); setUploading(false); },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setFormData(prev => ({ ...prev, image: downloadURL }));
                        setUploading(false);
                    });
                }
            );
        } catch (error) {
            console.error("Compression failed", error);
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `/api/menu/${editingItem.id}` : `/api/menu`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchItems();
                setIsModalOpen(false);
            } else {
                alert("Failed to save item");
            }
        } catch (error) { console.error("Error saving item:", error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const res = await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchItems();
        } catch (error) { console.error(error); }
    };

    const handleSelect = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedItems(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedItems.size} items?`)) return;
        for (const id of selectedItems) {
            await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
        }
        fetchItems();
        setSelectedItems(new Set());
    };

    const handleBulkUpdate = async (e) => {
        e.preventDefault();
        const updates = {};
        if (bulkFormData.category) updates.category = bulkFormData.category;
        if (bulkFormData.subcategory) updates.subcategory = bulkFormData.subcategory;
        if (bulkFormData.price) updates.price = bulkFormData.price;

        try {
            const res = await fetch(`/api/menu/bulk`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ ids: Array.from(selectedItems), updates })
            });
            if (res.ok) {
                fetchItems();
                setIsBulkModalOpen(false);
                setSelectedItems(new Set());
                alert("Bulk update successful!");
            }
        } catch (error) { console.error(error); }
    };

    const activeCategoryData = categories.find(c => c.name === formData.category);
    const bulkCategoryData = categories.find(c => c.name === bulkFormData.category);

    return (
        <div className="p-6 space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Menu Management</h2>
                <div className="bg-zinc-100 p-1 rounded-lg flex gap-1">
                    <button onClick={() => setSubTab('items')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${subTab === 'items' ? 'bg-white shadow text-black' : 'text-zinc-500 hover:text-zinc-900'}`}>Menu Items</button>
                    <button onClick={() => setSubTab('bulk')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${subTab === 'bulk' ? 'bg-white shadow text-black' : 'text-zinc-500 hover:text-zinc-900'}`}>Bulk Edit</button>
                    <button onClick={() => setSubTab('categories')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${subTab === 'categories' ? 'bg-white shadow text-black' : 'text-zinc-500 hover:text-zinc-900'}`}>Categories</button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg flex items-center gap-2 transition-colors">
                        <Download size={18} /> <span className="hidden md:inline">Export Excel</span>
                    </button>
                    <label className="p-2 text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        {importing ? <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /> : <Upload size={18} />}
                        <span className="hidden md:inline">{importing ? 'Importing...' : 'Import Excel'}</span>
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleBulkImport} disabled={importing} />
                    </label>
                    {subTab === 'items' && <button onClick={() => handleOpenModal()} className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-800 hover:text-white transition-colors"><Plus size={18} /> Add</button>}
                </div>
            </div>

            {subTab === 'categories' ? <CategoryManagement /> : subTab === 'bulk' ? <BulkMenuEditor items={items} categories={categories} onRefresh={fetchItems} /> : (
                <>
                    {selectedItems.size > 0 && (
                        <div className="bg-zinc-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
                            <span className="font-bold ml-2">{selectedItems.size} items selected</span>
                            <div className="flex gap-2">
                                <button onClick={() => setIsBulkModalOpen(true)} className="bg-primary text-black px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white transition-colors">Bulk Update</button>
                                <button onClick={handleBulkDelete} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">Delete Selected</button>
                                <button onClick={() => setSelectedItems(new Set())} className="text-zinc-400 hover:text-white px-3 py-1.5 text-sm">Cancel</button>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-zinc-900 text-white font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}>All Items</button>
                        {categories.map(cat => (
                            <button key={cat._id} onClick={() => setActiveTab(cat.name)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === cat.name ? 'bg-zinc-900 text-white font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}>{cat.name}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.filter(item => activeTab === 'all' || item.category === activeTab).map(item => (
                            <motion.div layout key={item.id} onClick={() => handleSelect(item.id)} className={`bg-white border rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer relative ${selectedItems.has(item.id) ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-zinc-200 hover:border-primary/50'}`}>
                                <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedItems.has(item.id) ? 'bg-primary border-primary' : 'bg-white/80 border-gray-300'}`}>{selectedItems.has(item.id) && <Check size={14} className="text-black" />}</div>
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.image || '/logo.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 flex gap-2 translate-y-[-100%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleOpenModal(item)} className="p-2 bg-white/90 backdrop-blur-md rounded-full text-zinc-900 hover:bg-primary hover:text-black transition-colors shadow-sm"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50/90 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-lg text-zinc-900 leading-tight">{item.name}</h3>
                                        <span className="bg-primary/20 text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap">{item.price}</span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                                        <span>{item.category}</span>
                                        {item.subcategory && <span>• {item.subcategory}</span>}
                                    </div>
                                    <p className="text-zinc-500 text-sm line-clamp-2">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-zinc-900 text-lg">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Category</label>
                                        <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2">
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Sub Category</label>
                                        <select value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2">
                                            <option value="">None</option>
                                            {activeCategoryData?.subcategories?.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-zinc-900" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Price</label>
                                        <input type="text" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-zinc-900" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Dietary</label>
                                        <select value={formData.dietary} onChange={e => setFormData({ ...formData, dietary: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                                            <option value="Veg">Veg</option>
                                            <option value="Non-Veg">Non-Veg</option>
                                            <option value="Vegan">Vegan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Image</label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-dark hover:file:bg-primary/30" />
                                    {uploading && <div className="w-full bg-gray-200 rounded-full h-1 mt-2"><div className="bg-primary h-1 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Description</label>
                                    <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-zinc-900" />
                                </div>
                                <button type="submit" disabled={uploading} className="w-full py-3 bg-primary text-black rounded-lg font-bold">{uploading ? 'Uploading...' : 'Save Item'}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isBulkModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl">
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-zinc-900 text-lg">Bulk Update ({selectedItems.size} items)</h3>
                                <button onClick={() => setIsBulkModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleBulkUpdate} className="p-6 space-y-4">
                                <p className="text-sm text-zinc-500">Only fields you fill in will be updated.</p>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">New Category</label>
                                    <select value={bulkFormData.category} onChange={e => setBulkFormData({ ...bulkFormData, category: e.target.value, subcategory: '' })} className="w-full border rounded-lg px-3 py-2">
                                        <option value="">No Change</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">New Subcategory</label>
                                    <select value={bulkFormData.subcategory} onChange={e => setBulkFormData({ ...bulkFormData, subcategory: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                                        <option value="">No Change</option>
                                        {bulkCategoryData?.subcategories?.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">New Price</label>
                                    <input type="text" value={bulkFormData.price} onChange={e => setBulkFormData({ ...bulkFormData, price: e.target.value })} placeholder="No Change" className="w-full border rounded-lg px-3 py-2 text-zinc-900" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-primary text-black rounded-lg font-bold">Update All Selected</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TableAllocation = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReservations = async () => {
        try {
            const res = await fetch('/api/reservations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setReservations(await res.json());
        } catch (error) { console.error("Error fetching reservations:", error); }
        finally { setIsLoading(false); }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/reservations/status/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setReservations(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
            } else { alert("Failed to update status"); }
        } catch (error) { console.error("Error updating status:", error); alert("Error updating status"); }
    };

    useEffect(() => { fetchReservations(); }, []);

    if (isLoading) return <div className="p-6 text-zinc-500">Loading reservations...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Table Allocation & Reservations</h2>
                <button onClick={fetchReservations} className="text-sm text-primary hover:text-primary-dark underline">Refresh Data</button>
            </div>
            <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-zinc-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Guests</th>
                            <th className="p-4">Requests</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-zinc-600">
                        {reservations.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-zinc-400">No reservations found.</td></tr> : reservations.map(res => (
                            <tr key={res._id} className="hover:bg-zinc-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-zinc-900">{res.name}</div>
                                    <div className="text-xs text-zinc-400">{res.phone}</div>
                                </td>
                                <td className="p-4">
                                    <div>{new Date(res.date).toLocaleDateString()}</div>
                                    <div className="text-xs text-zinc-400">{res.time}</div>
                                </td>
                                <td className="p-4 font-medium">{res.guests} Pax</td>
                                <td className="p-4 text-xs italic text-zinc-500 max-w-[150px] truncate" title={res.specialRequests || "None"}>{res.specialRequests || "-"}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${res.status === 'Confirmed' ? 'bg-green-100 text-green-700' : res.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{res.status}</span></td>
                                <td className="p-4 flex gap-2">
                                    {res.status !== 'Confirmed' && <button onClick={() => updateStatus(res._id, 'Confirmed')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Confirm"><Check size={16} /></button>}
                                    {res.status !== 'Cancelled' && <button onClick={() => updateStatus(res._id, 'Cancelled')} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Cancel"><X size={16} /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const QRCodeManagement = () => {
    const [tables, setTables] = useState([]);
    const [count, setCount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchTables(); }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables');
            if (res.ok) setTables(await res.json());
        } catch (error) { console.error(error); }
    };

    const generateTables = async () => {
        if (!count || count < 1) return alert("Please enter a valid number");
        if (!window.confirm(`This will regenerate ${count} tables and invalidate previous QR codes. Continue?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tables/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: parseInt(count) })
            });
            if (res.ok) {
                setTables(await res.json());
                setCount('');
            } else { alert("Failed to generate tables"); }
        } catch (error) { console.error(error); alert("Error generating tables"); }
        finally { setLoading(false); }
    };

    const deleteTable = async (number) => {
        if (!window.confirm(`Are you sure you want to delete Table ${number}?`)) return;
        try {
            const res = await fetch(`/api/tables/${number}`, { method: 'DELETE' });
            if (res.ok) setTables(tables.filter(t => t.number !== number));
            else alert("Failed to delete table");
        } catch (error) { console.error(error); alert("Error deleting table"); }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        alert("URL copied to clipboard!");
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">QR Code Management</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <input type="number" min="1" placeholder="Data" value={count} onChange={(e) => setCount(e.target.value)} className="pl-4 pr-4 py-2 rounded-lg border border-zinc-300 w-full md:w-32 focus:outline-none focus:border-primary text-zinc-900" />
                    <button onClick={generateTables} disabled={loading} className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap">{loading ? 'Generating...' : 'Generate New'}</button>
                    <button onClick={() => window.print()} className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"><Printer size={18} /> Print</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {tables.map(table => {
                    const dynamicUrl = `${window.location.origin}/menu?table=${table.number}`;
                    return (
                        <div key={table.number} className="bg-white border border-zinc-200 p-6 rounded-xl flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-white p-2 rounded-lg border border-zinc-100">
                                <QRCodeCanvas value={dynamicUrl} size={150} level={"H"} includeMargin={true} />
                            </div>
                            <div className="text-center w-full">
                                <h3 className="font-bold text-xl text-zinc-900">TABLE {table.number}</h3>
                                <p className="text-xs text-zinc-400 mt-1 truncate max-w-[150px] mx-auto mb-3">{dynamicUrl}</p>
                                <div className="flex gap-2 justify-center w-full">
                                    <button onClick={() => copyToClipboard(dynamicUrl)} className="text-xs text-primary hover:text-black hover:bg-primary/20 px-3 py-1 rounded transition-colors flex items-center gap-1 font-bold border border-primary/20"><Copy size={12} /> Copy</button>
                                    <button onClick={() => deleteTable(table.number)} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors flex items-center gap-1 border border-red-100"><Trash2 size={12} /> Remove</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const AdminDashboardPage = () => {
    const [activeView, setActiveView] = useState('welcome');
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/admin/login');
    }, [router]);

    return (
        <div className="relative w-full min-h-screen text-zinc-900 font-sans selection:bg-primary/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <QuatrefoilBackground />
                <SparticlesEffect />
            </div>

            <div className="flex w-full min-h-screen relative z-10">
                <AnimatePresence>
                    {!isSidebarOpen && (
                        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <motion.div initial={{ width: 256 }} animate={{ width: isSidebarOpen ? 256 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="border-r border-zinc-200 flex flex-col fixed h-full bg-white z-40 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between min-w-[256px]">
                        <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"><LayoutDashboard size={20} /></button>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 min-w-[256px]">
                        <button onClick={() => setActiveView('welcome')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'welcome' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}><LayoutDashboard size={20} /> Dashboard</button>
                        <button onClick={() => setActiveView('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'menu' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}><UtensilsCrossed size={20} /> Menu Management</button>
                        <button onClick={() => setActiveView('reservations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'reservations' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}><CalendarDays size={20} /> Table Allocation</button>
                        <button onClick={() => setActiveView('qr')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'qr' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}><QrCode size={20} /> QR Management</button>
                    </nav>
                    <div className="p-4 border-t border-zinc-100 min-w-[256px]">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut size={18} /> Logout</button>
                    </div>
                </motion.div>

                <motion.div animate={{ marginLeft: isSidebarOpen ? 256 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="flex-1 min-h-screen">
                    {activeView === 'welcome' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full p-10 text-center">
                            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1, type: "spring" }} src="/logo.png" alt="Asia By Gram" className="w-64 mb-10 object-contain drop-shadow-2xl" />
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-6">Welcome to <span className="text-primary">ASIA BY GRAM</span></h1>
                            <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed font-light">Admin Control Center</p>
                        </motion.div>
                    )}
                    {activeView === 'menu' && <MenuManagement />}
                    {activeView === 'reservations' && <TableAllocation />}
                    {activeView === 'qr' && <QRCodeManagement />}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
