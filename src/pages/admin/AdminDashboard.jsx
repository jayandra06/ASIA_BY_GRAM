import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UtensilsCrossed, CalendarDays, LogOut, Plus, Trash2, Edit2, Search, X, Check, QrCode, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../firebaseConfig.js';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import QuatrefoilBackground from '../../components/ui/QuatrefoilBackground';
import SparticlesEffect from '../../components/ui/SparticlesEffect';

// Placeholder Component for Menu Management
const MenuManagement = () => {
    const [items, setItems] = useState([]); // In real app, fetch from backend
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', description: '', category: '', image: '' });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Mock Data Loading (Replace with API fetch)
    useEffect(() => {
        // Basic fetch mock
        fetch('/src/data/menu.json')
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error(err));
    }, []);

    const handleOpenModal = (item = null) => {
        setUploading(false);
        setUploadProgress(0);
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({ name: '', price: '', description: '', category: 'Starters', image: '' });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const storageRef = ref(storage, `menu-items/${file.name}-${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed", error);
                setUploading(false);
                alert("Image upload failed! Please try again.");
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setFormData(prev => ({ ...prev, image: downloadURL }));
                    setUploading(false);
                });
            }
        );
    };

    const handeSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            // Update logic
            setItems(items.map(i => i.id === editingItem.id ? { ...formData, id: i.id } : i));
        } else {
            // Add logic
            setItems([...items, { ...formData, id: `new-${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const categories = ['all', ...new Set(items.map(item => item.category))];

    return (
        <div className="p-6 space-y-6 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Menu Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-800 hover:text-white transition-colors">
                    <Plus size={18} /> Add New Item
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === cat ? 'bg-zinc-900 text-white font-bold' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.filter(item => activeTab === 'all' || item.category === activeTab).map(item => (
                    <motion.div
                        layout
                        key={item.id}
                        className="bg-white border border-zinc-200 rounded-xl overflow-hidden group hover:border-primary/50 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 flex gap-2 translate-y-[-100%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <button onClick={() => handleOpenModal(item)} className="p-2 bg-white/90 backdrop-blur-md rounded-full text-zinc-900 hover:bg-primary hover:text-black transition-colors shadow-sm"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/90 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors shadow-sm"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-lg text-zinc-900 leading-tight">{item.name}</h3>
                                <span className="bg-primary/20 text-primary-dark text-xs font-bold px-2 py-1 rounded whitespace-nowrap">{item.price}</span>
                            </div>
                            <p className="text-zinc-500 text-sm line-clamp-2">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-zinc-900 text-lg">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                            </div>
                            <form onSubmit={handeSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Name</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">Price</label>
                                        <input type="text" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Category</label>
                                    <input type="text" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Image</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-dark hover:file:bg-primary/30"
                                            />
                                        </div>

                                        {uploading && (
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                        )}

                                        {formData.image && (
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 group">
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 uppercase font-bold">Description</label>
                                    <textarea rows="3" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 rounded-lg font-bold transition-colors">Cancel</button>
                                    <button type="submit" disabled={uploading} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-black rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {uploading ? 'Uploading...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Real Table Allocation Component
const TableAllocation = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth(); // Assuming useAuth provides token, otherwise use localStorage directly if needed

    // Helper to get token if not in context
    const getToken = () => localStorage.getItem('token');

    const fetchReservations = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setReservations(data);
            } else {
                console.error("Failed to fetch reservations");
            }
        } catch (error) {
            console.error("Error fetching reservations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Optimistic update or refetch
                setReservations(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status");
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

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
                        {reservations.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-zinc-400">No reservations found.</td>
                            </tr>
                        ) : (
                            reservations.map(res => (
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
                                    <td className="p-4 text-xs italic text-zinc-500 max-w-[150px] truncate" title={res.specialRequests || "None"}>
                                        {res.specialRequests || "-"}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                            ${res.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                res.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {res.status !== 'Confirmed' && (
                                            <button
                                                onClick={() => updateStatus(res._id, 'Confirmed')}
                                                className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                title="Confirm"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        {res.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => updateStatus(res._id, 'Cancelled')}
                                                className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// QR Code Management Component
const QRCodeManagement = () => {
    const [tables, setTables] = useState([]);
    const [count, setCount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tables`);
            if (res.ok) {
                const data = await res.json();
                setTables(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const generateTables = async () => {
        if (!count || count < 1) return alert("Please enter a valid number");
        if (!window.confirm(`This will regenerate ${count} tables and invalidate previous QR codes. Continue?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tables/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: parseInt(count) })
            });
            if (res.ok) {
                const data = await res.json();
                setTables(data);
                setCount('');
            } else {
                alert("Failed to generate tables");
            }
        } catch (error) {
            console.error(error);
            alert("Error generating tables");
        } finally {
            setLoading(false);
        }
    };

    const deleteTable = async (number) => {
        if (!window.confirm(`Are you sure you want to delete Table ${number}?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tables/${number}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setTables(tables.filter(t => t.number !== number));
            } else {
                alert("Failed to delete table");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting table");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">QR Code Management</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="number"
                            min="1"
                            placeholder="Data"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            className="pl-4 pr-4 py-2 rounded-lg border border-zinc-300 w-full md:w-32 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        onClick={generateTables}
                        disabled={loading}
                        className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? 'Generating...' : 'Generate New'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 print:grid-cols-3 print:gap-8">
                {tables.map(table => (
                    <div key={table.number} className="bg-white border border-zinc-200 p-6 rounded-xl flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-white p-2 rounded-lg border border-zinc-100">
                            <QRCodeCanvas
                                value={table.url}
                                size={150}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                        <div className="text-center w-full">
                            <h3 className="font-bold text-xl text-zinc-900">TABLE {table.number}</h3>
                            <p className="text-xs text-zinc-400 mt-1 truncate max-w-[150px] mx-auto mb-3">{table.url}</p>
                            <button
                                onClick={() => deleteTable(table.number)}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                {tables.length === 0 && (
                    <div className="col-span-full py-20 text-center text-zinc-400">
                        No tables generated yet.
                    </div>
                )}
            </div>

            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }
                    .print\\:gap-8 {
                        gap: 2rem !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('welcome');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Redirect if not logged in (Basic client side protection)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/admin/login');
    }, [navigate]);

    return (
        <div className="relative w-full min-h-screen text-zinc-900 font-sans selection:bg-primary/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <QuatrefoilBackground />
                <SparticlesEffect />
            </div>

            <div className="flex w-full min-h-screen relative z-10">
                {/* Sidebar Toggle Trigger (Visible when closed) */}
                <AnimatePresence>
                    {!isSidebarOpen && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={() => setIsSidebarOpen(true)}
                            className="fixed top-4 left-4 z-50 p-0 bg-transparent group flex items-center justify-center transition-transform hover:scale-105"
                        >
                            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain drop-shadow-md" />

                            {/* Tooltip */}
                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-lg z-[100] border border-white/10">
                                Open sidebar
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <motion.div
                    initial={{ width: 256 }}
                    animate={{ width: isSidebarOpen ? 256 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-r border-zinc-200 flex flex-col fixed h-full bg-white z-40 overflow-hidden shadow-xl md:shadow-none"
                >
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between min-w-[256px]">
                        <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors group relative"
                        >
                            <LayoutDashboard size={20} />
                            {/* Tooltip */}
                            <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                                Close sidebar
                            </div>
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 min-w-[256px]">
                        <button
                            onClick={() => setActiveView('welcome')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'welcome' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
                        >
                            <LayoutDashboard size={20} /> Dashboard
                        </button>
                        <button
                            onClick={() => setActiveView('menu')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'menu' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
                        >
                            <UtensilsCrossed size={20} /> Menu Management
                        </button>
                        <button
                            onClick={() => setActiveView('reservations')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'reservations' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
                        >
                            <CalendarDays size={20} /> Table Allocation
                        </button>
                        <button
                            onClick={() => setActiveView('qr')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeView === 'qr' ? 'bg-primary text-black font-bold' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
                        >
                            <QrCode size={20} /> QR Management
                        </button>
                    </nav>

                    <div className="p-4 border-t border-zinc-100 min-w-[256px]">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    animate={{ marginLeft: isSidebarOpen ? 256 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-1 min-h-screen"
                >
                    {activeView === 'welcome' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full p-10 text-center"
                        >
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 1, type: "spring" }}
                                src="/logo.png"
                                alt="Asia By Gram"
                                className="w-64 mb-10 object-contain drop-shadow-2xl"
                            />
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-6">
                                Welcome to <span className="text-primary">ASIA BY GRAM</span>
                            </h1>
                            <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed font-light">
                                Admin Control Center
                            </p>
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

export default AdminDashboard;
