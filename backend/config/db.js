const { createClient } = require('@supabase/supabase-js');

let supabase;

const connectDB = async () => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ SUPABASE_URL or SUPABASE_ANON_KEY is not set in .env file');
      console.error('Please add your Supabase project URL and anon key to backend/.env');
      process.exit(1);
    }

    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    // Test the connection
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }

    console.log(`✅ Supabase Connected: ${process.env.SUPABASE_URL.split('.')[0]}`);
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);

    // Provide helpful error messages
    if (err.message.includes('Invalid API key')) {
      console.error('\n🔧 API Key Error:');
      console.error('1. Check your SUPABASE_ANON_KEY in the .env file');
      console.error('2. Make sure you\'re using the anon/public key, not the service role key');
      console.error('3. Verify the key is correct in your Supabase dashboard');
    } else if (err.message.includes('Invalid URL')) {
      console.error('\n🔧 URL Error:');
      console.error('1. Check your SUPABASE_URL in the .env file');
      console.error('2. Make sure the URL format is correct: https://your-project-id.supabase.co');
    } else if (err.message.includes('fetch')) {
      console.error('\n🔧 Network Error:');
      console.error('1. Check your internet connection');
      console.error('2. Verify your Supabase project is active');
    }

    console.error('\n💡 Tip: Get your credentials from Supabase Dashboard:');
    console.error('   Dashboard → Settings → API → Project URL & anon/public key');
    console.error('');

    process.exit(1);
  }
};

const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Call connectDB() first.');
  }
  return supabase;
};

module.exports = { connectDB, getSupabaseClient };


