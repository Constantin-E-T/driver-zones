'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Zone } from '@prisma/client';
import { Navigation } from 'lucide-react';
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
    onLocationChange: (location: { lat: number; lng: number }) => void;
    onCreateZone: (lat: number, lng: number) => void;
}

function LocationMarker({
    onLocationChange,
    onCreateZone
}: {
    onLocationChange: (loc: { lat: number; lng: number }) => void,
    onCreateZone: (lat: number, lng: number) => void
}) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            onLocationChange(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map, onLocationChange]);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    onLocationChange(newPos);
                }
            },
            click() {
                const marker = markerRef.current;
                if (marker != null) {
                    const pos = marker.getLatLng();
                    onCreateZone(pos.lat, pos.lng);
                }
            }
        }),
        [onLocationChange, onCreateZone],
    );

    if (position === null) return null;

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Tooltip permanent direction="top" className="bg-blue-600 text-white border-none">
                Drag me to set location
            </Tooltip>
        </Marker>
    );
}

export default function Map({ zones, onLocationChange, onCreateZone }: MapProps) {
    const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'light'>('satellite');

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
                className="h-full w-full"
                style={{ zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    attribution={tileLayer.attribution}
                    url={tileLayer.url}
                />

                <LocationMarker onLocationChange={onLocationChange} onCreateZone={onCreateZone} />

                {zones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={[zone.lat, zone.lng]}
                        radius={zone.radius}
                        pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.2
                        }}
                    >
                        <Tooltip
                            permanent
                            direction="center"
                            className="bg-transparent border-none shadow-none text-white font-bold text-sm text-shadow-sm"
                        >
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
        </div>
    );
}

