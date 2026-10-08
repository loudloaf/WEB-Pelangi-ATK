import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import { Helmet } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO
import LoadingScreen from '../components/LoadingScreen'; 

export default function Outlet() {
  const location = useLocation();
  const orderMessage = location.state?.orderMessage || "Halo, Pelangi! Saya ingin bertanya tentang layanan Anda.";

  // --- PENGATURAN FITUR GAMBAR ---
  // Ubah menjadi 'true' jika pelanggan ingin menampilkan gambar outlet lagi di masa depan
  const SHOW_IMAGES = false;

  const { data: outlets = [], isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: async () => {
      const res = await fetch('/api/outlets');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Only show 'Active' outlets to customers
      return data.filter((item: any) => item.status === 'Active');
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: 'always'
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* --- SETUP SEO DINAMIS UNTUK HALAMAN OUTLET --- */}
      <Helmet>
        <title>Lokasi Cabang | Pelangi Stationery</title>
        <meta name="description" content="Temukan lokasi cabang toko Pelangi Stationery terdekat. Kunjungi outlet kami untuk melihat koleksi alat tulis secara langsung atau pesan online melalui WhatsApp." />
      </Helmet>

      <div className="min-h-screen bg-transparent py-20 font-sans text-slate-800 animate-fade-in">
        
        {/* PAGE HEADER */}
        <div className="max-w-5xl mx-auto text-center mb-16 px-6">
          <h4 className="text-sky-500 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4">
            Lokasi Kami
          </h4>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-800 mb-6 tracking-tight">
            Temukan Outlet Pelangi<span className="text-amber-500">.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Kunjungi cabang terdekat kami untuk melihat koleksi lengkap secara langsung, atau hubungi kami via WhatsApp untuk pemesanan online.
          </p>
        </div>

        {/* OUTLET GRID */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {outlets.length === 0 && !isLoading && (
             <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 border-dashed">
               <p className="text-slate-500 font-medium">Belum ada outlet yang tersedia saat ini.</p>
             </div>
          )}

          {outlets.map((outlet : any) => (
            <div 
              key={outlet.id} 
              className="group bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
            >
              {/* Storefront Image - Dikontrol oleh variabel SHOW_IMAGES */}
              {SHOW_IMAGES && (
                <div className="relative w-full h-56 bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                  {outlet.image_url ? (
                    <img 
                      src={`/uploads/${outlet.image_url}`} 
                      alt={outlet.name}
                      loading="lazy"   
                      decoding="async" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=Outlet+Photo";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center text-slate-400">
                      <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                  )}
                </div>
              )}

              {/* Outlet Details */}
              <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-1">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{outlet.name}</h2>
                  <div className="flex items-start gap-2 text-slate-500">
                    <svg className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <p className="text-sm leading-relaxed">{outlet.address || 'Alamat belum tersedia.'}</p>
                  </div>
                </div>

                {/* Action Buttons (Pushed to bottom) */}
                <div className="mt-auto space-y-3">
                  
                  {/* 1. View on Maps Button */}
                  {outlet.gmaps && (
                    <a 
                      href={outlet.gmaps} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                      Buka di Google Maps
                    </a>
                  )}

                  {/* 2. WhatsApp Button */}
                  {outlet.whatsapp && (
                    <a 
                      href={`https://wa.me/${outlet.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(orderMessage)}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold tracking-widest uppercase text-xs hover:bg-[#1ebe57] transition-colors shadow-sm rounded-xl"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.888-.653-1.488-1.46-1.661-1.759-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      Chat Cabang Ini
                    </a>
                  )}
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}