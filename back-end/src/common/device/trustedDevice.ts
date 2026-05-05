import type { Request } from 'express'
import type { TrustedDeviceSnapshot } from '../../types/device.js'
import { UAParser } from 'ua-parser-js'

function normalizeLabel(value: string | undefined): string {
  return (value?.trim() || 'unknown').toLowerCase()
}

function majorFromVersion(version?: string): string {
  const first = version?.split('.')[0]?.trim()
  return first || ''
}

/** Derive a stable, coarse device label from the raw User-Agent header (no full UA stored). */
export function trustedDeviceFromUserAgentHeader(header?: string | string[]): TrustedDeviceSnapshot {
  const raw = Array.isArray(header) ? header[0] : header
  const ua = new UAParser(raw).getResult()
  const browserName = ua.browser?.name?.trim() || ''
  const browserMajor = majorFromVersion(ua.browser?.version)
  const osName = ua.os?.name?.trim() || ''
  const osMajor = majorFromVersion(ua.os?.version)
  return {
    browser: `${browserName} ${browserMajor}`.trim() || 'unknown',
    os: `${osName} ${osMajor}`.trim() || 'unknown',
  }
}

export function trustedDeviceFromRequest(req: Request): TrustedDeviceSnapshot {
  return trustedDeviceFromUserAgentHeader(req.headers['user-agent'])
}

/** Equality on normalized browser + OS only (extend here for IP / device id). */
export function isSameTrustedDevice(a: TrustedDeviceSnapshot, b: TrustedDeviceSnapshot): boolean {
  return normalizeLabel(a.browser) === normalizeLabel(b.browser) && normalizeLabel(a.os) === normalizeLabel(b.os)
}

function isTrustedDeviceRecord(value: unknown): value is TrustedDeviceSnapshot {
  if (typeof value !== 'object' || value === null)
    return false
  const deviceInfo = value as Record<string, unknown>
  return typeof deviceInfo.browser === 'string' && typeof deviceInfo.os === 'string'
}

export function coerceStoredDevicesToSnapshots(stored: TrustedDeviceSnapshot[]): TrustedDeviceSnapshot[] {
  const out: TrustedDeviceSnapshot[] = []
  for (const entry of stored) {
    if (isTrustedDeviceRecord(entry))
      out.push({ browser: entry.browser, os: entry.os })
  }
  return dedupeTrustedDevices(out)
}

function dedupeTrustedDevices(devices: TrustedDeviceSnapshot[]): TrustedDeviceSnapshot[] {
  const seen = new Set<string>()
  const result: TrustedDeviceSnapshot[] = []
  for (const d of devices) {
    const key = `${normalizeLabel(d.browser)}|${normalizeLabel(d.os)}`
    if (seen.has(key))
      continue
    seen.add(key)
    result.push(d)
  }
  return result
}

export function userHasTrustedDevice(stored: TrustedDeviceSnapshot[], current: TrustedDeviceSnapshot): boolean {
  const devices = coerceStoredDevicesToSnapshots(stored)
  return devices.some(d => isSameTrustedDevice(d, current))
}

/** Returns a deduped array of snapshots with `current` appended if new. */
export function mergeTrustedDevice(stored: TrustedDeviceSnapshot[], current: TrustedDeviceSnapshot): TrustedDeviceSnapshot[] {
  const devices = coerceStoredDevicesToSnapshots(stored)
  if (devices.some(d => isSameTrustedDevice(d, current)))
    return devices
  return [...devices, current]
}
