const fs = require('fs');

const fixes = [
  {
    file: 'app/api/notes/[id]/route.ts',
    replacements: [
      {
        from: /try \{\s+const { id } = await params;\s+\n\s+\/\/ Get token/g,
        to: 'try {\n    const { id: noteId } = await params;\n    \n    // Get token'
      }
    ]
  },
  {
    file: 'app/api/members/[id]/route.ts',
    replacements: [
      {
        from: /try \{\s+const { id } = await params;\s+\n\s+\/\/ Get token/g,
        to: 'try {\n    const { id: memberId } = await params;\n    \n    // Get token'
      }
    ]
  },
  {
    file: 'app/api/documents/[id]/route.ts',
    replacements: [
      {
        from: /try \{\s+const { id } = await params;\s+\n\s+\/\/ Get token/g,
        to: 'try {\n    const { id: documentId } = await params;\n    \n    // Get token'
      }
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});

console.log('All files fixed!');
