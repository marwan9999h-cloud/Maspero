import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Award, ArrowLeft } from 'lucide-react';
import { Year } from '../types';
import { Link } from 'react-router-dom';
import { useActiveMonth } from '../hooks/useActiveMonth';
import { formatMonthName } from '../lib/utils';

export default function TopMembersPage() {
  const { selectedMonth, members, getLinkWithMonth } = useActiveMonth();

  const yearsData = useMemo(() => {
    return [Year.First, Year.Second, Year.Third, Year.Fourth].map((year) => {
      // الأعضاء المؤهلون:
      // 1. ينتمون لنفس الفرقة
      // 2. لديهم تقييم فعلي لهذا الشهر (hasEvaluation)
      // 3. ليس عليهم أي إنذار رسمي من النوع warning في هذا الشهر
      // 4. ليسوا في قائمة خارج الأسرة (isOut)
      const filtered = members.filter(m => 
        m.year === year && 
        m.hasEvaluation && 
        m.warnings.filter(w => w.type === 'warning').length === 0 && 
        !m.isOut
      );

      if (filtered.length === 0) return { year, podium: [] };

      // الترتيب المتكافئ (Dense Ranking) بناءً على (المجموع الأساسي + البونص)
      const uniqueCombinedScores: number[] = Array.from(new Set<number>(filtered.map(m => m.combinedScore)))
        .sort((a, b) => b - a);
      
      const membersWithDenseRank = filtered.map(m => ({
        ...m,
        denseRank: uniqueCombinedScores.indexOf(m.combinedScore) + 1
      })).sort((a, b) => b.combinedScore - a.combinedScore);

      const podium = membersWithDenseRank.filter(m => m.denseRank <= 3);

      return { year, podium };
    });
  }, [members]);

  const hasAnyPodium = yearsData.some(y => y.podium.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-16 pb-32"
    >
      {/* Deep Hero Header - بدون أي روابط صور خارجية */}
      <header className="relative py-16 md:py-24 rounded-[3.5rem] overflow-hidden bg-[#0a192f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.25),transparent_70%)]" />
        
        <div className="relative z-10 text-center space-y-6 px-6">
          <div className="inline-flex items-center gap-2 px-8 py-3 bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-400 rounded-full font-black text-sm shadow-md">
             <Trophy size={20} /> فرسان القمة
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight">
            المنصة الذهبية
          </h1>
          <p className="text-sky-100/70 max-w-2xl mx-auto text-base md:text-lg font-bold leading-relaxed">
            الترتيب بناءً على (المجموع الأساسي + البونص) لشهر:
            <span className="text-amber-400 mr-2">{formatMonthName(selectedMonth)}</span>
          </p>
        </div>
      </header>

      {hasAnyPodium ? (
        <div className="space-y-20">
          {yearsData.map(({ year, podium }) => {
            if (podium.length === 0) return null;

            return (
              <div key={year} className="space-y-10">
                <div className="flex items-center gap-6 justify-center">
                  <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-sky-400" />
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-wider">{year}</h2>
                  <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-sky-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                  {podium.map((member) => {
                    const rank = member.denseRank;
                    
                    const rankStyles = {
                      1: { border: 'border-yellow-400/50', accent: 'bg-yellow-400', icon: <Crown size={22} className="text-yellow-600" /> },
                      2: { border: 'border-slate-300/60', accent: 'bg-slate-400', icon: <Medal size={20} className="text-slate-600" /> },
                      3: { border: 'border-orange-400/50', accent: 'bg-orange-400', icon: <Award size={20} className="text-orange-600" /> }
                    }[rank as 1|2|3] || { border: 'border-white/50', accent: 'bg-sky-400', icon: null };

                    return (
                      <Link 
                        to={getLinkWithMonth(`/profile/${member.id}`)} 
                        key={member.id} 
                        className="group block"
                      >
                        <div className={`relative bg-white/80 rounded-[3rem] p-8 md:p-10 border-2 transition-transform duration-200 group-hover:-translate-y-1 shadow-sm hover:shadow-md ${rankStyles.border}`}>
                          
                          {/* Rank Icon Bagde */}
                          <div className="absolute -top-3 -right-2">
                            <div className="relative bg-white p-2 rounded-2xl shadow-md border border-sky-50">
                               {rankStyles.icon}
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div className="space-y-3">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-sm ${rankStyles.accent}`}>
                                 {rank}
                               </div>
                               <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">{member.name}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                               <div className="p-3 bg-sky-50 rounded-[1.5rem] border border-sky-100/50">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Base</div>
                                  <div className="text-xl font-black text-sky-600">{member.totalScore} <span className="text-xs opacity-50">/ 40</span></div>
                               </div>
                               <div className="p-3 bg-emerald-50 rounded-[1.5rem] border border-emerald-100/50">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Bonus</div>
                                  <div className="text-xl font-black text-emerald-600">+{member.bonus}</div>
                               </div>
                            </div>

                            <div className="pt-6 border-t border-sky-100 flex items-center justify-between">
                               <div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Power</div>
                                  <div className="text-4xl font-black text-slate-900">{member.combinedScore}</div>
                                </div>
                               <ArrowLeft className="text-slate-300 group-hover:text-sky-500 group-hover:-translate-x-1 transition-all" size={26} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl text-slate-400 space-y-2 max-w-xl mx-auto border-white/60">
          <Trophy size={44} className="mx-auto mb-2 opacity-25 text-amber-500" />
          <p className="text-2xl font-black text-slate-700">لا توجد بيانات بعد</p>
          <p className="text-sm font-bold text-slate-400">لم يتم رصد نتائج متميزين لهذا الشهر بعد</p>
        </div>
      )}
    </motion.div>
  );
}
