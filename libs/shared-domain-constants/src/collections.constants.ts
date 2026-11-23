// Parse class names of the domain, so a generic back-office can name them without importing
// anything from its own `_domain/` folders
export const DOMAIN_COLLECTIONS = {
  project: 'Project',
  // the clients of the Aldaron workspace, never listed in the portfolio one
  client: 'Client',
  // the quotes sent to those clients, Aldaron workspace only as well
  quote: 'Quote',
  // the work done for those clients after a quote is accepted, Aldaron workspace only as well
  mission: 'Mission',
};
