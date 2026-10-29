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
  DOCK_INNER_PADDING,
  DOCK_SIDE_PADDING,
} from "@/constants";

const Dock = () => {
  const isDockExpanded = useAppsStore((state) => state.isDockExpanded);
  const apps = config.apps as AppData[];
  const gridRef = useRef<HTMLDivElement>(null);

  const otherAppsCount =
    apps.length > DOCK_COLUMNS ? apps.length - DOCK_COLUMNS : 0;
  const extraRowsCount = Math.ceil(otherAppsCount / DOCK_COLUMNS);

  // Card size is derived from the screen width so DOCK_COLUMNS cards always fit.
  const cardSizeVars = {
    "--card-w": `calc((100vw - ${DOCK_SIDE_PADDING + DOCK_INNER_PADDING}px - ${
      (DOCK_COLUMNS - 1) * DOCK_GAP_X
    }px) / ${DOCK_COLUMNS})`,
    "--card-h": `calc(var(--card-w) * ${CARD_ASPECT})`,
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
        className="p-6 bg-gray-950/40 rounded-[65px] border-white/20 border grid gap-x-10.5"
        style={{ gridTemplateColumns: gridColumns }}
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
