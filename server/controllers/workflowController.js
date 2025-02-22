const Workflow = require('../models/Workflow');
const { IBM } = require('@ibm/granite-sdk');
const xlsx = require('xlsx');

// Initialize IBM Granite client
const granite = new IBM({
  apiKey: process.env.IBM_GRANITE_API_KEY
});

// Create a new workflow
exports.createWorkflow = async (req, res) => {
  try {
    const workflow = new Workflow({
      ...req.body,
      creator: req.user._id
    });
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all workflows for a user
exports.getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find({ creator: req.user._id })
      .sort({ 'metadata.lastModified': -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific workflow
exports.getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      creator: req.user._id
    });
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a workflow
exports.updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      {
        ...req.body,
        'metadata.lastModified': Date.now(),
        'metadata.version': { $inc: 1 }
      },
      { new: true }
    );
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a workflow
exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id
    });
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import workflow from spreadsheet
exports.importFromSpreadsheet = async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Process the spreadsheet data into workflow nodes and edges
    const nodes = [];
    const edges = [];

    data.forEach((row, index) => {
      const node = {
        id: `node_${index}`,
        type: 'default',
        position: { x: index * 150, y: 100 },
        data: {
          label: row.Task,
          description: row.Description,
          duration: row.Duration,
          resources: row.Resources?.split(','),
          dependencies: row.Dependencies?.split(','),
          status: 'pending'
        }
      };
      nodes.push(node);

      // Create edges based on dependencies
      if (row.Dependencies) {
        row.Dependencies.split(',').forEach(dep => {
          const sourceIndex = data.findIndex(d => d.Task === dep.trim());
          if (sourceIndex !== -1) {
            edges.push({
              id: `edge_${sourceIndex}_${index}`,
              source: `node_${sourceIndex}`,
              target: `node_${index}`,
              type: 'smoothstep'
            });
          }
        });
      }
    });

    const workflow = new Workflow({
      name: req.body.name,
      description: req.body.description,
      creator: req.user._id,
      nodes,
      edges
    });

    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export workflow to spreadsheet
exports.exportToSpreadsheet = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const data = workflow.nodes.map(node => ({
      Task: node.data.label,
      Description: node.data.description,
      Duration: node.data.duration,
      Resources: node.data.resources?.join(', '),
      Dependencies: workflow.edges
        .filter(edge => edge.target === node.id)
        .map(edge => {
          const sourceNode = workflow.nodes.find(n => n.id === edge.source);
          return sourceNode.data.label;
        })
        .join(', '),
      Status: node.data.status
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Workflow');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${workflow.name}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get LLM suggestions for workflow optimization
exports.getLLMSuggestions = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // Prepare workflow data for LLM analysis
    const workflowContext = {
      nodes: workflow.nodes.map(node => ({
        task: node.data.label,
        description: node.data.description,
        duration: node.data.duration,
        resources: node.data.resources,
        status: node.data.status
      })),
      dependencies: workflow.edges.map(edge => ({
        source: workflow.nodes.find(n => n.id === edge.source).data.label,
        target: workflow.nodes.find(n => n.id === edge.target).data.label
      }))
    };

    // Get suggestions from IBM Granite
    const suggestions = await granite.analyze({
      context: workflowContext,
      task: 'Analyze this workflow and provide optimization suggestions for:' +
            '1. Task sequencing\n' +
            '2. Resource allocation\n' +
            '3. Timeline optimization\n' +
            '4. Risk identification'
    });

    // Update workflow with LLM suggestions
    workflow.llmContext.aiSuggestions.push({
      type: 'optimization',
      suggestion: suggestions.text,
      confidence: suggestions.confidence
    });

    await workflow.save();
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 