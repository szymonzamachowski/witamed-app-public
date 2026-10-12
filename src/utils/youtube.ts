// Funkcja do wyciągnięcia ID wideo lub playlisty z YouTube URL
// oraz przygotowania możliwie najlepszego URL do osadzenia
export function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null

  // Sprawdź czy to playlisty (różne formaty URL)
  // Format 1: https://www.youtube.com/playlist?list=PLxxxxx
  // Format 2: https://www.youtube.com/watch?v=xxxxx&list=PLxxxxx
  // Format 3: https://youtube.com/playlist?list=PLxxxxx
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/)
  if (playlistMatch) {
    const playlistId = playlistMatch[1]
    // Wyciągnij też ID pierwszego wideo jeśli jest w URL (dla lepszego startu)
    const videoMatch = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11})/)
    const firstVideoId = videoMatch ? videoMatch[1] : null
    
    // Użyj embed URL dla playlisty
    // Jeśli mamy ID pierwszego wideo, użyj go jako startowego (bardziej niezawodne)
    if (firstVideoId) {
      // Format: embed pierwszego wideo z playlistą - automatycznie przejdzie do następnych
      return `https://www.youtube.com/embed/${firstVideoId}?list=${playlistId}&autoplay=1&rel=0`
    } else {
      // Format: embed playlisty bez konkretnego pierwszego wideo
      // YouTube automatycznie odtworzy pierwsze wideo z playlisty
      return `https://www.youtube.com/embed?listType=playlist&list=${playlistId}&autoplay=1&rel=0`
    }
  }

  // Jeśli nie playlisty, spróbuj wyciągnąć ID wideo
  // Obsługa standardowych linków + linków live (/live/VIDEO_ID)
  const videoMatch = url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]{11})/)
  if (videoMatch) {
    return `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=0`
  }

  // Jeżeli to nadal jest link do YouTube, ale nie udało się wyciągnąć ID,
  // użyj oryginalnego URL jako src iframe – YouTube zwykle i tak go obsłuży.
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      return url
    }
  } catch {
    // Ignoruj błędy parsowania i po prostu zwróć null
  }

  // Dla innych serwisów (np. Vimeo) na razie nie próbujemy embedować
  return null
}
