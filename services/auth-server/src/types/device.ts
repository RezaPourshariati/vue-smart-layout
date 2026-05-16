/**
 * One trusted client environment. Add optional fields later (e.g. `ipPrefix`, `deviceId`)
 * and extend matching logic when you want those signals to participate.
 */
export interface TrustedDeviceSnapshot {
  browser: string
  os: string
}
