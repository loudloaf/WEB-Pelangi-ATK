import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-0 border-t border-slate-200 mt-auto relative z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
        {/* Ubah grid menjadi 4 kolom di layar besar (lg:grid-cols-4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* COLUMN 1: Logo, Deskripsi & Address */}
          <div className="flex flex-col items-start">
            <img src="/logo pelangi.png" alt="Pelangi ATK" className="h-16 object-contain mb-6" />
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Pusat kulakan alat tulis dan perlengkapan kantor terlengkap dengan harga grosir terbaik. Melayani kebutuhan Anda sejak 2003.
            </p>
          </div>

          {/* COLUMN 2: Socials / TEMUKAN KAMI */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Temukan Kami</h3>
            <ul className="space-y-4 text-sm text-slate-600 font-medium">
              <li>
                    <a href="https://api.whatsapp.com/send/?phone=%2B6281210530003&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    +62 812-1053-0003
                    </a>
              </li>
              <li>
                    <a href="https://www.instagram.com/pelangiatk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-pink-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    @pelangiatk
                    </a>
              </li>
              <li>
                    <a href="https://www.tiktok.com/@pelangiatkofficial?_t=zs-8zfareer4bq&_r=1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-slate-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                    @pelangiatkofficial
                    </a>
              </li>
              <li>
                    <a href="https://shopee.co.id/pelangiatk?uls_trackid=5605lgk006nd&utm_content=3TR1m1L2kgUAPqne6bbZtJsUfSSs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-orange-600 transition-colors">
                      {/* --- SVG ICON SHOPEE YANG BARU --- */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7l.867 12.143a2 2 0 0 0 2 1.857h10.276a2 2 0 0 0 2 -1.857l.867 -12.143h-16z"></path>
                        <path d="M8.5 7c0 -1.653 1.5 -3 3.5 -3s3.5 1.347 3.5 3"></path>
                        <path d="M9.5 17c.413 .462 1 .5 2.5 .5s2.5 -.038 2.5 -.5c.833 -.5 1 -2 0 -2.5s-1.5 -.5 -2.5 -.5c-1 0 -2 -.5 -2 -1s.167 -1.5 1 -2c1.333 -1 4 -1 4 .5"></path>
                      </svg>
                      Shopee Pelangi ATK
                    </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Links / LINK PINTASAN */}
          <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Link Pintasan</h3>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li><Link to="/" className="hover:text-sky-600 transition-colors">Beranda</Link></li>
                <li><Link to="/outlet" className="hover:text-sky-600 transition-colors">Cabang Toko</Link></li>
                <li><Link to="/morning-star" className="hover:text-sky-600 transition-colors">Morning Star</Link></li>
                <li><Link to="/product" className="hover:text-sky-600 transition-colors">Brand Lain</Link></li>
                <li><Link to="/news-event" className="hover:text-sky-600 transition-colors">Acara</Link></li>
                <li><Link to="/promo" className="hover:text-sky-600 transition-colors">Promo</Link></li>
                </ul>
          </div>

          {/* COLUMN 4: Jam Operasional (BARU) */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Jam Operasional</h3>
            <ul className="space-y-4 text-sm text-slate-600 font-medium">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>
                  <strong>Buka Setiap Hari Senin-Sabtu</strong><br/>
                  08:00 - 21:00 WIB
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Melayani pembelian eceran maupun partai besar (grosir).</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* COPYRIGHT BOTTOM BAR */}
      <div className="bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 text-black text-center py-4 text-sm font-medium">
        © Pelangi ATK 2026 || Created By @stanlleytan
      </div>

      {/* ========================================== */}
      {/* FLOATING WHATSAPP BUTTON (GLOBAL)          */}
      {/* ========================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-fade-in">
        
        {/* Tooltip Chat Bubble */}
        <div className="bg-white text-slate-800 text-sm font-bold py-2 px-4 rounded-full shadow-lg border border-slate-100 hidden md:block animate-bounce">
          Order grosir?
        </div>
        
        {/* The Button */}
        <a 
          href="https://api.whatsapp.com/send/?phone=%2B6281210530003&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 transition-transform transform hover:scale-110 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </footer>
  );
}