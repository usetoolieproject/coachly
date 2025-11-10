import React, { createContext, useContext, useEffect } from 'react';

interface AdminThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Force light mode for admin
  const isDarkMode = false;
  
  const toggleDarkMode = () => {
    // Disabled for admin - always light mode
  };

  useEffect(() => {
    // Force light mode on document
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Set data attribute for Tailwind
    document.documentElement.setAttribute('data-theme', 'light');
    
    // Override any dark mode styles
    const style = document.createElement('style');
    style.textContent = `
      /* Force light mode for admin */
      .admin-interface {
        color-scheme: light !important;
      }
      
      /* Override any dark mode classes in admin */
      .admin-interface * {
        --tw-bg-opacity: 1 !important;
      }
      
      /* Ensure admin components use light colors */
      .admin-interface .dark\\:bg-gray-900 {
        background-color: rgb(249 250 251) !important;
      }
      
      .admin-interface .dark\\:bg-gray-800 {
        background-color: rgb(255 255 255) !important;
      }
      
      .admin-interface .dark\\:text-white {
        color: rgb(17 24 39) !important;
      }
      
      .admin-interface .dark\\:text-gray-300 {
        color: rgb(75 85 99) !important;
      }
      
      .admin-interface .dark\\:border-gray-700 {
        border-color: rgb(229 231 235) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <AdminThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className="admin-interface">
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};
