import bcrypt from 'bcrypt';
import { getSupabaseClient as getRepoSupabaseClient } from '../repositories/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const getSupabaseClient = () => getRepoSupabaseClient();

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_picture_url, phone, created_at, updated_at')
      .eq('id', req.user.id)
      .eq('role', 'admin')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { firstName, lastName, email, phone, profilePicture } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    // Check if email is already in use by another user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', req.user.id)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || null,
      profile_picture_url: profilePicture || null,
      updated_at: new Date().toISOString()
    };

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .eq('role', 'admin')
      .select('id, email, first_name, last_name, profile_picture_url, phone, created_at, updated_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update admin password
export const updateAdminPassword = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .eq('role', 'admin')
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
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .eq('role', 'admin');

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload admin profile picture
export const uploadAdminProfilePicture = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `admin/${req.user.id}/${uuidv4()}-${req.file.originalname}`;
    
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

    // Update admin's profile picture URL in database
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_picture_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .eq('role', 'admin')
      .select('id, email, first_name, last_name, profile_picture_url, phone, created_at, updated_at')
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Profile picture updated successfully',
      url: urlData.publicUrl,
      profile: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profile_picture_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
