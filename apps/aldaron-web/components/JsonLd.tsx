type Props = {
  data: Record<string, unknown>;
};

/**
 * renders a `<script type="application/ld+json">` tag from a schema.org data object
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
const JsonLd = ({ data }: Props) => (
  <script
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);

export default JsonLd;
