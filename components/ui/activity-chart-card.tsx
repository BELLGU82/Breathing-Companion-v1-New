import * as React from "react";
import { motion, Variants } from "framer-motion";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";

interface ActivityDataPoint {
  label: string;
  value: number; // minutes
}

import { ChartRange } from "../../types";

interface ActivityChartCardProps {
  title?: string;
  totalValue: string;
  data: ActivityDataPoint[];
  totalSessions?: number;
  className?: string;
  selectedRange: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}

const RANGE_LABELS: Record<ChartRange, string> = {
  daily: "יומי",
  weekly: "שבועי",
  monthly: "חודשי"
};

export const ActivityChartCard = ({
  title = "פעילות",
  totalValue,
  data,
  totalSessions = 0,
  className,
  selectedRange,
  onRangeChange
}: ActivityChartCardProps) => {

  const maxValue = React.useMemo(() => {
    return Math.max(1, data.reduce((max, item) => (item.value > max ? item.value : max), 0));
  }, [data]);

  const chartVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const barVariants: Variants = {
    hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
    visible: {
      scaleY: 1,
      opacity: 1,
      transformOrigin: "bottom",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <Card
      className={cn(
        "w-full max-w-md border-none bg-neu-base shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] rounded-2xl",
        className
      )}
      aria-labelledby="activity-card-title"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle id="activity-card-title" className="text-h1">{title}</CardTitle>
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-meta px-2 py-1 h-auto outline-none hover-soft focus:ring-0"
                aria-haspopup="true"
              >
                {RANGE_LABELS[selectedRange]}
                <ChevronDown className="icon-secondary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neu-base border-white/20 shadow-neu-flat">
              {(Object.keys(RANGE_LABELS) as ChartRange[]).map((range) => (
                <DropdownMenuItem
                  key={range}
                  onSelect={() => onRangeChange(range)}
                  className="text-body cursor-pointer justify-start hover-soft"
                >
                  {RANGE_LABELS[range]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <p className="text-h1 tracking-tighter">
              {totalValue}
            </p>
            <CardDescription className="flex items-center gap-1 mt-1 text-meta">
              סה״כ {totalSessions} תרגילים
            </CardDescription>
          </div>

          <motion.div
            key={selectedRange}
            className="flex h-32 w-full items-end justify-between gap-1 pt-4"
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            aria-label="Activity chart"
          >
            {data.map((item, index) => {
              const heightPercent = (item.value / maxValue) * 100;

              return (
                <div
                  key={index}
                  className="flex h-full w-full flex-col items-center justify-end gap-2 group"
                  role="presentation"
                >
                  <span className="text-[10px] text-meta opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-6 bg-white/50 px-1 rounded pointer-events-none">
                    {item.value}
                  </span>

                  <motion.div
                    className="w-full max-w-[24px] rounded-full bg-neu-text/10 backdrop-blur-sm relative shadow-neu-pressed hover-soft"
                    style={{
                      height: `${Math.max(4, heightPercent)}%`,
                    }}
                    variants={barVariants}
                    aria-label={`${item.label}: ${item.value} דקות`}
                  />
                  <span className="text-[10px] text-meta whitespace-nowrap overflow-hidden text-ellipsis max-w-[30px] text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
