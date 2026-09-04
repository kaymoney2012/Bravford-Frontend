interface Props {
  size?: number;
}

/** SVG recreation of the Bravford ASSDA logo (open book + pen nib + circle) */
export default function SchoolLogo({ size = 38 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book base curve */}
      <path
        d="M15 68 Q50 56 85 68 L85 80 Q50 68 15 80 Z"
        fill="none"
        stroke="#C8922A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Left page */}
      <path
        d="M15 35 L15 68 Q32 62 50 62 L50 29 Q32 29 15 35 Z"
        fill="none"
        stroke="#C8922A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <path
        d="M85 35 L85 68 Q68 62 50 62 L50 29 Q68 29 85 35 Z"
        fill="none"
        stroke="#C8922A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Spine */}
      <line x1="50" y1="29" x2="50" y2="62" stroke="#C8922A" strokeWidth="3.5" />
      {/* Pen nib */}
      <path
        d="M50 29 L46 18 L50 10 L54 18 Z"
        fill="none"
        stroke="#C8922A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Pen top circle */}
      <circle cx="50" cy="8" r="5" fill="none" stroke="#C8922A" strokeWidth="3" />
    </svg>
  );
}
