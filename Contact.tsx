import { Helmet } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO

export default function Contact() {
  const socialLinks = [
    {
      name: 'WhatsApp Pusat',
      username: '+62 812-1053-0003',
      url: 'https://api.whatsapp.com/send/?phone=%2B6281210530003&text&type=phone_number&app_absent=0',
      color: 'hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      )
    },
    {
      name: 'Shopee',
      username: 'pelangiatk',
      url: 'https://shopee.co.id/pelangiatk?uls_trackid=5605lgk006nd&utm_content=3TR1m1L2kgUAPqne6bbZtJsUfSSs',
      color: 'hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7l.867 12.143a2 2 0 0 0 2 1.857h10.276a2 2 0 0 0 2 -1.857l.867 -12.143h-16z"></path>
          <path d="M8.5 7c0 -1.653 1.5 -3 3.5 -3s3.5 1.347 3.5 3"></path>
          <path d="M9.5 17c.413 .462 1 .5 2.5 .5s2.5 -.038 2.5 -.5c.833 -.5 1 -2 0 -2.5s-1.5 -.5 -2.5 -.5c-1 0 -2 -.5 -2 -1s.167 -1.5 1 -2c1.333 -1 4 -1 4 .5"></path>
        </svg>
      )
    },
    {
      name: 'Instagram',
      username: '@pelangiatk',
      url: 'https://www.instagram.com/pelangiatk',
      color: 'hover:bg-pink-50 hover:border-pink-400 hover:text-pink-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      )
    },
    {
      name: 'TikTok',
      username: '@pelangiatkofficial',
      url: 'https://www.tiktok.com/@pelangiatkofficial?_t=zs-8zfareer4bq&_r=1',
      color: 'hover:bg-slate-100 hover:border-slate-800 hover:text-slate-900',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* --- SETUP SEO DINAMIS UNTUK HALAMAN CONTACT --- */}
      <Helmet>
        <title>Hubungi Kami | Pelangi Stationery</title>
        <meta name="description" content="Hubungi Pelangi Stationery melalui WhatsApp, Shopee, Instagram, atau TikTok. Kami siap melayani pemesanan alat tulis dan grosir ATK Anda." />
      </Helmet>

      {/* Outer wrapper remains fully transparent */}
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 bg-transparent animate-fade-in">
        
        {/* Glassmorphic Card Container */}
        <div className="w-full max-w-lg backdrop-blur-xl bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-8 md:p-12 flex flex-col items-center">
          
          {/* Profile Header */}
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center shadow-lg mb-6 border-4 border-white bg-white">
            <img src="/logo pelangi.png" alt="Pelangi ATK" className="h-10 object-contain" />
          </div>
                    
          <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Hubungi Kami</h1>
          <p className="text-slate-500 text-sm font-medium mb-8 text-center px-4">
            Silakan hubungi Pelangi ATK atau kunjungi toko online kami melalui platform di bawah ini.
          </p>

          {/* Social Links List */}
          <div className="w-full space-y-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center p-4 bg-white/80 border border-slate-200/60 rounded-2xl shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${link.color}`}
              >
                <div className="flex-shrink-0 mr-4">
                  {link.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-wide">{link.name}</span>
                  <span className="text-xs opacity-80 mt-0.5">{link.username}</span>
                </div>
                <div className="ml-auto opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}