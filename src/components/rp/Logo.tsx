export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const imageSize = size === "sm" ? "32px" : "40px";

  return (
    <span className="flex items-center gap-2.5">
      <img 
        src="/ChatGPT Image 12 sept. 2026, 01_08_30.png" 
        alt="FiveRate Logo" 
        style={{ width: imageSize, height: imageSize, borderRadius: "0.375rem" }}
      />
      <span className={`font-display ${size === "sm" ? "text-lg" : "text-xl"} tracking-tight`}>FiveRate</span>
    </span>
  );
}
