interface AnimatedLogoProps {
  size?: 'sm' | 'md';
  className?: string;
  'data-testid'?: string;
}

export function AnimatedLogo({
  size = 'md',
  className = '',
  'data-testid': testId,
}: AnimatedLogoProps) {
  const sizeClasses = size === 'sm'
    ? 'w-6 h-6'
    : 'w-8 h-8 sm:w-9 sm:h-9';

  return (
    <span className="djzs-logo-wrap">
      <img
        src="/logo.png"
        alt="DJZS"
        className={`djzs-logo-img rounded-lg ${sizeClasses} ${className}`}
        data-testid={testId}
      />
    </span>
  );
}

export default AnimatedLogo;
