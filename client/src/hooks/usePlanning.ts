import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

interface Resource {
  name: string;
  type: string;
  capacity: number;
  skills: string[];
  availability: boolean;
}

interface Milestone {
  name: string;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'delayed' | 'at-risk';
}

interface Timeline {
  start: string;
  end: string;
  milestones: Milestone[];
}

interface Planning {
  resources: Resource[];
  timeline: Timeline;
  // Add other planning-related fields as needed
}

export const usePlanning = (projectId: string, workflowId: string) => {
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanning();
  }, [projectId, workflowId]);

  const fetchPlanning = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/planning`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPlanning(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching planning:', error);
      setError('Failed to load planning data');
    } finally {
      setLoading(false);
    }
  };

  const importFromSpreadsheet = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/projects/${projectId}/planning/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setPlanning(response.data);
      setError(null);
    } catch (error) {
      console.error('Error importing planning:', error);
      throw new Error('Failed to import planning data');
    }
  };

  const exportToSpreadsheet = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/planning/export`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'planning.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting planning:', error);
      throw new Error('Failed to export planning data');
    }
  };

  const getOptimizedSchedule = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/planning/optimize`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting optimized schedule:', error);
      throw new Error('Failed to get optimization suggestions');
    }
  };

  const updatePlanning = async (updatedPlanning: Partial<Planning>) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/projects/${projectId}/planning`,
        updatedPlanning,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPlanning(response.data);
      setError(null);
    } catch (error) {
      console.error('Error updating planning:', error);
      throw new Error('Failed to update planning data');
    }
  };

  return {
    planning,
    loading,
    error,
    importFromSpreadsheet,
    exportToSpreadsheet,
    getOptimizedSchedule,
    updatePlanning
  };
}; 