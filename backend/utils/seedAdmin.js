const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const name = process.env.ADMIN_NAME || 'Campus Admin';
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seeding.');
      return;
    }

    // Use SERVICE ROLE KEY to bypass RLS for seeding
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Skipping admin seeding.');
      return;
    }

    // Create Supabase client with SERVICE ROLE KEY (bypasses RLS)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check if admin already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user using service role key (bypasses RLS)
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'admin',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    console.log(`✅ Admin user created with email: ${email}`);
  } catch (err) {
    console.error('❌ Error seeding admin user:', err.message);
    // Don't exit process, just log the error
  }
};

module.exports = seedAdmin;


