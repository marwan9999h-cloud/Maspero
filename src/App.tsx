import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, AlertTriangle, Trophy, UserMinus, Award } from 'lucide-react';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import WarningsPage from './pages/WarningsPage';
import OutPage from './pages/OutPage';
import AboutPage from './pages/AboutPage';
import TopMembersPage from './pages/TopMembersPage';
import BadgesGuidePage from './pages/BadgesGuidePage';
import ScrollToTop from './components/ScrollToTop';
import { useActiveMonth } from './hooks/useActiveMonth';

export default function App() {
  const location = useLocation();
  const { getLinkWithMonth } = useActiveMonth();

  const navLinks = [
    { path: '/', label: 'الرئيسية', icon: <Home size={18} /> },
    { path: '/warnings', label: 'الإنذارات', icon: <AlertTriangle size={18} /> },
    { path: '/top-members', label: 'المتميزين', icon: <Trophy size={18} /> },
    { path: '/badges-guide', label: 'دليل البادجات', icon: <Award size={18} /> },
    { path: '/out', label: 'خارج الأسرة', icon: <UserMinus size={18} /> },
  ];

  return (
    <div className="min-h-screen pb-12 flex flex-col relative overflow-x-hidden">
      <ScrollToTop />
      {/* Background Glows - خفيفة ومحسنة للأداء */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-sky-200/25 rounded-full blur-[60px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[25%] h-[25%] bg-sky-300/15 rounded-full blur-[50px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed md:top-6 bottom-6 md:bottom-auto left-0 right-0 z-50 px-4">
        <div className="max-w-4xl mx-auto glass rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl transition-all border-white/60">
          <div className="flex items-center gap-3 pr-2 md:pr-4">
             <Link to={getLinkWithMonth("/")} className="flex items-center gap-3 group">
                <img src="/1775344671830-01.jpg" alt="Maspero Logo" className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
             </Link>
          </div>

          <div className="flex items-center justify-end gap-1.5 flex-1 md:w-auto overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path}
                  to={getLinkWithMonth(link.path)} 
                  className={`flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full font-black transition-all duration-200 relative group overflow-hidden active:scale-95 ${
                    isActive 
                      ? 'bg-white text-sky-600 shadow-xl shadow-sky-100/50 scale-105' 
                      : 'text-slate-500 hover:text-sky-600'
                  }`}
                  title={link.label}
                >
                  <span className={`${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-400'} transition-colors`}>
                    {link.icon}
                  </span>
                  {!isActive && <div className="absolute inset-0 bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 mt-8 md:mt-32 mb-24 md:mb-0">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/warnings" element={<WarningsPage />} />
              <Route path="/top-members" element={<TopMembersPage />} />
              <Route path="/badges-guide" element={<BadgesGuidePage />} />
              <Route path="/out" element={<OutPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 text-center p-12 glass rounded-[3rem] mx-4 mb-4 border-white/50">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link to={getLinkWithMonth("/about")} className="text-sky-600 hover:text-sky-400 font-black text-xl tracking-tight transition-colors">عن ماسبيرو تيم</Link>
          <div className="flex justify-center gap-4 text-slate-400">
             <div className="w-1 h-1 bg-sky-300 rounded-full" />
             <p className="text-sm font-bold">منصة متابعة نشاط تطوعي قسم الإعلام</p>
             <div className="w-1 h-1 bg-sky-300 rounded-full" />
          </div>
          <div className="pt-4 border-t border-sky-100/70 flex flex-col items-center gap-1">
            <p className="text-sky-800 font-black text-sm md:text-base">Made By: Marwan M. Hammad</p>
            <p className="text-slate-500 font-bold text-xs md:text-sm">Vice Head Media for Maspero</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
