'use client';

import {
  GoogleMap, InfoWindow, Marker, useJsApiLoader,
} from '@react-google-maps/api';
import { useCallback, useState } from 'react';

import env from '@/env';

import Text from './typography/Text';

const placeName = 'Ambohitsoa, Antananarivo, Madagascar';

const options = {
  disableDefaultUI: true, // Enables/disables default UI controls
  zoomControl: true,
  mapTypeId: 'roadmap', // Options: roadmap, satellite, hybrid, terrain
  streetViewControl: false,
  fullscreenControl: true,
};

const COORD = { zoom: 13, center: { lat: -18.93944, lng: 47.539916 } };

const Map = () => {
  const [openMarker, setOpenMarker] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [map, setMap] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
  });

  const toggleMarker = () => setOpenMarker(!openMarker);

  const onLoad = useCallback((map: any) => {
    const bounds = new window.google.maps.LatLngBounds(COORD.center);

    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (

    <div className={`
      mt-10 mb-6 h-[550px] w-full
      md:mt-16 md:mb-32 md:h-[45vh]
      xl:mt-16
    `}
    >
      {isLoaded
        ? (
          <GoogleMap
            center={COORD.center}
            mapContainerStyle={{ height: 500 }}
            options={options}
            zoom={COORD.zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            <Marker
              position={COORD.center}
              onClick={toggleMarker}
            />
            {openMarker && (
              <InfoWindow
                position={COORD.center}
                onCloseClick={toggleMarker}
              >
                <Text>{placeName}</Text>
              </InfoWindow>
            )}
          </GoogleMap>
        )
        : null}
    </div>
  );
};

export default Map;
