/**
 * PDF Parser Wrapper
 * Handles pdf-parse v1.x CommonJS module correctly
 * pdf-parse v1.x exports a function directly
 */

const pdfParse = require('pdf-parse');

// pdf-parse v1.x exports the function directly
// Just re-export it
module.exports = pdfParse;
