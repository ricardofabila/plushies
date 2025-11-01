import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Home } from 'lucide-react';

const AppHeader: React.FC = () => {
    const location = useLocation();

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* App Logo and Title */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 group"
                        aria-label="Ir al dashboard principal"
                    >
                        <div
                            className="text-3xl group-hover:scale-110 transition-transform duration-200"
                            aria-hidden="true"
                        >
                            🧸
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary-800 group-hover:text-primary-600 transition-colors">
                                Plushie Revenue Tracker
                            </h1>
                            <p className="text-sm text-primary-600 hidden sm:block">
                                Track your adorable plushie sales
                            </p>
                        </div>
                    </Link>

                    {/* Navigation Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Dashboard Link */}
                        <Button
                            variant={location.pathname === '/' ? 'default' : 'ghost'}
                            size="sm"
                            asChild
                            className="hidden sm:flex"
                        >
                            <Link to="/" aria-label="Ir al dashboard">
                                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                                Dashboard
                            </Link>
                        </Button>

                        {/* Mobile Dashboard Link */}
                        <Button
                            variant={location.pathname === '/' ? 'default' : 'ghost'}
                            size="sm"
                            asChild
                            className="sm:hidden"
                        >
                            <Link to="/" aria-label="Ir al dashboard">
                                <Home className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </Button>

                        {/* Settings Link */}
                        <Button
                            variant={location.pathname === '/settings' ? 'default' : 'ghost'}
                            size="sm"
                            asChild
                            className="hidden sm:flex"
                        >
                            <Link to="/settings" aria-label="Ir a configuración">
                                <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                                Settings
                            </Link>
                        </Button>

                        {/* Mobile Settings Link */}
                        <Button
                            variant={location.pathname === '/settings' ? 'default' : 'ghost'}
                            size="sm"
                            asChild
                            className="sm:hidden"
                        >
                            <Link to="/settings" aria-label="Ir a configuración">
                                <Settings className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;