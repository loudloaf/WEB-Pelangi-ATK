import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Beranda', path: '/', hoverText: 'hover:text-rose-500', hoverLine: 'group-hover:bg-rose-500' },
  { name: 'Cabang Toko', path: '/outlet', hoverText: 'hover:text-indigo-500', hoverLine: 'group-hover:bg-indigo-500' },
  { name: 'Morning Star', path: '/morning-star', hoverText: 'hover:text-emerald-500', hoverLine: 'group-hover:bg-emerald-500' },
  { name: 'Brand Lain', path: '/product', hoverText: 'hover:text-sky-500', hoverLine: 'group-hover:bg-sky-500' },
  { name: 'Acara', path: '/news-event', hoverText: 'hover:text-orange-500', hoverLine: 'group-hover:bg-orange-500' },
  { name: 'Pelayanan', path: '/promo', hoverText: 'hover:text-amber-400', hoverLine: 'group-hover:bg-amber-400' },
  { name: 'Belanja Online', path: '/contact', hoverText: 'hover:text-purple-500', hoverLine: 'group-hover:bg-purple-500' },
];

export default function Navbar() {
  const location = useLocation();
  // State untuk mengontrol buka/tutup menu di HP
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Background updated to use crumpled-paper.jpg with a slight white overlay for text readability
    <nav 
      className="sticky top-0 z-50 backdrop-blur-md"
    >
      {/* Tinggi navbar (h-16) disesuaikan menjadi h-20 agar logo yang membesar punya ruang */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          {/* Tombol Hamburger Menu khusus HP di pojok kiri */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="flex items-center">
            {/* Ukuran gambar diperbesar (dari h-13 ke h-16) */}
            <img src="/logo pelangi (1).png" alt="Pelangi Brand Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                // Ukuran font diperbesar (dari text-sm ke text-base)
                className={`group relative text-base font-medium transition-colors duration-300 ${
                  isActive ? 'text-slate-900' : `text-slate-600 ${item.hoverText}`
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 ${item.hoverLine} ${isActive ? 'w-full bg-slate-800' : 'group-hover:w-full'}`} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Menu Dropdown untuk Mobile (HP) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-t border-slate-200 flex flex-col px-6 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)} // Menutup menu saat tautan diklik
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}