import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { AccessTime, Person, Assignment } from '@mui/icons-material';

interface TaskData {
  label: string;
  description: string;
  duration: number;
  resources: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

const TaskNode: React.FC<NodeProps<TaskData>> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 200,
        backgroundColor: '#fff',
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {data.label}
        </Typography>
        <Chip
          label={data.status}
          color={getStatusColor(data.status)}
          size="small"
          sx={{ mt: 0.5 }}
        />
      </Box>

      {data.description && (
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          {data.description}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <AccessTime fontSize="small" color="action" />
        <Typography variant="body2">
          {data.duration} days
        </Typography>
      </Box>

      {data.resources && data.resources.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" color="action" />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {data.resources.map((resource, index) => (
              <Chip
                key={index}
                label={resource}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export default memo(TaskNode); 