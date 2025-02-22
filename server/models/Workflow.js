const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: String,
    description: String,
    duration: Number,
    resources: [String],
    dependencies: [String],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'blocked'],
      default: 'pending'
    }
  }
});

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  type: { type: String, default: 'smoothstep' },
  animated: { type: Boolean, default: false }
});

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  metadata: {
    startDate: Date,
    endDate: Date,
    totalDuration: Number,
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft'
    },
    lastModified: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }
  },
  settings: {
    autoSchedule: { type: Boolean, default: true },
    notifyOnChanges: { type: Boolean, default: true },
    allowParallelTasks: { type: Boolean, default: true }
  },
  llmContext: {
    relevantDocuments: [String],
    contextualNotes: String,
    aiSuggestions: [{
      type: String,
      suggestion: String,
      confidence: Number,
      timestamp: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true });

// Indexes
workflowSchema.index({ name: 1, creator: 1 }, { unique: true });
workflowSchema.index({ 'metadata.status': 1 });
workflowSchema.index({ createdAt: -1 });

// Methods
workflowSchema.methods.calculateCriticalPath = function() {
  // Implementation for critical path calculation
};

workflowSchema.methods.validateWorkflow = function() {
  // Implementation for workflow validation
};

workflowSchema.methods.exportToSpreadsheet = function() {
  // Implementation for spreadsheet export
};

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow; 