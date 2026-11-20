import { useTranslations } from 'next-intl';

import ButtonLink from '@/components/buttons/ButtonLink';
import CtaBand from '@/components/layouts/CtaBand';
import PageSection from '@/components/layouts/PageSection';
import SectionIntro from '@/components/layouts/SectionIntro';
import Title from '@/components/typography/Title';
import OptionLine from '@/containers/pricing/OptionLine';
import PlanCard from '@/containers/pricing/PlanCard';
import PriceList from '@/containers/pricing/PriceList';
import QuoteLine from '@/containers/pricing/QuoteLine';
import RuleBlock from '@/containers/pricing/RuleBlock';
import StepCard from '@/containers/pricing/StepCard';
import { ROUTES } from '@/i18n/routes';

type Plan = { eyebrow: string; title: string; price: string; description: string };
type Step = { title: string; description: string };
type Example = { title: string; detail: string; price: string };
type Option = { label: string; price: string; description: string };
type Rule = { title: string; description: string };

// the second plan (mobile) is the one put forward
const FEATURED_PLAN_INDEX = 1;

// a section title is wider than the default 20 characters here: the sentences are longer
const TITLE_CLASS_NAME = 'max-w-[62ch]';

const GRID_CLASS_NAME = `
  m-0 grid list-none grid-cols-1 gap-4 p-0
  sm:grid-cols-2
  lg:grid-cols-3
`;

/**
 * The offer and pricing page: what a screen costs per support, the process, the simulator, five
 * examples, the options and the rules. Static: the texts come from the translations.
 */
const PricingPage = () => {
  const t = useTranslations('PricingPage');

  const facts = t.raw('hero.facts') as string[];
  const plans = t.raw('plans.items') as Plan[];
  const steps = t.raw('flow.steps') as Step[];
  const examples = t.raw('examples.items') as Example[];
  const options = t.raw('options.items') as Option[];
  const rules = t.raw('rules.items') as Rule[];

  return (
    <div className="flex flex-col self-stretch">
      {/* ------------- hero ------------- */}
      <PageSection
        aria-labelledby="pricing-title"
        hasDivider={false}
        className={`
          items-start gap-6 py-12
          lg:py-20
        `}
      >
        <Title
          gutterBottom={false}
          id="pricing-title"
          level={1}
          className={`
            max-w-[14ch] text-[40px] leading-none tracking-[-0.035em] text-balance
            md:text-[72px]
            lg:text-[84px]
          `}
        >
          {t('hero.title')}
        </Title>
        <p
          className={`
            max-w-[52ch] text-lg leading-[1.55] text-pretty text-muted-foreground
            md:text-xl
          `}
        >
          {t('hero.description')}
        </p>
        <div className={`
          flex flex-wrap gap-3
          max-sm:w-full max-sm:flex-col
        `}
        >
          <ButtonLink href={ROUTES.contact} size="lg" variant="brand">{t('hero.quote')}</ButtonLink>
          <ButtonLink href={ROUTES.simulator} size="lg" variant="outline">
            {t('hero.simulator')}
          </ButtonLink>
        </div>
        <ul
          className={`
            m-0 flex list-none flex-wrap gap-x-8 gap-y-3 p-0 font-mono text-[13px] leading-[1.4] font-medium
            tracking-[0.04em] text-muted-foreground
          `}
        >
          {facts.map(fact => (
            <li className="flex items-center gap-2" key={fact}>
              <span aria-hidden className="block size-1.5 flex-none bg-brand" />
              {fact}
            </li>
          ))}
        </ul>
      </PageSection>

      {/* ------------- plans ------------- */}
      <PageSection aria-labelledby="pricing-plans" id="plans">
        <SectionIntro
          eyebrow={t('plans.eyebrow')}
          title={t('plans.title')}
          titleClassName={TITLE_CLASS_NAME}
          titleId="pricing-plans"
        />
        <ul className={GRID_CLASS_NAME}>
          {plans.map((plan, index) => (
            <li className="flex" key={plan.title}>
              <PlanCard
                {...plan}
                variant={index === FEATURED_PLAN_INDEX ? 'inverted' : 'default'}
              />
            </li>
          ))}
        </ul>
        <p className="m-0 max-w-[70ch] font-mono text-sm leading-normal font-medium text-muted-foreground">
          {t('plans.note')}
        </p>
      </PageSection>

      {/* ------------- process ------------- */}
      <PageSection aria-labelledby="pricing-flow" id="process">
        <SectionIntro
          eyebrow={t('flow.eyebrow')}
          title={t('flow.title')}
          titleClassName={TITLE_CLASS_NAME}
          titleId="pricing-flow"
        />
        <ol className={GRID_CLASS_NAME}>
          {steps.map((step, index) => (
            <li className="flex" key={step.title}>
              <StepCard {...step} number={index + 1} />
            </li>
          ))}
        </ol>
      </PageSection>

      {/* ------------- simulator ------------- */}
      <PageSection aria-labelledby="pricing-simulator" id="simulator">
        <CtaBand
          cta={{ label: t('simulator.cta'), href: ROUTES.simulator }}
          description={t('simulator.description')}
          eyebrow={t('simulator.eyebrow')}
          layout="stacked"
          title={t('simulator.title')}
          titleId="pricing-simulator"
          variant="inverted"
        />
      </PageSection>

      {/* ------------- examples ------------- */}
      <PageSection aria-labelledby="pricing-examples" id="examples">
        <SectionIntro
          eyebrow={t('examples.eyebrow')}
          title={t('examples.title')}
          titleClassName={TITLE_CLASS_NAME}
          titleId="pricing-examples"
        />
        <PriceList>
          {examples.map(example => (
            <QuoteLine key={example.title} {...example} />
          ))}
        </PriceList>
      </PageSection>

      {/* ------------- options ------------- */}
      <PageSection aria-labelledby="pricing-options" id="options">
        <SectionIntro
          description={t('options.description')}
          eyebrow={t('options.eyebrow')}
          title={t('options.title')}
          titleClassName={TITLE_CLASS_NAME}
          titleId="pricing-options"
        />
        <PriceList>
          {options.map(option => (
            <OptionLine key={option.label} {...option} />
          ))}
        </PriceList>
      </PageSection>

      {/* ------------- rules ------------- */}
      <PageSection aria-labelledby="pricing-rules" id="rules">
        <SectionIntro
          eyebrow={t('rules.eyebrow')}
          title={t('rules.title')}
          titleClassName={TITLE_CLASS_NAME}
          titleId="pricing-rules"
        />
        <ul className={GRID_CLASS_NAME}>
          {rules.map(rule => (
            <li className="flex" key={rule.title}>
              <RuleBlock {...rule} />
            </li>
          ))}
        </ul>
      </PageSection>

      {/* ------------- contact ------------- */}
      <PageSection aria-labelledby="pricing-contact" id="contact">
        <CtaBand
          cta={{ label: t('contact.cta'), href: ROUTES.contact }}
          description={t('contact.description')}
          layout="stacked"
          title={t('contact.title')}
          titleId="pricing-contact"
        />
      </PageSection>
    </div>
  );
};

export default PricingPage;
