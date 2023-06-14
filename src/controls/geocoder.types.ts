export interface GeocodingResponse {
  type: 'FeatureCollection'
  x: GeocodingFeature[]
  query: any[]
  attribution: string
}

export interface GeocodingFeature {
  id: string
  type: 'Feature'
  place_type: string[]
}
