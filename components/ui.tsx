
import React from 'react';
import { Icons } from './Icons';

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Card = ({ children, className = '', as: Component = 'div', ...rest }: CardProps & { [key: string]: any }) => {
  return (
    <Component className={`bg-surface border border-outline rounded-2xl shadow-md ${className}`} {...rest}>
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-6 border-b border-outline ${className}`}>{children}</div>;
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold text-on-surface ${className}`}>{children}</h3>;
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
};

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  as?: React.ElementType;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className, variant = 'filled', size = 'md', isLoading = false, children, as: Component = 'button', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantClasses = {
      filled: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      tonal: 'bg-primary-container text-on-primary-container hover:bg-opacity-80 focus:ring-primary-400',
      outlined: 'border-2 border-outline text-on-surface-variant bg-transparent hover:bg-surface-variant hover:text-on-surface focus:ring-primary-400',
      ghost: 'bg-transparent text-primary-400 hover:bg-primary-container/50 hover:text-primary-300 focus:ring-primary-500',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3 text-base',
    };
    
    const { disabled, ...rest } = props;
    const isDisabled = isLoading || disabled;

    return (
      <Component
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        disabled={Component === 'button' ? isDisabled : undefined}
        aria-disabled={Component !== 'button' && isDisabled ? true : undefined}
        {...rest}
      >
        {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Component>
    );
  }
);
Button.displayName = "Button";
