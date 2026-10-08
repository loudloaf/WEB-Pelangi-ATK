import { useQuery } from '@tanstack/react-query'; 
import { Helmet } from 'react-helmet-async';
import LoadingScreen from '../components/LoadingScreen';

export default function Promo() {
  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['promos'],
    queryFn: async () => {
      const response = await fetch('/api/promos');
      if (!response.ok) throw new Error("Error fetching promos");
      const data = await response.json();
      
      const activePromos = data.filter((item: any) => item.status === 'Active');
      
      return [...activePromos].sort((a, b) => 
        new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
      );
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: 'always'
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getImageUrl = (filename: string | null) => {
    if (filename) return `/uploads/${filename}`;
    return "https://images.unsplash.com/photo-1522836924445-4478bdeb8eb7?auto=format&fit=crop&q=80&w=1200";
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Layanan & Fasilitas | Pelangi Stationery</title>
        <meta name="description" content="Temukan berbagai fasilitas dan layanan unggulan dari Pelangi Stationery untuk memenuhi kebutuhan Anda." />
      </Helmet>

      <div className="min-h-screen w-full flex flex-col items-center animate-fade-in pb-24 bg-transparent">
        
          {/* PAGE HEADER */}
          <header className="w-full py-20 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-semibold tracking-widest text-amber-500 uppercase mb-4">Fasilitas & Pelayanan</p>
              <h1 className="text-5xl md:text-6xl font-light text-slate-800 tracking-tight">Layanan Kami<span className="text-amber-400">.</span></h1>
              <p className="text-slate-500 mt-6 max-w-lg font-light text-lg">Kami berkomitmen untuk memberikan pengalaman belanja alat tulis terbaik dengan berbagai fasilitas dan layanan unggulan yang dirancang khusus untuk memenuhi kebutuhan Anda.</p>
              <div className="w-12 h-0.5 bg-slate-300 mt-8 rounded-full"></div>
          </header>

          {/* VOUCHER / SERVICE STACK */}
          <div className="max-w-4xl mx-auto px-6 w-full space-y-10 mb-20">
              {promos.length === 0 && !isLoading && (
                  <p className="text-center text-slate-400">Belum ada layanan yang ditambahkan. Silakan kembali lagi nanti!</p>
              )}
              
              {promos.map((promo) => (
                  <article 
                      key={promo.id} 
                      className="group relative flex flex-col md:flex-row bg-white/40 backdrop-blur-md rounded-sm border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                  >
                      {/* LEFT SIDE: Image */}
                      <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                          <img 
                              src={getImageUrl(promo.image_url)} 
                              alt={promo.title} 
                              loading="lazy"   
                              decoding="async" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-in-out"
                          />
                      </div>

                      {/* TICKET TEAR LINE */}
                      <div className="hidden md:flex flex-col justify-between items-center relative z-10 w-0">
                          <div className="w-4 h-4 rounded-full bg-[#f8fafc] border border-slate-200 absolute -top-2 -ml-2"></div>
                          <div className="h-full border-r-2 border-dashed border-slate-300/50 my-2"></div>
                          <div className="w-4 h-4 rounded-full bg-[#f8fafc] border border-slate-200 absolute -bottom-2 -ml-2"></div>
                      </div>

                      {/* RIGHT SIDE: Details */}
                      <div className="md:w-3/5 p-6 md:p-12 flex flex-col justify-center bg-white/20">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                                <h2 className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight sm:pr-4">
                                {promo.title}
                                </h2>
                                
                                {/* Hanya tampilkan label tanggal JIKA tanggal diisi di admin */}
                                {promo.validUntil && (
                                  <span className="bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm whitespace-nowrap w-fit">
                                    Berlaku Hingga {formatDate(promo.validUntil)}
                                  </span>
                                )}
                            </div>

                          <div className="mb-4">
                              <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-1 rounded">
                              Tersedia di: {promo.branch || 'Semua Outlet'}
                              </span>
                          </div>
                          
                          <p className="text-slate-600 font-light leading-relaxed mb-8">
                              {promo.description}
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between border-t border-slate-200/60 pt-6">
                              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Tanya Detail</p>
                              
                              {/* --- TOMBOL WHATSAPP BARU --- */}
                              <a 
                                  href={`https://wa.me/6281210530003?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang layanan: ${promo.title}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-white bg-emerald-500 px-6 py-2.5 rounded-sm hover:bg-emerald-600 transition-colors duration-300 shadow-sm text-center flex items-center gap-2"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.888-.653-1.488-1.46-1.661-1.759-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                  </svg>
                                  Tanya Admin
                              </a>
                          </div>
                      </div>
                  </article>
              ))}
          </div>
      </div>
    </>
  );
}