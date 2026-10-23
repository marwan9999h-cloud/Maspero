import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, Quote as QuoteIcon, Trophy, Star, AlertTriangle, ArrowLeft, ShieldCheck, TrendingUp, Sparkles, RotateCw, Calendar } from 'lucide-react';
import { QUOTES } from '../constants';
import { Member, Year } from '../types';
import { normalizeArabic, formatMonthName } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useActiveMonth } from '../hooks/useActiveMonth';

const MemberCard = React.memo(function MemberCard({
  member,
  profileLink
}: {
  member: Member;
  profileLink: string;
}) {
  const hasOfficialWarning = member.warnings.some(w => w.type === 'warning');
  const energyPercent = member.hasEvaluation 
    ? Math.min(100, Math.max(0, (member.totalScore / 40) * 100))
    : 0;

  return (
    <div 
      className="bg-white/70 border border-white/60 p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] hover:scale-[1.02] active:scale-95 md:active:scale-100 transition-transform duration-200 group relative overflow-hidden shadow-sm hover:shadow-sky-300/20"
    >
      <div className="space-y-4 md:space-y-8 relative z-10">
        <div className="flex justify-between items-start">
           <div className="space-y-1 md:space-y-2">
              <h3 className="text-sm md:text-2xl font-black text-slate-800 group-hover:text-sky-600 transition-colors leading-tight line-clamp-1">{member.name}</h3>
              <span className="inline-block px-2 py-0.5 md:px-3 md:py-1 bg-sky-50 text-[8px] md:text-[10px] font-black text-sky-600 rounded-lg uppercase tracking-widest border border-sky-100">{member.year}</span>
           </div>
           {hasOfficialWarning && (
             <div className="bg-rose-500 text-white p-1.5 md:p-2.5 rounded-xl md:rounded-2xl shadow-md shadow-rose-200" title="يوجد إنذار رسمي">
               <AlertTriangle size={14} className="md:w-5 md:h-5" />
             </div>
           )}
        </div>

        <div className="space-y-2 md:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest">Global Energy</span>
            {member.hasEvaluation ? (
              <span className="text-[10px] md:text-sm font-black text-sky-600">{member.totalScore}<span className="text-[8px] md:text-[10px] text-slate-300"> / 40</span></span>
            ) : (
              <span className="text-[9px] md:text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">غير مقيّم هذا الشهر</span>
            )}
          </div>
          <div className="h-1.5 md:h-2 w-full bg-sky-50 rounded-full overflow-hidden">
            <div 
              style={{ width: `${energyPercent}%` }}
              className={`h-full rounded-full transition-all duration-300 ${member.hasEvaluation ? 'gradient-sky' : 'bg-slate-200'}`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-sky-50 pt-4 md:pt-6">
          <div className="text-right">
            <span className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Status</span>
            <div className="text-[8px] md:text-xs font-black">
              {member.hasEvaluation ? (
                member.bonus > 0 ? (
                  <span className="text-emerald-500">+{member.bonus} Bonus</span>
                ) : (
                  <span className="text-sky-600">Standard</span>
                )
              ) : (
                <span className="text-slate-400">بدون تقييم</span>
              )}
            </div>
          </div>
          <Link 
            to={profileLink}
            className="p-2 md:p-3 bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white rounded-xl md:rounded-2xl transition-all shadow-sm hover:shadow-sky-200 group/btn"
          >
            <ArrowLeft size={16} className="md:w-5 md:h-5 group-hover/btn:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
});

export default function HomePage() {
  const { selectedMonth, availableMonths, setMonth, members, getLinkWithMonth } = useActiveMonth();
  const [search, setSearch] = useState("");
  const [activeYear, setActiveYear] = useState<Year | 'الكل'>('الكل');
  const [showStats, setShowStats] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [isRotating, setIsRotating] = useState(false);

  // حسابات إحصائية آمنة مع استبعاد غير المقيمين من إحصائيات التقييمات
  const totalMembers = members.length;
  
  const evaluatedMembers = useMemo(() => {
    return members.filter(m => m.hasEvaluation);
  }, [members]);

  const averageScore = useMemo(() => {
    if (evaluatedMembers.length === 0) return 0;
    return parseFloat((evaluatedMembers.reduce((sum, m) => sum + m.totalScore, 0) / evaluatedMembers.length).toFixed(1));
  }, [evaluatedMembers]);

  const excellenceRate = useMemo(() => {
    if (evaluatedMembers.length === 0) return 0;
    const count = evaluatedMembers.filter(m => m.totalScore >= 32).length;
    return parseFloat(((count / evaluatedMembers.length) * 100).toFixed(0));
  }, [evaluatedMembers]);

  const disciplineRate = useMemo(() => {
    if (totalMembers === 0) return 0;
    const committedCount = members.filter(m => m.warnings.filter(w => w.type === 'warning').length === 0).length;
    return parseFloat(((committedCount / totalMembers) * 100).toFixed(0));
  }, [members, totalMembers]);

  const handleNextQuote = () => {
    setIsRotating(true);
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    setTimeout(() => setIsRotating(false), 500);
  };

  // تطبيع الحروف للبحث الذكي
  const filteredMembers = useMemo(() => {
    const normalizedSearch = normalizeArabic(search);
    return members.filter(m => {
      const matchSearch = !normalizedSearch || normalizeArabic(m.name).includes(normalizedSearch);
      const matchYear = activeYear === 'الكل' || m.year === activeYear;
      return matchSearch && matchYear;
    });
  }, [members, search, activeYear]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 md:py-24 relative overflow-hidden glass rounded-[2.5rem] md:rounded-[4rem] border-white/40 shadow-none md:shadow-[0_32px_64px_-12px_rgba(14,165,233,0.15)]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.08),transparent_50%)]" />
        
        <div className="relative w-28 h-28 md:w-44 md:h-44 mx-auto mb-4 md:mb-6 flex items-center justify-center z-10">
          <img 
            src="/1775344671830-01.jpg" 
            alt="Maspero Logo" 
            className="w-full h-full object-contain relative z-10 drop-shadow-md" 
          />
        </div>

        <h1 className="text-4xl md:text-8xl font-black text-sky-600 tracking-tighter relative z-10 drop-shadow-sm">
          Maspero Team
        </h1>

        <p className="text-sm md:text-2xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-bold px-6 relative z-10 block">
          نصنع المحتوى لنترك الأثر. 
          <br className="md:hidden" />
          <span className="text-sky-500/80 md:block">ملتقى مبدعي الإعلام في كنف ماسبيرو.</span>
        </p>

        {/* محدد الشهر */}
        <div className="pt-2 relative z-10">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-sky-100 shadow-sm">
            <div className="flex items-center gap-2 text-sky-700 font-black text-xs md:text-sm pl-2 border-l border-sky-100">
              <Calendar size={16} className="text-sky-500" />
              <span>الشهر المعروض:</span>
            </div>

            {availableMonths.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableMonths.map((mKey) => (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => setMonth(mKey)}
                    className={`px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                      selectedMonth === mKey
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    {formatMonthName(mKey)}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 text-xs font-bold">لا توجد شهور مسجلة بعد</span>
            )}
          </div>
        </div>
      </section>

      {/* Team Stats Dashboard */}
      <section className="space-y-6">
        <div className="flex justify-center">
          <button 
            onClick={() => setShowStats(!showStats)} 
            className="flex items-center gap-2 px-8 py-3.5 bg-white/80 hover:bg-sky-50 text-sky-600 font-black rounded-full shadow-md hover:shadow-sky-100 transition-all active:scale-95 border border-sky-100 cursor-pointer text-sm md:text-base"
          >
             <TrendingUp size={20} className={`text-sky-500 transition-transform duration-300 ${showStats ? "rotate-180" : ""}`} />
             <span>{showStats ? "إخفاء إحصائيات الشهر" : "عرض إحصائيات أداء الشهر"}</span>
             <Sparkles size={16} className="text-amber-400" />
          </button>
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-2 max-w-5xl mx-auto">
                 {/* Card 1: Total Members */}
                 <div className="glass p-6 rounded-[2rem] text-center border-white/50 relative overflow-hidden shadow-sm">
                    <div className="p-3 bg-sky-100 text-sky-600 rounded-2xl w-fit mx-auto mb-3 shadow-inner">
                       <Users size={22} />
                    </div>
                    <div className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">الأعضاء بالمسجلين</div>
                    <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{totalMembers}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">({evaluatedMembers.length} تم تقييمهم)</div>
                 </div>

                 {/* Card 2: Average Score */}
                 <div className="glass p-6 rounded-[2rem] text-center border-white/50 relative overflow-hidden shadow-sm">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl w-fit mx-auto mb-3 shadow-inner">
                       <Trophy size={22} />
                    </div>
                    <div className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">متوسط تقييم المقيمين</div>
                    <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                      {averageScore} <span className="text-xs font-black text-slate-400">/ 40</span>
                    </div>
                 </div>

                 {/* Card 3: Excellence Rate */}
                 <div className="glass p-6 rounded-[2rem] text-center border-white/50 relative overflow-hidden shadow-sm">
                    <div className="p-3 bg-amber-100 text-amber-500 rounded-2xl w-fit mx-auto mb-3 shadow-inner">
                       <Star size={22} fill="currentColor" />
                    </div>
                    <div className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">نسبة المتميزين</div>
                    <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{excellenceRate}%</div>
                 </div>

                 {/* Card 4: Discipline Rate */}
                 <div className="glass p-6 rounded-[2rem] text-center border-white/50 relative overflow-hidden shadow-sm">
                    <div className="p-3 bg-rose-100 text-rose-500 rounded-2xl w-fit mx-auto mb-3 shadow-inner">
                       <ShieldCheck size={22} />
                    </div>
                    <div className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">نسبة الالتزام</div>
                    <div className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{disciplineRate}%</div>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Search & Filters */}
      <section className="space-y-8 glass p-6 md:p-12 rounded-[3rem] border-white/60 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-xl group">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sky-400">
               <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="البحث بالاسم..." 
              className="w-full pr-16 pl-6 py-4 rounded-full bg-white/80 border border-white/80 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400 text-lg md:text-xl font-black text-right shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex overflow-x-auto w-full md:w-auto p-1.5 gap-2 no-scrollbar glass-pill rounded-[2rem] border-white/40">
            {['الكل', Year.First, Year.Second, Year.Third, Year.Fourth].map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year as any)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeYear === year 
                    ? 'gradient-sky text-white shadow-md' 
                    : 'text-slate-500 hover:bg-white hover:text-sky-600'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredMembers.map((member) => (
              <MemberCard 
                key={member.id}
                member={member}
                profileLink={getLinkWithMonth(`/profile/${member.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <Search size={44} className="mx-auto opacity-30 text-sky-400" />
            <p className="text-2xl font-black text-slate-700">لا توجد بيانات بعد</p>
            <p className="text-sm font-bold text-slate-400">
              {search.trim() ? "لم يتم العثور على أي عضو بهذا الاسم في هذا الشهر" : "لم يتم تسجيل أي أعضاء في هذا الشهر بعد"}
            </p>
          </div>
        )}
      </section>

      {/* Quote Section */}
      <section className="py-6">
         <div className="glass p-8 md:p-12 rounded-[3rem] text-center space-y-6 bg-gradient-to-br from-white/90 to-sky-50/40 border border-white/60 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-center px-4 max-w-sm mx-auto">
               <QuoteIcon className="text-sky-300 opacity-60" size={28} />
               <button 
                  onClick={handleNextQuote}
                  disabled={isRotating}
                  className="p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-full transition-all active:scale-90 hover:scale-105 shadow-sm cursor-pointer flex items-center justify-center border border-sky-100"
                  title="حكمة عشوائية أخرى"
               >
                  <RotateCw size={16} className={isRotating ? "animate-spin" : ""} />
               </button>
            </div>

            <AnimatePresence mode="wait">
               <motion.p 
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg md:text-2xl font-bold text-slate-700 leading-relaxed italic max-w-3xl mx-auto px-4"
               >
                 "{QUOTES[quoteIndex].text}"
               </motion.p>
            </AnimatePresence>

            {QUOTES[quoteIndex].author && (
              <p className="text-xs font-black text-sky-500 uppercase tracking-widest">- {QUOTES[quoteIndex].author}</p>
            )}

            <div className="w-16 h-1 bg-gradient-to-r from-sky-200 to-sky-300 mx-auto rounded-full" />
         </div>
      </section>
    </motion.div>
  );
}
