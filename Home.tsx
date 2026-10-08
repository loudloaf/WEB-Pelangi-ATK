import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO

// 1. Carousel Data
const heroSlides = [
  {
    id: 1,
    image: "BG NEW 3.jpg.jpeg",
    eyebrow: "Selamat Datang Di",
    titleMain: "Pelangi Stationery",
    titleHighlight: "Tangan Pertama Grosir Atk dan Stationery",
    description: "Toko Pelangi berdiri sejak thn 2003 dan sampai sekarang dipercayai brand-brand ATK ternama sebagai distributor besar untuk menyuplai kebutuhan kantor dan sekolah. Sebagai sumber kulakan dengan item lengkap baik bisa ditemukan di toko offline yg tersebar di berbagai kota dan bisa dihubungi melalui kontak No. HP yg tersedia di kolom chat. Silahkan kontak dan kami siap melayani.",
    ctaText: "Temukan Cabang Kami",
    linkTo: "/outlet" 
  },
  {
    id: 2,
    image: "BG NEW 3.jpg.jpeg",
    eyebrow: "Layanan Lengkap & Terpercaya",
    titleMain: "Pusat Grosir Kulakan ",
    titleHighlight: "ATK Terlengkap.",
    description: "Nikmati harga grosir bertingkat yang makin hemat, gratis ongkir, hingga jangkauan pengiriman luar pulau. Tersedia juga layanan cetak, pembuatan parcel, dan pemesanan via e-commerce.",
    ctaText: "Lihat Pelayanan Kami",
    linkTo: "/promo" 
  },
  {
    id: 3,
    image: "BG NEW 3.jpg.jpeg",
    eyebrow: "Berbagai Pilihan",
    titleMain: "Temukan Merek Favorit Anda",
    titleHighlight: "Koleksi Lengkap.",
    description: "Dari Joyko hingga Faber-Castell, temukan semua merek alat tulis ternama di satu tempat untuk memenuhi kebutuhan kantor dan sekolah Anda.",
    ctaText: "Lihat Brand Lain",
    linkTo: "/product" 
  }
];

export default function Home() {
  const navigate = useNavigate(); 

  // --- SMART INTRO SCREEN STATE ---
  const [showIntro, setShowIntro] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. Check if the user has already seen the intro during this browser session
    const hasSeenIntro = sessionStorage.getItem('pelangi_intro_played');
    
    if (hasSeenIntro) {
      setShowIntro(false); // Skip the intro instantly!
      return;
    }

    // 2. If it is their first time, play the 3-second animation
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 2000);
    const removeTimer = setTimeout(() => {
      setShowIntro(false);
      sessionStorage.setItem('pelangi_intro_played', 'true'); // Remember they saw it
    }, 3000);
    
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);
  // --- END SMART INTRO SCREEN STATE ---

  const [currentSlide, setCurrentSlide] = useState(0);

  // 2. Manual Navigation Functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // 3. Auto-play effect
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds
    
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <>
      {/* --- SETUP SEO DINAMIS UNTUK HALAMAN HOME --- */}
      <Helmet>
        <title>Beranda | Pelangi Stationery</title>
        <meta name="description" content="Pusat kulakan alat tulis dan perlengkapan kantor terlengkap. Temukan koleksi Morning Star, Joyko, dan merek lainnya dengan harga grosir terbaik di Surabaya." />
      </Helmet>

      {/* --- FULL SCREEN INTRO ANIMATION --- */}
      {showIntro && (
        <div 
          className={`fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center transition-opacity duration-1000 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img 
            src="/logo pelangi.png" 
            alt="Logo Pelangi" 
            className="w-auto h-32 md:h-48 object-contain animate-pulse drop-shadow-sm" 
          />
        </div>
      )}
      {/* --- END INTRO ANIMATION --- */}

      <div className="main-page-wrapper flex flex-col w-full animate-fade-in">
        
        {/* HERO SECTION */}
        <section className="hero-section relative w-full h-[450px] sm:h-[500px] md:h-[600px] flex flex-col items-center justify-center text-center overflow-hidden mt-7 group">
          
          {/* CAROUSEL BACKGROUND IMAGES */}
          {heroSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              {/* KONTEN GAMBAR UNTUK CAROUSEL */}
              {slide.image && (
                <img 
                  src={slide.image} 
                  alt={slide.titleMain} 
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover object-center z-10"
                />
              )}
              
              {/* Overlay warna kuning untuk semua carousel */}
              <div className="absolute inset-0 bg-yellow-400/90"></div>
            </div>
          ))}

          {/* HERO TEXT CONTENT */}
          {/* Menambahkan -mt-8 md:-mt-16 untuk menarik seluruh kelompok teks ke atas */}
          <div className="hero-content-container relative mx-auto w-full z-10 px-4 sm:px-8 md:px-12 transition-all duration-700 animate-fade-in flex flex-col items-center justify-center text-center -mt-16 md:-mt-24">
            
            <p className="hero-eyebrow-text text-sm sm:text-base md:text-lg font-bold tracking-widest text-slate-600 uppercase mb-3 md:mb-4">
              {heroSlides[currentSlide].eyebrow}
            </p>

            <h1 className="hero-main-title flex flex-col items-center justify-center w-full text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 tracking-tight leading-tight mb-4 md:mb-6">
              <span>{heroSlides[currentSlide].titleMain}</span>
              <span className="hero-gradient-text font-medium text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-emerald-400 to-sky-400 md:whitespace-nowrap mt-2">
                {heroSlides[currentSlide].titleHighlight}
              </span>
            </h1>

            {/* Mengubah max-w-2xl menjadi max-w-4xl agar kotak teks lebih lebar dan barisnya berkurang */}
            <p className="hero-description text-sm sm:text-base md:text-lg text-slate-1000 mb-8 md:mb-10 max-w-4xl mx-auto font-medium">
              {heroSlides[currentSlide].description}
            </p>

            <button 
              onClick={() => navigate(heroSlides[currentSlide].linkTo || '/')}
              className="hero-cta-button px-6 md:px-8 py-2.5 md:py-3 bg-slate-800 text-slate-50 text-xs sm:text-sm font-medium rounded hover:bg-slate-700 transition-colors shadow-sm"
            >
              {heroSlides[currentSlide].ctaText}
            </button>
          </div>

          {/* --- LEFT AND RIGHT NAVIGATION ARROWS --- */}
          
          {/* Left Arrow */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-400 hover:text-slate-800 bg-slate-100/50 hover:bg-slate-100/80 backdrop-blur-sm rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Slide sebelumnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-slate-400 hover:text-slate-800 bg-slate-100/50 hover:bg-slate-100/80 backdrop-blur-sm rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Slide selanjutnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Navigation Dots */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {heroSlides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-slate-800 w-6' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Pergi ke slide ${index + 1}`}
              />
            ))}
          </div>

        </section>

        {/* --- RESELLER & GROSIR SECTION --- */}
        <section className="reseller-highlight-section w-full py-12 md:py-20 px-4 md:px-6 relative z-10 mt-12 md:mt-20">
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
            
            <div className="lg:w-1/2 p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-center relative bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <div className="relative z-10">
                <p className="text-xs sm:text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3 md:mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-emerald-600 inline-block"></span>
                  Mitra & Reseller Welcome
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heavy text-slate-800 mb-4 md:mb-6 tracking-tight leading-tight">
                  Pusat Kulakan Alat Tulis Terlengkap.
                </h2>
                <p className="text-slate-700 font-medium text-sm sm:text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-md">
                  Toko Pelangi membuka peluang usaha untuk Anda. Kami siap menjadi penyuplai andalan untuk kelancaran bisnis Anda dengan harga yang kompetitif.
                </p>
                
                <a 
                  href="https://wa.me/6281210530003" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-emerald-600 text-white text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 rounded-full hover:-translate-y-1 duration-300 w-fit"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Chat Admin Grosir
                </a>
              </div>
            </div>

            <div className="lg:w-1/2 p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-center gap-6 md:gap-8 bg-white">
              
              <div className="flex items-start gap-4 md:gap-5 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mb-1">Surabaya & Sekitarnya</h3>
                  <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed">
                    Pengiriman instan untuk area dalam kota, atau kunjungi langsung outlet kami untuk kemudahan berbelanja skala besar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:gap-5 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mb-1">Luar Kota & Luar Pulau</h3>
                  <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed">
                    Kami telah berpengalaman melayani pengiriman jarak jauh menggunakan ekspedisi cargo terpercaya dengan pengemasan super aman.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:gap-5 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mb-1">Harga Grosir Terbaik</h3>
                  <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed">
                    Dapatkan struktur harga bertingkat. Makin banyak jumlah pesanan Anda, makin besar pula margin keuntungan untuk bisnis Anda.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
        
        {/* ABOUT US SECTION */}
        <section className="about-section max-w-7xl mx-auto w-full px-4 md:px-6 py-12 md:py-24">
          <div className="about-grid grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            
            <div className="about-image-wrapper relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-rose-100 to-sky-100 rounded-sm opacity-50 group-hover:opacity-80 transition-opacity duration-700 blur-sm"></div>
              <img 
                src="P12.png" 
                alt="Tentang Pelangi" 
                className="relative w-full h-64 sm:h-80 md:h-[400px] object-cover rounded-sm shadow-sm border border-slate-200"
              />
            </div>

            <div className="about-text-content flex flex-col justify-center">
              <p className="about-eyebrow text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase mb-2 md:mb-3">
                Cerita Kami
              </p>
              <h2 className="about-title text-2xl sm:text-3xl md:text-4xl font-medium text-slate-800 leading-tight mb-4 md:mb-6">
                Mitra Terpercaya Kebutuhan Anda Sejak 2003.
              </h2>

              <div className="about-paragraphs space-y-4 md:space-y-5 text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
                <p>
                  Berdiri sejak tahun 2003, Toko Pelangi telah hadir selama lebih dari dua dekade sebagai solusi terpercaya untuk masyarakat. Kami tidak hanya melayani pelanggan perorangan, tetapi juga siap melayani pembelian grosir dengan penawaran harga yang kompetitif untuk mendukung kelancaran usaha Anda.
                </p>
                <p>
                  Kami berkomitmen untuk selalu memberikan pelayanan terbaik, dengan jam operasional toko setiap hari mulai pukul 08:00 hingga 21:00. Lebih dari sekadar penyedia barang, Pelangi juga sangat antusias dan terbuka untuk menjalin kerjasama bisnis maupun menjadi mitra kolaborasi dalam berbagai event Anda.
                </p>
              </div>
              
              <div className="w-16 h-0.5 bg-gradient-to-r from-rose-300 to-sky-300 mt-8 md:mt-10 rounded-full"></div>
            </div>

          </div>
        </section>

        {/* --- MORNING STAR HIGHLIGHT SECTION --- */}
        <section className="morning-star-section w-full py-12 md:py-20 px-4 md:px-6 relative z-10 mb-12 md:mb-20">
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row-reverse">
            
            <div className="lg:w-1/2 p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-center relative bg-gradient-to-bl from-amber-50 via-orange-50/30 to-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <div className="relative z-10">
                <p className="text-xs sm:text-sm font-bold tracking-widest text-amber-600 uppercase mb-3 md:mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-amber-600 inline-block"></span>
                  Koleksi Andalan Kami
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heavy text-slate-800 mb-4 md:mb-6 tracking-tight leading-tight">
                  Morning Star<span className="text-amber-500 font-bold">.</span>
                </h2>
                <p className="text-slate-700 font-medium text-sm sm:text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-md">
                  Rasakan puncak keahlian kami. Koleksi Morning Star menampilkan bahan yang dipilih dengan cermat, harga kompetitif, dan perhatian penuh pada detail bagi pencinta alat tulis sejati.
                </p>
                
                <Link 
                  to="/morning-star" 
                  className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-500/30 rounded-full hover:-translate-y-1 duration-300 w-fit"
                >
                  Jelajahi Koleksi
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 p-6 sm:p-10 md:p-16 lg:p-20 flex items-center justify-center bg-white relative">
               <img 
                 src="LOGO MS.jpeg" 
                 alt="Koleksi Morning Star" 
                 className="w-full h-auto max-w-md object-contain transition-transform duration-700 hover:scale-105 drop-shadow-sm" 
               />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}