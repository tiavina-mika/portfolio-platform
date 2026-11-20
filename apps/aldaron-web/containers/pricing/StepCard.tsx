import {
  Card, CardContent, CardDescription, CardTitle,
} from '@/components/ui/Card';

type Props = {
  /**
   * The place of the step in the process, from 1
   */
  number: number;
  title: string;
  description: string;
};

/**
 * One step of the process: its number, its name, what happens
 */
const StepCard = ({ number, title, description }: Props) => (
  <Card as="article" className="h-full">
    <CardContent className="gap-4">
      <span className="label-mono text-brand-text">
        {String(number).padStart(2, '0')}
      </span>
      <CardTitle gutterBottom={false} level={3}>{title}</CardTitle>
      <CardDescription className="mt-0">{description}</CardDescription>
    </CardContent>
  </Card>
);

export default StepCard;
