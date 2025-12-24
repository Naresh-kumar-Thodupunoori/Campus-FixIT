const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: Supabase credentials not configured. File uploads will fail.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Use memory storage for multer (files will be uploaded to Supabase, not stored locally)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware to upload file to Supabase Storage
const uploadToSupabase = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  if (!supabase) {
    return next(new Error('Storage configuration error: Supabase client not initialized'));
  }

  try {
    // Generate unique filename
    const originalName = req.file.originalname || 'image';
    const ext = path.extname(originalName) || '.jpg';
    const baseName = path.basename(originalName, ext).replace(/\s+/g, '-').toLowerCase() || 'image';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${baseName}-${uniqueSuffix}${ext}`;

    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'campus-fixit-uploads';

    // Ensure we have a buffer
    if (!req.file.buffer) {
      console.error('No buffer in file object');
      return next(new Error('File buffer is missing'));
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype || 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return next(new Error(`Failed to upload file: ${error.message}`));
    }

    // Create signed URL for private bucket (expires in 1 hour)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600);

    if (signedError) {
      console.error('Failed to create signed URL:', signedError);
      return next(new Error(`Failed to sign URL: ${signedError.message}`));
    }

    // Store both filename (path) and signed URL
    req.file.filename = fileName;
    req.file.publicUrl = signedData.signedUrl;
    req.file.storagePath = fileName;

    next();
  } catch (err) {
    console.error('Error uploading to Supabase:', err);
    return next(new Error(`Failed to upload file: ${err.message}`));
  }
};

module.exports = { upload, uploadToSupabase };


