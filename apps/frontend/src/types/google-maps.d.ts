export {};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          mapDiv: HTMLElement,
          opts?: google.maps.MapOptions
        ) => google.maps.Map;
        Data: new (opts?: { map?: google.maps.Map }) => google.maps.Data;
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

    interface DataFeature {
      getProperty(name: string): any;
    }

    interface DataMouseEvent {
      feature: DataFeature;
    }

    interface DataStyleOptions {
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    interface Data {
      addGeoJson(geoJson: any): void;
      setStyle(style: DataStyleOptions | ((feature: DataFeature) => DataStyleOptions)): void;
      addListener(eventName: string, handler: (event: DataMouseEvent) => void): void;
    }
  }
}
