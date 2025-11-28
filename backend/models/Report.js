import mongoose from 'mongoose';
import timelineEntrySchema from './TimelineEntry.js';

const reportSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    completionImage: {
      type: String,
      default: null,
    },
    completionNote: {
      type: String,
      default: null,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'inprogress', 'completed', 'rejected'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    timeline: [timelineEntrySchema],
  },
  { timestamps: true }
);

reportSchema.virtual('upvotesCount').get(function () {
  return this.upvotedBy.length;
});

reportSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Report', reportSchema);
