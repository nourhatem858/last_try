/**
 * Data Migration Script
 * Migrates any existing mock/test data to proper database structure
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-workspace';

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    log('✅ Connected to MongoDB', 'success');
  } catch (error) {
    log(`❌ MongoDB connection failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

async function checkCollections() {
  log('\n📊 Checking existing collections...', 'info');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  log(`Found ${collections.length} collections:`, 'info');
  collectionNames.forEach(name => log(`  - ${name}`, 'info'));
  
  return collectionNames;
}

async function checkIndexes() {
  log('\n🔍 Checking indexes...', 'info');
  
  const collections = ['users', 'workspaces', 'notes', 'documentmodels', 'chats'];
  
  for (const collName of collections) {
    try {
      const collection = mongoose.connection.db.collection(collName);
      const indexes = await collection.indexes();
      
      if (indexes.length > 1) { // More than just _id
        log(`✅ ${collName}: ${indexes.length} indexes`, 'success');
      } else {
        log(`⚠️  ${collName}: Only default _id index`, 'warning');
      }
    } catch (error) {
      log(`  ${collName}: Collection doesn't exist yet`, 'info');
    }
  }
}

async function createSampleData() {
  log('\n📝 Creating sample data for testing...', 'info');
  
  // Import models
  const User = require('./models/User').default;
  const Workspace = require('./models/Workspace').default;
  const Note = require('./models/Note').default;
  const DocumentModel = require('./models/DocumentModel').default;
  const Chat = require('./models/Chat').default;
  const bcrypt = require('bcryptjs');
  
  // Check if sample user exists
  let user = await User.findOne({ email: 'demo@example.com' });
  
  if (!user) {
    log('Creating demo user...', 'info');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      role: 'user',
    });
    log('✅ Demo user created (email: demo@example.com, password: demo123)', 'success');
  } else {
    log('✅ Demo user already exists', 'success');
  }
  
  // Check if sample workspace exists
  let workspace = await Workspace.findOne({ owner: user._id });
  
  if (!workspace) {
    log('Creating demo workspace...', 'info');
    workspace = await Workspace.create({
      name: 'Demo Workspace',
      description: 'Sample workspace for testing',
      owner: user._id,
      members: [
        {
          user: user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      settings: {
        visibility: 'private',
        allowMemberInvites: false,
        defaultNotePermission: 'edit',
      },
      tags: ['demo', 'sample'],
    });
    log('✅ Demo workspace created', 'success');
  } else {
    log('✅ Demo workspace already exists', 'success');
  }
  
  // Create sample notes
  const noteCount = await Note.countDocuments({ author: user._id });
  if (noteCount === 0) {
    log('Creating sample notes...', 'info');
    await Note.create([
      {
        title: 'Welcome Note',
        content: 'Welcome to the Knowledge Workspace! This is a sample note.',
        workspace: workspace._id,
        author: user._id,
        tags: ['welcome', 'intro'],
        isPinned: true,
        isArchived: false,
        collaborators: [],
        version: 1,
        aiGenerated: false,
      },
      {
        title: 'Project Ideas',
        content: 'List of project ideas:\n1. Build a task manager\n2. Create a blog\n3. Develop an API',
        workspace: workspace._id,
        author: user._id,
        tags: ['projects', 'ideas'],
        isPinned: false,
        isArchived: false,
        collaborators: [],
        version: 1,
        aiGenerated: false,
      },
      {
        title: 'Meeting Notes - Q4 Planning',
        content: 'Discussed Q4 goals and objectives. Key points:\n- Increase user engagement\n- Launch new features\n- Improve performance',
        workspace: workspace._id,
        author: user._id,
        tags: ['meeting', 'planning', 'q4'],
        isPinned: false,
        isArchived: false,
        collaborators: [],
        version: 1,
        aiGenerated: false,
      },
    ]);
    log('✅ Created 3 sample notes', 'success');
  } else {
    log(`✅ ${noteCount} notes already exist`, 'success');
  }
  
  // Create sample chat
  const chatCount = await Chat.countDocuments({ participants: user._id });
  if (chatCount === 0) {
    log('Creating sample chat...', 'info');
    await Chat.create({
      title: 'AI Assistant Chat',
      workspace: workspace._id,
      participants: [user._id],
      messages: [
        {
          sender: user._id,
          content: 'Hello! Can you help me organize my notes?',
          type: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
          sender: user._id,
          content: 'I can help you organize your notes! What would you like to do?',
          type: 'ai',
          metadata: {
            confidence: 0.95,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 4),
        },
      ],
      context: {},
      isAIConversation: true,
      lastMessageAt: new Date(),
    });
    log('✅ Created sample chat', 'success');
  } else {
    log(`✅ ${chatCount} chats already exist`, 'success');
  }
  
  return { user, workspace };
}

async function verifyCounts() {
  log('\n📊 Verifying data counts...', 'info');
  
  const User = require('./models/User').default;
  const Workspace = require('./models/Workspace').default;
  const Note = require('./models/Note').default;
  const DocumentModel = require('./models/DocumentModel').default;
  const Chat = require('./models/Chat').default;
  
  const counts = {
    users: await User.countDocuments(),
    workspaces: await Workspace.countDocuments(),
    notes: await Note.countDocuments(),
    documents: await DocumentModel.countDocuments(),
    chats: await Chat.countDocuments(),
  };
  
  log('Current database counts:', 'info');
  Object.entries(counts).forEach(([key, value]) => {
    log(`  ${key}: ${value}`, value > 0 ? 'success' : 'warning');
  });
  
  return counts;
}

async function runMigration() {
  log('🚀 Starting Data Migration\n', 'info');
  log('=' .repeat(50), 'info');
  
  try {
    await connectDB();
    await checkCollections();
    await checkIndexes();
    
    const { user, workspace } = await createSampleData();
    const counts = await verifyCounts();
    
    log('\n' + '='.repeat(50), 'info');
    log('\n✅ Migration completed successfully!', 'success');
    
    if (counts.users > 0) {
      log('\n📝 Demo Credentials:', 'info');
      log('  Email: demo@example.com', 'info');
      log('  Password: demo123', 'info');
    }
    
    log('\n🎯 Next Steps:', 'info');
    log('  1. Start the server: npm run dev', 'info');
    log('  2. Run tests: node test-data-consistency.js', 'info');
    log('  3. Login with demo credentials', 'info');
    
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('\n👋 Database connection closed', 'info');
  }
}

// Run migration
runMigration();
