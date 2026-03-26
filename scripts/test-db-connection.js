/**
 * Database Connection Test
 * Verifies Supabase connection and tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const tablesToCheck = [
    'clients',
    'landing_pages',
    'social_posts',
    'podcast_episodes',
    'youtube_content',
    'prompt_templates',
    'provision_log',
    'generation_log',
  ];

  console.log('📊 Checking database tables...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${table}: Table exists (${count || 0} rows)`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ ${table}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Successful: ${successCount}/${tablesToCheck.length}`);
  console.log(`❌ Failed: ${errorCount}/${tablesToCheck.length}`);
  console.log('═'.repeat(50));

  if (errorCount === 0) {
    console.log('\n🎉 Database connection test PASSED!');
    console.log('\nNext steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Test authentication flow');
    return true;
  } else {
    console.log('\n⚠️  Some tables are missing or inaccessible.');
    console.log('Please check the migration ran successfully.');
    return false;
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('\n❌ Connection test failed:', err.message);
    process.exit(1);
  });
