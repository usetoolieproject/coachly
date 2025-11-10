import bcrypt from 'bcrypt';
import { getSupabaseClient as getRepoSupabaseClient } from '../repositories/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const getSupabaseClient = () => getRepoSupabaseClient();

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_picture_url, phone, location, bio, created_at, role')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Include instructor info if user is an instructor
    let instructorData = null;
    if (user.role === 'instructor') {
      const { data: instructor } = await supabase
        .from('instructors')
        .select('business_name, subdomain')
        .eq('user_id', user.id)
        .single();
      instructorData = instructor;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      createdAt: user.created_at,
      role: user.role,
      instructor: instructorData
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { firstName, lastName, phone, location, bio, email, password, company } = req.body;

    const updateData = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (email) updateData.email = email;

    // Handle password change
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      updateData.password_hash = passwordHash;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, profile_picture_url, phone, location, bio, created_at, role')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Update instructor business_name if company is provided and user is instructor
    if (company && req.user.role === 'instructor') {
      await supabase
        .from('instructors')
        .update({ business_name: company })
        .eq('user_id', req.user.id);
    }

    // Get updated instructor data if applicable
    let instructorData = null;
    if (user.role === 'instructor') {
      const { data: instructor } = await supabase
        .from('instructors')
        .select('business_name, subdomain')
        .eq('user_id', req.user.id)
        .single();
      instructorData = instructor;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePictureUrl: user.profile_picture_url,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        createdAt: user.created_at,
        role: user.role,
        instructor: instructorData
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${req.user.id}/${uuidv4()}-${req.file.originalname}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    // Update user's profile picture URL in database
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ profile_picture_url: urlData.publicUrl })
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, profile_picture_url, phone, location, bio, created_at, role')
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Get instructor data if applicable
    let instructorData = null;
    if (user.role === 'instructor') {
      const { data: instructor } = await supabase
        .from('instructors')
        .select('business_name, subdomain')
        .eq('user_id', req.user.id)
        .single();
      instructorData = instructor;
    }

    res.json({
      message: 'Profile picture updated successfully',
      profilePictureUrl: urlData.publicUrl,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePictureUrl: user.profile_picture_url,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        createdAt: user.created_at,
        role: user.role,
        instructor: instructorData
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change email
export const changeEmail = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ error: 'New email and password are required' });
    }

    // Check if new email is already in use
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', newEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Get current user and verify password
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Update email
    const { error: updateError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: 'Email changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update instructor subdomain
export const updateInstructorSubdomain = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can change subdomain' });
    }

    let { subdomain } = req.body || {};
    if (typeof subdomain !== 'string') {
      return res.status(400).json({ error: 'subdomain is required' });
    }
    subdomain = subdomain.trim().toLowerCase();

    // Validation: 3-30, alnum or dash, no leading/trailing dash
    const valid = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(subdomain);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid subdomain format' });
    }
    const reserved = new Set(['www', 'api', 'admin', 'static', 'assets']);
    if (reserved.has(subdomain)) {
      return res.status(400).json({ error: 'This subdomain is reserved' });
    }

    // Get current instructor
    const { data: instructor, error: instErr } = await supabase
      .from('instructors')
      .select('id, subdomain')
      .eq('user_id', req.user.id)
      .single();

    if (instErr || !instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    if (instructor.subdomain === subdomain) {
      return res.json({ success: true, subdomain });
    }

    // Ensure uniqueness
    const { data: existing } = await supabase
      .from('instructors')
      .select('id')
      .eq('subdomain', subdomain)
      .maybeSingle();
    if (existing && existing.id && existing.id !== instructor.id) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    // Update
    const { error: updErr } = await supabase
      .from('instructors')
      .update({ subdomain })
      .eq('id', instructor.id);
    if (updErr) {
      return res.status(400).json({ error: updErr.message || 'Failed to update subdomain' });
    }

    return res.json({ success: true, subdomain });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get sidebar preferences
export const getSidebarPreferences = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('sidebar_mode')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ sidebarMode: data.sidebar_mode || 'expanded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update sidebar preferences
export const updateSidebarPreferences = async (req, res) => {
  try {
    const { sidebarMode } = req.body;

    if (!sidebarMode || !['expanded', 'collapsed', 'hover'].includes(sidebarMode)) {
      return res.status(400).json({ error: 'Invalid sidebar mode' });
    }

    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('users')
      .update({ sidebar_mode: sidebarMode })
      .eq('id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, sidebarMode });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};