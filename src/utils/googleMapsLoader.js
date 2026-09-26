// Utility to load Google Maps JavaScript API with Promise and caching
let googleMapsPromise = null;

export function loadGoogleMaps(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
      return;
    }

    const callbackName = `__googleMapsCallback_${Date.now()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&libraries=geometry,marker&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      delete window[callbackName];
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps script. Check network or API key restrictions.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export default loadGoogleMaps;
