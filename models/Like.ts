import mongoose from 'mongoose';

export interface ILike {
  userId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

LikeSchema.index({ userId: 1, cardId: 1 }, { unique: true });
LikeSchema.index({ cardId: 1 });
LikeSchema.index({ userId: 1 });

const Like = mongoose.models.Like || mongoose.model('Like', LikeSchema);

export default Like;
