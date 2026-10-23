import { Member, Year } from "../types";

/**
 * تطبيع الحروف العربية للبحث الدقيق بغض النظر عن طريقة الكتابة:
 * (ي/ى/ی، ك/ک، أ/إ/آ/ا، ة/ه) مع إزالة التشكيل والتطويل
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    // توحيد الهمزات والألف
    .replace(/[أإآٱ]/g, 'ا')
    // توحيد التاء المربوطة والهاء
    .replace(/ة/g, 'ه')
    // توحيد الياء والألف المقصورة والياء الفارسية
    .replace(/[ىيی]/g, 'ي')
    // توحيد الكاف
    .replace(/ك|ک/g, 'ك')
    // إزالة علامات التشكيل
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // إزالة التطويل (الكشيدة)
    .replace(/\u0640/g, '');
}

const MONTH_NAMES_AR: Record<string, string> = {
  '01': 'يناير',
  '02': 'فبراير',
  '03': 'مارس',
  '04': 'أبريل',
  '05': 'مايو',
  '06': 'يونيو',
  '07': 'يوليو',
  '08': 'أغسطس',
  '09': 'سبتمبر',
  '10': 'أكتوبر',
  '11': 'نوفمبر',
  '12': 'ديسمبر',
};

/**
 * تحويل صيغة YYYY-MM إلى اسم شهر عربي واضح
 */
export function formatMonthName(monthKey: string): string {
  if (!monthKey) return "الشهر الحالي";
  const parts = monthKey.split('-');
  if (parts.length === 2 && MONTH_NAMES_AR[parts[1]]) {
    return `${MONTH_NAMES_AR[parts[1]]} ${parts[0]}`;
  }
  return monthKey;
}

export function getRank(member: Member): string {
  const total = member.totalScore + member.bonus;
  if (total >= 45) return "Media Legend";
  if (total >= 40) return "Elite Hero";
  if (total >= 36) return "Team Star";
  if (total >= 32) return "Creative Mind";
  if (total >= 28) return "Active Member";
  if (total >= 22) return "Rising Soul";
  return "Maspero Member";
}

export function getTopMembers(members: Member[], year: Year): Member[] {
  return members
    .filter(m => m.year === year)
    // الاعتماد على حقل type بدلاً من الفحص النصي
    .filter(m => m.warnings.filter(w => w.type === 'warning').length === 0)
    .filter(m => !m.isOut)
    .sort((a, b) => {
      return b.totalScore - a.totalScore || b.bonus - a.bonus;
    });
}

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
