const bcrypt = require('bcryptjs');
const { getSupabaseClient } = require('../config/db');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase client with SERVICE_ROLE_KEY for operations that need to bypass RLS
const getServiceRoleClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SERVICE_ROLE_KEY not configured');
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user (uses SERVICE_ROLE_KEY to bypass RLS for registration)
  static async create(userData) {
    // Use SERVICE_ROLE_KEY to bypass RLS for user creation
    const supabase = getServiceRoleClient();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          role: userData.role || 'student',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return new User(data);
  }

  // Find user by email (uses SERVICE_ROLE_KEY to bypass RLS for login)
  static async findOne(query) {
    // Use SERVICE_ROLE_KEY to bypass RLS for login/authentication operations
    const supabase = getServiceRoleClient();

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, password, role, created_at, updated_at')
        .eq('email', query.email.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        console.error('User.findOne error:', error);
        throw new Error(error.message);
      }

      return new User(data);
    } catch (err) {
      console.error('Error in User.findOne:', err);
      throw err;
    }
  }

  // Find user by ID (uses SERVICE_ROLE_KEY to bypass RLS)
  static async findById(id) {
    // Use SERVICE_ROLE_KEY to bypass RLS for backend operations
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(error.message);
    }

    return new User(data);
  }

  // Compare password method
  async comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  }

  // Convert to plain object (for JWT token generation)
  toObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;


