type Props = {
  data: Record<string, unknown>;
};

/**
 * renders a `<script type="application/ld+json">` tag from a schema.org data object
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
const JsonLd = ({ data }: Props) => (
  <script
    /*
     * `<` is written as its unicode escape: a title or description coming from the back-office that
     * contains `</script>` would otherwise close the tag early and let the rest run as HTML. The
     * escape is still valid JSON, so search engines read the same value.
     */
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    type="application/ld+json"
  />
);

export default JsonLd;
