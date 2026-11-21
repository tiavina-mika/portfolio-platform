import { IProject, ProjectSupportType } from '@/types/project.type';

// the supports the projects can be filtered by, in the order of the filter
export const PROJECT_SUPPORTS: ProjectSupportType[] = ['web', 'app', 'mobile', 'bo'];

// number of projects per page of the list
export const PROJECTS_PER_PAGE = 4;

// the delivered projects, newest first (sample data: the texts are in the translations)
export const PROJECTS: IProject[] = [
  { id: 'tsaraLivraison', name: 'Tsara Livraison', supports: ['mobile', 'bo'], screens: { mobile: 110, bo: 20 }, weeks: 8 },
  { id: 'faniloSante', name: 'Fanilo Santé', supports: ['app', 'bo'], screens: { app: 60, bo: 25 }, weeks: 5 },
  { id: 'ravinalaVoyages', name: 'Ravinala Voyages', supports: ['web'], screens: { web: 40 }, weeks: 3 },
  {
    id: 'hasinaAcademie',
    name: 'Hasina Académie',
    supports: ['app', 'mobile', 'bo'],
    screens: { app: 70, mobile: 60, bo: 30 },
    weeks: 12,
  },
  { id: 'zanakaBoutique', name: 'Zanaka Boutique', supports: ['web', 'mobile'], screens: { web: 35, mobile: 30 }, weeks: 6 },
  { id: 'volaCompta', name: 'Vola Compta', supports: ['app', 'bo'], screens: { app: 45, bo: 20 }, weeks: 6 },
  { id: 'tanyImmobilier', name: 'Tany Immobilier', supports: ['web', 'bo'], screens: { web: 30, bo: 15 }, weeks: 4 },
  { id: 'ranoSuivi', name: 'Rano Suivi', supports: ['mobile'], screens: { mobile: 50 }, weeks: 5 },
  { id: 'soaRestaurant', name: 'Soa Restaurant', supports: ['web'], screens: { web: 15 }, weeks: 2 },
  { id: 'lalanaTransport', name: 'Lalana Transport', supports: ['app', 'mobile'], screens: { app: 35, mobile: 45 }, weeks: 7 },
];
