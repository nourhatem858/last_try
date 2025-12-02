/**
 * Create a real test PDF using a simple approach
 * We'll download a sample PDF or create text content
 */

const fs = require('fs');
const path = require('path');

console.log('📄 Creating test content files...\n');

// Create a comprehensive TXT file
const txtPath = path.join(process.cwd(), 'public', 'uploads', 'sample-document.txt');
const txtContent = `Sample Document for Testing
============================

Introduction
------------
This is a comprehensive test document for the document management system.
It contains multiple paragraphs and sections to test text extraction and AI summarization.

Key Features
------------
1. Document Upload: Users can upload PDF, DOCX, and TXT files
2. Text Extraction: Automatic extraction of text from uploaded documents
3. AI Summarization: Generate intelligent summaries using AI
4. Search Functionality: Full-text search across all documents
5. Workspace Organization: Organize documents by workspace

Technical Details
-----------------
The system uses the following technologies:
- Next.js 16 for the frontend and API routes
- MongoDB for data storage
- pdf-parse for PDF text extraction
- mammoth for DOCX text extraction
- OpenAI for AI-powered features

Use Cases
---------
This document management system is perfect for:
* Teams collaborating on projects
* Researchers organizing papers
* Students managing study materials
* Businesses handling contracts and reports

Conclusion
----------
This test document demonstrates the text extraction capabilities of the system.
It should be successfully uploaded, processed, and made searchable.

Total word count: approximately 150 words
`;

fs.writeFileSync(txtPath, txtContent);
console.log('✅ Created sample-document.txt');
console.log(`   Size: ${txtContent.length} bytes`);
console.log(`   Location: ${txtPath}\n`);

// Create a markdown file
const mdPath = path.join(process.cwd(), 'public', 'uploads', 'sample-readme.txt');
const mdContent = `# Project README

## Overview
This is a sample README file for testing document upload.

## Features
- Easy to use interface
- Fast document processing
- AI-powered insights

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Usage
1. Upload your documents
2. View and organize them
3. Get AI summaries
4. Search across all content

## License
MIT License
`;

fs.writeFileSync(mdPath, mdContent);
console.log('✅ Created sample-readme.txt');
console.log(`   Size: ${mdContent.length} bytes`);
console.log(`   Location: ${mdPath}\n`);

console.log('📊 Summary');
console.log('='.repeat(60));
console.log('✅ Test files created successfully');
console.log('\n🎯 Next steps:');
console.log('   1. Start the dev server: npm run dev');
console.log('   2. Login to your account');
console.log('   3. Go to /documents');
console.log('   4. Upload sample-document.txt');
console.log('   5. View the uploaded document');
console.log('\n💡 The text should be extracted and displayed correctly!');
