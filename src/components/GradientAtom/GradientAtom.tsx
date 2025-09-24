import AtomSvg from "../../assets/images/atom.svg?react";

export default function GradientAtomIcon() {
  return (
    <svg
      className="w-9 h-9"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>
      <AtomSvg className="w-full h-full" style={{ stroke: "url(#grad)" }} />
    </svg>
  );
}
