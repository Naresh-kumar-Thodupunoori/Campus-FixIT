const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const Issue = require('../models/Issue');
const { createClient } = require('@supabase/supabase-js');

// Helper to get Supabase storage client
const getStorageClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SERVICE_ROLE_KEY not configured');
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// Generate signed URL from storage path
const generateSignedUrl = async (storagePath) => {
  if (!storagePath) return null;
  
  // If it's already a full URL (legacy data), return as-is
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  
  // Generate signed URL from path
  const supabase = getStorageClient();
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'campus-fixit-uploads';
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 3600); // 1 hour expiration
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
};

const buildImageUrl = (req, file) => {
  if (!file) return null;
  // Store the file path (filename) instead of full URL
  // This allows us to generate fresh signed URLs later
  return file.storagePath || file.filename;
};

exports.createIssue = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { title, description, category } = req.body;

  try {
    let imageUrl = undefined;

    if (req.file) {
      imageUrl = buildImageUrl(req, req.file);
    }
    
    const issue = await Issue.create({
      title,
      description,
      category,
      status: 'Open',
      imageUrl,
      createdBy: req.user.id,
    });

    // Fetch the issue with populated createdBy user data
    const populatedIssue = await Issue.findById(issue.id);
    
    if (!populatedIssue) {
      console.error('Failed to fetch populated issue');
      return res.status(500).json({ message: 'Failed to fetch created issue' });
    }
    
    const issueObject = populatedIssue.toObject();
    
    // Generate signed URL for image if path exists
    if (issueObject.imageUrl) {
      const signedUrl = await generateSignedUrl(issueObject.imageUrl);
      if (signedUrl) {
        issueObject.imageUrl = signedUrl;
      }
    }
    
    return res.status(201).json(issueObject);
  } catch (err) {
    console.error('Error creating issue:', err);
    return next(err);
  }
};

exports.getAllIssues = async (req, res, next) => {
  const { status, category } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;

  try {
    const issues = await Issue.find(query);
    
    // Generate signed URLs for all issues with images
    const issuesWithSignedUrls = await Promise.all(
      issues.map(async (issue) => {
        const issueObj = issue.toObject();
        if (issueObj.imageUrl) {
          const signedUrl = await generateSignedUrl(issueObj.imageUrl);
          if (signedUrl) {
            issueObj.imageUrl = signedUrl;
          }
        }
        return issueObj;
      })
    );
    
    return res.json(issuesWithSignedUrls);
  } catch (err) {
    return next(err);
  }
};

exports.getMyIssues = async (req, res, next) => {
  const { status, category } = req.query;
  const query = { createdBy: req.user.id };
  if (status) query.status = status;
  if (category) query.category = category;

  try {
    const issues = await Issue.find(query);
    
    // Generate signed URLs for all issues with images
    const issuesWithSignedUrls = await Promise.all(
      issues.map(async (issue) => {
        const issueObj = issue.toObject();
        if (issueObj.imageUrl) {
          const signedUrl = await generateSignedUrl(issueObj.imageUrl);
          if (signedUrl) {
            issueObj.imageUrl = signedUrl;
          }
        }
        return issueObj;
      })
    );
    
    return res.json(issuesWithSignedUrls);
  } catch (err) {
    return next(err);
  }
};

exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (req.user.role !== 'admin' && issue.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const issueObject = issue.toObject();
    
    // Generate signed URL for image if path exists
    if (issueObject.imageUrl) {
      const signedUrl = await generateSignedUrl(issueObject.imageUrl);
      if (signedUrl) {
        issueObject.imageUrl = signedUrl;
      }
    }
    
    return res.json(issueObject);
  } catch (err) {
    return next(err);
  }
};

exports.updateIssueStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;
    const updated = await issue.save();
    const issueObject = updated.toObject();
    
    // Generate signed URL for image if path exists
    if (issueObject.imageUrl) {
      const signedUrl = await generateSignedUrl(issueObject.imageUrl);
      if (signedUrl) {
        issueObject.imageUrl = signedUrl;
      }
    }
    
    return res.json(issueObject);
  } catch (err) {
    return next(err);
  }
};

exports.updateIssueRemarks = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { adminRemarks } = req.body;

  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.admin_remarks = adminRemarks;
    const updated = await issue.save();
    const issueObject = updated.toObject();
    
    // Generate signed URL for image if path exists
    if (issueObject.imageUrl) {
      const signedUrl = await generateSignedUrl(issueObject.imageUrl);
      if (signedUrl) {
        issueObject.imageUrl = signedUrl;
      }
    }
    
    return res.json(issueObject);
  } catch (err) {
    return next(err);
  }
};


