import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import Price from '@/containers/currency/Price';

type Props = {
  /**
   * The mono label above the title: "From", "Per screen"
   */
  eyebrow: string;
  title: string;
  /**
   * The price, written in euros like the other prices of the site (converted by `Price`)
   * @example '1 500 €'
   */
  price: string;
  description: string;
  /**
   * `inverted` puts the plan forward: one per section
   * @default default
   */
  variant?: 'default' | 'inverted';
};

/**
 * One way in to the offer: what it is, its price, what the price covers
 */
const PlanCard = ({
  eyebrow, title, price, description, variant = 'default',
}: Props) => (
  <Card as="article" className="h-full" variant={variant}>
    <CardHeader>
      <div>
        <CardEyebrow>{eyebrow}</CardEyebrow>
        <CardTitle gutterBottom={false} level={3}>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="gap-4 pt-4">
      <b
        className={`
          font-display text-4xl leading-none font-bold tracking-[-0.03em] tabular-nums
          md:text-5xl
        `}
      >
        <Price text={price} />
      </b>
      <CardDescription className="mt-0">{description}</CardDescription>
    </CardContent>
  </Card>
);

export default PlanCard;
