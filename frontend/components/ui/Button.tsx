import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover",
    secondary:
      "bg-secondary text-white hover:bg-secondary-hover",
    outline:
      "border border-border-strong bg-surface text-text hover:bg-surface-muted",
    danger:
      "bg-danger text-white hover:opacity-90",
    ghost:
      "bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-md
        font-medium
        transition-colors
        focus-visible:outline-2
        focus-visible:outline-primary
        focus-visible:outline-offset-2
        disabled:pointer-events-none
        disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}