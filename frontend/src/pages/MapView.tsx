import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Corrigir o problema dos ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente para ajustar a visualização do mapa
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  markers?: Array<{
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    color?: string;
  }>;
  height?: string;
  onMarkerClick?: (id: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  latitude = -15.7801,
  longitude = -47.9292, // Coordenadas padrão (Brasília)
  zoom = 5,
  markers = [],
  height = '500px',
  onMarkerClick
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([latitude, longitude]);
  const [mapZoom, setMapZoom] = useState<number>(zoom);

  useEffect(() => {
    // Atualizar centro do mapa quando as props mudarem
    if (latitude && longitude) {
      setMapCenter([latitude, longitude]);
    }
    
    // Se houver apenas um marcador, centralizar nele
    if (markers.length === 1 && markers[0].latitude && markers[0].longitude) {
      setMapCenter([markers[0].latitude, markers[0].longitude]);
      setMapZoom(15); // Zoom mais próximo para um único marcador
    }
    
    // Se houver múltiplos marcadores, ajustar para mostrar todos
    if (markers.length > 1) {
      // Implementação básica - poderia ser melhorada com cálculo de bounds
      setMapZoom(10);
    }
  }, [latitude, longitude, markers]);

  // Criar ícones coloridos para os marcadores
  const createColoredIcon = (color: string = 'blue') => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={marker.color ? createColoredIcon(marker.color) : DefaultIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(marker.id);
                }
              }
            }}
          >
            <Popup>
              <div>
                <h3 className="font-medium">{marker.title}</h3>
                {marker.description && <p>{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
