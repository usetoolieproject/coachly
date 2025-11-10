import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSidebarCollapsed, setSidebarCollapsed } from '../utils/cookieUtils';
import { apiFetch } from '../services/api';

export type SidebarMode = 'expanded' | 'collapsed' | 'hover';

interface SidebarContextType {
  isCollapsed: boolean;
  sidebarMode: SidebarMode;
  toggleSidebar: () => void;
  setSidebarMode: (mode: SidebarMode) => void;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from cookies synchronously to prevent flash of wrong state
  const cookieState = getSidebarCollapsed();
  const [isCollapsed, setIsCollapsed] = useState(cookieState);
  const [sidebarMode, setSidebarModeState] = useState<SidebarMode>(cookieState ? 'collapsed' : 'expanded');
  const [isHovering, setIsHovering] = useState(false);

  // Initialize from backend or cookie on mount
  useEffect(() => {
    const fetchSidebarMode = async () => {
      try {
        const response = await apiFetch('/profile/sidebar-preferences');
        const mode = response.sidebarMode || 'collapsed';
        setSidebarModeState(mode);
        setIsCollapsed(mode === 'collapsed');
      } catch (error) {
        // Fallback to cookie if API fails
        console.error('Failed to fetch sidebar preferences:', error);
        const savedState = getSidebarCollapsed();
        setIsCollapsed(savedState);
        setSidebarModeState(savedState ? 'collapsed' : 'expanded');
      }
    };
    
    fetchSidebarMode();
  }, []);

  // Save to cookie whenever state changes
  useEffect(() => {
    setSidebarCollapsed(isCollapsed);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const setSidebarMode = async (mode: SidebarMode) => {
    setSidebarModeState(mode);
    if (mode === 'expanded') {
      setIsCollapsed(false);
    } else if (mode === 'collapsed') {
      setIsCollapsed(true);
    }
    // 'hover' mode handled separately
    
    // Save to backend
    try {
      await apiFetch('/profile/sidebar-preferences', {
        method: 'PUT',
        body: JSON.stringify({ sidebarMode: mode }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to save sidebar preferences:', error);
    }
  };

  // Determine actual collapsed state based on mode and hover
  const effectiveCollapsed = sidebarMode === 'expanded' 
    ? false 
    : sidebarMode === 'collapsed' 
    ? true 
    : !isHovering; // hover mode: collapsed unless hovering

  useEffect(() => {
    if (sidebarMode === 'hover') {
      setIsCollapsed(!isHovering);
    }
  }, [sidebarMode, isHovering]);

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed: effectiveCollapsed, 
      sidebarMode,
      toggleSidebar, 
      setSidebarMode,
      isHovering,
      setIsHovering
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
