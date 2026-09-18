/**
 * Maidenhead locators: the grid squares operators exchange, and the distance
 * between two of them.
 *
 * A locator is a square, not a point. Parsing returns the centre and the size,
 * so a caller can tell a 4 character square (about 150 km across) from an 8
 * character one and not present a distance to the metre that nothing supports.
 */
export interface GridSquare {
  /** Normalised locator: field uppercase, subsquare lowercase. */
  locator: string
  /** Centre of the square. */
  latitude: number
  longitude: number
  /** Degrees of latitude and longitude the square spans. */
  latitudeSpan: number
  longitudeSpan: number
}

const PATTERN = /^[A-R]{2}\d{2}(?:[A-X]{2}(?:\d{2})?)?$/i
const FIELD = 'A'.charCodeAt(0)
const SUBSQUARE = 'a'.charCodeAt(0)
const EARTH_RADIUS_KM = 6371.0088

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

export function isGridSquare(value: string): boolean {
  return PATTERN.test(value.trim())
}

/**
 * Written the conventional way: IN51OJ and in51oj are the same square, and
 * both are displayed as IN51oj.
 */
export function normaliseGridSquare(value: string): string | undefined {
  const trimmed = value.trim()
  if (!isGridSquare(trimmed)) return undefined
  return (
    trimmed.slice(0, 2).toUpperCase() +
    trimmed.slice(2, 4) +
    trimmed.slice(4, 6).toLowerCase() +
    trimmed.slice(6)
  )
}

export function parseGridSquare(value: string): GridSquare | undefined {
  const locator = normaliseGridSquare(value)
  if (!locator) return undefined

  const codes = [...locator.toUpperCase()]
  const at = (index: number) => codes[index] as string

  let longitude = (at(0).charCodeAt(0) - FIELD) * 20 - 180
  let latitude = (at(1).charCodeAt(0) - FIELD) * 10 - 90
  let longitudeSpan = 20
  let latitudeSpan = 10

  longitude += Number(at(2)) * 2
  latitude += Number(at(3))
  longitudeSpan = 2
  latitudeSpan = 1

  if (locator.length >= 6) {
    longitude += (at(4).charCodeAt(0) - FIELD) * (2 / 24)
    latitude += (at(5).charCodeAt(0) - FIELD) * (1 / 24)
    longitudeSpan = 2 / 24
    latitudeSpan = 1 / 24
  }

  if (locator.length === 8) {
    longitude += Number(at(6)) * (longitudeSpan / 10)
    latitude += Number(at(7)) * (latitudeSpan / 10)
    longitudeSpan /= 10
    latitudeSpan /= 10
  }

  return {
    locator,
    latitude: latitude + latitudeSpan / 2,
    longitude: longitude + longitudeSpan / 2,
    latitudeSpan,
    longitudeSpan,
  }
}

/** Length is the character count: 4, 6, or 8. */
export function toGridSquare(latitude: number, longitude: number, length = 6): string | undefined {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined
  if (length !== 4 && length !== 6 && length !== 8) return undefined

  // The poles and the antimeridian sit on the far edge of the last square.
  const lon = Math.min(longitude + 180, 359.999999)
  const lat = Math.min(latitude + 90, 179.999999)

  const parts = [
    String.fromCharCode(FIELD + Math.floor(lon / 20)),
    String.fromCharCode(FIELD + Math.floor(lat / 10)),
    String(Math.floor((lon % 20) / 2)),
    String(Math.floor(lat % 10)),
  ]

  if (length >= 6) {
    parts.push(
      String.fromCharCode(SUBSQUARE + Math.floor(((lon % 2) / 2) * 24)),
      String.fromCharCode(SUBSQUARE + Math.floor((lat % 1) * 24)),
    )
  }

  if (length === 8) {
    parts.push(
      String(Math.floor((((lon % 2) / 2) * 24 * 10) % 10)),
      String(Math.floor(((lat % 1) * 24 * 10) % 10)),
    )
  }

  return parts.join('')
}

/** Great circle distance in kilometres between the centres of two squares. */
export function distanceKm(from: string, to: string): number | undefined {
  const a = parseGridSquare(from)
  const b = parseGridSquare(to)
  if (!a || !b) return undefined

  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const deltaLat = toRadians(b.latitude - a.latitude)
  const deltaLon = toRadians(b.longitude - a.longitude)

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial bearing in degrees from true north, 0 to 360. */
export function bearing(from: string, to: string): number | undefined {
  const a = parseGridSquare(from)
  const b = parseGridSquare(to)
  if (!a || !b) return undefined

  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const deltaLon = toRadians(b.longitude - a.longitude)

  const y = Math.sin(deltaLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon)

  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}
