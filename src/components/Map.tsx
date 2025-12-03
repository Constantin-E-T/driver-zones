'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Zone, UserLocation } from '@/lib/types';
import { Locate, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default Leaflet markers in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    zones: Zone[];
    onAddZone: (lat: number, lng: number) => void;
}

function LocationMarker({ location, follow }: { location: UserLocation | null, follow: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (location && follow) {
            map.flyTo([location.lat, location.lng], map.getZoom());
        }
    }, [location, follow, map]);

    if (!location) return null;

    return (
        <Marker position={[location.lat, location.lng]}>
            {/* We can customize this marker later to look like a car or dot */}
        </Marker>
    );
}

export default function Map({ zones, onAddZone }: MapProps) {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [followUser, setFollowUser] = useState(true);

    const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'light'>('satellite');

    useEffect(() => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Error getting location:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Handler to stop following when user drags map
    function MapEvents() {
        useMapEvents({
            dragstart: () => setFollowUser(false),
        });
        return null;
    }

    const getTileLayer = () => {
        switch (mapStyle) {
            case 'satellite':
                return {
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                };
            case 'dark':
                return {
                    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                };
            case 'light':
            default:
                return {
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                };
        }
    };

    const tileLayer = getTileLayer();

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[50.85, -1.18]} // Default to Portsmouth/Fareham area
                zoom={13}
                className="h-full w-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution={tileLayer.attribution}
                    url={tileLayer.url}
                />

                <MapEvents />
                <LocationMarker location={location} follow={followUser} />

                {zones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={[zone.lat, zone.lng]}
                        radius={zone.radius}
                        pathOptions={{
                            color: '#ef4444', // Always red for visibility
                            fillColor: '#ef4444',
                            fillOpacity: 0.2
                        }}
                    >
                        <Tooltip permanent direction="center" className="bg-transparent border-none shadow-none text-white font-bold text-sm">
                            {zone.name}
                        </Tooltip>
                    </Circle>
                ))}
            </MapContainer>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setMapStyle(current => {
                        if (current === 'satellite') return 'dark';
                        if (current === 'dark') return 'light';
                        return 'satellite';
                    })}
                    className="rounded-full h-10 w-10 shadow-lg bg-zinc-800 text-white border border-zinc-700"
                >
                    {mapStyle === 'satellite' ? "🛰️" : mapStyle === 'dark' ? "🌙" : "☀️"}
                </Button>
            </div>

            <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
                <Button
                    variant={followUser ? "default" : "secondary"}
                    size="icon"
                    onClick={() => setFollowUser(true)}
                    className="rounded-full h-12 w-12 shadow-lg"
                >
                    <Navigation className={`h-6 w-6 ${followUser ? "text-primary-foreground" : ""}`} />
                </Button>
            </div>
        </div>
    );
}
