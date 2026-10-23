import React from 'react';
import {
  Crown,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Flame,
  HeartHandshake,
  Award,
  Zap,
  Target,
  Video,
  Camera,
  Users,
  UserCheck,
  Repeat,
  TrendingUp,
  Compass,
  Medal,
} from 'lucide-react';

interface BadgeIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function BadgeIcon({ name, size = 18, className = '' }: BadgeIconProps) {
  switch (name) {
    case 'Crown':
      return <Crown size={size} className={className} />;
    case 'Trophy':
      return <Trophy size={size} className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck size={size} className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 size={size} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'Flame':
      return <Flame size={size} className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake size={size} className={className} />;
    case 'Award':
      return <Award size={size} className={className} />;
    case 'Zap':
      return <Zap size={size} className={className} />;
    case 'Target':
      return <Target size={size} className={className} />;
    case 'Video':
      return <Video size={size} className={className} />;
    case 'Camera':
      return <Camera size={size} className={className} />;
    case 'Users':
      return <Users size={size} className={className} />;
    case 'UserCheck':
      return <UserCheck size={size} className={className} />;
    case 'Repeat':
      return <Repeat size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Compass':
      return <Compass size={size} className={className} />;
    default:
      return <Medal size={size} className={className} />;
  }
}
