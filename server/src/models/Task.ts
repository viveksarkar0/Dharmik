import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: { 
    type: String, 
    enum: {
      values: ['todo', 'in-progress', 'done'],
      message: 'Status must be one of: todo, in-progress, done'
    },
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be one of: low, medium, high'
    },
    default: 'medium' 
  },
  dueDate: { 
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  assignee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Creator is required']
  },
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for task age
taskSchema.virtual('age').get(function() {
  if (!this.createdAt) return 0;
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

export default mongoose.model('Task', taskSchema);
