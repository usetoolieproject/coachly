import { supabase } from '../repositories/supabaseClient.js';

// Save website configuration
const saveWebsiteConfiguration = async (req, res) => {
  try {
    const { themeId, addedSections, sectionData, selectedPageType, isMobileView, isPublished } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!themeId || !addedSections || !sectionData) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // First, verify the user exists in the database
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userCheckError || !userExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found in database',
        error: userCheckError?.message || 'User does not exist'
      });
    }

    // Use the user ID directly - the foreign key constraint now points to public.users

    // Check if user already has a website configuration for this theme
    const { data: existingConfig, error: fetchError } = await supabase
      .from('website_configurations')
      .select('id, is_published')
      .eq('user_id', userId)
      .eq('theme_id', themeId)
      .single();
    
    const websiteConfig = {
      user_id: userId,
      theme_id: themeId,
      added_sections: addedSections,
      section_data: sectionData,
      selected_page_type: selectedPageType,
      is_mobile_view: isMobileView,
      is_published: isPublished === true ? true : false, // Explicitly check for true only
      updated_at: new Date().toISOString()
    };
    
    // If publishing this theme:
    if (isPublished) {
      
      // 1. Unpublish all other themes for this user
      const { error: unpublishError } = await supabase
        .from('website_configurations')
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('theme_id', themeId);

    } else {
      
    
      if (existingConfig && existingConfig.is_published) {
     
      }
    }

    let result;
    
    // CRITICAL: Don't overwrite published config with draft!
    if (existingConfig && existingConfig.is_published && !isPublished) {
      // Return success without updating the database
      // This preserves the published version
      res.json({
        success: true,
        message: 'Draft saved (preserved published version)',
        websiteId: existingConfig.id,
        preservedPublished: true
      });
      return;
    }
    
    if (existingConfig) {
      // Update existing configuration for this theme
      const { data, error } = await supabase
        .from('website_configurations')
        .update(websiteConfig)
        .eq('user_id', userId)
        .eq('theme_id', themeId)
        .select()
        .single();

      if (error) throw error;
      result = data;
      
    } else {
      // Create new configuration for this theme
      const { data, error } = await supabase
        .from('website_configurations')
        .insert([websiteConfig])
        .select()
        .single();

      if (error) throw error;
      result = data;
      
    }

    res.json({
      success: true,
      message: 'Website configuration saved successfully',
      websiteId: result.id
    });

  } catch (error) {
    
    // Check if it's a foreign key constraint violation
    if (error.message && error.message.includes('violates foreign key constraint')) {
      return res.status(400).json({
        success: false,
        message: 'Database constraint error: User ID does not exist in auth system',
        error: 'The user ID does not have a corresponding record in the authentication system. This is likely a database schema issue where the foreign key constraint references auth.users but the application uses public.users.',
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to save website configuration',
      error: error.message
    });
  }
};

// Load website configuration
const loadWebsiteConfiguration = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { themeId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let query = supabase
      .from('website_configurations')
      .select('*')
      .eq('user_id', userId);

    // If themeId is provided, load that specific theme
    if (themeId) {
      query = query.eq('theme_id', themeId);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        // No configuration found
        return res.status(404).json({ success: false, message: 'No website configuration found' });
      }
      throw error;
    }

    // If themeId was provided, use single() result
    // Otherwise return all themes (for future UI to show theme list)
    let config;
    if (themeId && data && data.length > 0) {
      config = {
        themeId: data[0].theme_id,
        addedSections: data[0].added_sections,
        sectionData: data[0].section_data,
        selectedPageType: data[0].selected_page_type,
        isMobileView: data[0].is_mobile_view,
        isPublished: data[0].is_published || false
      };
    } else if (themeId) {
      // Theme specified but not found
      return res.status(404).json({ success: false, message: 'No website configuration found for this theme' });
    } else {
      // No themeId - return all themes (for theme selector UI)
      config = data.map(item => ({
        themeId: item.theme_id,
        addedSections: item.added_sections,
        sectionData: item.section_data,
        selectedPageType: item.selected_page_type,
        isMobileView: item.is_mobile_view,
        isPublished: item.is_published || false
      }));
    }

    res.json(config);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load website configuration',
      error: error.message
    });
  }
};

// Delete website configuration
const deleteWebsiteConfiguration = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { error } = await supabase
      .from('website_configurations')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Website configuration deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete website configuration',
      error: error.message
    });
  }
};

const getPublicWebsiteConfiguration = async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    if (!subdomain) {
      return res.status(400).json({ success: false, message: 'Subdomain is required' });
    }

    // First, find the instructor by subdomain
    const { data: instructor, error: instructorError } = await supabase
      .from('instructors')
      .select('user_id, id')
      .eq('subdomain', subdomain)
      .single();

    if (instructorError || !instructor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Instructor not found for this subdomain' 
      });
    }

    // Store instructor ID for later use
    const instructorId = instructor.id;

    // Get the website configuration for this instructor
    
    const { data: websiteConfig, error: configError } = await supabase
      .from('website_configurations')
      .select('*')
      .eq('user_id', instructor.user_id)
      .eq('is_published', true) // Only return published websites
      .single();

    if (configError || !websiteConfig) {
      return res.status(404).json({ 
        success: false, 
        message: 'No published website found for this subdomain' 
      });
    }

    // Get community data from about page
    const { data: aboutPage } = await supabase
      .from('instructor_about_pages')
      .select('instructor_id, subdomain')
      .eq('subdomain', subdomain)
      .eq('is_published', true)
      .single();

    // Transform the data to match the frontend format
    const config = {
      themeId: websiteConfig.theme_id,
      addedSections: websiteConfig.added_sections,
      sectionData: websiteConfig.section_data,
      selectedPageType: websiteConfig.selected_page_type,
      isMobileView: websiteConfig.is_mobile_view,
      isPublished: websiteConfig.is_published,
      instructorId: instructorId,
      communityId: aboutPage?.instructor_id || instructorId // Use instructor_id as communityId
    };

    res.json(config);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load public website configuration',
      error: error.message
    });
  }
};

export {
  saveWebsiteConfiguration,
  loadWebsiteConfiguration,
  deleteWebsiteConfiguration,
  getPublicWebsiteConfiguration
};
