'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zone } from '@prisma/client';
import { Plus, MapPin as MapPinIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickZoneDialog } from './quick-zone-dialog';

// Custom pulsing location marker icon
const createLocationIcon = () => {
    return L.divIcon({
        className: 'custom-location-marker',
        html: `
            <div style="position: relative; width: 40px; height: 40px;">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    background: #3b82f6;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    z-index: 2;
                "></div>
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 40px;
                    height: 40px;
                    background: rgba(59, 130, 246, 0.3);
                    border-radius: 50%;
                    animation: pulse 2s ease-out infinite;
                "></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

// Custom draggable marker icon for zone placement
const createPlacementIcon = () => {
    return L.divIcon({
        className: 'custom-placement-marker',
        html: `
            <div style="
                width: 30px;
                height: 30px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                cursor: move;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
            ">+</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

interface MapProps {
    zones: Zone[];
}

// Continuous location tracking marker
function LocationTracker() {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const map = useMap();
    const watchIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Start continuous location tracking
        if ('geolocation' in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    setPosition(newPos);

                    // On first location, center the map
                    if (!position) {
                        map.setView(newPos, 15);
                    }
                },
                (error) => console.error('Location error:', error),
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        }

        // Cleanup
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [map, position]);

    if (!position) return null;

    return (
        <Marker position={position} icon={createLocationIcon()}>
            <Tooltip direction="top" offset={[0, -20]} className="bg-blue-600 text-white border-none font-medium">
                Your Location
            </Tooltip>
        </Marker>
    );
}

// Draggable placement marker for creating zones
function PlacementMarker({
    initialPosition,
    onPositionChange,
}: {
    initialPosition: { lat: number; lng: number };
    onPositionChange: (pos: { lat: number; lng: number }) => void;
}) {
    const [position, setPosition] = useState(initialPosition);
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    onPositionChange(newPos);
                }
            },
        }),
        [onPositionChange]
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={createPlacementIcon()}
        >
            <Tooltip permanent direction="top" offset={[0, -15]} className="bg-emerald-600 text-white border-none font-semibold">
                Drag to position
            </Tooltip>
        </Marker>
    );
}

export default function Map({ zones }: MapProps) {
    const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'light'>('satellite');
    const [isPlacementMode, setIsPlacementMode] = useState(false);
    const [placementPosition, setPlacementPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [showQuickDialog, setShowQuickDialog] = useState(false);

    const getTileLayer = () => {
        switch (mapStyle) {
            case 'satellite':
                return {
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attribution: 'Tiles &copy; Esri'
                };
            case 'dark':
                return {
                    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    attribution: '&copy; OpenStreetMap'
                };
            case 'light':
            default:
                return {
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    attribution: '&copy; OpenStreetMap'
                };
        }
    };

    const handleAddZoneClick = () => {
        // Get current user location or map center
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPlacementPosition({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                    setIsPlacementMode(true);
                },
                () => {
                    // Fallback to default position
                    setPlacementPosition({ lat: 50.85, lng: -1.18 });
                    setIsPlacementMode(true);
                }
            );
        }
    };

    const handleConfirmPlacement = () => {
        setShowQuickDialog(true);
    };

    const handleCancelPlacement = () => {
        setIsPlacementMode(false);
        setPlacementPosition(null);
    };

    const handleZoneCreated = () => {
        setShowQuickDialog(false);
        setIsPlacementMode(false);
        setPlacementPosition(null);
    };

    const tileLayer = getTileLayer();

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[50.85, -1.18]}
                zoom={13}
                className="h-full w-full"
                style={{ zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url={tileLayer.url}
                />

                <LocationTracker />

                {isPlacementMode && placementPosition && (
                    <PlacementMarker
                        initialPosition={placementPosition}
                        onPositionChange={setPlacementPosition}
                    />
                )}

                {zones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={[zone.lat, zone.lng]}
                        radius={zone.radius}
                        pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.2,
                            weight: 2,
                        }}
                    >
                        <Tooltip
                            permanent
                            direction="center"
                            className="!bg-transparent !border-0 !shadow-none !p-0"
                        >
                            <div style={{
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '14px',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px 1px 3px rgba(0,0,0,0.95)',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                letterSpacing: '0.3px',
                            }}>
                                {zone.name}
                            </div>
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
                    className="rounded-full h-12 w-12 shadow-lg bg-zinc-800/90 backdrop-blur-sm text-white border border-zinc-700 hover:bg-zinc-700"
                    title="Change map style"
                >
                    <span className="text-xl">{mapStyle === 'satellite' ? "🛰️" : mapStyle === 'dark' ? "🌙" : "☀️"}</span>
                </Button>
            </div>

            {/* Floating Action Button to Add Zone */}
            {!isPlacementMode && (
                <Button
                    onClick={handleAddZoneClick}
                    className="absolute bottom-24 right-4 md:bottom-4 z-[1000] h-14 w-14 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-white transition-all duration-200 hover:scale-110"
                    title="Add new zone"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            )}

            {/* Placement Mode Actions */}
            {isPlacementMode && (
                <div className="absolute bottom-24 right-4 md:bottom-4 z-[1000] flex flex-col gap-2">
                    <Button
                        onClick={handleConfirmPlacement}
                        className="h-14 px-6 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        Create Zone Here
                    </Button>
                    <Button
                        onClick={handleCancelPlacement}
                        variant="secondary"
                        className="h-12 px-6 rounded-full shadow-lg bg-zinc-800/90 hover:bg-zinc-700 text-white"
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Quick Zone Dialog */}
            {showQuickDialog && placementPosition && (
                <QuickZoneDialog
                    open={showQuickDialog}
                    onOpenChange={setShowQuickDialog}
                    position={placementPosition}
                    onSuccess={handleZoneCreated}
                />
            )}
        </div>
    );
}

