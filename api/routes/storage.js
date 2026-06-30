'use strict';

const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Suppress errors if Supabase keys are not set yet for dev mode
let supabaseAdmin = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (err) {
    console.error('[Supabase] Init failed:', err.message);
  }
}

// ----------------------------------------------------------------
// GET /api/v1/storage/signed-url
// ----------------------------------------------------------------
router.get('/signed-url', authenticate, async (req, res, next) => {
  try {
    const { path } = req.query;
    const orgId = req.user.org_id;

    if (!path) {
      return res.status(400).json({ error: 'path parameter is required' });
    }

    // Security: ensure path starts with user's org_id
    if (!path.startsWith(orgId)) {
      return res.status(403).json({ error: 'Access denied: Path outside tenant scope' });
    }

    if (!supabaseAdmin) {
      // Fallback in development mode when Supabase is not configured
      return res.json({ url: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.email)}` });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('employee-documents')
      .createSignedUrl(path, 300); // 5 minutes

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ url: data.signedUrl });
  } catch (err) {
    return next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/v1/storage/upload-profile
// ----------------------------------------------------------------
router.post('/upload-profile', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { emp_id } = req.body;
    const orgId = req.user.org_id;

    if (!emp_id) {
      return res.status(400).json({ error: 'emp_id is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const storagePath = `${orgId}/${emp_id}/profile_${Date.now()}.${fileExtension}`;

    if (!supabaseAdmin) {
      // Fallback in development: return a data URI representation of the file
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      return res.json({
        path: storagePath,
        url: dataUri,
        message: 'Dev Mode: File simulated via Data URI'
      });
    }

    // Upload to Supabase Bucket
    const { data, error } = await supabaseAdmin.storage
      .from('employee-documents')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get signed url for immediate preview
    const { data: signedData } = await supabaseAdmin.storage
      .from('employee-documents')
      .createSignedUrl(storagePath, 315360000); // 10 years for profile pic cache

    return res.json({
      path: storagePath,
      url: signedData ? signedData.signedUrl : null,
      message: 'Profile picture uploaded successfully'
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
