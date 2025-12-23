#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Building backend...\n');

const build = spawn('npm', ['run', 'build'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

build.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.error('\n❌ Build failed!');
    process.exit(1);
  }
  
  console.log('\n✅ Build completed successfully\n');
  console.log('⏳ Waiting 3 seconds before resetting database...\n');
  
  setTimeout(() => {
    console.log('🔄 Resetting & Re-seeding Database...\n');
    
    const reset = spawn('npm', ['run', 'db:reset'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });
    
    reset.on('close', (resetCode) => {
      if (resetCode !== 0) {
        console.error('\n❌ Database reset FAILED!');
        process.exit(1);
      }
      
      console.log('\n✅ Database reset SUCCESSFUL!\n');
      process.exit(0);
    });
  }, 3000);
});


