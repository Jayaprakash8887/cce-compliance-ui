import type { StepState, ProtocolInstanceStatus, CompletionStatus } from '../api/types';

export const STATE_COLORS: Record<StepState, { bg: string; text: string; dot: string }> = {
  pending:   { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-400'   },
  due:       { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  overdue:   { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  missed:    { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
  completed: { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  skipped:   { bg: 'bg-slate-100',  text: 'text-slate-500',  dot: 'bg-slate-400'  },
};

export const STATUS_COLORS: Record<ProtocolInstanceStatus, { bg: string; text: string }> = {
  active:    { bg: 'bg-green-100',  text: 'text-green-700'  },
  completed: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  withdrawn: { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  expired:   { bg: 'bg-red-100',    text: 'text-red-700'    },
};

export const COMPLETION_COLORS: Record<CompletionStatus, { bg: string; text: string }> = {
  early:   { bg: 'bg-green-100', text: 'text-green-700' },
  on_time: { bg: 'bg-green-100', text: 'text-green-700' },
  late:    { bg: 'bg-amber-100', text: 'text-amber-700' },
};
