import { useState, useEffect, createContext, useContext } from 'react';

const FOMOSettingsContext = createContext();

export const FOMOSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('cargwin_fomo_settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    return {
      enabled: false, // Disabled by default as requested
      showViewers: true,
      showConfirmed: true,
      showStock: true,
      showReservations: false, // Disable reservation notifications
      updateInterval: 120000 // 2 minutes
    };
  });

  useEffect(() => {
    // Save settings to localStorage when they change
    localStorage.setItem('cargwin_fomo_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleFOMO = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const disableReservationNotifications = () => {
    setSettings(prev => ({ ...prev, showReservations: false }));
  };

  const value = {
    settings,
    updateSettings,
    toggleFOMO,
    disableReservationNotifications,
    isEnabled: settings.enabled,
    showViewers: settings.enabled && settings.showViewers,
    showConfirmed: settings.enabled && settings.showConfirmed,
    showStock: settings.enabled && settings.showStock,
    showReservations: settings.enabled && settings.showReservations
  };

  return (
    <FOMOSettingsContext.Provider value={value}>
      {children}
    </FOMOSettingsContext.Provider>
  );
};

export const useFOMOSettings = () => {
  const context = useContext(FOMOSettingsContext);
  if (!context) {
    throw new Error('useFOMOSettings must be used within a FOMOSettingsProvider');
  }
  return context;
};