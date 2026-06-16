import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, asChild, children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] hover:-translate-y-0.5';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    save: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
    update: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm',
    delete: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    view: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    edit: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    approve: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    reject: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    cancel: 'bg-slate-500 hover:bg-slate-600 text-white shadow-sm',
  };

  const sizes = {
    default: 'h-11 px-5 py-2',
    sm: 'h-9 px-4 text-xs rounded-lg',
    lg: 'h-14 px-8 text-lg rounded-2xl',
    icon: 'h-11 w-11',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
