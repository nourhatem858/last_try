const fs = require('fs');

const files = [
  'app/api/notes/[id]/route.ts',
  'app/api/members/[id]/route.ts',
  'app/api/documents/[id]/route.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all occurrences of the old params pattern
    content = content.replace(
      /{ params }: { params: { id: string } }/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );
    
    // Add await params after each function declaration
    // Pattern: function name followed by try block
    content = content.replace(
      /(export async function (?:GET|PUT|PATCH|DELETE)\([^)]+\) \{\s+try \{\s+)/g,
      (match) => {
        // Check if it already has await params
        if (match.includes('await params')) {
          return match;
        }
        return match + '    const { id } = await params;\n    \n';
      }
    );
    
    // Replace params.id with id (but not in comments)
    content = content.replace(/(\s+)const (\w+) = params\.id;/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});

console.log('All files fixed!');
