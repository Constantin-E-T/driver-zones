'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, List, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
    zoneCount?: number;
}

export function Navigation({ zoneCount = 0 }: NavigationProps) {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Map', icon: Map },
        { href: '/zones', label: 'Zones', icon: List, badge: zoneCount },
    ];

    return (
        <>
            {/* Desktop Header - Top */}
            <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
                <div className="flex items-center justify-between px-4 h-16 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-blue-500" />
                        <span className="text-lg font-semibold text-white">Driver Zones</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium relative',
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-md border-t border-zinc-800 safe-area-bottom">
                <div className="grid grid-cols-2 h-20 max-w-md mx-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1.5 transition-all relative',
                                    isActive
                                        ? 'text-blue-500'
                                        : 'text-zinc-500 active:text-zinc-300'
                                )}
                            >
                                <div className="relative">
                                    <Icon className={cn(
                                        'h-6 w-6 transition-transform',
                                        isActive && 'scale-110'
                                    )} />
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-bold min-w-[20px] text-center">
                                            {link.badge > 99 ? '99+' : link.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    'text-xs font-medium',
                                    isActive && 'font-semibold'
                                )}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Top Header with Logo */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
                <div className="flex items-center justify-center px-4 h-14">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <span className="text-base font-semibold text-white">Driver Zones</span>
                    </div>
                </div>
            </div>
        </>
    );
}
