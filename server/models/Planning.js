const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['human', 'machine', 'material', 'other'],
    required: true
  },
  capacity: Number,
  costPerUnit: Number,
  availability: [{
    startDate: Date,
    endDate: Date,
    quantity: Number
  }],
  skills: [String],
  constraints: {
    maxHoursPerDay: Number,
    requiredBreaks: Number,
    setupTime: Number
  }
});

const supplySchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: String,
  leadTime: Number,
  reorderPoint: Number,
  supplier: {
    name: String,
    contact: String,
    reliability: Number
  },
  cost: {
    perUnit: Number,
    shipping: Number,
    handling: Number
  }
});

const deliveryUnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  expectedQuantity: Number,
  actualQuantity: Number,
  quality: {
    target: Number,
    actual: Number,
    metrics: Map
  },
  timeline: {
    planned: Date,
    actual: Date,
    variance: Number
  }
});

const planningSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  name: { type: String, required: true },
  timeline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    milestones: [{
      name: String,
      date: Date,
      description: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'delayed', 'at-risk'],
        default: 'pending'
      }
    }]
  },
  resources: [resourceSchema],
  supplies: [supplySchema],
  deliveryUnits: [deliveryUnitSchema],
  optimization: {
    objectives: [{
      type: {
        type: String,
        enum: ['cost', 'time', 'quality', 'efficiency'],
        required: true
      },
      weight: Number,
      target: Number
    }],
    constraints: [{
      type: String,
      value: Number,
      operator: String
    }]
  },
  llmAnalysis: {
    recommendations: [{
      type: String,
      description: String,
      impact: {
        cost: Number,
        time: Number,
        quality: Number
      },
      confidence: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    riskAssessment: [{
      risk: String,
      probability: Number,
      impact: Number,
      mitigationStrategy: String
    }],
    optimizationHistory: [{
      version: Number,
      changes: [String],
      performance: Map,
      timestamp: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true });

// Indexes
planningSchema.index({ projectId: 1, workflowId: 1 });
planningSchema.index({ 'timeline.start': 1, 'timeline.end': 1 });
planningSchema.index({ 'deliveryUnits.timeline.planned': 1 });

// Methods
planningSchema.methods.calculateResourceUtilization = function() {
  // Implementation for resource utilization calculation
};

planningSchema.methods.optimizeDeliverySchedule = function() {
  // Implementation for delivery schedule optimization
};

planningSchema.methods.generateSupplyForecast = function() {
  // Implementation for supply forecast generation
};

planningSchema.methods.exportPlan = function(format) {
  // Implementation for plan export in various formats
};

const Planning = mongoose.model('Planning', planningSchema);

module.exports = Planning; 