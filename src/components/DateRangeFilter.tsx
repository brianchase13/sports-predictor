'use client';

import { useState } from 'react';
import { format, subDays, startOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESETS: { label: string; getValue: () => Omit<DateRange, 'label'> }[] = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: 'Last 14 days',
    getValue: () => ({
      from: subDays(new Date(), 14),
      to: new Date(),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: 'This week',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 0 }),
      to: new Date(),
    }),
  },
  {
    label: 'This month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: 'Last month',
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
  },
  {
    label: 'All time',
    getValue: () => ({
      from: new Date(2020, 0, 1), // Far back date
      to: new Date(),
    }),
  },
];

export function getDefaultDateRange(): DateRange {
  return {
    ...PRESETS[2].getValue(), // Last 30 days
    label: PRESETS[2].label,
  };
}

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (preset: (typeof PRESETS)[number]) => {
    onChange({
      ...preset.getValue(),
      label: preset.label,
    });
    setOpen(false);
  };

  const formatRange = () => {
    if (value.label === 'All time') {
      return 'All time';
    }
    return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d, yyyy')}`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-between min-w-[200px] font-normal',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{value.label}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {PRESETS.map((preset, index) => (
          <DropdownMenuItem
            key={preset.label}
            onClick={() => handleSelect(preset)}
            className={cn(
              'cursor-pointer',
              value.label === preset.label && 'bg-primary/10 font-medium'
            )}
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {formatRange()}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
