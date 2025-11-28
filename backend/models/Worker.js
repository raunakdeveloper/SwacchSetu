import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workHistory: [
      {
        report: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Report',
        },
        status: String,
        completedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Worker', workerSchema);
