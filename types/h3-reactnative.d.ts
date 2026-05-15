declare module "h3-reactnative" {
  export function geoToH3(lat: number, lng: number, res: number): string;
  export function h3ToGeoBoundary(
    h3Index: string,
    formatAsGeoJson?: boolean
  ): number[][];
  export function kRing(h3Index: string, ringSize: number): string[];
}

declare module 'fast-text-encoding';
declare module 'react-native/Libraries/Utilities/PolyfillFunctions';