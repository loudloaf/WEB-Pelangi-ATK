import { useState } from 'react'; // <-- ADDED: useState for modal
import { useQuery } from '@tanstack/react-query'; 
import { Helmet } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO
import LoadingScreen from '../components/LoadingScreen'; 

export default function NewsEvent() {
  // --- ADDED: State to track which news article is open in the modal ---
  const [selectedNews, setSelectedNews] = useState<any>(null);

  // 1. Fetch data using useQuery instead of useEffect
  const { data: newsData = [], isLoading } = useQuery({
    queryKey: ['news-events'],
    queryFn: async () => {
      const response = await fetch('/api/news_events');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // --- THE CRITICAL FILTER ---
      // Only show posts that the Admin has marked as 'Published'
      return data.filter((item: any) => item.status === 'Published');
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: 'always'
  });

  // 3. Sort the data mathematically so the newest date is ALWAYS index 0
  const sortedNews = [...newsData].sort((a, b) => {
    // Fallback to created_at if the user forgot to input a specific event date
    const dateA = a.date || a.created_at;
    const dateB = b.date || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // 4. Separate the newest item from the rest of the older items
  const featuredNews = sortedNews[0];
  const olderNews = sortedNews.slice(1);

  // Helper function to make dates look pretty (e.g., "1 Juli 2026")
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Helper function to build the correct image URL or provide a fallback
  const getImageUrl = (filename: string | null) => {
    if (filename) return `/uploads/${filename}`;
    // Fallback image just in case an admin forgets to upload one!
    return "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800";
  };

  // --- ADDED: Intercept rendering to show the global Loading Screen ---
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* --- SETUP SEO DINAMIS UNTUK HALAMAN NEWS & EVENT --- */}
      <Helmet>
        <title>Berita & Acara | Pelangi Stationery</title>
        <meta name="description" content="Dapatkan informasi terbaru seputar rilisan produk alat tulis, promo menarik, dan acara komunitas di Pelangi Stationery." />
      </Helmet>

      <div className="w-full flex flex-col items-center animate-fade-in pb-24">
        
        {/* PAGE HEADER */}
        <header className="w-full py-20 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold tracking-widest text-sky-500 uppercase mb-4">Papan Pengumuman</p>
          <h1 className="text-5xl md:text-6xl font-light text-slate-800 tracking-tight">Berita & Acara<span className="text-sky-400">.</span></h1>
          <p className="text-slate-500 mt-6 max-w-lg font-light text-lg">Dapatkan informasi terbaru seputar rilisan produk kami, lokakarya komunitas, dan acara toko.</p>
          <div className="w-12 h-0.5 bg-slate-300 mt-8 rounded-full"></div>
        </header>

        {/* EMPTY STATE (If database has no published news) */}
        {!isLoading && sortedNews.length === 0 && (
            <div className="flex justify-center items-center py-20">
                <p className="text-slate-400">Silakan kembali lagi nanti untuk berita dan acara mendatang!</p>
            </div>
        )}

        <div className="max-w-7xl mx-auto px-6 w-full space-y-16">
          
          {/* THE FEATURED STORY (Always the newest item) */}
          {featuredNews && (
            <article 
              onClick={() => setSelectedNews(featuredNews)} // <-- ADDED: Open modal on click
              className="group cursor-pointer flex flex-col md:flex-row bg-white/60 backdrop-blur-md rounded-sm border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-500"
            >
              {/* --- KOTAK GAMBAR YANG SUDAH DIPERBAIKI --- */}
              <div className="md:w-3/5 min-h-[250px] md:min-h-[400px] overflow-hidden relative">
                <div className="absolute top-4 left-4 z-20 bg-slate-900 text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm">
                  {featuredNews.type || 'Berita Terkini'}
                </div>
                <img 
                  src={getImageUrl(featuredNews.image_url)} 
                  alt={featuredNews.title} 
                  loading="lazy"   
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>
              {/* ------------------------------------------- */}

              <div className="md:w-2/5 p-6 md:p-14 flex flex-col justify-center">
                <p className="text-sm text-slate-400 font-medium tracking-wide mb-3">{formatDate(featuredNews.date || featuredNews.created_at)}</p>
                <h2 className="text-3xl md:text-4xl font-light text-slate-800 leading-tight mb-5 group-hover:text-sky-600 transition-colors duration-300">
                  {featuredNews.title}
                </h2>
                <p className="text-slate-600 font-light leading-relaxed mb-8 line-clamp-4">
                  {featuredNews.content} 
                </p>
                <span className="text-sm font-medium text-slate-800 group-hover:text-sky-500 transition-colors flex items-center gap-2">
                  Baca Selengkapnya <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </article>
          )}

          {/* THE GRID LOGIC FOR OLDER STORIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {olderNews.map((news) => (
              <article 
                key={news.id} 
                onClick={() => setSelectedNews(news)} // <-- ADDED: Open modal on click
                className="group cursor-pointer flex flex-col bg-white/40 backdrop-blur-sm rounded-sm border border-slate-200 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1"
              >
                <div className="w-full h-64 overflow-hidden relative">
                  {news.type && (
                      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm border border-slate-200">
                      {news.type}
                      </div>
                  )}
                  <img 
                    src={getImageUrl(news.image_url)} 
                    alt={news.title}
                    loading="lazy"   
                    decoding="async" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <p className="text-xs text-slate-400 font-medium tracking-wide mb-3">{formatDate(news.date || news.created_at)}</p>
                  <h3 className="text-xl font-medium text-slate-800 leading-snug mb-3 group-hover:text-sky-600 transition-colors duration-300">
                    {news.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-light leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {news.content}
                  </p>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-sky-500 transition-colors">
                    Jelajahi +
                  </span>
                </div>
              </article>
            ))}
          </div>

        </div>

        {/* --- ADDED: THE NEWS MODAL --- */}
        {selectedNews && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="bg-white max-w-5xl w-full flex flex-col md:flex-row shadow-2xl relative rounded-3xl min-w-0 overflow-hidden max-h-[90vh]">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedNews(null)} 
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-rose-500 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Image Side */}
              <div className="md:w-2/5 h-64 md:h-auto md:min-h-[500px] relative bg-slate-50 shrink-0">
                <img 
                  src={getImageUrl(selectedNews.image_url)} 
                  alt={selectedNews.title}
                  loading="lazy"   
                  decoding="async"
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>

              {/* Content Side */}
              <div className="md:w-3/5 p-5 md:p-12 flex flex-col bg-white min-w-0 overflow-y-auto">
                {selectedNews.type && (
                  <span className="text-[10px] tracking-[0.2em] uppercase text-sky-500 font-bold mb-3 block">
                    {selectedNews.type}
                  </span>
                )}
                
                <h2 className="text-2xl md:text-4xl font-light text-slate-900 mb-4 break-words">
                  {selectedNews.title}
                </h2>
                
                <p className="text-sm text-slate-400 font-medium tracking-wide mb-8 border-b border-slate-100 pb-6">
                  Dipublikasikan pada {formatDate(selectedNews.date || selectedNews.created_at)}
                </p>
                
                {/* Full Article Content */}
                <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                  {selectedNews.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}