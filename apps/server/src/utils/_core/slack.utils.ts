/** Escapes the three characters Slack reads as markup; everything else is shown as written. */
export const escapeSlackText = (text: string): string => (
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
);

type SlackAlertContent = {
  icon: string;
  title: string;
  details?: string;
  link?: { url: string; label: string };
};

/**
 * One staff alert as a Slack message: the icon and the title in bold, then the details and the
 * link, each on its own line. Every piece of text is escaped, so a member's input quoted in an
 * alert can never turn into a link or a mention.
 */
export const buildSlackAlertText = ({
  icon, title, details, link,
}: SlackAlertContent): string => [
  `${icon} *${escapeSlackText(title)}*`,
  details ? escapeSlackText(details) : undefined,
  link ? `<${link.url}|${escapeSlackText(link.label)}>` : undefined,
].filter(Boolean).join('\n');
