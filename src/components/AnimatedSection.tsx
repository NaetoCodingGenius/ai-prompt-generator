'use client';

import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function FadeIn({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SlideInLeft({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SlideInRight({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
