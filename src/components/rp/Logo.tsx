export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "size-7" : "size-8";
  const glyph = size === "sm" ? "text-base" : "text-lg";
  const word = size === "sm" ? "text-lg" : "text-xl";

  return (
    <span className="flex items-center gap-2.5">
      <span className={`grid ${box} place-items-center rounded-md bg-pulse`}>
        <span className={`font-display ${glyph} leading-none text-on-dark`}>&#42;</span>
      </span>
      <span className={`font-display ${word} tracking-tight`}>ReviewPulse</span>
    </span>
  );
}
