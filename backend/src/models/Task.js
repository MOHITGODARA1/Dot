const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    taskDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ connectionId: 1, taskDate: 1, createdAt: 1 });

module.exports = mongoose.model('Task', taskSchema);
