export type LatLng = {
  latitude: number;
  longitude: number;
};

/**
 * get circle coords around a given distance from a given coords (mainly the current user location)
 * https://stackoverflow.com/questions/52060188/fit-mapview-to-circle-bounds
 * @param latitude
 * @param longitude
 * @param radius
 * @returns
 */
export const get4PointsAroundCircumference = (
  latitude: number,
  longitude: number,
  radius: number
): LatLng[] => {
  const earthRadius = 6378.1; // Km
  const lat0 = latitude + ((-radius / earthRadius) * (180 / Math.PI));
  const lat1 = latitude + ((radius / earthRadius) * (180 / Math.PI));
  const lng0 = longitude +
    (((-radius / earthRadius) * (180 / Math.PI)) /
      Math.cos((latitude * Math.PI) / 180));
  const lng1 = longitude +
    (((radius / earthRadius) * (180 / Math.PI)) / Math.cos((latitude * Math.PI) / 180));

  return [
    {
      latitude: lat0,
      longitude: longitude,
    }, // bottom
    {
      latitude: latitude,
      longitude: lng0,
    }, // left
    {
      latitude: lat1,
      longitude: longitude,
    }, // top
    {
      latitude: latitude,
      longitude: lng1,
    }, // right
  ];
};
