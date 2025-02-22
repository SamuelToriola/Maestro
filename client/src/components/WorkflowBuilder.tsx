import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  ConnectionMode,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Typography, Paper } from '@mui/material';
import TaskNode from './nodes/TaskNode';
import { useWorkflow } from '../hooks/useWorkflow';

const nodeTypes = {
  task: TaskNode
};

interface WorkflowBuilderProps {
  workflowId?: string;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflowId }) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    exportToSpreadsheet,
    importFromSpreadsheet,
    getLLMSuggestions
  } = useWorkflow(workflowId);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node_${nodes.length + 1}`,
      type: 'task',
      position: { x: 100, y: 100 },
      data: {
        label: `Task ${nodes.length + 1}`,
        description: '',
        duration: 0,
        resources: [],
        dependencies: [],
        status: 'pending'
      }
    };
    addNode(newNode);
  }, [nodes, addNode]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromSpreadsheet(file);
    }
  }, [importFromSpreadsheet]);

  const handleExport = useCallback(() => {
    exportToSpreadsheet();
  }, [exportToSpreadsheet]);

  const handleGetSuggestions = useCallback(async () => {
    const suggestions = await getLLMSuggestions();
    // Handle suggestions display
    console.log(suggestions);
  }, [getLLMSuggestions]);

  return (
    <Box sx={{ height: '100vh', width: '100%' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Workflow Builder
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={handleAddNode}>
            Add Task
          </Button>
          <Button
            variant="contained"
            component="label"
          >
            Import from Spreadsheet
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
          <Button variant="contained" onClick={handleExport}>
            Export to Spreadsheet
          </Button>
          <Button variant="contained" onClick={handleGetSuggestions}>
            Get AI Suggestions
          </Button>
        </Box>
      </Paper>

      <Box sx={{ height: 'calc(100vh - 200px)', border: '1px solid #ccc' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-right">
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">
                Drag to connect nodes
              </Typography>
              <Typography variant="body2">
                Click on nodes to edit
              </Typography>
            </Paper>
          </Panel>
        </ReactFlow>
      </Box>

      {selectedNode && (
        <Paper
          sx={{
            position: 'fixed',
            right: 20,
            top: 20,
            width: 300,
            p: 2,
            zIndex: 1000
          }}
        >
          <Typography variant="h6">Task Details</Typography>
          {/* Add task details editor here */}
        </Paper>
      )}
    </Box>
  );
};

export default WorkflowBuilder; 