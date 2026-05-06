import { cn } from "@/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50";

  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg",
    secondary: "bg-surface text-text-primary hover:bg-surface/80",
    ghost: "bg-transparent text-text-primary hover:bg-black/5",
    outline: "border-2 border-primary/20 text-primary hover:bg-primary/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-2.5 text-base rounded-xl",
    lg: "px-8 py-3 text-lg rounded-2xl",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}