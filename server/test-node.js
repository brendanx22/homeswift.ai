console.log('Node.js is working!');
console.log('Current directory:', __dirname);
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '*** (hidden for security) ***' : 'not set');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL || 'not set');
