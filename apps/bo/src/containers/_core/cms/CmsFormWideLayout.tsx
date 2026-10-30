import CMSFormLayout from './CMSFormLayout';

/**
 * The shell the page and article forms' routes are rendered in. Both are laid out as a workbench
 * in three columns — the summary rail, the section being filled and the preview — so they take the
 * wide cap rather than the single-column one every other CMS form is read at.
 */
const CmsFormWideLayout = () => <CMSFormLayout wide />;

export default CmsFormWideLayout;
