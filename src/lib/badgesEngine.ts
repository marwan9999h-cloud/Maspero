import { Member, MemberData, Year } from "../types";
import { BADGES_LIST, BADGES_MAP, BadgeDefinition } from "../data/badgesDefinition";
import { getAllParsedMonths, getMembersForMonth, ParsedMonth } from "../data/dataLoader";
import { formatMonthName } from "./utils";

export interface BadgeOccurrence {
  monthKey: string;
  monthName: string;
  reason: string;
}

export interface UnlockedBadge {
  badge: BadgeDefinition;
  earnedMonths: string[];
  latestMonth: string;
  dynamicReason: string;
  occurrences: BadgeOccurrence[];
}

export interface LockedBadge {
  badge: BadgeDefinition;
  condition: string;
}

export interface MemberBadgesResult {
  unlocked: UnlockedBadge[];
  locked: LockedBadge[];
  totalUnlockedCount: number;
  totalAvailableCount: number;
}

/**
 * محرك احتساب البادجات والإنجازات للأعضاء
 * يعتمد كلياً على التقييمات الشهرية الحقيقية والمساهمات المعتمدة، مع حفظ تاريخ استحقاق كل إنجاز
 */
export function calculateMemberBadges(member: MemberData): MemberBadgesResult {
  const allMonths = getAllParsedMonths().sort((a, b) => a.key.localeCompare(b.key)); // ترتيب تصاعدي للشهور
  const occurrencesMap = new Map<string, BadgeOccurrence[]>();

  const addOccurrence = (badgeId: string, monthKey: string, reason: string) => {
    const list = occurrencesMap.get(badgeId) || [];
    // منع تكرار نفس البادج في نفس الشهر
    if (!list.some(item => item.monthKey === monthKey)) {
      list.push({
        monthKey,
        monthName: formatMonthName(monthKey),
        reason,
      });
      occurrencesMap.set(badgeId, list);
    }
  };

  // 1. حساب البادجات الشهرية لكل شهر على حدة
  for (const pMonth of allMonths) {
    const monthKey = pMonth.key;
    const ev = pMonth.evaluations.find(e => e.memberId === member.id);
    const monthMembers = getMembersForMonth(monthKey);
    const memberFull = monthMembers.find(m => m.id === member.id);

    // التحقق من وجود تقييم فعلي للعضو في هذا الشهر
    if (ev && memberFull && memberFull.hasEvaluation) {
      const attendance = memberFull.grades.attendance;
      const interaction = memberFull.grades.interaction;
      const leadership = memberFull.grades.leadership;
      const behavior = memberFull.grades.behavior;
      const totalScore = memberFull.totalScore;
      const bonus = memberFull.bonus;
      const combinedScore = memberFull.combinedScore;

      // فئة الأداء والتقييم
      if (totalScore === 40) {
        addOccurrence('perfect_score', monthKey, `حصلت على الدرجة الكاملة 40/40 في تقييم شهر ${formatMonthName(monthKey)}.`);
      } else if (totalScore >= 36) {
        addOccurrence('excellent_performance', monthKey, `حققت أداءً متميزاً بمجموع ${totalScore}/40 في تقييم شهر ${formatMonthName(monthKey)}.`);
      }

      if (attendance >= 8 && interaction >= 8 && leadership >= 8 && behavior >= 8) {
        addOccurrence('balanced_member', monthKey, `حققت 8/10 أو أكثر في جميع المعايير الأربعة (حضور ${attendance}، تفاعل ${interaction}، قيادة ${leadership}، سلوك وتعامل ${behavior}) في ${formatMonthName(monthKey)}.`);
      }

      // فئة المهارات الفردية
      if (attendance >= 9) {
        addOccurrence('attendance_pro', monthKey, `حققت درجة ${attendance}/10 في معيار الحضور والالتزام خلال شهر ${formatMonthName(monthKey)}.`);
      }

      if (interaction >= 9) {
        addOccurrence('interaction_star', monthKey, `حققت درجة ${interaction}/10 في معيار المشاركة والتفاعل خلال شهر ${formatMonthName(monthKey)}.`);
      }

      if (leadership >= 9) {
        addOccurrence('leadership_badge', monthKey, `حققت درجة ${leadership}/10 في معيار المبادرة والقيادة خلال شهر ${formatMonthName(monthKey)}.`);
      }

      if (behavior === 10) {
        addOccurrence('behavior_excellence', monthKey, `حققت الدرجة الكاملة 10/10 في معيار السلوك والتعامل خلال شهر ${formatMonthName(monthKey)}.`);
      }

      // فئة الترتيب والبونص
      if (bonus > 0) {
        addOccurrence('bonus_achiever', monthKey, `حصلت على +${bonus} بونص تميز إضافي في تقييم شهر ${formatMonthName(monthKey)}.`);
      }

      // أعلى بونص في الفرقة (مع دعم التعادل)
      const sameYearMembers = monthMembers.filter(m => m.year === member.year && m.hasEvaluation);
      const maxBonusInYear = Math.max(0, ...sameYearMembers.map(m => m.bonus));
      if (bonus > 0 && bonus === maxBonusInYear) {
        addOccurrence('bonus_leader', monthKey, `حققت أعلى قيمة بونص (+${bonus}) على مستوى ${member.year} في ${formatMonthName(monthKey)}.`);
      }

      // نجم الفرقة (المركز الأول في الترتيب الرسمي للفرقة مع دعم التعادل واستبعاد الإنذارات)
      const eligibleForRanking = sameYearMembers.filter(m => 
        m.hasEvaluation && 
        m.warnings.filter(w => w.type === 'warning').length === 0 && 
        !m.isOut
      );

      if (eligibleForRanking.length > 0) {
        const uniqueScores = Array.from(new Set(eligibleForRanking.map(m => m.combinedScore))).sort((a, b) => b - a);
        const topScore = uniqueScores[0];
        // إذا كان العضو مؤهلاً وحقق أعلى مجموع متكافئ (المركز الأول)
        if (memberFull.warnings.filter(w => w.type === 'warning').length === 0 && !memberFull.isOut && combinedScore === topScore) {
          addOccurrence('top_of_the_team', monthKey, `حققت المركز الأول (Rank 1) في الترتيب الرسمي لـ ${member.year} لشهر ${formatMonthName(monthKey)} بمجموع (${combinedScore}).`);
        }
      }
    }

    // فئة مساهمات فريقي Media وHR (تعتمد على سجل المساهمات الفعلي المعتمد في الشهر)
    const conts = pMonth.contributions || [];
    for (const c of conts) {
      if (c.memberId === member.id) {
        if (c.role === 'media_contributor') {
          addOccurrence('media_contributor', monthKey, `سجلت مشاركة فعلية معتمدة في مهام فريق الميديا خلال ${formatMonthName(monthKey)}.`);
        } else if (c.role === 'media_excellence') {
          addOccurrence('media_excellence', monthKey, `قدمت عملاً إبداعياً متميزاً مع فريق الميديا في ${formatMonthName(monthKey)}.`);
        } else if (c.role === 'hr_contributor') {
          addOccurrence('hr_contributor', monthKey, `سجلت مشاركة تنظيمية نشطة في مهام فريق الموارد البشرية (HR) خلال ${formatMonthName(monthKey)}.`);
        } else if (c.role === 'hr_excellence') {
          addOccurrence('hr_excellence', monthKey, `قدمت مساهمة استثنائية وأداءً متميزاً مع فريق HR في ${formatMonthName(monthKey)}.`);
        }
      }
    }
  }

  // 2. حساب إنجازات الاستمرارية والتطور (Consistency & Evolution)
  // حصر الشهور التي تحتوي على تقييم فعلي فقط دون احتساب الغائب كـ 0
  const evaluatedMonthsHistory: { monthKey: string; monthName: string; totalScore: number }[] = [];
  for (const pMonth of allMonths) {
    const ev = pMonth.evaluations.find(e => e.memberId === member.id);
    if (ev) {
      const att = Math.min(10, Math.max(0, Number(ev.attendance) || 0));
      const inter = Math.min(10, Math.max(0, Number(ev.interaction) || 0));
      const lead = Math.min(10, Math.max(0, Number(ev.leadership) || 0));
      const beh = Math.min(10, Math.max(0, Number(ev.behavior) || 0));
      const total = att + inter + lead + beh;
      evaluatedMonthsHistory.push({
        monthKey: pMonth.key,
        monthName: formatMonthName(pMonth.key),
        totalScore: total,
      });
    }
  }

  // Consistent Performer: 3 أشهر تقييم متتالية تحتوي على مجموع >= 32
  if (evaluatedMonthsHistory.length >= 3) {
    for (let i = 0; i <= evaluatedMonthsHistory.length - 3; i++) {
      const window = evaluatedMonthsHistory.slice(i, i + 3);
      if (window.every(m => m.totalScore >= 32)) {
        const lastMonth = window[2];
        const monthsNames = window.map(m => m.monthName).join(' و ');
        addOccurrence(
          'consistent_performer', 
          lastMonth.monthKey, 
          `حققت أداءً ثابتاً بمجموع 32/40 أو أكثر في 3 أشهر تقييم متتالية (${monthsNames}).`
        );
      }
    }
  }

  // Rising Star & Comeback: مقارنة كل شهرين متتاليين يحتويان على تقييم فعلي
  if (evaluatedMonthsHistory.length >= 2) {
    for (let i = 1; i < evaluatedMonthsHistory.length; i++) {
      const prev = evaluatedMonthsHistory[i - 1];
      const curr = evaluatedMonthsHistory[i];

      // Rising Star: الحصول على 36 أو أكثر بعد شهر سابق كان أقل من 30
      if (prev.totalScore < 30 && curr.totalScore >= 36) {
        addOccurrence(
          'rising_star',
          curr.monthKey,
          `حققت قفزة استثنائية بمجموع ${curr.totalScore}/40 في ${curr.monthName} بعد تقييم ${prev.totalScore}/40 في ${prev.monthName}.`
        );
      }

      // Comeback: ارتفاع المجموع بمقدار 5 درجات أو أكثر عن الشهر السابق مباشرة
      const diff = curr.totalScore - prev.totalScore;
      if (diff >= 5) {
        addOccurrence(
          'comeback',
          curr.monthKey,
          `حققت عودة قوية بارتفاع قدره +${diff} درجات في ${curr.monthName} (${curr.totalScore}/40) مقارنة بـ ${prev.monthName} (${prev.totalScore}/40).`
        );
      }
    }
  }

  // بناء قوائم البادجات المحققة والمقفولة
  const unlocked: UnlockedBadge[] = [];
  const locked: LockedBadge[] = [];

  for (const bDef of BADGES_LIST) {
    const occurrences = occurrencesMap.get(bDef.id);
    if (occurrences && occurrences.length > 0) {
      // فرز مرات الحصول على البادج من الأحدث إلى الأقدم
      occurrences.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
      const latest = occurrences[0];
      unlocked.push({
        badge: bDef,
        earnedMonths: occurrences.map(o => o.monthKey),
        latestMonth: latest.monthKey,
        dynamicReason: latest.reason,
        occurrences,
      });
    } else {
      locked.push({
        badge: bDef,
        condition: bDef.condition,
      });
    }
  }

  return {
    unlocked,
    locked,
    totalUnlockedCount: unlocked.length,
    totalAvailableCount: BADGES_LIST.length,
  };
}
