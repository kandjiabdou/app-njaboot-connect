import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes par défaut de Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configurer les icônes par défaut
const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const StoreIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FBB03B">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  coordinates?: { lat: number; lng: number };
  rating?: number;
  hours?: string;
  distance?: number;
}

interface InteractiveMapProps {
  stores: Store[];
  userLocation?: { lat: number; lng: number } | null;
  onStoreSelect?: (store: Store) => void;
}

function MapUpdater({ stores, userLocation }: { stores: Store[]; userLocation?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (stores.length > 0) {
      const bounds = stores
        .filter(store => store.coordinates)
        .map(store => [store.coordinates!.lat, store.coordinates!.lng] as [number, number]);
      
      if (userLocation) {
        bounds.push([userLocation.lat, userLocation.lng]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, stores, userLocation]);

  return null;
}

export default function InteractiveMap({ stores, userLocation, onStoreSelect }: InteractiveMapProps) {
  // Centre par défaut sur Dakar
  const defaultCenter: [number, number] = [14.6937, -17.4441];

  const handleGetDirections = (store: Store) => {
    if (store.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater stores={stores} userLocation={userLocation} />

        {/* Marqueurs pour les boutiques */}
        {stores
          .filter(store => store.coordinates)
          .map((store) => (
            <Marker
              key={store.id}
              position={[store.coordinates!.lat, store.coordinates!.lng]}
              icon={StoreIcon}
              eventHandlers={{
                click: () => onStoreSelect?.(store),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-2">{store.name}</h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p className="flex items-start gap-1">
                      <span className="inline-block w-3 h-3 mt-0.5">📍</span>
                      {store.address}
                    </p>
                    {store.phone && (
                      <p className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3">📞</span>
                        {store.phone}
                      </p>
                    )}
                    {store.hours && (
                      <p className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3">🕒</span>
                        {store.hours}
                      </p>
                    )}
                    {store.rating && (
                      <p className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3">⭐</span>
                        {store.rating}/5
                      </p>
                    )}
                    {store.distance !== undefined && (
                      <p className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3">📏</span>
                        {store.distance < 1 
                          ? `${(store.distance * 1000).toFixed(0)}m`
                          : `${store.distance.toFixed(1)}km`
                        }
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleGetDirections(store)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Itinéraire
                    </button>
                    <button
                      onClick={() => window.location.href = `/store/${store.id}`}
                      className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Marqueur pour la position de l'utilisateur */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-semibold text-sm">Votre position</h3>
                <p className="text-xs text-gray-600">Vous êtes ici</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}