export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#141a25" />
        <path d="M21.5 10.5a8 8 0 1 0 0 11" fill="none" stroke="#c6f432" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="22" cy="16" r="2.4" fill="#c6f432" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        crypto<span className="text-volt">nize</span>
      </span>
    </span>
  )
}
