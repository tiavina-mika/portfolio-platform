import Section from '@/components/layouts/Section';
import SectionIntro from '@/components/layouts/SectionIntro';
import Title from '@/components/typography/Title';

export type LegalDocumentSection = {
  title: string;
  /**
   * The paragraphs of the section, one string each
   */
  lines: string[];
};

type Props = {
  /**
   * The mono label above the title, e.g. "Legal"
   */
  label: string;
  title: string;
  /**
   * The date of the last update, written as a sentence under the title
   */
  updated: string;
  sections: LegalDocumentSection[];
};

/**
 * A legal text (the legal notice, the privacy policy): the title and the date of its last update, then its
 * sections, each one a title and its paragraphs under a line. The text keeps a readable measure of 72
 * characters.
 */
const LegalDocument = ({
  label, title, updated, sections,
}: Props) => (
  <div className="flex flex-col self-stretch">
    <Section
      aria-labelledby="legal-title"
      as="section"
      className={`
        pt-10 pb-5
        md:pt-[72px] md:pb-10
      `}
    >
      <div className="flex flex-col items-start gap-5">
        <SectionIntro
          className="gap-5"
          eyebrow={label}
          level={1}
          title={title}
          titleId="legal-title"
        />
        <p className="m-0 font-mono text-sm leading-normal font-medium text-muted-foreground">{updated}</p>
      </div>
    </Section>
    <Section className={`
      pb-10
      md:pb-16
    `}
    >
      <div className="w-full max-w-[72ch]">
        {sections.map(section => (
          <section className="grid gap-3 border-t border-border py-8" key={section.title}>
            <Title
              gutterBottom={false}
              level={2}
              className={`
                text-h3
                md:text-h3
              `}
            >{section.title}</Title>
            {section.lines.map(line => (
              <p className="m-0 text-[17px] leading-[1.6] text-pretty text-muted-foreground" key={line}>
                {line}
              </p>
            ))}
          </section>
        ))}
      </div>
    </Section>
  </div>
);

export default LegalDocument;
