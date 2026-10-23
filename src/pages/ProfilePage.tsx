import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, Star, Shield, Activity, Award, CheckCircle2, AlertTriangle, Users, Crown, UserX, Info, Lock, X, Sparkles, HelpCircle } from 'lucide-react';
import { getRank, formatMonthName } from '../lib/utils';
import { getMemberById, getMemberHistoricalScores } from '../data/dataLoader';
import { useActiveMonth } from '../hooks/useActiveMonth';
import { calculateMemberBadges, UnlockedBadge, LockedBadge } from '../lib/badgesEngine';
import BadgeIcon from '../components/BadgeIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMonth, members, getLinkWithMonth } = useActiveMonth();

  // حالة البادج المختار لعرض البوب أوفر التوضيحي التفاعلي
  const [selectedBadgeInfo, setSelectedBadgeInfo] = useState<{
    badgeId: string;
    type: 'unlocked' | 'locked';
  } | null>(null);

  const member = useMemo(() => {
    if (!id) return undefined;
    return getMemberById(id, selectedMonth);
  }, [id, selectedMonth]);

  // حساب البادجات والإنجازات الخاصة بالعضو بناءً على البيانات الحقيقية
  const badgesResult = useMemo(() => {
    if (!member) return { unlocked: [], locked: [], totalUnlockedCount: 0, totalAvailableCount: 0 };
    return calculateMemberBadges(member);
  }, [member]);

  // السجل التاريخي الحقيقي لدرجات العضو عبر الشهور
  const trendData = useMemo(() => {
    if (!id) return [];
    return getMemberHistoricalScores(id);
  }, [id]);

  if (!member) {
    return (
      <div className="glass p-12 rounded-[3rem] text-center max-w-md mx-auto space-y-4 my-20 border-white/60 shadow-xl">
        <UserX size={48} className="mx-auto text-slate-300" />
        <h2 className="text-2xl font-black text-slate-800">لا توجد بيانات بعد</h2>
        <p className="text-slate-500 font-bold">العضو غير موجود أو لم يتم تسجيل بياناته في هذا الشهر</p>
        <Link 
          to={getLinkWithMonth("/")} 
          className="inline-block mt-4 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-black text-sm shadow-md transition-all active:scale-95"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const rank = member.hasEvaluation ? getRank(member) : "عضو مسجل";
  
  // حساب متوسط الفريق من الأعضاء المقيمين فقط
  const evaluatedMembers = members.filter(m => m.hasEvaluation);
  const evalCount = evaluatedMembers.length;

  const avgAttendance = evalCount > 0 ? parseFloat((evaluatedMembers.reduce((sum, m) => sum + m.grades.attendance, 0) / evalCount).toFixed(1)) : 0;
  const avgInteraction = evalCount > 0 ? parseFloat((evaluatedMembers.reduce((sum, m) => sum + m.grades.interaction, 0) / evalCount).toFixed(1)) : 0;
  const avgLeadership = evalCount > 0 ? parseFloat((evaluatedMembers.reduce((sum, m) => sum + m.grades.leadership, 0) / evalCount).toFixed(1)) : 0;
  const avgBehavior = evalCount > 0 ? parseFloat((evaluatedMembers.reduce((sum, m) => sum + m.grades.behavior, 0) / evalCount).toFixed(1)) : 0;

  const stats = [
    { label: "Attendance", arabicLabel: "الحضور والالتزام", value: member.grades.attendance, teamAvg: avgAttendance, icon: <CheckCircle2 className="text-sky-500" size={16} /> },
    { label: "Interaction", arabicLabel: "المشاركة والتفاعل", value: member.grades.interaction, teamAvg: avgInteraction, icon: <Activity className="text-emerald-500" size={16} /> },
    { label: "Leadership", arabicLabel: "المبادرة والقيادة", value: member.grades.leadership, teamAvg: avgLeadership, icon: <Crown className="text-amber-500" size={16} /> },
    { label: "Behavior", arabicLabel: "السلوك والتعامل", value: member.grades.behavior, teamAvg: avgBehavior, icon: <Shield className="text-purple-500" size={16} /> },
  ];

  // إيجاد البادج النشط للبوب أوفر
  const activeUnlocked = selectedBadgeInfo?.type === 'unlocked'
    ? badgesResult.unlocked.find(b => b.badge.id === selectedBadgeInfo.badgeId)
    : null;

  const activeLocked = selectedBadgeInfo?.type === 'locked'
    ? badgesResult.locked.find(b => b.badge.id === selectedBadgeInfo.badgeId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-10 max-w-5xl mx-auto pb-20"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 text-slate-500 hover:text-sky-600 font-black transition-all group px-4 cursor-pointer"
      >
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /> العودة
      </button>

      {/* Global Profile Card */}
      <section className="glass p-8 md:p-14 rounded-[3.5rem] relative overflow-hidden shadow-xl border-white/60">
        <div className="relative flex flex-col items-center text-center space-y-10">
          {/* Name & Title Section */}
          <div className="space-y-3 pt-2">
            <h1 className="text-4xl md:text-7xl font-black text-slate-800 tracking-tight leading-tight">
              {member.name}
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-10 bg-sky-200" />
              <p className="text-xs md:text-base font-black text-sky-500 uppercase tracking-widest">{member.year}</p>
              <div className="h-px w-10 bg-sky-200" />
            </div>
            <p className="text-xs font-bold text-slate-400">
              بيانات شهر: <span className="text-sky-600 font-black">{formatMonthName(selectedMonth)}</span>
            </p>
          </div>

          {/* Ranks & Medals */}
          <div className="flex flex-wrap justify-center gap-3">
             <span className="px-6 py-2.5 bg-white/80 text-sky-600 rounded-full font-black text-xs uppercase tracking-wider shadow-sm border border-white">
                {rank}
             </span>
             {member.hasEvaluation && member.bonus > 0 && (
                <span className="px-6 py-2.5 bg-emerald-500 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2">
                   <Star size={14} fill="currentColor" /> Excellence Bonus (+{member.bonus})
                </span>
             )}
          </div>

          {/* حالة عدم وجود تقييم لهذا الشهر */}
          {!member.hasEvaluation ? (
            <div className="w-full max-w-lg bg-sky-50/70 border border-sky-100 p-8 rounded-[2.5rem] text-center space-y-3">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto text-sky-600">
                <Info size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800">لم يتم رصد تقييم لهذا الشهر</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                هذا العضو مسجل في الأسرة، ولكنه غير مدرج في سجل تقييمات هذا الشهر، ولا يُحسب له صفر ولا يدخل في حساب الترتيب العام.
              </p>
            </div>
          ) : (
            <>
              {/* Score Circle */}
              <div className="relative p-10 bg-white/60 rounded-[2.5rem] border border-white/80 shadow-inner">
                 <div className="relative z-10 flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Power Score</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-6xl md:text-7xl font-black text-sky-600 tracking-tight">{member.totalScore}</span>
                       <span className="text-xl font-black text-slate-300">/ 40</span>
                    </div>
                 </div>
              </div>

              {/* Stats Sections */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                {/* Performance Stats */}
                <div className="space-y-6 text-right">
                  <h3 className="text-lg font-black text-slate-800 flex items-center justify-end gap-2 px-1">
                     <Activity className="text-sky-500" size={20} /> تفاصيل أداء الشهر
                  </h3>
                  <div className="space-y-5">
                    {stats.map((stat, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-black uppercase text-slate-600">
                           <div className="flex items-center gap-2">
                              {stat.icon} <span className="text-slate-700 font-bold">{stat.arabicLabel}</span>
                           </div>
                           <span className="text-sky-600 font-black">{stat.value} / 10</span>
                        </div>
                        <div className="h-2.5 bg-sky-100/60 rounded-full overflow-hidden border border-white/60">
                          <div 
                            style={{ width: `${Math.min(100, Math.max(0, (stat.value / 10) * 100))}%` }}
                            className="h-full gradient-sky rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Trend Interactive Chart - يظهر فقط إذا كان للعضو شهرين أو أكثر مسجلين حقيقة */}
                <div className="space-y-6 text-right">
                  {trendData.length >= 2 ? (
                    <div className="bg-sky-50/60 rounded-[2rem] p-6 border border-sky-100/60 overflow-hidden">
                       <div className="h-44 w-full" style={{ minWidth: 0 }}>
                          <ResponsiveContainer width="99%" height="100%">
                             <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                                />
                                <YAxis hide domain={[0, 40]} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    borderRadius: '0.75rem', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    fontWeight: 800,
                                    fontSize: '11px'
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="score" 
                                  stroke="#0ea5e9" 
                                  strokeWidth={3} 
                                  dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 6, fill: '#0369a1' }}
                                  animationDuration={600}
                                />
                             </LineChart>
                          </ResponsiveContainer>
                       </div>
                       <p className="text-[10px] font-black text-center text-slate-400 mt-4 uppercase tracking-wider">سجل التطور عبر الشهور</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center p-8 bg-sky-50/40 rounded-[2rem] border border-sky-100/50 text-center space-y-2">
                      <Sparkles size={28} className="text-sky-400" />
                      <p className="text-sm font-black text-slate-700">سجل التطور الزمني</p>
                      <p className="text-xs text-slate-400 font-bold max-w-xs">
                        سيظهر الرسم البياني التلقائي فور رصد تقييمين فعليين أو أكثر لهذا العضو في الشهور القادمة.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Badges & Achievements Section — نظام البادجات والإنجازات الشامل والموضوعي */}
      <section className="glass p-8 md:p-12 rounded-[3.5rem] border-white/60 shadow-xl space-y-8 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-sky-100 pb-6">
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2.5 justify-end md:justify-start">
              <Award className="text-sky-600" size={24} />
              <h2 className="text-2xl font-black text-slate-800">Badges & Achievements</h2>
            </div>
            <p className="text-xs text-slate-500 font-bold">
              إنجازات وأوسمة مستحقة مبنية على التقييمات الشهرية والبونص والمساهمات المعتمدة
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-sky-50 text-sky-700 rounded-full font-black text-xs border border-sky-100">
              المحققة: {badgesResult.totalUnlockedCount} من {badgesResult.totalAvailableCount}
            </span>
            <Link 
              to={getLinkWithMonth("/badges-guide")} 
              className="text-xs font-black text-sky-600 hover:text-sky-800 underline underline-offset-4 flex items-center gap-1"
            >
              <HelpCircle size={14} /> دليل البادجات
            </Link>
          </div>
        </div>

        {/* 1. البادجات المحققة (Unlocked Badges) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-800">الأوسمة والإنجازات المحققة</h3>
            <span className="text-[11px] font-bold text-slate-400">اضغط على أي بادج لمعرفة سبب وتفاصيل استحقاقه</span>
          </div>

          {badgesResult.unlocked.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {badgesResult.unlocked.map((unlockedItem) => {
                const b = unlockedItem.badge;
                const isSelected = selectedBadgeInfo?.badgeId === b.id && selectedBadgeInfo.type === 'unlocked';
                const hasMultipleMonths = unlockedItem.earnedMonths.length > 1;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBadgeInfo(prev => 
                        prev?.badgeId === b.id && prev.type === 'unlocked' ? null : { badgeId: b.id, type: 'unlocked' }
                      );
                    }}
                    className={`p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer relative group flex flex-col justify-between space-y-3 ${
                      isSelected 
                        ? 'bg-white ring-2 ring-sky-500 shadow-md scale-[1.02] border-sky-300' 
                        : 'bg-white/80 hover:bg-white hover:border-sky-200 border-white/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.colorGradient} flex items-center justify-center text-white shadow-sm`}>
                        <BadgeIcon name={b.iconName} size={20} />
                      </div>
                      {hasMultipleMonths ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-black text-[9px] border border-amber-200">
                          {unlockedItem.earnedMonths.length} مرات
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full font-black text-[9px] border border-sky-100">
                          {formatMonthName(unlockedItem.latestMonth)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-slate-800 leading-tight">{b.nameAr}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{b.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 bg-sky-50/40 rounded-2xl border border-sky-100 text-center space-y-2">
              <Award size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-black text-slate-700">لا توجد بادجات محققة بعد</p>
              <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">
                استمر في الالتزام والمشاركة في الفعاليات والتكليفات لفتح أول وسام في تقييمات الشهور القادمة!
              </p>
            </div>
          )}
        </div>

        {/* بوب أوفر تفاعلي لشرح البادج المحقق عند الضغط عليه */}
        <AnimatePresence>
          {activeUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-3xl bg-white border-2 border-sky-200 shadow-xl relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedBadgeInfo(null)}
                className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                title="إغلاق"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-right pr-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeUnlocked.badge.colorGradient} flex items-center justify-center text-white shadow-md shrink-0`}>
                  <BadgeIcon name={activeUnlocked.badge.iconName} size={28} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-black text-slate-800">{activeUnlocked.badge.nameAr}</h4>
                    <span className="text-xs font-black text-slate-400 uppercase">({activeUnlocked.badge.name})</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] border border-emerald-200">
                      إنجاز محقق
                    </span>
                  </div>
                  <p className="text-sm font-bold text-sky-800 leading-relaxed pt-1">
                    {activeUnlocked.dynamicReason}
                  </p>
                  
                  {/* في حالة الحصول على البادج في عدة شهور مختلفة */}
                  {activeUnlocked.occurrences.length > 1 && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap text-xs font-bold text-slate-500">
                      <span>سجل الإنجاز عبر الشهور:</span>
                      {activeUnlocked.occurrences.map((occ) => (
                        <span key={occ.monthKey} className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-100 text-[10px]">
                          {occ.monthName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. بادجات قيد الإنجاز (Locked Badges) */}
        {badgesResult.locked.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-sky-100/70">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-600 flex items-center gap-2">
                <Lock size={16} className="text-slate-400" />
                <span>بادجات قيد الإنجاز ({badgesResult.locked.length})</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">اضغط للاطلاع على شروط الاستحقاق</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {badgesResult.locked.map((lockedItem) => {
                const b = lockedItem.badge;
                const isSelected = selectedBadgeInfo?.badgeId === b.id && selectedBadgeInfo.type === 'locked';

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBadgeInfo(prev => 
                        prev?.badgeId === b.id && prev.type === 'locked' ? null : { badgeId: b.id, type: 'locked' }
                      );
                    }}
                    className={`p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer relative group flex flex-col justify-between space-y-3 opacity-60 hover:opacity-100 ${
                      isSelected 
                        ? 'bg-white ring-2 ring-slate-400 shadow-md scale-[1.02] border-slate-300 opacity-100' 
                        : 'bg-white/40 hover:bg-white/70 border-white/60 shadow-none'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shadow-inner">
                        <Lock size={18} />
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-black text-[9px]">
                        لم يُفتح بعد
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-700 leading-tight">{b.nameAr}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{b.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* بوب أوفر تفاعلي لشرح شروط البادج المقفول */}
        <AnimatePresence>
          {activeLocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 shadow-lg relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedBadgeInfo(null)}
                className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                title="إغلاق"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-right pr-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 shadow-inner shrink-0">
                  <Lock size={26} />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-black text-slate-700">{activeLocked.badge.nameAr}</h4>
                    <span className="text-xs font-black text-slate-400 uppercase">({activeLocked.badge.name})</span>
                    <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 rounded-full font-black text-[10px]">
                      قيد الإنجاز
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeLocked.badge.description}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-slate-700">
                    <span className="text-sky-600">شرط الحصول على هذا البادج:</span>
                    <span>{activeLocked.condition}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Warnings & Notes Section */}
      {member.warnings.length > 0 && (
        <section className="glass p-8 md:p-12 rounded-[3rem] border-rose-100/60 bg-rose-50/20">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-500 shadow-sm">
                <AlertTriangle size={22} />
             </div>
             <h3 className="text-xl md:text-2xl font-black text-slate-800 text-right w-full">ملحوظات وسجل الانضباط لهذا الشهر</h3>
          </div>
          <div className="grid gap-4">
            {member.warnings.map((w, idx) => {
              const isWarning = w.type === 'warning';
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-5 bg-white/70 rounded-[1.5rem] border border-white shadow-sm"
                >
                  <div className="flex items-center gap-3">
                     <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                       isWarning ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                     }`}>
                       {isWarning ? 'إنذار رسمي' : 'لفت نظر'}
                     </span>
                     <p className="font-bold text-slate-700 text-base">{w.reason}</p>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{w.date}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
