import {
  Card, CardContent, CardDescription, CardTitle,
} from '@/components/ui/Card';

type Props = {
  title: string;
  description: string;
};

/**
 * A rule of scope or billing: its name, then the sentence that states it
 */
const RuleBlock = ({ title, description }: Props) => (
  <Card as="article" className="h-full">
    <CardContent className="gap-4">
      <CardTitle gutterBottom={false} level={3}>{title}</CardTitle>
      <CardDescription className="mt-0">{description}</CardDescription>
    </CardContent>
  </Card>
);

export default RuleBlock;
