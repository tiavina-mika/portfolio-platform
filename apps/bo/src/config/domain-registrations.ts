/**
 * Composition point of the business domain: importing these modules for their side effect plugs the
 * project domain into the generic back-office (dashboard cards and columns, role rights). The files
 * under `_core/` never import them, so the domain can be removed by deleting this file and the
 * `_domain/` folders.
 *
 * Loaded first by `main.tsx`, before anything is rendered.
 */
import '@/utils/_domain/project-dashboard.utils';
import '@/utils/_domain/project-role.utils';
