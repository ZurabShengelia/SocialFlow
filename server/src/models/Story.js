import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: false
  },
  videoUrl: {
    type: String,
    required: false
  },
  videoDuration: {
    type: Number, 
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true; 
        return v > 0 && v <= 60; 
      },
      message: 'Video duration must be between 0 and 60 seconds'
    }
  },
  text: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  views: [{
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      enum: ['❤️', '😂', '🔥'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
  }
});

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

storySchema.index({ createdAt: -1, expiresAt: 1 });

export default mongoose.model('Story', storySchema);

