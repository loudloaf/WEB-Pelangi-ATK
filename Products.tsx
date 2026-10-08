import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO
import LoadingScreen from '../components/LoadingScreen';

export default function BrandCatalog() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // --- Search State (Brand Filter Removed) ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Fetch data
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    select: (data: any[]) =>
      data
        .filter((p: any) =>
          (p.brand || '').toLowerCase() !== 'morning star' &&
          p.status !== 'Inactive'
        ),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: 'always'
  });

  // Auto-reset to Page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter Logic (Hanya Nama dan Deskripsi)
  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Pagination Math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* --- SETUP SEO DINAMIS UNTUK HALAMAN PRODUCTS --- */}
      <Helmet>
        <title>Katalog Produk & Merek | Pelangi Stationery</title>
        <meta name="description" content="Temukan berbagai merek alat tulis dan perlengkapan kantor berkualitas tinggi seperti Joyko, Faber-Castell, dan lainnya di Pelangi Stationery." />
      </Helmet>

      <div className="min-h-screen w-full flex flex-col items-center pb-24 bg-transparent font-sans text-slate-800">
        
        <div className="max-w-7xl w-full mx-auto px-6 mb-12 mt-16">
          <h4 className="text-sky-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4">
            KATALOG MEREK
          </h4>
          <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-4 tracking-tight">
            Eksplorasi Koleksi Kami
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-3xl">
            Temukan berbagai merek alat tulis dan perlengkapan kantor berkualitas tinggi yang tersedia di toko kami.
          </p>
        </div>

        <div className="max-w-7xl w-full mx-auto px-6 mb-10 animate-fade-in">
          {/* Search Bar Container */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="Cari katalog berdasarkan nama atau deskripsi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-colors text-sm"
              />
            </div>
            {/* Dropdown Merek telah dihapus dari sini */}
          </div>
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed animate-fade-in">
              <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="text-sm font-medium">Tidak ada katalog yang cocok dengan pencarian Anda.</p>
              <button onClick={() => setSearchQuery('')} className="mt-3 text-xs text-sky-500 hover:text-sky-700 font-bold px-4 py-2 bg-sky-50 rounded-lg">Reset Pencarian</button>
            </div>
          )}

          {currentProducts.map((product) => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)}
              className="group cursor-pointer bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-sky-200"
            >
              <div className="relative w-full aspect-[4/3] bg-white border-b-2 border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {product.base_image_url ? (
                  <img 
                    src={`/uploads/${product.base_image_url}`} 
                    alt={product.name}
                    loading="lazy"   
                    decoding="async" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=Tidak+Ada+Gambar"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-slate-100">Tidak Ada Gambar</div>
                )}
              </div>
              <div className="p-3 md:p-4 text-left bg-white flex flex-col justify-center flex-1">
                <h3 className="text-xs md:text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{product.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-2 animate-fade-in w-full">
            <button
              onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm"
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
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="bg-transparent max-w-5xl w-full flex flex-col md:flex-row shadow-2xl relative rounded-3xl min-w-0 overflow-hidden max-h-[90vh]">
              
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-rose-500 transition-colors shadow-sm"
              >
                ✕
              </button>

              <div className="md:w-1/2 h-64 md:h-auto md:min-h-[500px] relative border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 shrink-0">
                {selectedProduct.base_image_url ? (
                   <img 
                      src={`/uploads/${selectedProduct.base_image_url}`} 
                      loading="lazy"   
                      decoding="async" 
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300" 
                      alt={selectedProduct.name} 
                    />
                ) : (
                   <div className="w-full h-full absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">Tidak Ada Gambar</div>
                )}
              </div>

              <div className="md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col bg-white min-w-0 overflow-y-auto">
                <div className="mt-auto md:mt-0">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-sky-500 font-bold mb-3">{selectedProduct.brand || 'Umum'}</h4>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-6 break-words">{selectedProduct.name}</h2>
                  
                  <div className="prose prose-slate prose-sm mb-8 text-slate-500 leading-relaxed border-b border-slate-100 pb-8 break-words break-all md:break-words whitespace-pre-wrap w-full">
                    <p>{selectedProduct.description || "Tidak ada deskripsi tersedia."}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const message = `Halo, saya tertarik dengan katalog produk berikut:\n\nMerek: ${selectedProduct.brand || 'Umum'}\nProduk: ${selectedProduct.name}\n\nApakah produk ini tersedia?`;
                    const phoneNumber = '6281210530003';
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="mt-auto w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white font-bold tracking-widest uppercase text-xs hover:bg-emerald-500 transition-all shadow-md hover:shadow-lg rounded-xl"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                TANYAKAN KETERSEDIAAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}