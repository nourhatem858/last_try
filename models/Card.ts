import mongoose from 'mongoose';

export interface ICard {
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  authorName: string;
  likes: number;
  bookmarks: number;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags'
      }
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CardSchema.index({ author: 1, createdAt: -1 });
CardSchema.index({ category: 1, createdAt: -1 });
CardSchema.index({ tags: 1 });
CardSchema.index({ title: 'text', content: 'text' });
CardSchema.index({ isDraft: 1, createdAt: -1 });

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

export default Card;
