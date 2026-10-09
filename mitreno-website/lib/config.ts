export const getBackendUrl = () => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    if (host) {
      return `${window.location.protocol}//${host}:8080`;
    }
  }
  // Fallback for production
  return 'https://api.nvilar.com';
};

export const getSellerPortalUrl = () => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SELLER_PORTAL_URL) {
    return process.env.NEXT_PUBLIC_SELLER_PORTAL_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3002';
    }
    if (host) {
      return `${window.location.protocol}//${host}:3002`;
    }
  }
  return 'https://seller.nvilar.com';
};

