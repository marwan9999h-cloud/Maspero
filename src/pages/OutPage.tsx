import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Heart, Stars } from 'lucide-react';
import { getOutMembers } from '../data/dataLoader';

export default function OutPage() {
  const outMembers = useMemo(() => {
    return getOutMembers();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto space-y-10 py-6"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-rose-50 text-rose-500 rounded-full font-bold border border-rose-100 text-sm">
           خارج الأسرة / Out Members
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
          برا الأسرة ونتمنالهم كل خير الفترة الجاية ❤️
        </h1>
        <p className="text-slate-500 text-base md:text-lg">شكراً لكل لحظة إبداع شاركتوها معانا</p>
      </div>

      {outMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outMembers.map((member) => (
            <div 
              key={member.id}
              className="bg-white/80 border border-white/60 p-5 rounded-2xl flex items-center justify-between group hover:border-rose-200 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-lg">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-800 block">{member.name}</span>
                  <span className="text-[10px] font-bold text-slate-400">{member.year}</span>
                </div>
              </div>
              <Heart className="text-rose-200 group-hover:text-rose-500 transition-colors" size={20} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-3xl text-slate-400 space-y-2 border-white/60">
          <Heart size={44} className="mx-auto mb-2 opacity-25 text-rose-400" />
          <p className="text-2xl font-black text-slate-700">لا توجد بيانات بعد</p>
          <p className="text-sm font-bold text-slate-400">لا يوجد أعضاء خارج الأسرة حالياً</p>
        </div>
      )}

      <div className="pt-8 text-center">
         <div className="inline-flex items-center gap-2 text-slate-400 font-medium text-sm">
            <Stars size={16} />
            ستظلون دائماً جزءاً من تاريخ Maspero Team
         </div>
      </div>
    </motion.div>
  );
}
