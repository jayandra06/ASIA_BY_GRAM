'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, X, Save, Megaphone, Upload } from 'lucide-react';
import { storage } from '../../firebaseConfig.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const EMPTY_FORM = {
    title: '',
    content: '',
    mediaUrl: '',
    category: 'offer',
    adType: 'popup',
    ctaText: 'View Menu',
    ctaLink: '',
    autoCloseSeconds: 0,
    showCloseButton: true,
    frequency: 'session',
    targetAudience: 'all',
    placement: 'both',
    startDate: '',
    endDate: '',
    position: 'center',
    priority: 5,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderRadius: 12,
    animationType: 'fade',
    animationDuration: 500,
    status: 'draft',
};

const toLocalInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdsManagement = () => {
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('ads'); // ads | leads
    const [leads, setLeads] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(false);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const fetchAds = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/ads', { headers: authHeaders() });
            if (res.ok) setAds(await res.json());
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeads = async () => {
        setLeadsLoading(true);
        try {
            const res = await fetch('/api/leads', { headers: authHeaders() });
            if (res.ok) setLeads(await res.json());
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLeadsLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
        fetchLeads();
    }, []);

    useEffect(() => {
        if (activeTab === 'leads') fetchLeads();
    }, [activeTab]);

    const fillRegisterLink = () => {
        const event = (formData.title || 'Event').trim();
        const link = `/register?event=${encodeURIComponent(event)}`;
        setFormData((prev) => ({
            ...prev,
            ctaLink: link,
            ctaText: prev.ctaText === 'View Menu' || !prev.ctaText ? 'Register Now' : prev.ctaText,
        }));
    };
    const openModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                title: ad.title || '',
                content: ad.content || '',
                mediaUrl: ad.mediaUrl || '',
                category: ad.category || 'offer',
                adType: ad.adType || 'popup',
                ctaText: ad.ctaText || 'View Menu',
                ctaLink: ad.ctaLink || '',
                autoCloseSeconds: ad.autoCloseSeconds ?? 0,
                showCloseButton: ad.showCloseButton !== false,
                frequency: ad.frequency || 'session',
                targetAudience: ad.targetAudience || 'all',
                placement: ad.placement || 'both',
                startDate: toLocalInput(ad.startDate),
                endDate: toLocalInput(ad.endDate),
                position: ad.position || 'center',
                priority: ad.priority ?? 5,
                backgroundColor: ad.backgroundColor || '#ffffff',
                textColor: ad.textColor || '#000000',
                borderRadius: ad.borderRadius ?? 12,
                animationType: ad.animationType || 'fade',
                animationDuration: ad.animationDuration || 500,
                status: ad.status || 'draft',
            });
        } else {
            setEditingAd(null);
            setFormData(EMPTY_FORM);
        }
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const options = { maxSizeMB: 0.4, maxWidthOrHeight: 1600, useWebWorker: true, fileType: 'image/webp' };
            const compressedFile = await imageCompression(file, options);
            const storageRef = ref(storage, `ads/${file.name.split('.')[0]}-${Date.now()}.webp`);
            const uploadTask = uploadBytesResumable(storageRef, compressedFile, {
                cacheControl: 'public,max-age=31536000',
            });

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                },
                (error) => {
                    console.error('Upload failed', error);
                    alert('Image upload failed');
                    setUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setFormData((prev) => ({ ...prev, mediaUrl: downloadURL }));
                        setUploading(false);
                    });
                }
            );
        } catch (error) {
            console.error('Compression failed', error);
            alert('Image compression failed');
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            alert('Ad content is required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                autoCloseSeconds: Number(formData.autoCloseSeconds) || 0,
                priority: Number(formData.priority) || 5,
                borderRadius: Number(formData.borderRadius) || 0,
                animationDuration: Number(formData.animationDuration) || 500,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
            };

            const url = editingAd ? `/api/ads/${editingAd._id}` : '/api/ads';
            const method = editingAd ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await fetchAds();
                setIsModalOpen(false);
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to save ad');
            }
        } catch (error) {
            console.error('Error saving ad:', error);
            alert('Error saving ad');
        } finally {
            setSaving(false);
        }
    };

    const deleteAd = async (id) => {
        if (!window.confirm('Delete this ad?')) return;
        try {
            const res = await fetch(`/api/ads/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (res.ok) {
                setAds((prev) => prev.filter((a) => a._id !== id));
            } else {
                alert('Failed to delete ad');
            }
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('Error deleting ad');
        }
    };

    const toggleStatus = async (ad) => {
        const next = ad.status === 'published' ? 'draft' : 'published';
        try {
            const res = await fetch(`/api/ads/${ad._id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ status: next }),
            });
            if (res.ok) {
                const updated = await res.json();
                setAds((prev) => prev.map((a) => (a._id === ad._id ? updated : a)));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filtered = ads.filter((ad) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
            !q ||
            ad.title?.toLowerCase().includes(q) ||
            ad.content?.toLowerCase().includes(q) ||
            ad.category?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' || ad.status === statusFilter;
        const matchesType = typeFilter === 'All' || ad.adType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const publishedCount = ads.filter((a) => a.status === 'published').length;
    const draftCount = ads.filter((a) => a.status === 'draft').length;

    const inputClass =
        'w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary text-zinc-900';
    const labelClass = 'block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5';
    const cardClass = 'bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4';

    if (isLoading) return <div className="p-6 text-zinc-500">Loading restaurant events...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Events &amp; Ads</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        Promote specials, events &amp; offers on the homepage and table QR menu
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-lg text-sm hover:brightness-95 transition-all self-start md:self-auto"
                >
                    <Plus size={18} /> Create Event Ad
                </button>
            </div>

            <div className="flex gap-2 border-b border-zinc-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
                        activeTab === 'ads'
                            ? 'border-primary text-zinc-900'
                            : 'border-transparent text-zinc-400 hover:text-zinc-700'
                    }`}
                >
                    Event Ads
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('leads')}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
                        activeTab === 'leads'
                            ? 'border-primary text-zinc-900'
                            : 'border-transparent text-zinc-400 hover:text-zinc-700'
                    }`}
                >
                    Form Registrations ({leads.length})
                </button>
            </div>

            {activeTab === 'leads' ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-zinc-500">
                            Guests who submitted name, phone &amp; age via the <code className="text-xs bg-zinc-100 px-1 rounded">/register</code> form
                        </p>
                        <button onClick={fetchLeads} className="text-sm text-primary hover:underline">
                            Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-zinc-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4">Age</th>
                                    <th className="p-4">Event</th>
                                    <th className="p-4">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-sm text-zinc-600">
                                {leadsLoading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-zinc-400">
                                            Loading registrations...
                                        </td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-zinc-400">
                                            No form submissions yet. Set CTA link to{' '}
                                            <code className="text-xs bg-zinc-100 px-1 rounded">/register?event=Your Event</code>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr key={lead._id} className="hover:bg-zinc-50">
                                            <td className="p-4 font-bold text-zinc-900">{lead.name}</td>
                                            <td className="p-4">{lead.phone}</td>
                                            <td className="p-4">{lead.age}</td>
                                            <td className="p-4">{lead.eventName || '—'}</td>
                                            <td className="p-4 whitespace-nowrap text-xs">
                                                {lead.createdAt
                                                    ? new Date(lead.createdAt).toLocaleString('en-IN', {
                                                          day: '2-digit',
                                                          month: 'short',
                                                          year: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Total Events</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{ads.length}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Live Now</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{publishedCount}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Drafts</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">{draftCount}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by event name or description..."
                        className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                    <option value="All">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                    <option value="All">All Types</option>
                    <option value="popup">Popup</option>
                    <option value="banner">Banner</option>
                    <option value="toast">Toast</option>
                    <option value="badge">Badge</option>
                    <option value="flyer">Flyer</option>
                    <option value="floating">Floating Button</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-zinc-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Event</th>
                            <th className="p-4">Ad Type</th>
                            <th className="p-4">Shown On</th>
                            <th className="p-4">Priority</th>
                            <th className="p-4">Visible Period</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-zinc-600">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-zinc-400">
                                    No events yet. Create a special, offer, or competition to show on the homepage &amp; QR menu.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((ad) => (
                                <tr key={ad._id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-start gap-3">
                                            {ad.mediaUrl ? (
                                                <img
                                                    src={ad.mediaUrl}
                                                    alt=""
                                                    className="w-12 h-12 rounded-lg object-cover border border-zinc-100 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <Megaphone size={18} className="text-zinc-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-zinc-900">
                                                    {ad.title || ad.category || 'Untitled Event'}
                                                </div>
                                                <div className="text-xs text-zinc-400 mt-0.5 max-w-[220px] truncate">
                                                    {ad.content}
                                                </div>
                                                <div className="text-[10px] uppercase tracking-wider text-primary font-bold mt-1">
                                                    {ad.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 capitalize">{ad.adType}</td>
                                    <td className="p-4 capitalize">{ad.placement}</td>
                                    <td className="p-4">{ad.priority}</td>
                                    <td className="p-4 whitespace-nowrap text-xs">
                                        {ad.startDate || ad.endDate ? (
                                            <>
                                                <div>
                                                    {ad.startDate
                                                        ? new Date(ad.startDate).toLocaleDateString('en-IN')
                                                        : '—'}
                                                </div>
                                                <div className="text-zinc-400">
                                                    →{' '}
                                                    {ad.endDate
                                                        ? new Date(ad.endDate).toLocaleDateString('en-IN')
                                                        : '—'}
                                                </div>
                                            </>
                                        ) : (
                                            'Always'
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(ad)}
                                            className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                                ad.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : ad.status === 'archived'
                                                      ? 'bg-zinc-100 text-zinc-500'
                                                      : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                            title="Toggle publish"
                                        >
                                            {ad.status}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModal(ad)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteAd(ad._id)}
                                                className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 overflow-y-auto bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-3xl bg-zinc-50 rounded-2xl shadow-2xl mb-10">
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white rounded-t-2xl">
                            <h3 className="text-lg font-bold text-zinc-900">
                                {editingAd ? 'Edit Event Ad' : 'Create Event Ad'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Basic Information */}
                            <div className={cardClass}>
                                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                                    Event Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Event Name *</label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Weekend Ramen Special"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Event Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="offer">Food Offer / Special</option>
                                            <option value="competition">Restaurant Event / Competition</option>
                                            <option value="general">General Promo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Advertisement Type *</label>
                                        <select
                                            name="adType"
                                            value={formData.adType}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="popup">Popup — Center modal</option>
                                            <option value="banner">Banner — Top sticky strip</option>
                                            <option value="toast">Toast — Bottom-right notice</option>
                                            <option value="badge">Badge — Small glowing dot</option>
                                            <option value="flyer">Flyer — Poster card</option>
                                            <option value="floating">Floating Button</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Where to Show *</label>
                                        <select
                                            name="placement"
                                            value={formData.placement}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="both">Homepage + Table QR Menu</option>
                                            <option value="homepage">Homepage only</option>
                                            <option value="menu">Table QR Menu only</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Event Description *</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        rows={3}
                                        required
                                        placeholder="e.g. Try our new spicy ramen bowl this weekend — dine-in only. Limited bowls daily!"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Event Poster</label>
                                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                                            <Upload size={16} />
                                            {uploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Upload Poster'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                        <input
                                            name="mediaUrl"
                                            value={formData.mediaUrl}
                                            onChange={handleChange}
                                            placeholder="Or paste poster image URL"
                                            className={`${inputClass} flex-1`}
                                        />
                                    </div>
                                    {formData.mediaUrl && (
                                        <img
                                            src={formData.mediaUrl}
                                            alt="Event poster preview"
                                            className="mt-3 h-28 rounded-lg object-cover border border-zinc-200"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className={cardClass}>
                                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                                    Call-to-Action Button
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Button Title</label>
                                        <input
                                            name="ctaText"
                                            value={formData.ctaText}
                                            onChange={handleChange}
                                            placeholder="e.g. Register Now, View Menu, Book a Table"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Button Link (CTA)</label>
                                        <input
                                            name="ctaLink"
                                            value={formData.ctaLink}
                                            onChange={handleChange}
                                            placeholder="/register?event=Weekend Ramen Special"
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={fillRegisterLink}
                                            className="mt-1.5 text-xs font-bold text-primary hover:underline"
                                        >
                                            Use registration form link →
                                        </button>
                                        <p className="text-[11px] text-zinc-400 mt-1">
                                            Guests land on a page with Name, Phone &amp; Age. Paste{' '}
                                            <code className="bg-zinc-100 px-1 rounded">/register</code> or click the
                                            button above.
                                        </p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Auto-close Timer (seconds)</label>
                                        <input
                                            type="number"
                                            name="autoCloseSeconds"
                                            min={0}
                                            max={300}
                                            value={formData.autoCloseSeconds}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                        <p className="text-[11px] text-zinc-400 mt-1">0 = stays open until guest closes it</p>
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="showCloseButton"
                                                checked={formData.showCloseButton}
                                                onChange={handleChange}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <span className="text-sm text-zinc-700 font-medium">
                                                Show close button (X)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Targeting & Schedule */}
                            <div className={cardClass}>
                                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                                    Event Time &amp; Visibility
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>How Often to Show *</label>
                                        <select
                                            name="frequency"
                                            value={formData.frequency}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="session">Once per visit</option>
                                            <option value="once">Once ever (per device)</option>
                                            <option value="daily">Once per day</option>
                                            <option value="always">Every time guest opens</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Who Sees It *</label>
                                        <select
                                            name="targetAudience"
                                            value={formData.targetAudience}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="all">All guests</option>
                                            <option value="new">First-time visitors</option>
                                            <option value="returning">Returning guests</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Visible From</label>
                                        <input
                                            type="datetime-local"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                        <p className="text-[11px] text-zinc-400 mt-1">Leave empty to start immediately</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Visible Until</label>
                                        <input
                                            type="datetime-local"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                        <p className="text-[11px] text-zinc-400 mt-1">Leave empty for no end date</p>
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div className={cardClass}>
                                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                                    Colours &amp; Animation
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Position on Screen</label>
                                        <select
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="center">Center</option>
                                            <option value="top">Top</option>
                                            <option value="bottom-right">Bottom Right</option>
                                            <option value="bottom-left">Bottom Left</option>
                                            <option value="top-right">Top Right</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Priority (1–10)</label>
                                        <input
                                            type="number"
                                            name="priority"
                                            min={1}
                                            max={10}
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                        <p className="text-[11px] text-zinc-400 mt-1">Higher = shown first if multiple events</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Background Colour</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.backgroundColor}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        backgroundColor: e.target.value,
                                                    }))
                                                }
                                                className="w-12 h-10 rounded border border-zinc-200 cursor-pointer"
                                            />
                                            <input
                                                name="backgroundColor"
                                                value={formData.backgroundColor}
                                                onChange={handleChange}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Text Colour</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.textColor}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, textColor: e.target.value }))
                                                }
                                                className="w-12 h-10 rounded border border-zinc-200 cursor-pointer"
                                            />
                                            <input
                                                name="textColor"
                                                value={formData.textColor}
                                                onChange={handleChange}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Corner Roundness</label>
                                        <input
                                            type="number"
                                            name="borderRadius"
                                            min={0}
                                            max={48}
                                            value={formData.borderRadius}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Animation Style</label>
                                        <select
                                            name="animationType"
                                            value={formData.animationType}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >
                                            <option value="fade">Fade In</option>
                                            <option value="slide">Slide In</option>
                                            <option value="scale">Scale In</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Animation Speed (ms)</label>
                                        <input
                                            type="number"
                                            name="animationDuration"
                                            min={100}
                                            max={2000}
                                            value={formData.animationDuration}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className={cardClass}>
                                <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                                    Publish Status
                                </h4>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    <option value="draft">Draft — guests will not see this yet</option>
                                    <option value="published">Published — live for guests</option>
                                    <option value="archived">Archived — hidden</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-black hover:brightness-95 disabled:opacity-60 transition-all"
                                >
                                    <Save size={16} />
                                    {saving ? 'Saving...' : editingAd ? 'Update Event' : 'Create Event Ad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
};

export default AdsManagement;
