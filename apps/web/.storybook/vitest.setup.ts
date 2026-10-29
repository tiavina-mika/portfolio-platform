import { setProjectAnnotations } from '@storybook/nextjs-vite';

import * as projectAnnotations from './preview';

/*
 * The addon already applies the preview annotations by itself, but not the ones of the Next.js
 * framework (the mocked app router `next/navigation` and `next-intl` need) unless they go through
 * the framework's own `setProjectAnnotations`.
 */
setProjectAnnotations([projectAnnotations]);
