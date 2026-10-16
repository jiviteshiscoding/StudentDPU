import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Clock, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateStr: string; // e.g. "May 2, 2025" or "2025-05-02"
  onApplyDate: (formattedDisplay: string, isoDate: string, daysRemaining: number) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  selectedDateStr,
  onApplyDate,
}) => {
  // Today's date reference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse initial selected date
  const parseInitialDate = (input: string): Date => {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
    // Default to +14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(() => parseInitialDate(selectedDateStr));
  const [selectedDate, setSelectedDate] = useState<Date>(() => parseInitialDate(selectedDateStr));
  const [typedInput, setTypedInput] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      const d = parseInitialDate(selectedDateStr);
      setSelectedDate(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      setTypedInput(formatIso(d));
      setInputError(null);
    }
  }, [isOpen, selectedDateStr]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Formatting helpers
  function formatIso(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplay(d: Date): string {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const calculateDaysRemaining = (d: Date): number => {
    const diffTime = d.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar matrix calculation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Grid cells
  const cells: { date: Date; isCurrentMonth: boolean; isPast: boolean; isToday: boolean; isSelected: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    d.setHours(0, 0, 0, 0);
    cells.push({
      date: d,
      isCurrentMonth: false,
      isPast: d.getTime() < today.getTime(),
      isToday: d.getTime() === today.getTime(),
      isSelected: d.getTime() === selectedDate.getTime(),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    d.setHours(0, 0, 0, 0);
    cells.push({
      date: d,
      isCurrentMonth: true,
      isPast: d.getTime() < today.getTime(),
      isToday: d.getTime() === today.getTime(),
      isSelected: d.getTime() === selectedDate.getTime(),
    });
  }

  // Next month leading days to complete full 6 weeks grid (42 cells)
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    d.setHours(0, 0, 0, 0);
    cells.push({
      date: d,
      isCurrentMonth: false,
      isPast: d.getTime() < today.getTime(),
      isToday: d.getTime() === today.getTime(),
      isSelected: d.getTime() === selectedDate.getTime(),
    });
  }

  const handleSelectDay = (cell: typeof cells[0]) => {
    if (cell.isPast) return; // Prevent selecting past dates
    setSelectedDate(cell.date);
    setTypedInput(formatIso(cell.date));
    setInputError(null);
  };

  // Quick preset shortcuts
  const applyPreset = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    setSelectedDate(d);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setTypedInput(formatIso(d));
    setInputError(null);
  };

  // Handle manual keyboard entry
  const handleTypedInputChange = (val: string) => {
    setTypedInput(val);
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      if (parsed.getTime() < today.getTime()) {
        setInputError('Deadline cannot be in the past.');
      } else {
        setInputError(null);
        setSelectedDate(parsed);
        setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    } else {
      if (val.length >= 8) {
        setInputError('Please use YYYY-MM-DD format (e.g. 2025-05-02).');
      }
    }
  };

  const handleConfirm = () => {
    if (selectedDate.getTime() < today.getTime()) {
      setInputError('Selected deadline cannot be in the past.');
      return;
    }
    const days = calculateDaysRemaining(selectedDate);
    const formatted = formatDisplay(selectedDate);
    const iso = formatIso(selectedDate);
    onApplyDate(formatted, iso, days);
    onClose();
  };

  const daysRemaining = calculateDaysRemaining(selectedDate);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-rise"
      role="dialog"
      aria-modal="true"
      aria-label="Select Project Deadline"
    >
      <div 
        className="bg-white dark:bg-[#0D131F] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Project Deadline</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sets milestone schedule in draft plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close date picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected date preview badge & quick presets */}
        <div className="px-5 pt-4 pb-2 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Date</span>
              <div className="text-base font-extrabold text-[#1E60FF] dark:text-blue-400">
                {formatDisplay(selectedDate)}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                daysRemaining < 7
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-[#1E60FF] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`}</span>
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1 shrink-0">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 font-medium text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer transition-colors"
            >
              +1 Week
            </button>
            <button
              type="button"
              onClick={() => applyPreset(14)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 font-medium text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer transition-colors"
            >
              +2 Weeks
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 font-medium text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer transition-colors"
            >
              +1 Month
            </button>
            <button
              type="button"
              onClick={() => applyPreset(45)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 font-medium text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer transition-colors"
            >
              End of Term
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-5 space-y-4">
          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Grid Cells */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {cells.map((cell, idx) => {
              const dayNum = cell.date.getDate();
              let cellClasses = 'h-9 rounded-xl flex items-center justify-center font-semibold transition-all relative select-none ';

              if (cell.isSelected) {
                cellClasses += 'bg-[#1E60FF] text-white shadow-sm font-bold ';
              } else if (cell.isPast) {
                cellClasses += 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/40 dark:bg-slate-900/20 ';
              } else if (!cell.isCurrentMonth) {
                cellClasses += 'text-slate-400/60 dark:text-slate-500/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ';
              } else {
                cellClasses += 'text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-[#1E60FF] cursor-pointer ';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cell.isPast}
                  onClick={() => handleSelectDay(cell)}
                  className={cellClasses}
                  aria-label={formatDisplay(cell.date)}
                  aria-disabled={cell.isPast}
                >
                  <span>{dayNum}</span>
                  {cell.isToday && !cell.isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#1E60FF] absolute bottom-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Keyboard Entry Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Keyboard input (YYYY-MM-DD):
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => handleTypedInputChange(e.target.value)}
              placeholder="e.g. 2025-05-02"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white focus:border-[#1E60FF]"
            />
            {inputError && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => applyPreset(14)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Deadline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
