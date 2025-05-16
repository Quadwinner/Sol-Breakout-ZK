/**
 * Fixed IDL for the cPOP Program
 * This file contains a manually corrected IDL that properly includes
 * account type definitions to avoid the "size" error in Anchor's client code.
 */

let idl;
try {
  // Try to import from the original location first
  idl = require('../../cpop-program/target/idl/cpop_program.json');
} catch (error) {
  // Fallback to the local copy for deployments (Netlify/Vercel)
  console.log("Using fallback IDL location in fixed-idl.ts");
  idl = require('./idl/cpop_program.json');
}

export default idl; 