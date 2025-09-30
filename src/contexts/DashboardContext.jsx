import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProperties, createProperty, deleteProperty } from '../services/propertyService';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    activeRentals: 0,
    propertiesSold: 0,
    activeLeads: 0,
    inquiries: 0
  });

  // Load properties from localStorage on mount
  useEffect(() => {
    loadPropertiesFromStorage();
  }, []);

  // Load properties from localStorage
  const loadPropertiesFromStorage = useCallback(() => {
    try {
      const storedProperties = localStorage.getItem('homeswift_properties');
      if (storedProperties) {
        const parsedProperties = JSON.parse(storedProperties);
        setProperties(parsedProperties);
        updateStats(parsedProperties);
      }
    } catch (error) {
      console.error('Error loading properties from storage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save properties to localStorage
  const savePropertiesToStorage = useCallback((newProperties) => {
    try {
      localStorage.setItem('homeswift_properties', JSON.stringify(newProperties));
    } catch (error) {
      console.error('Error saving properties to storage:', error);
    }
  }, []);

  // Update statistics based on properties
  const updateStats = useCallback((propertiesList) => {
    const totalListings = propertiesList.length;
    const totalViews = propertiesList.reduce((sum, prop) => sum + (prop.views || 0), 0);
    const activeRentals = propertiesList.filter(prop => 
      prop.propertyType === 'rent' && prop.status !== 'sold'
    ).length;
    const propertiesSold = propertiesList.filter(prop => 
      prop.status === 'sold' || prop.listingType === 'sale'
    ).length;
    const activeLeads = Math.floor(Math.random() * 10) + 5; // Mock data for now
    const inquiries = Math.floor(Math.random() * 15) + 3; // Mock data for now

    setStats({
      totalListings,
      totalViews,
      activeRentals,
      propertiesSold,
      activeLeads,
      inquiries
    });
  }, []);

  // Add new property
  const addProperty = useCallback(async (propertyData) => {
    try {
      setLoading(true);
      
      // Create property with unique ID and timestamp
      const newProperty = {
        id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...propertyData,
        status: 'active',
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to properties array
      const updatedProperties = [newProperty, ...properties];
      setProperties(updatedProperties);
      savePropertiesToStorage(updatedProperties);
      updateStats(updatedProperties);

      return newProperty;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [properties, savePropertiesToStorage, updateStats]);

  // Delete property
  const removeProperty = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      
      const updatedProperties = properties.filter(prop => prop.id !== propertyId);
      setProperties(updatedProperties);
      savePropertiesToStorage(updatedProperties);
      updateStats(updatedProperties);

      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [properties, savePropertiesToStorage, updateStats]);

  // Update property
  const updateProperty = useCallback(async (propertyId, updates) => {
    try {
      setLoading(true);
      
      const updatedProperties = properties.map(prop => 
        prop.id === propertyId 
          ? { ...prop, ...updates, updatedAt: new Date().toISOString() }
          : prop
      );
      
      setProperties(updatedProperties);
      savePropertiesToStorage(updatedProperties);
      updateStats(updatedProperties);

      return updatedProperties.find(prop => prop.id === propertyId);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [properties, savePropertiesToStorage, updateStats]);

  // Get recent properties (last 5)
  const getRecentProperties = useCallback(() => {
    return properties.slice(0, 5);
  }, [properties]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    properties,
    loading,
    error,
    stats,
    addProperty,
    removeProperty,
    updateProperty,
    getRecentProperties,
    clearError,
    refreshProperties: loadPropertiesFromStorage
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardContext;
