interface CopilotChipsProps {
  chips: string[];
  onChipClick: (chip: string) => void;
  disabled?: boolean;
}

export function CopilotChips({ chips, onChipClick, disabled }: CopilotChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onChipClick(chip)}
          disabled={disabled}
          className="px-2.5 py-1 rounded-full text-[13px] font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors border border-primary/20"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
