import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActiveMonth } from '../hooks/useActiveMonth';
import { formatMonthName } from '../lib/utils';

export default function WarningsPage() {
  const { selectedMonth, members, getLinkWithMonth } = useActiveMonth();

  // تصفية الأعضاء الذين لديهم إنذارات من النوع 'warning' فقط في هذا الشهر
  const membersWithWarnings = useMemo(() => {
    return members.filter(m => 
      m.warnings.some(w => w.type === 'warning')
    );
  }, [members]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-10 pb-20"
    >
      <header className="text-center space-y-3">
        <div className="w-16 h-16 bg-rose-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-3 border border-rose-200">
           <AlertTriangle className="text-rose-500" size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">نظام الالتزام والإنذارات</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm md:text-base">
          نلتزم بالمهنية والروح التطوعية. الإنذارات هي خطوة للتصحيح والالتزام بمعايير Maspero Team.
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-[11px] font-black text-sky-600 bg-sky-50 px-4 py-1 rounded-full border border-sky-100">
            {formatMonthName(selectedMonth)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            • لفت النظر لا يُحسب كإنذار رسمي ويُعرض في ملف العضو فقط
          </span>
        </div>
      </header>

      {membersWithWarnings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {membersWithWarnings.map((member) => {
            const officialWarnings = member.warnings.filter(w => w.type === 'warning');
            const warningCount = officialWarnings.length;

            return (
              <Link to={getLinkWithMonth(`/profile/${member.id}`)} key={member.id} className="group block">
                <div className={`bg-white/80 p-6 rounded-[2.5rem] border-2 transition-transform duration-200 group-hover:scale-[1.02] active:scale-95 md:active:scale-100 relative overflow-hidden shadow-sm ${
                   warningCount === 1 ? 'border-amber-200' : 
                   warningCount === 2 ? 'border-orange-300' : 
                   'border-rose-400'
                }`}>
                  <div className="flex justify-between items-start mb-5">
                    <div className="space-y-1 text-right">
                      <h3 className="text-xl font-black text-slate-800">{member.name}</h3>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.year}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-2xl shadow-md ${
                       warningCount === 1 ? 'bg-amber-500 text-white' :
                       warningCount === 2 ? 'bg-orange-500 text-white' :
                       'bg-rose-500 text-white'
                    }`}>
                      {warningCount === 1 && <AlertCircle size={22} />}
                      {warningCount === 2 && <AlertTriangle size={22} />}
                      {warningCount >= 3 && <AlertOctagon size={22} />}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {officialWarnings.map((w, i) => (
                       <div key={i} className={`text-sm p-3.5 rounded-2xl border flex flex-col gap-1 ${
                          warningCount === 1 ? 'bg-amber-50/50 border-amber-100' :
                          warningCount === 2 ? 'bg-orange-50/50 border-orange-100' :
                          'bg-rose-50/50 border-rose-100'
                       }`}>
                         <p className="font-black text-slate-800 leading-tight underline decoration-sky-200 decoration-2 underline-offset-4">{w.reason}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{w.date}</p>
                       </div>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      warningCount === 1 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' : 
                      warningCount === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 
                      'bg-gradient-to-r from-rose-600 to-red-700 text-white'
                    }`}>
                      {warningCount >= 3 ? 'TERMINATED' : `LEVEL ${warningCount} WARNING`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl text-slate-400 space-y-2 max-w-xl mx-auto border-white/60">
          <AlertCircle size={44} className="mx-auto mb-2 opacity-25 text-sky-400" />
          <p className="text-2xl font-black text-slate-700">لا توجد بيانات بعد</p>
          <p className="text-sm font-bold text-slate-400">لا يوجد أي إنذارات مسجلة لهذا الشهر</p>
        </div>
      )}
    </motion.div>
  );
}
