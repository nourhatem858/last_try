import mongoose from 'mongoose';

export interface IBookmark {
  userId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new mongoose.Schema(
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

BookmarkSchema.index({ userId: 1, cardId: 1 }, { unique: true });
BookmarkSchema.index({ cardId: 1 });
BookmarkSchema.index({ userId: 1 });

const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);

export default Bookmark;
