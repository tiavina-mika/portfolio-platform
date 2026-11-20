import { SimulatorExampleId } from '@/types/simulator.type';
import { cn } from '@/utils/app.utils';

type Props = {
  /**
   * The name of the group: "One-click examples"
   */
  label: string;
  examples: { id: SimulatorExampleId; label: string }[];
  /**
   * The example whose answers are on screen
   */
  activeId: SimulatorExampleId | null;
  onSelect: (id: SimulatorExampleId) => void;
};

/**
 * Ready-made answers, one tap away. Tapping the one that is on takes the simulator back to its start.
 */
const SimulatorExamples = ({
  label, examples, activeId, onSelect,
}: Props) => (
  <div aria-labelledby="simulator-examples-label" className="grid gap-3" role="group">
    <p className="label-mono text-muted-foreground" id="simulator-examples-label">{label}</p>
    <div className="flex flex-wrap gap-2">
      {examples.map(example => (
        <button
          aria-pressed={activeId === example.id}
          key={example.id}
          onClick={() => onSelect(example.id)}
          type="button"
          className={cn(
            `
              min-h-11 cursor-pointer rounded-md border border-input bg-card px-3.5 text-sm font-medium
              transition-colors duration-120 ease-out
              hover:bg-muted
              motion-reduce:transition-none
            `,
            'aria-pressed:border-brand aria-pressed:bg-muted'
          )}
        >
          {example.label}
        </button>
      ))}
    </div>
  </div>
);

export default SimulatorExamples;
