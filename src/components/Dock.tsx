import config from "../../public/config.json";
import { useAppsStore } from "@/store";
import type { AppData } from "@/types";
import AppCard from "./AppCard";
import { useEffect, useRef } from "react";
import {
  CARD_ASPECT,
  DOCK_COLUMNS,
  DOCK_GAP_X,
  DOCK_GAP_Y,
  DOCK_BORDER,
  DOCK_FOCUS_MARGIN,
  DOCK_SIDE_PADDING,
  FOCUS_SCALE,
} from "@/constants";

const Dock = () => {
  const isDockExpanded = useAppsStore((state) => state.isDockExpanded);
  const apps = config.apps as AppData[];
  const gridRef = useRef<HTMLDivElement>(null);

  const otherAppsCount =
    apps.length > DOCK_COLUMNS ? apps.length - DOCK_COLUMNS : 0;
  const extraRowsCount = Math.ceil(otherAppsCount / DOCK_COLUMNS);

  // Card size is derived from the screen width so DOCK_COLUMNS cards always fit.
  // The pill's side padding = how far a focused card grows + a small margin,
  // so the padding depends on the card width and the card width on the padding.
  // Solving that: width = free space / (columns + 2 x growth per side).
  const growthPerSide = (FOCUS_SCALE - 1) / 2; // 0.125 = 12.5% of card width
  const freeSpace =
    DOCK_SIDE_PADDING +
    2 * DOCK_BORDER +
    2 * DOCK_FOCUS_MARGIN +
    (DOCK_COLUMNS - 1) * DOCK_GAP_X;
  const cardSizeVars = {
    "--card-w": `calc((100vw - ${freeSpace}px) / ${DOCK_COLUMNS + 2 * growthPerSide})`,
    "--card-h": `calc(var(--card-w) * ${CARD_ASPECT})`,
    "--dock-pad-x": `calc(var(--card-w) * ${growthPerSide} + ${DOCK_FOCUS_MARGIN}px)`,
  } as React.CSSProperties;

  const gridColumns = `repeat(${DOCK_COLUMNS}, minmax(0, 1fr))`;

  function calculateMargin(extraRows: number) {
    if (extraRows <= 0) return "0px";
    // The first extra row adds exactly one card height.
    // Every subsequent row adds one card height + the row gap.
    return `calc(-1 * (var(--card-h) + ${extraRows - 1} * (var(--card-h) + ${DOCK_GAP_Y}px)))`;
  }

  const marginBottomAmount = calculateMargin(extraRowsCount);

  useEffect(() => {
    if (isDockExpanded) return;
    let node: HTMLElement | null = gridRef.current;
    while (node) {
      node.scrollTop = 0;
      node.scrollLeft = 0;
      node = node.parentElement;
    }
  }, [isDockExpanded]);

  return (
    <div
      className="relative z-10 pt-15 px-22.5 flex flex-col min-h-0"
      style={{
        ...cardSizeVars,
        marginTop: isDockExpanded ? 0 : "auto",
        flex: isDockExpanded ? "1 1 0%" : "0 0 auto",
        paddingBottom: isDockExpanded ? "60px" : 0,
        backgroundColor: isDockExpanded ? "rgba(0, 0, 0, 0.5)" : "transparent",
        backdropFilter: isDockExpanded ? "blur(12px)" : "none",
        WebkitBackdropFilter: isDockExpanded ? "blur(12px)" : "none",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div
        className="py-6 bg-gray-950/40 rounded-[65px] border-white/20 border grid gap-x-10.5"
        style={{
          gridTemplateColumns: gridColumns,
          paddingInline: "var(--dock-pad-x)",
        }}
      >
        {apps.slice(0, DOCK_COLUMNS).map((app, index) => (
          <AppCard
            key={`dock-${index}`}
            app={app}
            index={index}
            totalApps={apps.length}
          />
        ))}
      </div>
      <div
        ref={gridRef}
        data-dock-grid
        className="p-8 grid gap-x-10.5 gap-y-12 flex-1 min-h-0 overflow-y-auto transition-all duration-500 ease-in-out"
        style={{
          gridTemplateColumns: gridColumns,
          // line the rows below up with the dock row (+ the pill's border)
          paddingInline: `calc(var(--dock-pad-x) + ${DOCK_BORDER}px)`,
          marginBottom: isDockExpanded ? "0px" : marginBottomAmount,
        }}
      >
        {apps.slice(DOCK_COLUMNS).map((app, index) => {
          const absoluteIndex = index + DOCK_COLUMNS;
          return (
            <AppCard
              key={`grid-${absoluteIndex}`}
              app={app}
              index={absoluteIndex}
              totalApps={apps.length}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Dock;
