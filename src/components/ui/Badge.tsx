import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors gap-1 focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-800 border border-brand-200',
        navy: 'bg-slate-900 text-slate-100',
        secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-800 border border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border border-rose-200',
        purple: 'bg-purple-50 text-purple-700 border border-purple-200',
        teal: 'bg-teal-50 text-teal-700 border border-teal-200',
        outline: 'text-slate-600 border border-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
