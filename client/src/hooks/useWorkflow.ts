import { useState, useCallback, useEffect } from 'react';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from 'reactflow';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const useWorkflow = (workflowId?: string) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Fetch workflow data if workflowId is provided
  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workflows/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNodes(response.data.nodes);
      setEdges(response.data.edges);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    }
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
  );

  const addNode = useCallback((newNode: Node) => {
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const saveWorkflow = async () => {
    try {
      const method = workflowId ? 'put' : 'post';
      const url = workflowId
        ? `${API_BASE_URL}/workflows/${workflowId}`
        : `${API_BASE_URL}/workflows`;

      const response = await axios({
        method,
        url,
        data: {
          nodes,
          edges
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  };

  const importFromSpreadsheet = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/workflows/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setNodes(response.data.nodes);
      setEdges(response.data.edges);
    } catch (error) {
      console.error('Error importing workflow:', error);
      throw error;
    }
  };

  const exportToSpreadsheet = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/workflows/${workflowId}/export`,
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
      link.setAttribute('download', 'workflow.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting workflow:', error);
      throw error;
    }
  };

  const getLLMSuggestions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/workflows/${workflowId}/suggestions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting LLM suggestions:', error);
      throw error;
    }
  };

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    saveWorkflow,
    importFromSpreadsheet,
    exportToSpreadsheet,
    getLLMSuggestions
  };
}; 