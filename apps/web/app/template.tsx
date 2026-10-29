/*
 * This is the RootTemplate component: A wrapper for the app.
 * Navigate to "app/[locale]/template.tsx" for the main template file.
 */

import { ReactNode } from 'react';

type RootTemplateProperties = { children: ReactNode };

const RootTemplate = ({ children }: RootTemplateProperties) => children;

export default RootTemplate;
