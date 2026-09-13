export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "size-7" : "size-8";
  const word = size === "sm" ? "text-lg" : "text-xl";

  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/ChatGPT Image 12 sept. 2026, 01_08_30.png"
        alt=""
        className={`${box} rounded-md object-cover`}
      />
      <span className={`font-display ${word} tracking-tight`}>FiveRate</span>
    </span>
  );
}
