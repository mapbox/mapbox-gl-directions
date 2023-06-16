import mapboxgl from "mapbox-gl"

export interface DirectionsErrorResponse {
  message?: string
}

export interface DirectionsOkResponse {
  /**
   * A code indicating the state of the response. This is a different code than the HTTP status code. On normal valid responses, the value will be Ok. For other responses, see the Directions API errors table.
   */
  code: string

  /**
   * An array of waypoint objects. Each waypoint is an input coordinate snapped to the road and path network. The waypoints appear in the array in the order of the input coordinates.
   * 📌 Deprecation Notice
   * The location of the waypoints property at the root of the response is now deprecated. You can continue to use this and it will work as-is. It remains the default structure (waypoints_per_route=false). We have added a waypoints_per_route=true parameter to request the new waypoints response moving forward. This is necessary when asking for an EV-optimized route with alternatives. Please see the new waypoints_per_route parameter in the optional parameters and the new waypoints per route object waypoints in the route object.
   */
  waypoints: Waypoint[]

  /**
   * An array of route objects ordered by descending recommendation rank. The response object may contain at most two routes.
   */
  routes: Route[]
}

export interface Waypoint {
  /**
   * The name of the road or path to which the input coordinate has been snapped.
   */
  name: string

  /**
   * The snapped coordinate as [longitude, latitude].
   */
  location: mapboxgl.LngLatLike

  /**
   * 	Optional. The straight-line distance from the coordinate specified in the query to the location it was snapped to.
   */
  distance?: number

  /**
   * Optional. An object describing charging stops inserted by EV Routing for routes requiring charging along the way. Its set to null for user provided waypoints including start & end locations.
   */
  metadata?: ChargingWaypointMetadata | null
}

export interface ChargingWaypointMetadata {
}

export interface Route {
  /**
   * The estimated travel time through the waypoints, in seconds.
   */
  duration: number

  /**
   * The distance traveled through the waypoints, in meters.
   */
  distance: number

  /**
   * The weight used. The default is routability, which is duration-based, with additional penalties for less desirable maneuvers.
   */
  weight_name: string

  /**
   * When using the driving-traffic profile, this will be returned as a float indicating the duration of the route under typical conditions (not taking into account live traffic).
   */
  duration_typical: number

  /**
   * When using the driving-traffic profile, this will be returned as a float indicating the weight of the selected route under typical conditions (not taking into account live traffic).
   */
  weight_typical: number

  /**
   * Depending on the geometries query parameter, this is either a GeoJSON LineString or a Polyline string. Depending on the overview query parameter, this is the complete route geometry (full), a simplified geometry to the zoom level at which the route can be displayed in full (simplified), or is not included (false).
   */
  geometry: string

  /**
   * An array of route leg objects.
   */
  legs: RouteLeg[]

  /**
   * The locale used for voice instructions. Defaults to en (English). Can be any accepted instruction language. voiceLocale is only present in the response when voice_instructions=true.
   */
  voiceLocale: string
}

export interface RouteLeg {
  /**
   * The distance traveled between waypoints, in meters.
   */
  distance: number

  /**
   * The estimated travel time between waypoints, in seconds.
   */
  duration: number

  /**
   * The weight in units described by weight_name.
   */
  weight: number

  /**
   * When using the driving-traffic profile, this will be returned as indication of duration of the leg under typical conditions (not taking into account live traffic).
   */
  duration_typical: number

  /**
   * When using the driving-traffic profile, this will be returned as indication of the weight of the leg under typical conditions (not taking into account live traffic).
   */
  weight_typical: number

  /**
   * Depending on the optional steps parameter, either an array of route step objects (steps=true) or an empty array (steps=false, default).
   */
  steps: RouteStep[]

  /**
   * A summary of the route.
   */
  summary: string

  /**
   * An array of objects describing the administrative boundaries the route leg travels through. Use admin_index on the intersection object to look up the administrative boundaries for each intersection in this array.
   */
  admins: AdminBoundary[]

  /**
   * An array of incident objects describing temporary events that occur along the roadway. This is only provided if incidents exist and you are using the mapbox/driving-traffic profile.
   */
  incidents: RouteIncident[]

  /**
   * Included in the route leg object when making a mapbox/driving-traffic request with annotations=closure,... and there are live-traffic closures along the route. This is an array of closure objects which contain the following properties:
   */
  closures: RouteClosure[]

  /**
   * An annotations object that contains additional details about each line segment along the route geometry. Each entry in an annotations field corresponds to a coordinate along the route geometry.
   */
  annotation: RouteAnnotation

  /**
   * When the semicolon-separated list waypoints parameter is used in the request, an array per leg is returned that describes where a particular waypoint from the root-level array matches to the route. This provides a way for tracking when a waypoint is passed along the route. Also see the optional waypoints parameter description.
   */
  via_waypoints: RouteWaypoint[]

  /**
   * An optional array of notification objects describing notifications about the route.
   */
  notifications: Notification[]
}

export interface RouteStep {
  /**
   * One step maneuver object.
   */
  manuever: RouteStepManeuver

  /**
   * The distance traveled, in meters, from the maneuver to the next route step.
   */
  distance: number

  /**
   * The estimated time traveled, in seconds, from the maneuver to the next route step.
   */
  duration: number

  /**
   * The weight in units described by weight_name.
   */
  weight: number

  /**
   * When using the driving-traffic profile, this will be returned as indication of duration of the step under typical conditions (not taking into account live traffic).
   */
  duration_typical: number

  /**
   * When using the driving-traffic profile, this will be returned as indication of the weight of the step under typical conditions (not taking into account live traffic).
   */
  weight_typical: number

  /**
   * Depending on the geometries parameter, this is a GeoJSON LineString or a Polyline string representing the full route geometry from this route step to the next route step.
   */
  geometry: string

  /**
   * The name of the road or path that forms part of the route step.
   */
  name: string

  /**
   * Any road designations associated with the road or path leading from this step’s maneuver to the next step’s maneuver. If multiple road designations are associated with the road, they are separated by semicolons. Typically consists of an alphabetic network code (identifying the road type or numbering system), a space or hyphen, and a route number. Optionally included, if data is available.
   * Note: A network code is not necessarily globally unique, and should not be treated as though it is. A route number may not uniquely identify a road within a given network.
   */
  ref: string

  /**
   * The destinations of the road or path along which the travel proceeds. Optionally included, if data is available.
   */
  destinations: string

  /**
   * The exit numbers or names of the road or path. Optionally included, if data is available.
   */
  exits: string

  /**
   * The legal driving side at the location for this step. Either left or right.
   */
  driving_side: string

  /**
   * The mode of transportation.
   * Profile	Possible values
   * mapbox/driving	driving, ferry, unaccessible
   * mapbox/walking	walking, ferry, unaccessible
   * mapbox/cycling	cycling, walking, ferry, train, unaccessible
   */
  mode: string

  /**
   * An IPA phonetic transcription indicating how to pronounce the name in the name property. Omitted if pronunciation data is not available for the step.
   */
  pronunciation: string

  /**
   * An array of objects representing all the intersections along the step:
   */
  intersections: RouteStepIntersection[]

  /**
   * The basic design of speed limit signs along the route step, either mutcd (Manual on Uniform Traffic Control Devices) or vienna (Vienna Convention on Road Signs and Signals). Only present in the response when the annotations query parameter contains maxspeed.
   */
  speedLimitSign: string

  /**
   * The unit of measurement for speed that is used locally along the step, either km/h or mph. This unit is an appropriate default unit to display in the absence of a user preference; it may differ from the unit property of the annotation objects. Only present in the response when the annotations query parameter contains maxspeed.
   */
  speedLimitUnit: string
}

export interface RouteStepManeuver {
  /**
   * A number between 0 and 360 indicating the clockwise angle from true north to the direction of travel immediately before the maneuver.
   */
  bearing_before: number

  /**
   * A number between 0 and 360 indicating the clockwise angle from true north to the direction of travel immediately after the maneuver.
   */
  bearing_after: number

  /**
   * A human-readable instruction of how to execute the returned maneuver.
   */
  instruction: string

  /**
   * The coordinates of the maneuver as [longitude, latitude].
   */
  location: mapboxgl.LngLatLike

  /**
   * Optional. The direction change of the maneuver. The meaning of each modifier depends on the type property.
   */
  modifier?: string

  /**
   * Indicates the type of maneuver. See the full list of maneuver types in the maneuver types table. If no modifier is provided, the type of maneuvers is limited to depart and arrive.
   */
  type: string
}

export interface RouteStepIntersection {
  location: mapboxgl.LngLatLike

  bearings: number[]

  classes: string[]

  entry: boolean[]

  in: number

  out: number

  lanes: RouteStepIntersectionLane[]

  duration: number

  tunnel_name: string

  /**
   * TODO...
   */
}

export interface RouteStepIntersectionLane {
  /**
   * Indicates whether a lane can be taken to complete the maneuver (true) or not (false). For instance, if the lane array has four objects and the first two are valid, the driver can take either of the left lanes and stay on the route.
   */
  valid: boolean

  /**
   * Indicates whether this lane is a preferred lane (true) or not (false). A preferred lane is a lane that is recommended if there are multiple lanes available. For example, if guidance indicates that the driver must turn left at an intersection and there are multiple left turn lanes, the left turn lane that will better prepare the driver for the next maneuver will be marked as active. Only available on the mapbox/driving profile.
   */
  active: boolean

  /**
   * When either valid or active is set to true, this property shows which of the lane indications is applicable to the current route, when there is more than one. For example, if a lane allows you to go left or straight but your current route is guiding you to the left, then this value will be set to left. See indications for possible values. When both active and valid are false, this property will not be included in the response. Only available on the mapbox/driving profile.
   */
  valid_indication: string

  /**
   * The indications (based on signs, road markings, or both) for each turn lane. A road can have multiple indications. For example, a turn lane can have a sign with an arrow pointing left and another arrow pointing straight.
   */
  indications: string[]
}

export interface AdminBoundary {
  /**
   * Contains the two-letter ISO 3166-1 alpha-2 code that applies to a country boundary. Example: "US".
   */
  iso_3116_1: string

  /**
   * Contains the three-letter ISO 3166-1 alpha-3 code that applies to a country boundary. Example: "USA".
   */
  iso_3166_1_alpha3: string
}

/**
 * TODO
 */
export interface RouteIncident {
}

export interface RouteClosure {
  /**
   * The position in the coordinate list where the closure began, relative to the start of the leg it's on.
   */
  geometry_index_start: number

  /**
   * The position in the coordinate list where the closure ended, relative to the start of the leg it's on.
   */
  geometry_index_end: number
}

export interface RouteAnnotation {
  /**
   * The level of congestion, described as severe, heavy, moderate, low or unknown, between each entry in the array of coordinate pairs in the route leg. For any profile other than mapbox/driving-traffic a list of unknowns will be returned.
   */
  congestion: string

  /**
   * The level of congestion in numeric form, from 0-100. A value of 0 indicates no congestion, a value of 100 indicates maximum congestion. Entries may be null if congestion on that segment is not known.
   */
  congestion_numeric: number | null

  /**
   * The distance between each pair of coordinates, in meters.
   */
  distance: number

  /**
   * The duration between each pair of coordinates, in seconds.
   */
  duration: number

  /**
   * The local posted speed limit between each pair of coordinates. A maxspeed object contains the following properties:
   */
  maxspeed: SpeedLimit

  /**
   * The average speed used in the calculation between the two points in each pair of coordinates, in meters per second.
   */
  speed: number
}

export interface SpeedLimit {
  /**
   * The maximum speed limit between the coordinates of a segment. The value can be either the legal speed limit or an advisory speed limit where posted, or none if the speed limit is unlimited (for instance, a German Autobahn).
   */
  speed: number

  /**
   * The unit of measurement that speed is expressed in, either km/h or mph. Returned in combination with speed.
   */
  unit: string

  /**
   * Returns true if the speed limit is not known.
   */
  unknown?: boolean
}

export interface RouteWaypoint {
  waypoint_index: number

  distance_from_start: number

  geometry_index: number
}

export async function fetchDirections(
  api: string,
  profile: string,
  query: string,
  queryParameters: Record<string, string> = {}
) {
  const options = Object.keys(queryParameters).map((key) => `${key}=${queryParameters[key]}`)

  const url = `${api}${profile}/${query}.json?${options.join('&')}`

  const directionsResponseData = await fetch(url)
    .then(async (response) => {
      const data = await response.json()

      if ('error' in data) {
        return { message: data.error } as DirectionsErrorResponse
      }
      if (data.message === 'No route found') {
        return data as DirectionsErrorResponse
      }
      if (!response.ok) {
        return { message: 'No route found' } as DirectionsErrorResponse
      }

      return data as DirectionsOkResponse
    })
    .catch(error => {
      return { message: error } as DirectionsErrorResponse
    })

  return directionsResponseData
}
