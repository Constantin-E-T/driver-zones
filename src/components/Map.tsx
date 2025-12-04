'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Zone } from '@prisma/client';
import { Plus, MapPin as MapPinIcon, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickZoneDialog } from './quick-zone-dialog';

// Custom zone marker icon
const createZoneIcon = () => {
    return L.divIcon({
        className: 'custom-zone-marker',
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                font-weight: bold;
            ">📍</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

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
    centerOnZone?: { lat: number; lng: number } | null;
}

// Fetch driving route from OSRM (Open Source Routing Machine)
async function getDrivingRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
): Promise<{ distance: number; duration: number } | null> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            return {
                distance: data.routes[0].distance / 1000, // Convert meters to km
                duration: data.routes[0].duration / 60, // Convert seconds to minutes
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching route:', error);
        return null;
    }
}

// Format travel time from minutes
function formatTravelTime(minutes: number): string {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Continuous location tracking marker
function LocationTracker({
    onLocationUpdate,
    disableAutoCenter
}: {
    onLocationUpdate: (pos: { lat: number; lng: number }) => void;
    disableAutoCenter?: boolean;
}) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const map = useMap();
    const watchIdRef = useRef<number | null>(null);
    const hasCenteredRef = useRef(false);

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
                    onLocationUpdate(newPos);

                    // On first location, center the map (unless disabled)
                    if (!hasCenteredRef.current && !disableAutoCenter) {
                        map.setView(newPos, 15);
                        hasCenteredRef.current = true;
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
    }, [map, onLocationUpdate, disableAutoCenter]);

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

// Component to handle map centering
function MapCenterController({ center }: { center: { lat: number; lng: number } | null }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], 16, {
                animate: true,
                duration: 0.5,
            });
        }
    }, [center, map]);

    return null;
}

// Component to handle recentering on user location
function RecenterController({
    shouldRecenter,
    userLocation,
    onComplete
}: {
    shouldRecenter: boolean;
    userLocation: { lat: number; lng: number } | null;
    onComplete: () => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (shouldRecenter && userLocation) {
            map.setView([userLocation.lat, userLocation.lng], 15, {
                animate: true,
                duration: 0.5,
            });
            onComplete();
        }
    }, [shouldRecenter, userLocation, map, onComplete]);

    return null;
}

// Component to handle map events like zoom
function MapEvents({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
    const map = useMapEvents({
        zoomend: () => {
            onZoomChange(map.getZoom());
        },
    });
    return null;
}

export default function Map({ zones, centerOnZone }: MapProps) {
    const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'light'>('satellite');
    const [isPlacementMode, setIsPlacementMode] = useState(false);
    const [placementPosition, setPlacementPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [showQuickDialog, setShowQuickDialog] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [shouldRecenter, setShouldRecenter] = useState(false);

    // Fetch driving route when a zone is selected
    useEffect(() => {
        if (selectedZone && userLocation) {
            setLoadingRoute(true);
            setRouteInfo(null);
            getDrivingRoute(
                userLocation.lat,
                userLocation.lng,
                selectedZone.lat,
                selectedZone.lng
            ).then((route) => {
                setRouteInfo(route);
                setLoadingRoute(false);
            });
        } else {
            setRouteInfo(null);
            setLoadingRoute(false);
        }
    }, [selectedZone, userLocation]);

    const getTileLayer = () => {
        switch (mapStyle) {
            case 'satellite':
                return {
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attribution: 'Tiles &copy; Esri'
                };
            case 'dark':
                return {
                    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
                    attribution: '&copy; OpenStreetMap &copy; CARTO'
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

                {/* Add labels overlay for dark mode with better visibility */}
                {mapStyle === 'dark' && (
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                        opacity={0.8}
                    />
                )}

                <LocationTracker
                    onLocationUpdate={setUserLocation}
                    disableAutoCenter={!!centerOnZone}
                />

                {centerOnZone && <MapCenterController center={centerOnZone} />}

                <RecenterController
                    shouldRecenter={shouldRecenter}
                    userLocation={userLocation}
                    onComplete={() => setShouldRecenter(false)}
                />

                {isPlacementMode && placementPosition && (
                    <PlacementMarker
                        initialPosition={placementPosition}
                        onPositionChange={setPlacementPosition}
                    />
                )}

                {zones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;

                    return (
                        <Marker
                            key={zone.id}
                            position={[zone.lat, zone.lng]}
                            icon={createZoneIcon()}
                            eventHandlers={{
                                click: () => setSelectedZone(zone),
                            }}
                        >
                            <Tooltip
                                permanent
                                direction="top"
                                offset={[0, -20]}
                                className="!bg-red-600 !border-white !border-2 !shadow-lg !px-3 !py-1 !rounded-full"
                            >
                                <div style={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    whiteSpace: 'nowrap',
                                    letterSpacing: '0.3px',
                                }}>
                                    {zone.name}
                                </div>
                            </Tooltip>
                            {isSelected && userLocation && (
                                <Popup
                                    onClose={() => setSelectedZone(null)}
                                    closeButton={true}
                                    className="custom-popup"
                                    autoClose={false}
                                >
                                    <div className="p-3 min-w-[220px]">
                                        <h3 className="font-bold text-lg mb-3 text-zinc-900">{zone.name}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-zinc-700">
                                                <MapPin className="h-4 w-4 text-blue-500" />
                                                <span className="font-mono text-xs">
                                                    {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                                                </span>
                                            </div>
                                            <div className="h-px bg-zinc-200 my-2" />
                                            {loadingRoute ? (
                                                <div className="py-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-zinc-600 font-medium">Driving distance:</span>
                                                            <div className="h-5 w-16 bg-zinc-200 rounded animate-pulse"></div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-zinc-600 font-medium">Drive time:</span>
                                                            <div className="h-5 w-16 bg-zinc-200 rounded animate-pulse"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-zinc-200">
                                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                                                        <span className="text-xs text-zinc-500">Calculating route...</span>
                                                    </div>
                                                </div>
                                            ) : routeInfo ? (
                                                <div className="space-y-2 py-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-zinc-600 font-medium">Driving distance:</span>
                                                        <span className="font-semibold text-zinc-900">
                                                            {routeInfo.distance < 1
                                                                ? `${Math.round(routeInfo.distance * 1000)}m`
                                                                : `${routeInfo.distance.toFixed(1)}km`}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-zinc-600 font-medium">Drive time:</span>
                                                        <span className="font-semibold text-emerald-600">
                                                            {formatTravelTime(routeInfo.duration)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-3 text-zinc-500 text-xs bg-zinc-50 rounded">
                                                    Unable to calculate route
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    );
                })}
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
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShouldRecenter(true)}
                    className="rounded-full h-12 w-12 shadow-lg bg-blue-600/90 backdrop-blur-sm text-white border border-blue-500 hover:bg-blue-700"
                    title="Center on my location"
                    disabled={!userLocation}
                >
                    <Navigation className="h-5 w-5" fill="currentColor" />
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

