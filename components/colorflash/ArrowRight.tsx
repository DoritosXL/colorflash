export function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 9h11M9.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
