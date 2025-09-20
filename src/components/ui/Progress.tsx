import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size = 'md', variant = 'default', showValue = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };
    
    const variantClasses = {
      default: 'bg-primary-600',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    };

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full w-full flex-1 transition-all duration-500 ease-in-out rounded-full",
              variantClasses[variant]
            )}
            style={{
              transform: `translateX(-${100 - percentage}%)`
            }}
          />
        </div>
        {showValue && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {percentage.toFixed(1)}%
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
