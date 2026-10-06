import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  BUTTON_BASE,
  BUTTON_SIZE,
  BUTTON_VARIANT,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/button-styles";

/**
 * LineCta와 같은 버튼 토큰을 쓰는 일반 내부링크 버튼.
 * Hero/DoctorAuthority/Treatments 등에서 각자 손으로 쓰던 버튼 클래스를 통일한다.
 */
export default function ButtonLink({
  href,
  children,
  variant = "outlineLight",
  size = "md",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(BUTTON_BASE, BUTTON_SIZE[size], BUTTON_VARIANT[variant], className)}
    >
      {children}
    </Link>
  );
}
