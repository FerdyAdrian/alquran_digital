export function getApiErrorMessage(error: unknown, fallback = 'Layanan belum dapat dihubungi. Periksa koneksi, lalu coba lagi.') {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') return error.message;
  return fallback;
}
