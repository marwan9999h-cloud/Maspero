import { EvaluationInput, MemberContribution, Warning } from "../../types";

/**
 * =========================================================================
 * بيانات شهر أكتوبر 2026 (2026-10) - بيانات تجريبية للاختبار الشامل
 * 
 * الحالات المغطاة للاختبار:
 * 1. عضو تجريبي 1 (test-1): درجات مرتفعة (38)، بونص 0، بدون أي إنذارات (فرسان القمة مركز 2).
 * 2. عضو تجريبي 2 (test-2): درجات متوسطة (31)، بونص مرتفع (+8) يجعله يتصدر المركز 1 بمجموع (39)، مع لفت نظر notice (لا يستبعده من القمة).
 * 3. عضو تجريبي 3 (test-3): درجات متوسطة/منخفضة (23)، لديه إنذار رسمي warning ولفت نظر notice (تعدد السجلات والتواريخ، واستبعاده من القمة وظهوره في الإنذارات Level 1).
 * 4. عضو تجريبي 4 (test-4): درجات منخفضة (17)، لديه إنذاران رسميان warning (ظهوره في الإنذارات Level 2).
 * 5. عضو تجريبي 5 (test-5): غير موجود في التقييمات نهائياً (لا يحصل على أصفار ولا يدخل في الإحصائيات أو الترتيب).
 * =========================================================================
 */

export const evaluations: EvaluationInput[] = [
  // عضو تجريبي 1: درجات مرتفعة
  {
    memberId: "test-1",
    attendance: 10,
    interaction: 9,
    leadership: 9,
    behavior: 10,
    bonus: 0,
  },
  // عضو تجريبي 2: درجات متوسطة + بونص يؤثر على الترتيب
  {
    memberId: "test-2",
    attendance: 8,
    interaction: 8,
    leadership: 7,
    behavior: 8,
    bonus: 8,
  },
  // عضو تجريبي 3: درجات متوسطة/منخفضة
  {
    memberId: "test-3",
    attendance: 6,
    interaction: 5,
    leadership: 5,
    behavior: 7,
    bonus: 0,
  },
  // عضو تجريبي 4: درجات منخفضة
  {
    memberId: "test-4",
    attendance: 4,
    interaction: 4,
    leadership: 4,
    behavior: 5,
    bonus: 1,
  },
  // ملاحظة: عضو تجريبي 5 (test-5) لم يتم إدراجه هنا عن قصد لاختبار حالة عدم وجود تقييم
];

export const warnings: Warning[] = [
  // لفت نظر لعضو تجريبي 2 (لا يؤثر على فرسان القمة)
  {
    memberId: "test-2",
    type: "notice",
    reason: "لفت نظر تجريبي: تأخر بسيط عن موعد تسليم التكليف",
    date: "2026-10-12",
  },
  // سجلان لعضو تجريبي 3 (إنذار رسمي + لفت نظر بتواريخ مختلفة)
  {
    memberId: "test-3",
    type: "notice",
    reason: "لفت نظر تجريبي: عدم الالتزام بالزي الموحد للأسرة",
    date: "2026-10-05",
  },
  {
    memberId: "test-3",
    type: "warning",
    reason: "إنذار تجريبي رسمي: الغياب عن التوزيعة بدون إذن مسبق",
    date: "2026-10-18",
  },
  // إنذاران رسميان لعضو تجريبي 4 (Level 2)
  {
    memberId: "test-4",
    type: "warning",
    reason: "إنذار تجريبي 1: تكرار عدم التفاعل مع تكليفات الفريق",
    date: "2026-10-10",
  },
  {
    memberId: "test-4",
    type: "warning",
    reason: "إنذار تجريبي 2: مغادرة الفعالية مبكراً دون إذن مسؤول اللجنة",
    date: "2026-10-22",
  },
];

export const contributions: MemberContribution[] = [];

export default {
  evaluations,
  warnings,
  contributions,
};
