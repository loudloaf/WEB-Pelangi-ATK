import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query'; 

export default function AdminDashboard() {
  // ========================================================================
  // 0. INISIALISASI QUERY CLIENT (Ditaruh di atas agar rapi)
  // ========================================================================
  const queryClient = useQueryClient();

  // ========================================================================
  // 1. STATE AUTENTIKASI & LOGIN (SISTEM BARU)
  // ========================================================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mainTab, setMainTab] = useState('dashboard'); // 'dashboard' atau 'settings'
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });
  
  // ========================================================================
  // 2. STATE DATA DASHBOARD & FITUR BARU
  // ========================================================================
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  
  // --- NEW: STATE UNTUK PENCARIAN DAN DRAG & DROP ---
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // --- TIERED PRICING - Menambah struktur tiers ke state variants ---
  const [variants, setVariants] = useState<any[]>([]);
  const addVariant = () => { setVariants([...variants, { name: '', price: '', file: null, existing_image: '', tiers: [] }]);};
  
  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
  };

  const addTier = (variantIndex: number) => {
    const newVariants = [...variants];
    if (!newVariants[variantIndex].tiers) newVariants[variantIndex].tiers = [];
    newVariants[variantIndex].tiers.push({ min_qty: '', price: '' });
    setVariants(newVariants);
  };

  const removeTier = (variantIndex: number, tierIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].tiers = newVariants[variantIndex].tiers.filter((_: any, i: number) => i !== tierIndex);
    setVariants(newVariants);
  };

  const handleTierChange = (variantIndex: number, tierIndex: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex].tiers[tierIndex][field] = value;
    setVariants(newVariants);
  };
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); // Untuk Sidebar
  
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddOutletModalOpen, setIsAddOutletModalOpen] = useState(false);
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- SAFE API FETCHER ---
  const fetchSafeArray = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Fetch error:", error);
      return []; 
    }
  };

  const { data: categories = [] as any[] } = useQuery({ queryKey: ['categories'], queryFn: () => fetchSafeArray('/api/categories') });
  const { data: products = [] as any[] } = useQuery({ queryKey: ['products'], queryFn: () => fetchSafeArray('/api/products') });
  const { data: newsList = [] as any[] } = useQuery({ queryKey: ['news-events'], queryFn: () => fetchSafeArray('/api/news_events') });
  const { data: promos = [] as any[] } = useQuery({ queryKey: ['promos'], queryFn: () => fetchSafeArray('/api/promos') });
  const { data: outlets = [] as any[] } = useQuery({ queryKey: ['outlets'], queryFn: () => fetchSafeArray('/api/outlets') });

  // ========================================================================
  // 3. FUNGSI AUTENTIKASI
  // ========================================================================
  useEffect(() => {
    const token = sessionStorage.getItem('pelangi_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('pelangi_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError('Username atau kata sandi salah.');
      }
    } catch (error) {
      setLoginError('Koneksi ke server gagal.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setSettingsMessage({ type: 'error', text: 'Kata sandi baru tidak cocok.' });
      return;
    }

    if (newPassword.length < 6) {
      setSettingsMessage({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    try {
      const token = sessionStorage.getItem('pelangi_admin_token');
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        setSettingsMessage({ type: 'success', text: 'Kata sandi berhasil diubah!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errData = await response.json();
        setSettingsMessage({ type: 'error', text: errData.message || 'Gagal mengubah kata sandi.' });
      }
    } catch (error) {
      setSettingsMessage({ type: 'error', text: 'Koneksi ke server gagal.' });
    }
  };

  // ========================================================================
  // 4. FUNGSI DATA DASHBOARD & DRAG N DROP
  // ========================================================================
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      sessionStorage.removeItem('pelangi_admin_token');
      setIsAuthenticated(false);
      setMainTab('dashboard');
      navigate('/');
    }
  };

  const handleToggleVisibility = async (id: number, type: string) => {
    try {
      const response = await fetch(`/api/${type}/${id}/toggle`, {
        method: 'PUT',
      });

      if (response.ok) {
        const queryMap: { [key: string]: string } = { product: 'products', news: 'news-events', promo: 'promos', outlet: 'outlets' };
        queryClient.invalidateQueries({ queryKey: [queryMap[type] || type] });
      } else {
        alert("Failed to update visibility.");
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const handleRemove = async (id: number, type: string) => {
    if (window.confirm("Are you sure you want to permanently delete this item? (Consider setting it to Inactive instead!)")) {
      const endpoints: { [key: string]: string } = {
        product: 'products',
        news: 'news_events',
        promo: 'promos',
        outlet: 'outlets'
      };

      try {
        const response = await fetch(`/api/${endpoints[type]}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const queryMap: { [key: string]: string } = { product: 'products', news: 'news-events', promo: 'promos', outlet: 'outlets' };
          queryClient.invalidateQueries({ queryKey: [queryMap[type] || type] });
        } else {
          alert("Failed to delete item from database.");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // --- NEW: FUNGSI DRAG AND DROP REORDERING ---
  const handleDrop = async (e: React.DragEvent, dropIdx: number, type: string, currentList: any[]) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    if (searchQuery.trim() !== '') return; // Mencegah reorder jika pengguna sedang memfilter/mencari

    // Modifikasi urutan array secara lokal
    const newArray = [...currentList];
    const draggedItem = newArray.splice(draggedIdx, 1)[0];
    newArray.splice(dropIdx, 0, draggedItem);

    // Kumpulkan ID dengan urutan yang baru
    const orderedIds = newArray.map(item => item.id);

    try {
      const response = await fetch(`/api/${type}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids: orderedIds })
      });

      if (response.ok) {
        const queryMap: { [key: string]: string } = { product: 'products', news: 'news-events', promo: 'promos', outlet: 'outlets' };
        queryClient.invalidateQueries({ queryKey: [queryMap[type] || type] });
      } else {
        alert("Gagal merubah urutan database.");
      }
    } catch (error) {
      console.error("Reorder error:", error);
    } finally {
      setDraggedIdx(null);
    }
  };

  // --- NEW: Fungsi ubah tab agar Search reset ---
  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery(''); 
  };

  const openModal = (type: string) => {
    setEditingItem(null);
    if (type === 'product') {
      setVariants([]);
      setIsAddProductModalOpen(true);
    }
    if (type === 'news') setIsAddNewsModalOpen(true);
    if (type === 'promo') setIsAddPromoModalOpen(true);
    if (type === 'outlet') setIsAddOutletModalOpen(true);
  };

  const openEditModal = (item: any, type: string) => {
    setEditingItem(item);
    
    if (type === 'product') {
      if (item.variants && item.variants.length > 0) {
        const mappedVariants = item.variants.map((v: any) => ({
          name: v.name || '',
          price: v.price || '',
          existing_image: v.image || v.existing_image || '',
          tiers: v.tiers ? v.tiers.map((t: any) => ({ min_qty: t.min_qty, price: t.price })) : []
        }));
        setVariants(mappedVariants);
      } else {
        setVariants([]);
      }
      setIsAddProductModalOpen(true);
    }
    
    if (type === 'news') setIsAddNewsModalOpen(true);
    if (type === 'promo') setIsAddPromoModalOpen(true);
    if (type === 'outlet') setIsAddOutletModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const brandVal = formData.get('brand');
    if (typeof brandVal === 'string' && brandVal.trim() !== '') {
    const cleanBrand = brandVal
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    formData.set('brand', cleanBrand);
    }

    const endpoints: { [key: string]: string } = {
      product: 'products',
      news: 'news_events',
      promo: 'promos',
      outlet: 'outlets'
    };

    const url = `/api/${endpoints[type]}`;
    const method = editingItem ? 'PUT' : 'POST';
    const fetchUrl = editingItem ? `${url}/${editingItem.id}` : url;

    try {
      const response = await fetch(fetchUrl, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const queryMap: { [key: string]: string } = { product: 'products', news: 'news-events', promo: 'promos', outlet: 'outlets' };
        queryClient.invalidateQueries({ queryKey: [queryMap[type] || type] });
        
        setIsAddProductModalOpen(false);
        setIsAddNewsModalOpen(false);
        setIsAddPromoModalOpen(false);
        setIsAddOutletModalOpen(false);
        setEditingItem(null);
      } else {
        // --- MENANGKAP PESAN ERROR DARI BACKEND ---
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || "Terjadi kesalahan pada database.";
        alert(`⚠️ GAGAL MENYIMPAN:\n\n${errorMessage}`);
      }
    } catch (error) {
      // --- PERINGATAN JIKA SERVER MATI/CRASH ---
      alert("⚠️ Peringatan:\nGagal terhubung ke server. Pastikan internet lancar atau backend menyala.");
      console.error("Submission error:", error);
    }
  };

  // --- SAFE MAPPING ---
  const safeProducts = Array.isArray(products) ? products : [];
  const groupedProducts = safeProducts.map((p: any) => ({
    ...p,
    variants: Array.isArray(p.variants) ? p.variants.filter((v: any) => v && v.name && v.name !== 'Default') : []
  }));

  // --- NEW: LOGIKA FILTERING (PENCARIAN) ---
  const q = searchQuery.toLowerCase();
  
  const filteredProducts = (groupedProducts as any[])
    .filter((p: any) => activeTab === 'products' ? (p.brand || '').toLowerCase() !== 'morning star' : (p.brand || '').toLowerCase() === 'morning star')
    .filter((p: any) => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  
  const filteredNews = newsList.filter((n: any) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
  const filteredPromos = promos.filter((p: any) => (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  const filteredOutlets = outlets.filter((o: any) => (o.name || '').toLowerCase().includes(q) || (o.address || '').toLowerCase().includes(q));


  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const catName = formData.get('name');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName })
      });
      const data = await res.json();
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        form.reset();
      } else {
        alert(data.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category", error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this category?")) {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        } else {
          alert(data.error || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category", error);
      }
    }
  };

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ========================================================================
  // RENDER 1: LOADING SCREEN
  // ========================================================================
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat...</div>;
  }

  // ========================================================================
  // RENDER 2: LOGIN SCREEN
  // ========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-center">
            <img src="/logo pelangi.png" alt="Pelangi Admin" className="h-16 mx-auto mb-4 object-contain invert" />
            <h2 className="text-xl font-medium text-white tracking-widest uppercase">Admin Portal</h2>
          </div>
          
          <form onSubmit={handleLogin} className="p-8">
            {loginError && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg text-center font-medium">
                {loginError}
              </div>
            )}
            
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            
            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold tracking-widest uppercase text-sm py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'Memproses...' : 'Login Ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER 3: SECURE DASHBOARD
  // ========================================================================
  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800 animate-fade-in">
      
      {/* NAVBAR GLOBAL ADMIN */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-4">
          <img src="/logo pelangi.png" alt="Pelangi" className="h-8 invert" />
          <span className="text-sm font-bold tracking-widest uppercase text-slate-400 border-l border-slate-600 pl-4">Workspace</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMainTab('dashboard')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${mainTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Data Utama
          </button>
          <button
            onClick={() => setMainTab('settings')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${mainTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Pengaturan Akun
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-bold text-rose-400 hover:text-rose-300 ml-4 px-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* --- TAB: PENGATURAN KATA SANDI --- */}
      {mainTab === 'settings' && (
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-light text-slate-800 mb-8">Pengaturan Akun</h1>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Ubah Kata Sandi</h2>
              <p className="text-sm text-slate-500 mb-8">Pastikan akun admin Anda tetap aman dengan memperbarui kata sandi secara berkala.</p>

              {settingsMessage.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                  settingsMessage.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {settingsMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi Baru</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Sandi Baru</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white font-bold tracking-widest uppercase text-xs px-8 py-4 rounded-xl transition-colors shadow-md">
                    Simpan Kata Sandi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* --- TAB: DASHBOARD DATA UTAMA --- */}
      {mainTab === 'dashboard' && (
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* --- SIDEBAR KIRI --- */}
          <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col hidden md:flex h-full">
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Dashboard</p>
              <button onClick={() => changeTab('analytics')} className={`w-full text-left px-4 py-2.5 rounded transition-colors ${activeTab === 'analytics' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>📊 Analytics</button>
              
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Inventory</p>
              <button onClick={() => changeTab('morning-star')} className={`w-full text-left px-4 py-2.5 rounded transition-colors ${activeTab === 'morning-star' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>⭐ Morning Star Product</button>
              <button onClick={() => changeTab('products')} className={`w-full text-left px-4 py-2.5 rounded transition-colors ${activeTab === 'products' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>📦 Brand </button>
              
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Store Management</p>
              <button onClick={() => changeTab('news')} className={`w-full text-left px-4 py-2.5 rounded transition-colors ${activeTab === 'news' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>📰 News & Events</button>
              <button onClick={() => changeTab('promos')} className={`w-full text-left px-4 py-2.5 rounded transition-colors ${activeTab === 'promos' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>🎟️ Layanan</button>
              <button onClick={() => changeTab('outlets')} className={`w-full text-left px-4 py-2.5 rounded transition-colors ${activeTab === 'outlets' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 hover:text-white'}`}>🏪 Outlets</button>
            </nav>
          </aside>

          {/* --- AREA KONTEN UTAMA --- */}
          <main className="flex-1 flex flex-col h-full overflow-y-auto">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
              <h1 className="text-xl font-medium text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
            </header>

            <div className="p-8">
              
              {/* ANALYTICS VIEW */}
              {activeTab === 'analytics' && (
                <div className="animate-fade-in space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium mb-1">Total Catalog</p>
                      <p className="text-3xl font-light text-slate-800">{groupedProducts.length} Products</p>
                    </div>
                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium mb-1">Active Campaigns</p>
                      <p className="text-3xl font-light text-amber-500">{promos.filter((p: any) => p.status === 'Active').length + newsList.filter((n: any) => n.status === 'Published').length} Running</p>
                    </div>
                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                      <p className="text-sm text-slate-500 font-medium mb-1">Store Network</p>
                      <p className="text-3xl font-light text-sky-500">{outlets.filter((o: any) => o.status === 'Active').length} Active Branches</p>
                    </div>
                  </div>

                  {/* TOP PERFORMING PRODUCTS */}
                  <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50"><h3 className="font-medium text-slate-800">Product List Preview</h3></div>
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3">Product Name</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Analytics preview doesn't need drag and drop */}
                        {[...(groupedProducts as any[])].reverse().slice(0, 10).map((product: any) => (
                          <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${product.category_id === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{product.category || 'Other'}</span></td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{product.status || 'Active'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SHARED VIEW (PENCARIAN, DRAG N DROP & TABEL) */}
              {activeTab !== 'analytics' && (
                <div className="animate-fade-in">
                  
                  {/* --- BAGIAN PENCARIAN & TOMBOL TAMBAH --- */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div className="w-full lg:w-96 relative">
                      <input 
                        type="text" 
                        placeholder={`Cari di ${activeTab.replace('-', ' ')}...`} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 shadow-sm" 
                      />
                      <svg className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    
                    <div className="space-x-3 shrink-0">
                      {(activeTab === 'products' || activeTab === 'morning-star') && (
                        <button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 rounded text-sm font-medium transition-colors shadow-sm">+ Add Category</button>
                      )}
                      <button onClick={() => openModal(activeTab === 'morning-star' || activeTab === 'products' ? 'product' : activeTab === 'news' ? 'news' : activeTab === 'promos' ? 'promo' : 'outlet')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors shadow-sm">+ Add New Item</button>
                    </div>
                  </div>

                  {/* --- PESAN INFORMASI DRAG AND DROP --- */}
                  {searchQuery === '' ? (
                    <p className="text-xs text-slate-400 mb-3 font-medium flex items-center gap-1">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                       Tarik dan lepas (Drag & Drop) ikon titik enam di sebelah kiri tabel untuk mengubah urutan.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 mb-3 font-bold">⚠️ Fitur Drag & Drop dinonaktifkan sementara saat sedang melakukan pencarian.</p>
                  )}

                  <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                      
                      {/* --- HEADERS --- */}
                      {(activeTab === 'products' || activeTab === 'morning-star') && (
                        <thead className="bg-slate-50 text-slate-400 uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 w-10"></th>
                            <th className="px-6 py-3">Product Name</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Brand</th> 
                            <th className="px-6 py-3">Variants</th>
                            <th className="px-6 py-3">Base Price</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                      )}

                      {activeTab === 'news' && (
                        <thead className="bg-slate-50 text-slate-400 uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 w-10"></th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Event Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                      )}

                      {activeTab === 'promos' && (
                        <thead className="bg-slate-50 text-slate-400 uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 w-10"></th>
                            <th className="px-6 py-3">Promo Title</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Branch</th>
                            <th className="px-6 py-3">Valid Until</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                      )}

                      {activeTab === 'outlets' && (
                        <thead className="bg-slate-50 text-slate-400 uppercase text-xs border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 w-10"></th>
                            <th className="px-6 py-3">Branch Name</th>
                            <th className="px-6 py-3">WhatsApp</th>
                            <th className="px-6 py-3">Google Maps</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                      )}

                      {/* --- ROWS (DENGAN DRAG AND DROP) --- */}
                      <tbody className="divide-y divide-slate-100">
                        
                        {(activeTab === 'products' || activeTab === 'morning-star') && filteredProducts.map((product: any, index: number) => (   
                          <tr key={product.id} draggable={searchQuery === ''} onDragStart={() => setDraggedIdx(index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, index, 'product', filteredProducts)} className={`hover:bg-slate-50 transition-colors ${product.status === 'Inactive' ? 'opacity-50' : ''} ${draggedIdx === index ? 'opacity-30 bg-slate-100' : ''}`}>
                            <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg></td>
                            <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                            <td className="px-6 py-4">{product.category || (product.category_id === 1 ? 'Morning Star' : `Category ${product.category_id}`)}</td>
                            <td className="px-6 py-4 font-medium text-sky-600">{product.brand || 'General'}</td>
                            <td className="px-6 py-4"><span className="truncate max-w-[150px] block">{product.variants && product.variants.length > 0 ? product.variants.map((v: any) => v.name).join(', ') : 'Default'}</span></td>
                            <td className="px-6 py-4">
                              Rp {Number(
                                product.price && Number(product.price) > 0 
                                  ? product.price 
                                  : (product.variants && product.variants.length > 0 ? product.variants[0].price : 0)
                              ).toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{product.status || 'Active'}</span></td>
                            <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                              <button onClick={() => handleToggleVisibility(product.id, 'product')} className="text-indigo-500 hover:text-indigo-700 font-medium">{product.status === 'Inactive' ? 'Set Active' : 'Set Inactive'}</button>
                              <button onClick={() => openEditModal(product, 'product')} className="text-sky-500 hover:text-sky-700 font-medium">Edit</button>
                              <button onClick={() => handleRemove(product.id, 'product')} className="text-rose-500 hover:text-rose-700 font-medium">Remove</button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'news' && filteredNews.map((news: any, index: number) => (
                          <tr key={news.id} draggable={searchQuery === ''} onDragStart={() => setDraggedIdx(index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, index, 'news', filteredNews)} className={`hover:bg-slate-50 transition-colors ${news.status !== 'Published' ? 'opacity-50' : ''} ${draggedIdx === index ? 'opacity-30 bg-slate-100' : ''}`}>
                            <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg></td>
                            <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{news.title}</td>
                            <td className="px-6 py-4"><span className="truncate max-w-[200px] block">{news.content || news.description || 'N/A'}</span></td>
                            <td className="px-6 py-4">{news.date ? new Date(news.date).toLocaleDateString('en-GB') : 'N/A'}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${news.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{news.status}</span></td>
                            <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                              <button onClick={() => handleToggleVisibility(news.id, 'news')} className="text-indigo-500 hover:text-indigo-700 font-medium">{news.status === 'Published' ? 'Unpublish' : 'Publish'}</button>
                              <button onClick={() => openEditModal(news, 'news')} className="text-sky-500 hover:text-sky-700 font-medium">Edit</button>
                              <button onClick={() => handleRemove(news.id, 'news')} className="text-rose-500 hover:text-rose-700 font-medium">Remove</button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'promos' && filteredPromos.map((promo: any, index: number) => (
                          <tr key={promo.id} draggable={searchQuery === ''} onDragStart={() => setDraggedIdx(index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, index, 'promo', filteredPromos)} className={`hover:bg-slate-50 transition-colors ${promo.status === 'Inactive' ? 'opacity-50' : ''} ${draggedIdx === index ? 'opacity-30 bg-slate-100' : ''}`}>
                            <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg></td>
                            <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{promo.title}</td>
                            <td className="px-6 py-4"><span className="truncate max-w-[200px] block">{promo.description}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap">{promo.branch || 'All Outlets'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('en-GB') : 'N/A'}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${promo.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{promo.status}</span></td>
                            <td className="px-6 py-3 text-right space-x-4 whitespace-nowrap">
                                <button onClick={() => handleToggleVisibility(promo.id, 'promo')} className="text-indigo-500 hover:text-indigo-700 font-medium">{promo.status === 'Active' ? 'Set Inactive' : 'Set Active'}</button>
                                <button onClick={() => openEditModal(promo, 'promo')} className="text-sky-500 hover:text-sky-700 font-medium">Edit</button>
                                <button onClick={() => handleRemove(promo.id, 'promo')} className="text-rose-500 hover:text-rose-700 font-medium">Remove</button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'outlets' && filteredOutlets.map((outlet: any, index: number) => (
                          <tr key={outlet.id} draggable={searchQuery === ''} onDragStart={() => setDraggedIdx(index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, index, 'outlet', filteredOutlets)} className={`hover:bg-slate-50 transition-colors ${outlet.status === 'Inactive' ? 'opacity-50' : ''} ${draggedIdx === index ? 'opacity-30 bg-slate-100' : ''}`}>
                            <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg></td>
                            <td className="px-6 py-4 font-medium text-slate-800">{outlet.name}</td>
                            <td className="px-6 py-4">{outlet.whatsapp || 'N/A'}</td>
                            <td className="px-6 py-4">
                              {outlet.gmaps ? (
                                <a href={outlet.gmaps} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">View Map</a>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4"><span className="truncate max-w-[200px] block">{outlet.address || 'N/A'}</span></td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${outlet.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{outlet.status || 'Active'}</span></td>
                            <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                            <button onClick={() => handleToggleVisibility(outlet.id, 'outlet')} className="text-indigo-500 hover:text-indigo-700 font-medium">{outlet.status === 'Inactive' ? 'Set Active' : 'Set Inactive'}</button>
                            <button onClick={() => openEditModal(outlet, 'outlet')} className="text-sky-500 hover:text-sky-700 font-medium">Edit</button>
                            <button onClick={() => handleRemove(outlet.id, 'outlet')} className="text-rose-500 hover:text-rose-700 font-medium">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* --- MODALS BAWAAN TETAP UTUH --- */}
          {/* 1. PRODUCT MODAL */}
          {isAddProductModalOpen && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-md shadow-xl w-full max-w-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-medium text-slate-800">{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={() => setIsAddProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, 'product')} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input name="name" type="text" defaultValue={editingItem?.name} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" /></div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select name="category_id" defaultValue={editingItem?.category_id || (activeTab === 'morning-star' ? '1' : '')} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50">
                                <option value="" disabled>Select Category</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                            <input name="brand" type="text" defaultValue={editingItem?.brand || (activeTab === 'morning-star' ? 'Morning Star' : '')} placeholder="e.g. Joyko" className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (Rp)</label>
                            <input 
                              name="price" 
                              type="number" 
                              defaultValue={editingItem?.price || (variants && variants.length > 0 ? variants[0].price : '')} 
                              className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" 
                            />
                        </div>
                    </div>

                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea name="description" rows={2} defaultValue={editingItem?.description} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50"></textarea></div>
                    
                    <div className="space-y-4 w-full">
                        {variants.map((_variant: any, index: number) => (
                            <div key={`${editingItem?.id || 'new'}-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-lg shadow-sm items-start relative">
                                
                                <input
                                    name={`variant_name_${index}`}
                                    defaultValue={_variant.name}
                                    placeholder="Variant Name (e.g. Red)"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
                                />
                                
                                <input
                                    name={`variant_price_${index}`}
                                    defaultValue={_variant.price}
                                    placeholder="Base Price"
                                    type="number"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
                                />
                                
                                <div className="w-full">
                                    <input type="hidden" name={`existing_variant_image_${index}`} value={_variant.existing_image || ''} />
                                    {_variant.existing_image && (
                                      <div className="text-[10px] text-emerald-600 font-semibold mb-1 flex items-center gap-1">
                                        <span>✅ Image saved.</span>
                                      </div>
                                    )}
                                    <input type="file" name={`variant_image_${index}`} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-200 file:text-slate-700" accept="image/*" />
                                </div>

                                <button type="button" onClick={() => removeVariant(index)} className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center justify-center py-1.5 border border-rose-200 bg-rose-50 rounded">
                                    Remove Variant
                                </button>

                                <div className="col-span-1 md:col-span-4 mt-2 border-t border-slate-200 pt-3">
                                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Harga Grosir / Paket (Opsional)</label>
                                  {_variant.tiers && _variant.tiers.map((tier: any, tIndex: number) => (
                                    <div key={`tier-${index}-${tIndex}`} className="flex items-center gap-3 mb-2">
                                      <div className="flex items-center gap-2 w-2/5">
                                        <span className="text-xs text-slate-400 font-medium">Beli ≥</span>
                                        <input type="number" name={`variant_tier_min_qty_${index}_${tIndex}`} value={tier.min_qty} onChange={(e) => handleTierChange(index, tIndex, 'min_qty', e.target.value)} placeholder="Qty (e.g. 5)" className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sky-500" />
                                      </div>
                                      <div className="flex items-center gap-2 w-2/5">
                                        <span className="text-xs text-slate-400 font-medium">Rp</span>
                                        <input type="number" name={`variant_tier_price_${index}_${tIndex}`} value={tier.price} onChange={(e) => handleTierChange(index, tIndex, 'price', e.target.value)} placeholder="Harga per pcs" className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-sky-500" />
                                      </div>
                                      <button type="button" onClick={() => removeTier(index, tIndex)} className="text-slate-400 hover:text-rose-500 text-xs font-bold w-1/5 text-right">
                                        Hapus
                                      </button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => addTier(index)} className="text-emerald-600 text-[11px] font-bold mt-1 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded">
                                    + Tambah Tier Harga
                                  </button>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addVariant} className="text-sky-600 text-sm font-semibold hover:text-sky-800 transition-colors py-2">
                            + Add Another Variant
                        </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        Upload Product Image
                        {editingItem?.base_image_url && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">✅ Saved</span>}
                      </label>
                      <input name="image" type="file" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 cursor-pointer border border-slate-200 rounded p-1" />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsAddProductModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">{editingItem ? 'Save Changes' : 'Save Product'}</button>
                    </div>
                    </form>
                </div>
              </div>
          )}

          {/* MANAGE CATEGORY MODAL */}
          {isAddCategoryModalOpen && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                        <h3 className="text-lg font-medium text-slate-800">Manage Categories</h3>
                        <button onClick={() => setIsAddCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                        <form onSubmit={handleAddCategory} className="mb-8 flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Category Name</label>
                                <input name="name" type="text" required placeholder="e.g., Notebooks" className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-medium rounded hover:bg-emerald-600 shadow-sm h-[38px] whitespace-nowrap">Add</button>
                        </form>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Existing Categories</h4>
                            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-md bg-slate-50 overflow-hidden shadow-sm">
                                {categories.map((cat: any) => (
                                    <li key={cat.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                        {cat.id !== 1 ? (
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-[11px] text-rose-500 hover:text-rose-700 font-bold px-2 py-1 bg-rose-50 rounded hover:bg-rose-100 transition-colors uppercase tracking-wider">Remove</button>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Default</span>
                                        )}
                                    </li>
                                ))}
                                {categories.length === 0 && <li className="p-4 text-sm text-slate-500 text-center">No categories found.</li>}
                            </ul>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
                        <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium">Close</button>
                    </div>
                </div>
                </div>
            )}

          {/* 2. NEWS MODAL */}
          {isAddNewsModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-medium text-slate-800">{editingItem ? 'Edit News/Event' : 'Add News/Event'}</h3>
                    <button onClick={() => setIsAddNewsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, 'news')} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input name="title" type="text" required defaultValue={editingItem?.title} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" /></div>
                    
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Description / Content</label>
                    <textarea name="content" required rows={3} defaultValue={editingItem?.content || editingItem?.description} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50"></textarea></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label>
                      <input name="date" type="date" required defaultValue={formatDateForInput(editingItem?.date)} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" /></div>
                      
                      <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select name="status" defaultValue={editingItem?.status || 'Published'} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50">
                        <option value="Published">Published</option>
                        <option value="Unpublished">Unpublished</option>
                        <option value="Finished">Finished</option>
                      </select></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        Upload Display Image
                        {editingItem?.image_url && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">✅ Saved</span>}
                      </label>
                      <input name="image" type="file" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 cursor-pointer border border-slate-200 rounded p-1" />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsAddNewsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">{editingItem ? 'Save Changes' : 'Post News'}</button>
                    </div>
                    </form>
                </div>
                </div>
            )}

          {/* 3. ADD PROMO MODAL */}
            {isAddPromoModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-medium text-slate-800">{editingItem ? 'Edit Promo' : 'Add Promo Announcement'}</h3>
                        <button onClick={() => setIsAddPromoModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, 'promo')} className="p-6 space-y-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Promo Title</label>
                        <input name="title" type="text" required defaultValue={editingItem?.title} className="w-full border border-slate-300 rounded px-3 py-2" /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Select Branch</label>
                            <select name="branch" defaultValue={editingItem?.branch || 'All Outlets'} className="w-full border border-slate-300 rounded px-3 py-2">
                            {outlets.map((o: any) => <option key={o.id} value={o.name}>{o.name}</option>)}
                            <option value="All Outlets">All Outlets</option>
                            </select></div>

                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select name="status" defaultValue={editingItem?.status || 'Active'} className="w-full border border-slate-300 rounded px-3 py-2">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select></div>
                        </div>

                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" required rows={3} defaultValue={editingItem?.description} className="w-full border border-slate-300 rounded px-3 py-2"></textarea></div>
                        
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Valid Until (Opsional)</label>
                            <input name="validUntil" type="date" defaultValue={formatDateForInput(editingItem?.validUntil)} className="w-full border border-slate-300 rounded px-3 py-2" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                            Upload Promo Banner
                            {editingItem?.image_url && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">✅ Saved</span>}
                          </label>
                          <input name="image" type="file" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 cursor-pointer border border-slate-200 rounded p-1" />
                        </div>

                        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsAddPromoModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm rounded">{editingItem ? 'Save Changes' : 'Announce Promo'}</button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

          {/* 4. OUTLET MODAL */}
          {isAddOutletModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-md shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-medium text-slate-800">{editingItem ? 'Edit Outlet' : 'Add Physical Store'}</h3>
                    <button onClick={() => setIsAddOutletModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, 'outlet')} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                    <input name="name" type="text" required defaultValue={editingItem?.name} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" /></div>
                    
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                    <textarea name="address" required rows={2} defaultValue={editingItem?.address} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50"></textarea></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                        <input name="whatsapp" type="text" required defaultValue={editingItem?.whatsapp} className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-sky-500/50" /></div>
                        
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Link</label>
                        <input name="gmaps" type="url" required defaultValue={editingItem?.gmaps} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/50" /></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        Upload Storefront Photo
                        {editingItem?.image_url && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">✅ Saved</span>}
                      </label>
                      <input name="image" type="file" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 cursor-pointer border border-slate-200 rounded p-1" />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsAddOutletModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700">{editingItem ? 'Save Changes' : 'Save Outlet'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}