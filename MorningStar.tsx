import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query'; // <-- ADDED: TanStack Query import
import { Helmet } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO
import LoadingScreen from '../components/LoadingScreen'; // Sesuaikan path jika file Anda berada di folder berbeda

export default function MorningStar() {
  // --- REMOVED standard isLoading and products useState, handled by React Query below ---
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  
  // --- NEW: State untuk melacak kuantitas yang dipilih ---
  const [quantity, setQuantity] = useState<number>(1);

  // --- NEW: Search and Category States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // --- ADDED: Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Fits perfectly in 2 or 5 column layouts

  // --- UPDATED: queryFn now just returns the raw API response. ---
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      return data;
    },
    select: (data: any[]) =>
      data
        .filter((p: any) =>
          (p.brand || '').toLowerCase() === 'morning star' &&
          p.status !== 'Inactive'
        )
        .map((p: any) => ({
          ...p,
          variants: (p.variants || []).filter((v: any) => v && v.name !== 'Default'),
        })),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: 'always'
  });

  // --- ADDED: Auto-reset to Page 1 when a user types a search or clicks a filter ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Handle opening the modal and setting the default variant
  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset kuantitas ke 1 setiap buka produk baru
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  };

  // 1. Dynamic Image: Pulls variant image if it exists, otherwise falls back to base image
  const displayImage = selectedVariant?.image
    ? `/uploads/${selectedVariant.image}`
    : (selectedProduct?.base_image_url ? `/uploads/${selectedProduct.base_image_url}` : null);
    
  // 2. Dynamic Price & Auto-Tier Logic
  let unitPrice = 0;
  let activeTierIndex = -1;

  if (selectedVariant) {
      unitPrice = selectedVariant.price; // Harga dasar eceran
      if (selectedVariant.tiers && selectedVariant.tiers.length > 0) {
          // Urutkan tier dari yang terbesar ke terkecil untuk mengecek kecocokan kuantitas
          const sortedTiers = [...selectedVariant.tiers].sort((a, b) => b.min_qty - a.min_qty);
          const applicableTier = sortedTiers.find(t => quantity >= t.min_qty);

          if (applicableTier) {
              unitPrice = applicableTier.price; // Ganti harga satuan dengan harga grosir
              // Cari index aslinya agar UI kotak grosirnya menyala otomatis
              activeTierIndex = selectedVariant.tiers.findIndex((t: any) => t.id === applicableTier.id);
          }
      }
  } else if (selectedProduct) {
      unitPrice = selectedProduct.price;
  }
  
  // Total Harga = Harga Satuan (Otomatis menyesuaikan tier) x Kuantitas
  const totalPrice = unitPrice * quantity;

  // Array of vibrant, omnidirectional aura glows
  const rainbowGlows = [
    'hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]',   // Red Aura
    'hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]',  // Orange Aura
    'hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]',  // Yellow Aura
    'hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]',   // Green Aura
    'hover:shadow-[0_0_40px_rgba(14,165,233,0.4)]',  // Sky Blue Aura
    'hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]',  // Indigo Aura
    'hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]',  // Purple Aura
  ];

  // --- NEW: Extract Unique Categories dynamically from the fetched products ---
  const availableCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // --- NEW: Filter products based on search query AND selected category ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // --- ADDED: Pagination Math ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // --- ADDED THIS TO SHOW THE LOADING SCREEN ---
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Koleksi Morning Star | Pelangi Stationery</title>
        <meta name="description" content="Jelajahi katalog eksklusif Morning Star di Pelangi Stationery. Alat tulis premium, buku catatan berkualitas tinggi, dan pilihan terbaik untuk Anda." />
      </Helmet>

      <div className="min-h-screen bg-transparent py-20 font-sans text-slate-800">
        
        {/* Header (Matched to News & Promo pages style) */}
        <div className="max-w-5xl mx-auto text-center mb-16 px-6">
          <h4 className="text-rose-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4">
            KATALOG EKSKLUSIF
          </h4>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 tracking-tight">
            Morning Star<span className="text-amber-500">.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
            Temukan koleksi alat tulis premium kami yang dibuat dengan cermat. Klik produk apa saja untuk melihat varian dan memesan langsung melalui WhatsApp.
          </p>
        </div>

        {/* --- NEW: Interactive Search & Category Layout --- */}
        <div className="max-w-5xl mx-auto px-6 mb-16 animate-fade-in">
          
          {/* Unique Category Panels */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {/* 'All Items' Default Button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`relative overflow-hidden px-6 py-2.5 rounded-2xl border transition-all duration-500 ease-out ${
                  selectedCategory === null
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xl scale-105'
                    : 'bg-white/50 backdrop-blur-sm text-slate-600 border-slate-200 hover:bg-white hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <span className="relative z-10 font-semibold text-sm tracking-wide">Semua Produk</span>
              </button>
              
              {/* Dynamic Category Buttons */}
              {availableCategories.map((cat: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative overflow-hidden group px-6 py-2.5 rounded-2xl border transition-all duration-500 ease-out ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xl scale-105'
                      : 'bg-white/50 backdrop-blur-sm text-slate-600 border-slate-200 hover:bg-white hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  <span className="relative z-10 font-semibold text-sm tracking-wide">{cat}</span>
                  {/* Subtle sky-blue background glow on hover for inactive buttons */}
                  {selectedCategory !== cat && (
                     <div className="absolute inset-0 bg-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Catalog Grid - Stationery Style (Edge-to-Edge Images, Crisp Borders) */}
        <div className="max-w-8xl mx-4 sm:mx-10 px-4 sm:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-10">
          {/* --- NEW: Show a message if no products match the search --- */}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 animate-fade-in">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="text-lg font-medium">Tidak ada produk yang cocok dengan pencarian Anda.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="mt-4 text-sky-500 hover:text-sky-600 font-semibold transition-colors">Hapus Filter</button>
            </div>
          )}

          {currentProducts.map((product, index) => {
            const glowColor = rainbowGlows[index % rainbowGlows.length];

            // --- NEW: LOGIKA FALLBACK GAMBAR & HARGA ---
            // Jika gambar utama kosong, ambil gambar dari varian pertama
            const gridImage = product.base_image_url
              ? product.base_image_url
              : (product.variants && product.variants.length > 0 && product.variants[0].image
                  ? product.variants[0].image
                  : null);
                  
            // Jika harga utama kosong/0, ambil harga eceran dari varian pertama
            const gridPrice = (product.price && Number(product.price) > 0)
              ? product.price
              : (product.variants && product.variants.length > 0
                  ? product.variants[0].price
                  : 0);

            return (
              <div
                key={product.id}
                onClick={() => handleOpenModal(product)}
                className={`group cursor-pointer bg-white border border-slate-200 rounded-3xl shadow-sm transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-1 ${glowColor}`}
              >
                {/* Edge-to-Edge Image Container */}
                <div className="relative w-full aspect-square bg-slate-50 rounded-3xl border-b border-slate-200 overflow-hidden">
                  {gridImage ? (
                    <img
                      src={`/uploads/${gridImage}`}
                      alt={product.name}
                      loading="lazy"  
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x600?text=Gambar+Tidak+Ditemukan";
                      }}
                    />
                  ) : (
                    // Graph Paper Fallback Pattern
                    <div className="w-full h-full bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center text-slate-400 text-sm">
                      Gambar Menyusul
                    </div>
                  )}
                </div>

                {/* Clean, minimalist text area */}
                <div className="p-5 text-left bg-white flex flex-col justify-between flex-1">
                  <h3 className="text-lg font-medium text-slate-800 mb-2 leading-snug line-clamp-2">{product.name}</h3>
                  <p className="text-s text-sky-600 font-bold tracking-wide mt-auto pt-2">
                    Rp {Number(gridPrice).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- ADDED: Pagination Controls UI (Only shows if there is more than 1 page) --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-16 space-x-2 animate-fade-in w-full">
            <button
              onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-white transition-colors font-semibold text-sm shadow-sm"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm ${
                  currentPage === page
                    ? 'bg-slate-800 text-white scale-110'
                    : 'bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-white transition-colors font-semibold text-sm shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="bg-transparent max-w-5xl w-full flex flex-col md:flex-row shadow-2xl relative border border-slate-200 rounded-3xl min-w-0 overflow-hidden max-h-[90vh]">
              
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-rose-500 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Modal Image Half */}
              <div className="md:w-1/2 h-64 md:h-auto md:min-h-[500px] relative border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 shrink-0">
                {displayImage ? (
                   <img
                   src={displayImage}
                   loading="lazy"  
                   decoding="async"  
                   className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
                   alt={selectedProduct.name}
                 />
                ) : (
                   <div className="w-full h-full absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center text-slate-400">
                     Gambar Menyusul
                   </div>
                )}
              </div>

              {/* Modal Content Half */}
              <div className="md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col bg-white min-w-0 overflow-y-auto">
                <div className="mt-auto md:mt-0">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-sky-500 font-bold mb-3">Morning Star</h4>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-900 mb-2 break-words">{selectedProduct.name}</h2>
                  
                  {/* TOTAL HARGA (Auto-Calculated) */}
                  <p className="text-2xl font-medium text-rose-600 mb-6">
                    Rp {Number(totalPrice).toLocaleString('id-ID')}
                  </p>
                  
                  <div className="prose prose-slate prose-sm mb-6 text-slate-500 leading-relaxed break-words break-all md:break-words whitespace-pre-wrap w-full">
                    <p>
                      {selectedProduct.description || "Produk eksklusif dari koleksi Morning Star."}
                    </p>
                  </div>

                  {/* --- NEW: UI VARIAN ALA SHOPEE, KUANTITAS & HARGA GROSIR --- */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && selectedProduct.variants[0].name !== 'Default' && (
                    <div className="border-t border-slate-100 pt-6 mb-8">
                      
                      {/* Bagian 1: Tombol Varian (Warna/Jenis) */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Pilihan Varian</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.variants.map((variant: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedVariant(variant);
                                setQuantity(1); // Reset ke 1 saat ganti varian
                              }}
                              className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${
                                selectedVariant?.name === variant.name
                                  ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {variant.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bagian 2: Pengatur Kuantitas (Counter) */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Jumlah Pesanan</label>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                            </button>
                            <span className="w-12 text-center font-semibold text-slate-800 text-sm">
                              {quantity}
                            </span>
                            <button 
                              onClick={() => setQuantity(prev => prev + 1)}
                              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border-l border-slate-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                          </div>
                          {activeTierIndex !== -1 && (
                             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm">
                               Harga Grosir Aktif!
                             </span>
                          )}
                        </div>
                      </div>

                      {/* Bagian 3: Tombol Paket Grosir */}
                      {selectedVariant && selectedVariant.tiers && selectedVariant.tiers.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-3 flex items-center justify-between">
                            <span>Harga Grosir / Paket</span>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-sm">Lebih Hemat</span>
                          </label>
                          <div className="flex flex-col gap-2">
                            {/* Tombol Eceran (Bawaan) */}
                            <button
                              onClick={() => setQuantity(1)} // Jika diklik, otomatis set kuantitas ke 1
                              className={`flex justify-between items-center px-3 sm:px-4 py-3 border rounded-md text-xs sm:text-sm transition-all duration-200 ${
                                activeTierIndex === -1
                                  ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500'
                                  : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-medium text-slate-700">Pembelian Eceran</span>
                              <span className="font-bold text-slate-900">Rp {Number(selectedVariant.price).toLocaleString('id-ID')}/pcs</span>
                            </button>

                            {/* Tombol Tiers (Grosir) */}
                            {selectedVariant.tiers.map((tier: any, tIdx: number) => (
                              <button
                                key={tIdx}
                                onClick={() => setQuantity(tier.min_qty)} // Jika diklik, langsung lompat ke minimum kuantitas tier ini
                                className={`flex justify-between items-center px-3 sm:px-4 py-3 border rounded-md text-xs sm:text-sm transition-all duration-200 ${
                                  activeTierIndex === tIdx
                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500'
                                    : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                <span className="font-medium text-slate-700">Beli ≥ {tier.min_qty} pcs</span>
                                <span className="font-bold text-slate-900 text-rose-600">Rp {Number(tier.price).toLocaleString('id-ID')}/pcs</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                  {/* --- END NEW UI --- */}

                </div>
                
                {/* WhatsApp Call to Action (Updated Text Logic) */}
                <a
                  href={`https://wa.me/6281210530003?text=${encodeURIComponent(
                    `Halo, saya tertarik untuk memesan produk berikut:\n\n` +
                    `Kategori: ${selectedProduct.category || 'Morning Star'}\n` +
                    `Produk: ${selectedProduct.name}\n` +
                    (selectedVariant && selectedVariant.name !== 'Default' ? `Varian: ${selectedVariant.name}\n` : '') +
                    `Jumlah: ${quantity} pcs\n` +
                    (activeTierIndex !== -1 
                      ? `Harga Satuan (Grosir): Rp ${Number(unitPrice).toLocaleString('id-ID')}\n` 
                      : `Harga Satuan (Eceran): Rp ${Number(unitPrice).toLocaleString('id-ID')}\n`
                    ) +
                    `*Total Harga: Rp ${Number(totalPrice).toLocaleString('id-ID')}*`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-bold tracking-widest uppercase text-xs hover:bg-[#1ebe57] transition-all shadow-sm rounded-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.888-.653-1.488-1.46-1.661-1.759-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Chat untuk Memesan
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}