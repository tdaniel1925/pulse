/**
 * Database Migration Script
 * Executes the initial schema migration on Supabase
 *
 * Usage: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration file loaded:', migrationPath);
  console.log('📊 Size:', migrationSQL.length, 'characters\n');

  // Split SQL into individual statements
  // Note: This is a simplified splitter - production should use a proper SQL parser
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Extract first line for logging (usually contains table/command info)
    const firstLine = statement.split('\n')[0].substring(0, 60);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct execution via REST API as fallback
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }

      successCount++;
      console.log(`✅ [${i + 1}/${statements.length}] ${firstLine}...`);

    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/${statements.length}] ${firstLine}...`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('═'.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify tables in Supabase dashboard');
    console.log('2. Install dependencies: npm install');
    console.log('3. Configure API keys in .env.local');
    console.log('4. Start dev server: npm run dev');
  } else {
    console.log('\n⚠️  Migration completed with errors.');
    console.log('Please check the errors above and run migration manually in Supabase SQL Editor if needed.');
  }
}

runMigration().catch(console.error);
