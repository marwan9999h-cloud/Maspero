import React from 'react';
import { motion } from 'motion/react';
import { Facebook, Instagram, Youtube, Mail, Globe, Heart, Shield, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  const social = [
    { icon: <Facebook />, label: "Facebook", color: "hover:text-blue-600" },
    { icon: <Instagram />, label: "Instagram", color: "hover:text-pink-600" },
    { icon: <Youtube />, label: "YouTube", color: "hover:text-red-600" },
    { icon: <TikTokIcon />, label: "TikTok", color: "hover:text-slate-900" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-16 py-12"
    >
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-sky-400 blur-3xl opacity-10 rounded-full" />
          <img src="/1775344671830-01.jpg" alt="Maspero Logo" className="w-32 md:w-48 h-auto mx-auto relative z-10 rounded-3xl shadow-2xl" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-sky-600 tracking-tight">عن ماسبيرو تيم</h1>
          <div className="w-24 h-2 bg-sky-200 mx-auto rounded-full" />
        </div>
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          نشاط تطوعي تابع لقسم الإعلام، تأسس ليجمع شغف الطلاب بالإبداع الإعلامي والعمل الجماعي المنظم.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-3xl space-y-4 text-center">
           <Users className="mx-auto text-sky-500" size={32} />
           <h3 className="text-xl font-bold text-slate-800">العمل الجماعي</h3>
           <p className="text-slate-500 text-sm">نؤمن أن القوة تكمن في تماسكنا وتكامل أدوارنا كفريق واحد.</p>
        </div>
        <div className="glass p-8 rounded-3xl space-y-4 text-center">
           <Zap className="mx-auto text-sky-500" size={32} />
           <h3 className="text-xl font-bold text-slate-800">التطوير المستمر</h3>
           <p className="text-slate-500 text-sm">نسعى دائماً لرفع كفاءة الأعضاء من خلال التجربة والمشاركة الفعالة.</p>
        </div>
        <div className="glass p-8 rounded-3xl space-y-4 text-center">
           <Heart className="mx-auto text-sky-500" size={32} />
           <h3 className="text-xl font-bold text-slate-800">الإبداع والروح</h3>
           <p className="text-slate-500 text-sm">الإعلام روح قبل أن يكون أدوات، ونحن ننمي هذه الروح داخل كل عضو.</p>
        </div>
      </div>

      <section className="glass p-12 rounded-[3rem] space-y-8 bg-sky-600/5 border-sky-100">
         <h2 className="text-3xl font-bold text-slate-800 text-center">تواصل معنا</h2>
         <div className="flex justify-center flex-wrap gap-8">
            {social.map((item, idx) => (
              <a 
                key={idx} 
                href="#" 
                className={`flex flex-col items-center gap-2 text-slate-400 transition-all ${item.color} group hover:scale-110`}
              >
                <div className="text-3xl">{item.icon}</div>
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </a>
            ))}
         </div>
      </section>

      <div className="text-center text-slate-400 text-sm">
         <p>© 2024 Maspero Team. All rights reserved.</p>
         <p className="mt-2">Created with passion for Media Students.</p>
      </div>
    </motion.div>
  );
}

function TikTokIcon() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="currentColor"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.51 4.3 1.05.35 2.14.39 3.25.32V8.4c-1.14.07-2.28-.05-3.39-.42-.08 1.25-.4 2.47-.94 3.59-.01 1.34-.01 2.68.01 4.02 0 4.19-2.14 7.24-6.38 7.24-4.8 0-7.85-3.04-7.85-7.85 0-5.22 3.86-8.91 9.07-8.19.01 1.51.01 3.02.01 4.54-1.92-.47-4.14.18-4.6 2.13-.39 1.63.4 3.32 1.9 3.87 1.83.67 3.87-.04 4.51-1.89.04-4.19.04-8.38.04-12.57-.03-2.31-.03-4.63-.12-6.94Z" />
    </svg>
  );
}
