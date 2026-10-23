import { EvaluationInput, Member, MemberContribution, MemberData, MonthData, Warning } from "../types";
import { MEMBERS_DATA } from "./members";

interface RawMonthModule {
  default?: MonthData;
  evaluations?: EvaluationInput[];
  warnings?: Warning[];
  contributions?: MemberContribution[];
}

// تحميل جميع ملفات الشهور تلقائياً عند إضافة أي ملف بصيغة YYYY-MM.ts
const monthModules = ((import.meta as any).glob('./months/*.ts', { eager: true }) || {}) as Record<string, RawMonthModule>;

export interface ParsedMonth {
  key: string; // e.g. "2026-10"
  evaluations: EvaluationInput[];
  warnings: Warning[];
  contributions: MemberContribution[];
}

function parseMonths(): Map<string, ParsedMonth> {
  const map = new Map<string, ParsedMonth>();

  for (const [path, mod] of Object.entries(monthModules)) {
    const match = path.match(/(\d{4}-\d{2})\.ts$/);
    if (!match) continue;
    const monthKey = match[1];

    const evals = mod.default?.evaluations || mod.evaluations || [];
    const warns = mod.default?.warnings || mod.warnings || [];
    const conts = mod.default?.contributions || mod.contributions || [];

    map.set(monthKey, {
      key: monthKey,
      evaluations: Array.isArray(evals) ? evals : [],
      warnings: Array.isArray(warns) ? warns : [],
      contributions: Array.isArray(conts) ? conts : [],
    });
  }

  return map;
}

const parsedMonths = parseMonths();

export function getAllParsedMonths(): ParsedMonth[] {
  return Array.from(parsedMonths.values());
}

/**
 * جميع مفاتيح الشهور المتاحة مرتبة من الأحدث إلى الأقدم
 */
export const AVAILABLE_MONTHS: string[] = Array.from(parsedMonths.keys()).sort((a, b) => b.localeCompare(a));

/**
 * الشهر الافتراضي: أحدث شهر يحتوي على بيانات مسجلة، أو أحدث شهر متاح
 */
export const DEFAULT_MONTH: string = 
  AVAILABLE_MONTHS.find(m => {
    const data = parsedMonths.get(m);
    return data && (data.evaluations.length > 0 || data.warnings.length > 0);
  }) || AVAILABLE_MONTHS[0] || "";

/**
 * الحصول على بيانات شهر معين
 */
export function getMonthData(monthKey: string): ParsedMonth | undefined {
  return parsedMonths.get(monthKey);
}

/**
 * جلب جميع الأعضاء ودمجهم مع تقييمات وإنذارات الشهر المحدد
 * مع التحقق من عدم تكرار الـ IDs ومراعاة أن العضو غير المقيم لا يحسب له أصفار
 */
export function getMembersForMonth(monthKey: string): Member[] {
  const monthData = parsedMonths.get(monthKey);
  const evals = monthData?.evaluations || [];
  const warns = monthData?.warnings || [];

  // منع التكرار وفلترة الأعضاء حسب الـ id
  const seenIds = new Set<string>();
  const uniqueMembers: MemberData[] = [];
  for (const m of MEMBERS_DATA) {
    if (!seenIds.has(m.id)) {
      seenIds.add(m.id);
      uniqueMembers.push(m);
    }
  }

  return uniqueMembers.map((baseMember) => {
    const ev = evals.find((e) => e.memberId === baseMember.id);
    const hasEvaluation = Boolean(ev);

    // إذا وُجد تقييم، يتم حساب الدرجات من المحاور الأربعة من 40
    const attendance = hasEvaluation ? Math.min(10, Math.max(0, Number(ev?.attendance) || 0)) : 0;
    const interaction = hasEvaluation ? Math.min(10, Math.max(0, Number(ev?.interaction) || 0)) : 0;
    const leadership = hasEvaluation ? Math.min(10, Math.max(0, Number(ev?.leadership) || 0)) : 0;
    const behavior = hasEvaluation ? Math.min(10, Math.max(0, Number(ev?.behavior) || 0)) : 0;
    const bonus = hasEvaluation ? Math.max(0, Number(ev?.bonus) || 0) : 0;

    const totalScore = hasEvaluation ? (attendance + interaction + leadership + behavior) : 0;
    const combinedScore = hasEvaluation ? (totalScore + bonus) : 0;

    const memberWarnings = warns.filter((w) => w.memberId === baseMember.id);

    return {
      ...baseMember,
      hasEvaluation,
      grades: {
        attendance,
        interaction,
        leadership,
        behavior,
      },
      bonus,
      totalScore,
      combinedScore,
      warnings: memberWarnings,
    };
  });
}

/**
 * الحصول على عضو معين في شهر محدد
 */
export function getMemberById(memberId: string, monthKey: string): Member | undefined {
  const members = getMembersForMonth(monthKey);
  return members.find((m) => m.id === memberId);
}

/**
 * استخراج السجل التاريخي الحقيقي لدرجات عضو عبر الشهور المسجلة فقط
 * لا يحسب الشهور التي لم يقيم فيها
 */
export function getMemberHistoricalScores(memberId: string): { month: string; name: string; score: number }[] {
  const chronologicalMonths = Array.from(parsedMonths.keys()).sort((a, b) => a.localeCompare(b));
  const history: { month: string; name: string; score: number }[] = [];

  for (const mKey of chronologicalMonths) {
    const mData = parsedMonths.get(mKey);
    if (!mData) continue;
    const ev = mData.evaluations.find((e) => e.memberId === memberId);
    if (ev) {
      const attendance = Math.min(10, Math.max(0, Number(ev.attendance) || 0));
      const interaction = Math.min(10, Math.max(0, Number(ev.interaction) || 0));
      const leadership = Math.min(10, Math.max(0, Number(ev.leadership) || 0));
      const behavior = Math.min(10, Math.max(0, Number(ev.behavior) || 0));
      const totalScore = attendance + interaction + leadership + behavior;
      history.push({
        month: mKey,
        name: mKey,
        score: totalScore,
      });
    }
  }

  return history;
}

/**
 * الحصول على أعضاء خارج الأسرة
 */
export function getOutMembers(): MemberData[] {
  return MEMBERS_DATA.filter((m) => m.isOut);
}
