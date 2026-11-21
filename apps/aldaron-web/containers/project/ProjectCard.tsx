import { ReactNode } from 'react';

import ScreenshotPlaceholder from '@/components/ScreenshotPlaceholder';
import {
  Card, CardContent, CardDescription, CardEyebrow, CardHeader, CardTitle,
} from '@/components/ui/Card';

export type ProjectFact = {
  label: string;
  // a text, or a price that follows the currency the visitor chose
  value: ReactNode;
};

type Props = {
  name: string;
  /**
   * The field of the project, above its name: "Delivery", "Health"
   */
  eyebrow: string;
  summary: string;
  /**
   * What the placeholder says it stands for: "Product screenshot"
   */
  screenshotLabel: string;
  /**
   * The scope of the project, one row each: supports, screens, lead time, price
   */
  facts: ProjectFact[];
};

/**
 * A delivered project: its field, name and summary, its screenshot, then the facts of its scope
 */
const ProjectCard = ({
  name, eyebrow, summary, screenshotLabel, facts,
}: Props) => (
  <Card as="article" className="h-full">
    <CardHeader>
      <div>
        <CardEyebrow>{eyebrow}</CardEyebrow>
        <CardTitle gutterBottom={false} level={2}>{name}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-1 gap-5">
      <ScreenshotPlaceholder label={screenshotLabel} />
      <dl className="m-0 grid">
        {facts.map(fact => (
          <div
            className="flex justify-between gap-4 border-t border-border py-2.5 text-[15px] leading-[1.4]"
            key={fact.label}
          >
            <dt className="text-muted-foreground">{fact.label}</dt>
            <dd className="m-0 text-right font-mono text-sm font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);

export default ProjectCard;
