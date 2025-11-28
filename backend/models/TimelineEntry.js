import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected_by_authority',
        'assigned_to_worker',
        'accepted_by_worker',
        'rejected_by_worker',
        'inprogress',
        'completed',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true, _id: true }
);

export default timelineEntrySchema;
