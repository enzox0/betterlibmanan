export {};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          mapDiv: HTMLElement,
          opts?: google.maps.MapOptions
        ) => google.maps.Map;
      };
    };
  }

  namespace google.maps {
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface Map {
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
  }
}
