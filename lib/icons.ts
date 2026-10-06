import {
  CalendarCheck,
  Languages,
  Activity,
  Cpu,
  Building2,
  ShieldCheck,
  Smile,
  AlignHorizontalDistributeCenter,
  Sparkles,
  Stethoscope,
  BadgePercent,
  TrainFront,
  Microscope,
  Circle,
  Gem,
  Sun,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated icon registry for the dental site. Using named imports (not
 * `import * as Icons`) keeps tree-shaking intact — only these icons ship.
 * Keys must match the `icon` strings in database/clinic.json (usps + categories).
 */
const REGISTRY: Record<string, LucideIcon> = {
  // USPs
  CalendarCheck,
  Languages,
  Activity,
  Cpu,
  Building2,
  ShieldCheck,
  // Categories
  Smile,
  AlignHorizontalDistributeCenter,
  Sparkles,
  Stethoscope,
  // Misc / trust
  BadgePercent,
  TrainFront,
  Microscope,
  Gem,
  Sun,
};

export function getIcon(name: string, fallback: LucideIcon = Circle): LucideIcon {
  return REGISTRY[name] ?? fallback;
}
