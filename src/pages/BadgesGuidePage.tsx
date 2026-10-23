import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, Clock, Users, ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BADGES_LIST, BADGE_CATEGORIES, BadgeCategory, BadgeDefinition } from '../data/badgesDefinition';
import BadgeIcon from '../components/BadgeIcon';
import { MEMBERS_DATA } from '../data/members';
import { calculateMemberBadges } from '../lib/badgesEngine';
import { useActiveMonth } from '../hooks/useActiveMonth';
import { MemberData } from '../types';

interface BadgeEarnerInfo {
  member: MemberData;
  monthsCount: number;
}

export default function BadgesGuidePage() {
  const { getLinkWithMonth } = useActiveMonth();
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  // حساب الأعضاء الحاصلين على كل بادج فعلياً وربطهم
  const badgeEarnersMap = useMemo(() => {
    const map = new Map<string, BadgeEarnerInfo[]>();
    for (const b of BADGES_LIST) {
      map.set(b.id, []);
    }

    for (const m of MEMBERS_DATA) {
      const result = calculateMemberBadges(m);
      for (const unlocked of result.unlocked) {
        const list = map.get(unlocked.badge.id) || [];
        list.push({
          member: m,
          monthsCount: unlocked.earnedMonths.length,
        });
        map.set(unlocked.badge.id, list);
      }
    }

    return map;
  }, []);

  // قائمة البادجات التي حققها أعضاء بالفعل لعرضها في قسم الإحصائية
  const badgesWithEarners = useMemo(() => {
    return BADGES_LIST.map(badge => ({
      badge,
      earners: badgeEarnersMap.get(badge.id) || [],
    })).filter(item => item.earners.length > 0)
      .sort((a, b) => b.earners.length - a.earners.length);
  }, [badgeEarnersMap]);

  const totalBadgesEarnedAcrossTeam = useMemo(() => {
    let total = 0;
    for (const earners of badgeEarnersMap.values()) {
      total += earners.length;
    }
    return total;
  }, [badgeEarnersMap]);

  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') return BADGES_LIST;
    return BADGES_LIST.filter(b => b.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-10 pb-28 max-w-6xl mx-auto"
    >
      {/* Hero Header */}
      <header className="relative py-12 md:py-16 rounded-[3rem] overflow-hidden glass text-center border-white/60 shadow-xl space-y-4 px-6">
        <div className="w-16 h-16 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto text-sky-600 shadow-inner">
          <Award size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            دليل البادجات — Badges Guide
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base font-bold leading-relaxed">
            دليل تعريفي شامل لجميع شروط ومعايير استحقاق الأوسمة والإنجازات داخل أسرة Maspero Team.
          </p>
        </div>
      </header>

      {/* قسم إحصائية استحقاق الأوسمة العام في الفريق مع ربط البروفايلات */}
      <section className="glass rounded-[2.5rem] p-6 md:p-8 border-white/60 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100/80 pb-4">
          <div className="flex items-center gap-3 text-right">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-800">
                إحصائية استحقاق الأوسمة في الفريق
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                توزيع الأوسمة المحققة وعدد الحاصلين على كل بادج مع روابط مباشرة لملفاتهم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full font-black text-xs border border-sky-100">
              إجمالي الاستحقاقات: {totalBadgesEarnedAcrossTeam}
            </span>
            <button
              type="button"
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="p-1.5 hover:bg-sky-50 rounded-xl text-sky-600 transition-colors cursor-pointer"
              title={isStatsExpanded ? "طي الإحصائية" : "عرض الإحصائية"}
            >
              <ChevronDown
                size={20}
                className={`transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isStatsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-4"
            >
              {badgesWithEarners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {badgesWithEarners.map(({ badge, earners }) => (
                    <div
                      key={badge.id}
                      className="bg-white/80 border border-white/80 p-4 rounded-2xl shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-right">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${badge.colorGradient} flex items-center justify-center text-white shadow-sm shrink-0`}>
                            <BadgeIcon name={badge.iconName} size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{badge.nameAr}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{badge.name}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px] border border-emerald-200">
                          {earners.length} {earners.length === 1 ? 'عضو' : 'أعضاء'}
                        </span>
                      </div>

                      {/* قائمة الأعضاء الحاصلين مع روابط مباشرة للبروفايل */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                        {earners.map(({ member }) => (
                          <Link
                            key={member.id}
                            to={getLinkWithMonth(`/profile/${member.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-bold text-[11px] transition-all hover:scale-105 group border border-sky-100 shadow-2xs"
                            title={`عرض بروفايل ${member.name} (${member.year})`}
                          >
                            <span>{member.name}</span>
                            <ExternalLink size={10} className="text-sky-400 group-hover:text-sky-600 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <p className="text-sm font-black text-slate-600">لا توجد بادجات محققة بعد في بيانات الفريق</p>
                  <p className="text-xs text-slate-400">ستظهر إحصائيات الأعضاء الحاصلين هنا فور اعتماد التقييمات الشهرية.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Category Filter Tabs */}
      <div className="flex overflow-x-auto p-2 gap-2 no-scrollbar glass-pill rounded-[2.5rem] border-white/40 max-w-fit mx-auto">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full font-black text-xs transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'gradient-sky text-white shadow-md scale-105'
              : 'text-slate-600 hover:bg-white hover:text-sky-600'
          }`}
        >
          جميع البادجات ({BADGES_LIST.length})
        </button>
        {BADGE_CATEGORIES.map((cat) => {
          const count = BADGES_LIST.filter(b => b.category === cat.key).length;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-black text-xs transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'gradient-sky text-white shadow-md scale-105'
                  : 'text-slate-600 hover:bg-white hover:text-sky-600'
              }`}
            >
              {cat.titleAr} ({count})
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {filteredBadges.map((badge) => {
          const earners = badgeEarnersMap.get(badge.id) || [];

          return (
            <div
              key={badge.id}
              className="bg-white/80 border border-white/80 p-6 md:p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Badge Icon & Category header */}
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.colorGradient} flex items-center justify-center text-white shadow-md`}>
                    <BadgeIcon name={badge.iconName} size={26} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full font-black text-[10px] border border-sky-100">
                      {badge.categoryNameAr}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Clock size={11} /> {badge.timeframe}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 text-right">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 justify-end">
                    <span>{badge.nameAr}</span>
                  </h3>
                  <p className="text-xs font-black text-sky-600 tracking-wider uppercase">{badge.name}</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                    {badge.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Unlock Condition Box */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100/70 text-right space-y-1.5">
                  <div className="flex items-center gap-1.5 justify-end text-[11px] font-black text-slate-700">
                    <span>شرط الاستحقاق</span>
                    <CheckCircle2 size={13} className="text-sky-500" />
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-normal">
                    {badge.condition}
                  </p>
                </div>

                {/* الحاصلون على هذا البادج مع روابط لملفاتهم */}
                <div className="pt-2 border-t border-sky-100/70 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold text-[11px]">
                    الحاصلون عليه ({earners.length}):
                  </span>
                  {earners.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {earners.slice(0, 3).map(({ member }) => (
                        <Link
                          key={member.id}
                          to={getLinkWithMonth(`/profile/${member.id}`)}
                          className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-black rounded-md text-[10px] transition-colors"
                          title={`عرض بروفايل ${member.name}`}
                        >
                          {member.name}
                        </Link>
                      ))}
                      {earners.length > 3 && (
                        <span className="text-[10px] font-black text-slate-400">
                          +{earners.length - 3} آخرين
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-medium">لم يحققه أحد بعد</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
