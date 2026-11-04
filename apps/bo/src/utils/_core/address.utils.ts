/* eslint-disable @typescript-eslint/naming-convention */

import { IAddress } from '@/types/_core/user.type';

interface AddressComponent {
  short_name: string;
  long_name: string;
  types: string[];
}
// TODO: use google map address type for addressDetails
export const formatAutocompleteAddress = (addressDetails: any | null): IAddress | null => {
  if (!addressDetails) return null;
  const {
    address_components, geometry, place_id, name,
  } = addressDetails;
  const country = address_components.find((address: AddressComponent) => address.types.includes('country'));
  const city = address_components.find((address: AddressComponent) => address.types.includes('locality'));
  const district = address_components.find((address: AddressComponent) =>
    address.types.includes('administrative_area_level_2')
  );
  const region = address_components.find((address: AddressComponent) =>
    address.types.includes('administrative_area_level_1')
  );

  const address: IAddress = {
    placeId: place_id,
    name,
    country: country?.long_name,
    countryCode: country?.short_name,
    location: {
      latitude: geometry.location.lat,
      longitude: geometry.location.lng,
    },
  };

  if (city) {
    address.city = city.long_name;
  }

  if (district) {
    address.district = district.long_name;
  }

  if (region) {
    address.region = region.long_name;
  }

  return address;
};

/**
 * get address name from full address object
 * @param address
 * @param withCountry
 * @returns
 */
export const getFullAddressName = (address: IAddress, withCountry = false): string => {
  let name = address.name;

  if (address.city) {
    name += ', ' + address.city;
  }

  if (address.country && withCountry) {
    name += ', ' + address.country;
  }

  return name;
};
