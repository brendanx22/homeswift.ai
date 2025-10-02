import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ListPropertyForm from './ListPropertyForm';
import { useDashboard } from '../../../contexts/DashboardContext';

const ListPropertyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addProperty } = useDashboard();

  const { mutate, isLoading, error, isSuccess, data } = useMutation({
    mutationFn: async (payload) => {
      try {
        // Add to dashboard context (local storage)
        const created = await addProperty(payload);
        
        // Also try to save to backend if available
        try {
          const res = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const backendData = await res.json();
            return { ...created, backendId: backendData.id };
          }
        } catch (backendError) {
          console.warn('Backend not available, using local storage:', backendError);
        }
        
        return created;
      } catch (error) {
        throw new Error('Failed to create property: ' + error.message);
      }
    },
    onSuccess: (created) => {
      // Refresh renter-facing lists so new listing appears
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['landingProperties'] });
      
      // Navigate back to dashboard to show the new property
      navigate('/');
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">List Your Property</h1>
          <p className="text-sm text-gray-600 mt-2">Provide details about your property. Fields marked with * are required.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <ListPropertyForm
            onSubmit={(values) => mutate(values)}
            submitting={isLoading}
            errorMessage={error ? error.message : ''}
            successMessage={isSuccess ? 'Property created successfully' : ''}
            brand={{ primary: '#FF6B35', accent: '#2C3E50' }}
          />
        </div>

        {data?.id && (
          <div className="mt-4 text-sm text-gray-700">Redirecting to property…</div>
        )}
      </div>
    </div>
  );
};

export default ListPropertyPage;


