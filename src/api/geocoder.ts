export interface GeocodingErrorResponse {
  message: string
}

export interface GeocodingOkResponse {
  /**
   * "FeatureCollection", a GeoJSON type from the GeoJSON specification.
   */
  type: 'FeatureCollection'

  /**
   * Forward geocodes: An array of space and punctuation-separated strings from the original query.
   * Reverse geocodes: An array containing the coordinates being queried.
   */
  query: any[]

  /**
   * An array of feature objects.
   *
   * Forward geocodes: Returned features are ordered by relevance.
   *
   * Reverse geocodes:
   * Returned features are ordered by index hierarchy,
   * from most specific features to least specific features that overlap the queried coordinates.
   *
   * Read the Search result prioritization guide to learn more
   * about how returned features are organized in the Geocoding API response.
   */
  features: GeocodingFeature[]

  /**
   * Attributes the results of the Mapbox Geocoding API to Mapbox.
   */
  attribution: string
}

export interface GeocodingFeature {
  /**
   * A feature ID in the format {type}.{id}
   * where {type} is the lowest hierarchy feature in the place_type field.
   * The {id} suffix of the feature ID is unstable and may change within versions.
   */
  id: string

  /**
   * "Feature", a GeoJSON type from the GeoJSON specification.
   */
  type: 'Feature'

  /**
   * An array of feature types describing the feature.
   * Options are country, region, postcode, district, place, locality, neighborhood, address, and poi.
   * Most features have only one type, but if the feature has multiple types,
   * all applicable types will be listed in the array.
   * (For example, Vatican City is a country, region, and place.)
   */
  place_type: PlaceType[]

  /**
   * Indicates how well the returned feature matches the user's query on a scale from 0 to 1.
   * 0 means the result does not match the query text at all,
   * while 1 means the result fully matches the query text.
   * You can use the relevance property to remove results that don’t fully match the query.
   * Learn more about textual relevance in the Search result prioritization guide.
   */
  relevance: number

  /**
   * Optional. The house number for the returned address feature.
   * Note that unlike the address property for poi features, this property is outside the properties object.
   */
  address?: string

  /**
   * An object describing the feature. The properties object may change with data improvements.
   * Your implementation should check for the presence of these values in a response before it attempts to use them.
   */
  properties: GeocodingProperties

  /**
   * A string representing the feature in the requested language, if specified.
   */
  text: string

  /**
   * A string representing the feature in the requested language,
   * if specified, and its full result hierarchy.
   */
  place_name: string

  /**
   * Optional.
   * A string analogous to the text field that more closely
   * matches the query than results in the specified language.
   * For example, querying Köln, Germany with language set to English (en)
   * might return a feature with the text Cologne and the matching_text Köln.
   *
   * Category matches will not appear as matching_text.
   * For example, a query for coffee, Köln with language set to English (en)
   * would return a poi Café Reichard, but this feature will not include a matching_text field.
   */
  matching_text?: string

  /**
   * Optional.
   * A string analogous to the place_name field that more closely
   * matches the query than results in the specified language.
   * For example, querying Köln, Germany with language set to English (en)
   * might return a feature with the place_name
   * Cologne, Germany and a matching_place_name of Köln, North Rhine-Westphalia, Germany.
   *
   * Category matches will not appear in the matching_place_name field.
   * For example, a query for coffee, Köln with language set to English (en)
   * would return a matching_place_name of
   * Café Reichard, Unter Fettenhennen 11, Köln, North Rhine-Westphalia 50667, Germany
   * instead of a matching_place_name of coffee, Unter Fettenhennen 11, Köln, North Rhine-Westphalia 50667, Germany.
   */
  matching_place_name?: string

  /**
   * Optional. A string of the IETF language tag of the query’s primary language.
   */
  language?: string

  /**
   * A bounding box array in the form [minX,minY,maxX,maxY].
   */
  bbox?: mapboxgl.LngLatBoundsLike

  /**
   * The coordinates of the feature’s center in the form [longitude,latitude].
   * This may be the literal centroid of the feature’s geometry,
   * or the center of human activity within the feature (for example, the downtown area of a city).
   */
  center: mapboxgl.LngLatLike

  /**
   * An object describing the spatial geometry of the returned feature.
   */
  geometry: GeocodeGeometry

  /**
   * An array representing the hierarchy of encompassing parent features.
   * Each parent feature may include any of the above properties.
   */
  context?: Partial<GeocodingFeature>[]

  /**
   * Optional. An object with the routable points for the feature.
   */
  routable_points?: GeocodingPoints
}

export interface GeocodingProperties {
  /**
   * Optional. A point accuracy metric for the returned address feature.
   * Can be one of rooftop, parcel, point, interpolated, intersection, street.
   * Note that this list is subject to change.
   * For details on these options, see the Point accuracy for address features section.
   */
  accuracy?: string

  /**
   * Optional. The full street address for the returned poi feature.
   * Note that unlike the address property for address features, this property is inside the properties object.
   */
  address?: string

  /**
   * Optional. Comma-separated categories for the returned poi feature.
   */
  category?: string

  /**
   * Optional. The name of a suggested Maki icon to visualize a poi feature based on its category.
   */
  maki?: string

  /**
   * Optional. The Wikidata identifier for the returned feature.
   */
  wikidata?: string

  /**
   * Optional. The ISO 3166-1 country and ISO 3166-2 region code for the returned feature.
   */
  short_code?: string

  /**
   * Describes whether or not the feature is in the poi.landmark data type.
   * This data type is deprecated, and this property will be present
   * on all poi features for backwards compatibility reasons but will always be true.
   * @deprecated
   */
  landmark: boolean

  /**
   * A formatted string of the telephone number for the returned poi feature.
   * @deprecated
   */
  tel?: string
}

export interface GeocodeGeometry {
  /**
   * "Point", a GeoJSON type from the GeoJSON specification.
   */
  type: 'Point'

  /**
   * An array in the format [longitude,latitude] at the center of the specified bbox.
   */
  coordinates: number[]

  /**
   * Optional. If present, indicates that an address is interpolated along a road network.
   * The geocoder can usually return exact address points,
   * but if an address is not present the geocoder can use interpolated data as a fallback.
   * In edge cases, interpolation may not be possible if surrounding address data is not present,
   * in which case the next fallback will be the center point of the street feature itself.
   */
  interpolated?: boolean

  /**
   * Optional. If present, indicates an out-of-parity match.
   * This occurs when an interpolated address is not in the expected range for the indicated side of the street.
   */
  omitted?: boolean
}

export interface GeocodingPoints {
  /**
   * Optional.
   * An array of points in the form of [{ coordinates: [lon, lat] }], or null if no points were found.
   */
  points?: { coordinates: number[] }[] | null
}

export type PlaceType =
  | 'country'
  | 'region'
  | 'postcode'
  | 'district'
  | 'place'
  | 'locality'
  | 'neighborhood'
  | 'address'
  | 'poi'

export async function fetchGeocoder(
  api: string,
  input: string,
  queryParameters: Record<PropertyKey, PropertyKey> = {}
) {
  const options = Object.entries(queryParameters).map(
    ([key, value]) => `${key}=${value.toString()}`
  )

  const url = `${api}${encodeURIComponent(input.trim())}.json?${options.join('&')}`

  const data = await fetch(url)
    .then(async (response) => {
      const data = await response.json()
      return response.ok ? data as GeocodingOkResponse : data as GeocodingErrorResponse
    })
    .catch((error) => {
      console.log({ error })
      return { message: error } as GeocodingErrorResponse
    })

  return data
}
