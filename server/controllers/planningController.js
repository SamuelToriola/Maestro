const Planning = require('../models/Planning');
const { IBM } = require('@ibm/granite-sdk');
const xlsx = require('xlsx');

// Initialize IBM Granite client
const granite = new IBM({
  apiKey: process.env.IBM_GRANITE_API_KEY
});

// Create a new planning
exports.createPlanning = async (req, res) => {
  try {
    const planning = new Planning({
      ...req.body,
      projectId: req.params.projectId
    });
    await planning.save();
    res.status(201).json(planning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all planning instances for a project
exports.getAllPlannings = async (req, res) => {
  try {
    const plannings = await Planning.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });
    res.json(plannings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific planning
exports.getPlanning = async (req, res) => {
  try {
    const planning = await Planning.findOne({
      _id: req.params.id,
      projectId: req.params.projectId
    });
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    res.json(planning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a planning
exports.updatePlanning = async (req, res) => {
  try {
    const planning = await Planning.findOneAndUpdate(
      { _id: req.params.id, projectId: req.params.projectId },
      req.body,
      { new: true }
    );
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    res.json(planning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a planning
exports.deletePlanning = async (req, res) => {
  try {
    const planning = await Planning.findOneAndDelete({
      _id: req.params.id,
      projectId: req.params.projectId
    });
    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }
    res.json({ message: 'Planning deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import planning from spreadsheet
exports.importFromSpreadsheet = async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    
    // Process Resources sheet
    const resourcesSheet = workbook.Sheets['Resources'];
    const resourcesData = xlsx.utils.sheet_to_json(resourcesSheet);
    const resources = resourcesData.map(row => ({
      name: row.Name,
      type: row.Type,
      capacity: row.Capacity,
      costPerUnit: row.CostPerUnit,
      skills: row.Skills?.split(','),
      constraints: {
        maxHoursPerDay: row.MaxHoursPerDay,
        requiredBreaks: row.RequiredBreaks,
        setupTime: row.SetupTime
      }
    }));

    // Process Supplies sheet
    const suppliesSheet = workbook.Sheets['Supplies'];
    const suppliesData = xlsx.utils.sheet_to_json(suppliesSheet);
    const supplies = suppliesData.map(row => ({
      item: row.Item,
      quantity: row.Quantity,
      unit: row.Unit,
      leadTime: row.LeadTime,
      reorderPoint: row.ReorderPoint,
      supplier: {
        name: row.SupplierName,
        contact: row.SupplierContact,
        reliability: row.SupplierReliability
      },
      cost: {
        perUnit: row.CostPerUnit,
        shipping: row.ShippingCost,
        handling: row.HandlingCost
      }
    }));

    // Process Timeline sheet
    const timelineSheet = workbook.Sheets['Timeline'];
    const timelineData = xlsx.utils.sheet_to_json(timelineSheet);
    const timeline = {
      start: new Date(timelineData[0].StartDate),
      end: new Date(timelineData[0].EndDate),
      milestones: timelineData.map(row => ({
        name: row.MilestoneName,
        date: new Date(row.MilestoneDate),
        description: row.Description,
        status: row.Status || 'pending'
      }))
    };

    const planning = new Planning({
      projectId: req.params.projectId,
      workflowId: req.body.workflowId,
      name: req.body.name,
      timeline,
      resources,
      supplies
    });

    // Get LLM analysis for the planning
    const analysisContext = {
      resources,
      supplies,
      timeline
    };

    const llmAnalysis = await granite.analyze({
      context: analysisContext,
      task: 'Analyze this planning data and provide:\n' +
            '1. Resource utilization optimization\n' +
            '2. Supply chain recommendations\n' +
            '3. Timeline risk assessment\n' +
            '4. Delivery optimization suggestions'
    });

    planning.llmAnalysis.recommendations.push({
      type: 'initial',
      description: llmAnalysis.text,
      impact: llmAnalysis.impact,
      confidence: llmAnalysis.confidence
    });

    await planning.save();
    res.status(201).json(planning);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export planning to spreadsheet
exports.exportToSpreadsheet = async (req, res) => {
  try {
    const planning = await Planning.findOne({
      _id: req.params.id,
      projectId: req.params.projectId
    });

    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    const workbook = xlsx.utils.book_new();

    // Create Resources sheet
    const resourcesData = planning.resources.map(resource => ({
      Name: resource.name,
      Type: resource.type,
      Capacity: resource.capacity,
      CostPerUnit: resource.costPerUnit,
      Skills: resource.skills.join(', '),
      MaxHoursPerDay: resource.constraints.maxHoursPerDay,
      RequiredBreaks: resource.constraints.requiredBreaks,
      SetupTime: resource.constraints.setupTime
    }));
    const resourcesSheet = xlsx.utils.json_to_sheet(resourcesData);
    xlsx.utils.book_append_sheet(workbook, resourcesSheet, 'Resources');

    // Create Supplies sheet
    const suppliesData = planning.supplies.map(supply => ({
      Item: supply.item,
      Quantity: supply.quantity,
      Unit: supply.unit,
      LeadTime: supply.leadTime,
      ReorderPoint: supply.reorderPoint,
      SupplierName: supply.supplier.name,
      SupplierContact: supply.supplier.contact,
      SupplierReliability: supply.supplier.reliability,
      CostPerUnit: supply.cost.perUnit,
      ShippingCost: supply.cost.shipping,
      HandlingCost: supply.cost.handling
    }));
    const suppliesSheet = xlsx.utils.json_to_sheet(suppliesData);
    xlsx.utils.book_append_sheet(workbook, suppliesSheet, 'Supplies');

    // Create Timeline sheet
    const timelineData = planning.timeline.milestones.map(milestone => ({
      MilestoneName: milestone.name,
      MilestoneDate: milestone.date.toISOString(),
      Description: milestone.description,
      Status: milestone.status
    }));
    const timelineSheet = xlsx.utils.json_to_sheet(timelineData);
    xlsx.utils.book_append_sheet(workbook, timelineSheet, 'Timeline');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${planning.name}_planning.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get optimized delivery schedule
exports.getOptimizedSchedule = async (req, res) => {
  try {
    const planning = await Planning.findOne({
      _id: req.params.id,
      projectId: req.params.projectId
    });

    if (!planning) {
      return res.status(404).json({ message: 'Planning not found' });
    }

    // Prepare context for LLM analysis
    const context = {
      resources: planning.resources,
      supplies: planning.supplies,
      timeline: planning.timeline,
      deliveryUnits: planning.deliveryUnits,
      optimization: planning.optimization
    };

    // Get optimization suggestions from IBM Granite
    const optimization = await granite.analyze({
      context,
      task: 'Optimize the delivery schedule considering:\n' +
            '1. Resource availability and constraints\n' +
            '2. Supply chain lead times\n' +
            '3. Timeline milestones\n' +
            '4. Current delivery unit status\n' +
            'Provide specific recommendations for schedule adjustments.'
    });

    // Update planning with optimization results
    planning.llmAnalysis.recommendations.push({
      type: 'schedule_optimization',
      description: optimization.text,
      impact: optimization.impact,
      confidence: optimization.confidence,
      timestamp: new Date()
    });

    await planning.save();
    res.json(optimization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 