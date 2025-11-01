import { useState, useEffect } from 'react';

interface BreakpointConfig {
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

const defaultBreakpoints: BreakpointConfig = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
};

export const useResponsive = (breakpoints: BreakpointConfig = defaultBreakpoints) => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowSize.width < breakpoints.sm;
    const isTablet = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg;
    const isDesktop = windowSize.width >= breakpoints.lg;
    const isSmall = windowSize.width < breakpoints.md;
    const isMedium = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.xl;
    const isLarge = windowSize.width >= breakpoints.xl;

    return {
        windowSize,
        isMobile,
        isTablet,
        isDesktop,
        isSmall,
        isMedium,
        isLarge,
        breakpoints,
    };
};

export const useIsMobile = () => {
    const { isMobile } = useResponsive();
    return isMobile;
};

export const useIsTablet = () => {
    const { isTablet } = useResponsive();
    return isTablet;
};

export const useIsDesktop = () => {
    const { isDesktop } = useResponsive();
    return isDesktop;
};