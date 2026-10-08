import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { HelmetProvider } from 'react-helmet-async'; // <-- TAMBAHAN UNTUK SEO
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer'; 
import Home from './pages/Home';
import NewsEvent from './pages/NewsEvent';
import Promo from './pages/Promo';
import MorningStar from './pages/MorningStar'; 
import Products from './pages/Products';
import OutletPage from './pages/Outlet'; // <-- Renamed to avoid collision with React Router
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard'; 

// --- UPDATED: Global QueryClient Settings ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // <-- Set to false globally to prevent Alt-Tab spam!
      staleTime: 1000 * 60 * 5, // 5 Minutes
      gcTime: 1000 * 60 * 60, // 1 Hour cache memory retention
      retry: 1, 
    },
  },
});

// --- NEW: Persistent Layout Wrapper ---
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col text-slate-800 font-sans selection:bg-rose-100">
      <Navbar />
      <main className="flex-grow">
        {/* React Router will seamlessly inject the pages right here without destroying the Navbar! */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            
            {/* THE ADMIN ROUTE (No Navbar) */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* THE PUBLIC ROUTES (Wrapped in the Persistent Layout) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/news-event" element={<NewsEvent />} />
              <Route path="/promo" element={<Promo />} />
              <Route path="/morning-star" element={<MorningStar />} />
              <Route path="/product" element={<Products />} />
              <Route path="/outlet" element={<OutletPage />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            
          </Routes>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;