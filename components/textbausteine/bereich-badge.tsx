import { getBereichLabel, type Bereich } from "@/lib/textbausteine/types";
import { bereichStyles } from "@/lib/textbausteine/bereich-styles";
import { cn } from "@/lib/utils";

export function BereichBadge({
  bereich,
  className,
}: {
  bereich: Bereich;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide ring-1 ring-inset",
        bereichStyles[bereich].badge,
        className
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", bereichStyles[bereich].dot)}
      />
      {getBereichLabel(bereich)}
    </span>
  );
}
