import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export default function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  const variants = {
    default: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    warning: "bg-complementary-light text-complementary-hover",
    danger: "bg-danger-light text-danger",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-xs
        font-semibold
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}