import { PATH_NAMES } from '@/utils/_core/pathnames';

// a rating, a report or a ticket points at a ride, so the generic pages link to it by address only
export const goToRide: any = (id: string) => ({ to: PATH_NAMES.rides + '/$id', params: { id } });
