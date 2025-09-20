import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  };

  return (
    <div
      className={cn(
        "bg-gray-200 dark:bg-gray-700",
        variant === 'text' && "h-4 rounded",
        variant === 'circular' && "rounded-full",
        variant === 'rectangular' && "rounded-md",
        animationClasses[animation],
        className
      )}
    />
  );
};
