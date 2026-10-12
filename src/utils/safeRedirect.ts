/** Zwraca tylko wewnętrzną ścieżkę aplikacji (chroni przed przekierowaniem na obcą stronę). */
export function safeRedirect(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) {
    return value
  }
  return '/'
}
