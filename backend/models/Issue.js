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

class Issue {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.status = data.status;
    this.image_url = data.image_url;
    this.created_by = data.created_by;
    this.admin_remarks = data.admin_remarks;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.createdBy = data.createdBy; // populated user data
  }

  // Create a new issue (uses SERVICE_ROLE_KEY to bypass RLS)
  static async create(issueData) {
    // Use SERVICE_ROLE_KEY to bypass RLS for backend operations
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('issues')
      .insert([
        {
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          status: issueData.status || 'Open',
          image_url: issueData.imageUrl,
          created_by: issueData.createdBy,
          admin_remarks: issueData.adminRemarks || '',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return new Issue(data);
  }

  // Find issues with optional filters (uses SERVICE_ROLE_KEY to bypass RLS)
  static async find(query = {}) {
    // Use SERVICE_ROLE_KEY to bypass RLS for backend operations
    const supabase = getServiceRoleClient();

    let dbQuery = supabase
      .from('issues')
      .select(`
        *,
        createdBy:users!issues_created_by_fkey(id, name, email, role)
      `);

    if (query.createdBy) {
      dbQuery = dbQuery.eq('created_by', query.createdBy);
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(item => new Issue(item));
  }

  // Find issue by ID with populated user data (uses SERVICE_ROLE_KEY to bypass RLS)
  static async findById(id) {
    // Use SERVICE_ROLE_KEY to bypass RLS for backend operations
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        createdBy:users!issues_created_by_fkey(id, name, email, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(error.message);
    }

    return new Issue(data);
  }

  // Save/update issue (uses SERVICE_ROLE_KEY to bypass RLS)
  async save() {
    // Use SERVICE_ROLE_KEY to bypass RLS for backend operations
    const supabase = getServiceRoleClient();

    const updateData = {
      title: this.title,
      description: this.description,
      category: this.category,
      status: this.status,
      image_url: this.image_url,
      admin_remarks: this.admin_remarks,
    };

    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', this.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update the current instance
    Object.assign(this, data);
    return this;
  }

  // Convert to plain object
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      status: this.status,
      imageUrl: this.image_url,
      createdBy: this.createdBy,
      adminRemarks: this.admin_remarks,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Issue;


