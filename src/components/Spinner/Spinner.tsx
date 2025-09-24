export default function Spinner() {
  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-60"
    >
      <svg
        className="animate-spin"
        width="100"
        height="100"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="url(#gradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
