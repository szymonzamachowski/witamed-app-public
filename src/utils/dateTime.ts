/**
 * Utility functions for handling dates and times in Polish timezone (Europe/Warsaw)
 * Handles both CET (UTC+1) and CEST (UTC+2) automatically
 */

/**
 * Converts a local date and time string to ISO string in Polish timezone
 * @param dateString - Date in format YYYY-MM-DD
 * @param timeString - Time in format HH:mm (optional)
 * @returns ISO string in Polish timezone
 */
export function localDateTimeToISO(dateString: string, timeString?: string): string {
  if (!dateString) return ''
  
  const time = timeString || '12:00'
  const [hours, minutes] = time.split(':')
  
  // Create date in Polish timezone
  // Format: YYYY-MM-DDTHH:mm:ss
  const localDateTime = `${dateString}T${hours}:${minutes}:00`
  
  // Parse as local time and convert to ISO (this will include timezone offset)
  const date = new Date(localDateTime)
  
  // Return ISO string - this will be in UTC, but represents the correct local time
  return date.toISOString()
}

/**
 * Converts an ISO date string from database to local date string (YYYY-MM-DD)
 * @param isoString - ISO date string from database
 * @returns Date string in format YYYY-MM-DD in Polish timezone
 */
export function isoToLocalDate(isoString: string): string {
  if (!isoString) return ''
  
  const date = new Date(isoString)
  
  // Use Intl.DateTimeFormat to get date components in Polish timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  return formatter.format(date)
}

/**
 * Converts an ISO date string from database to local time string (HH:mm)
 * @param isoString - ISO date string from database
 * @returns Time string in format HH:mm in Polish timezone
 */
export function isoToLocalTime(isoString: string): string {
  if (!isoString) return ''
  
  const date = new Date(isoString)
  
  // Use Intl.DateTimeFormat to get time components in Polish timezone
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  
  return formatter.format(date)
}

/**
 * Formats a date for display in Polish locale with timezone awareness
 * @param isoString - ISO date string from database
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateForDisplay(
  isoString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Warsaw'
  }
): string {
  if (!isoString) return ''
  
  const date = new Date(isoString)
  return date.toLocaleString('pl-PL', options)
}

/**
 * Formats a date for display (date only) in Polish locale
 * @param isoString - ISO date string from database
 * @returns Formatted date string
 */
export function formatDateOnly(isoString: string): string {
  return formatDateForDisplay(isoString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Warsaw'
  })
}

/**
 * Formats a date and time for display in Polish locale
 * @param isoString - ISO date string from database
 * @returns Formatted date and time string
 */
export function formatDateTime(isoString: string): string {
  return formatDateForDisplay(isoString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Warsaw'
  })
}

