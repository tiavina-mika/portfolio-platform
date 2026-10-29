/* eslint-disable @cspell/spellchecker */
/**
 * This file is used to display a 404 page in the case where the user tries to access a page that does not exist.
 * It should be in /pages/not-found.tsx
 * to not to confuse width /pages/[locale]/not-found.tsx which is used to display a translated 404 page.
 * It's a next-intl bug that we need to fix (with new version of next-intl?).
 * When it's fixed, we can move this file to /pages/not-found.tsx
 * so the non-translated 404 page will be displayed in the case where the user tries to access a page that does not exist.
 * @see https://github.com/amannn/next-intl/issues/1359
 * @see https://stackoverflow.com/questions/79009882/usage-of-next-intl-apis-in-server-components-currently-opts-into-dynamic-renderi
 */

import NotFound from '@/containers/NotFound';

const NonTranslatedNotFoundPage = () => {
  return (
    <NotFound
      description="La page que vous cherchez n'existe pas ou a été déplacée."
      linkText="Retourner à la page d'accueil"
      secondaryLinkText="Contactez-moi"
      title="Page introuvable"
    />
  );
};

export default NonTranslatedNotFoundPage;
