interface ComingSoonProps {
  children: React.ReactNode;
  className?: string;
}

export function ComingSoon({ children, className = '' }: ComingSoonProps) {
  return (
    <div className={`blur-dev-wrapper ${className}`}>
      <div className="blur-dev">{children}</div>
      <div className="blur-dev-overlay">
        <span className="blur-dev-badge">Coming Soon</span>
      </div>
    </div>
  );
}
