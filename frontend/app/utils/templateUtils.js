

// Function to generate smart metadata based on template name analysis
const generateTemplateMetadata = (templateName, category) => {
  const cleanName = templateName.replace('Template', '');
  
  let description = '';
  let tags = [];
  let industry = [];
  let isPremium = false;
  let difficulty = 'Beginner';
  let features = [];

  // Name analysis for smart metadata generation
  const nameAnalysis = {
    // Modern indicators
    modern: cleanName.toLowerCase().includes('modern'),
    minimal: cleanName.toLowerCase().includes('minimal'),
    clean: cleanName.toLowerCase().includes('clean'),
    
    // Professional indicators
    professional: cleanName.toLowerCase().includes('professional'),
    executive: cleanName.toLowerCase().includes('executive'),
    corporate: cleanName.toLowerCase().includes('corporate'),
    business: cleanName.toLowerCase().includes('business'),
    
    // Creative indicators
    creative: cleanName.toLowerCase().includes('creative'),
    colorful: cleanName.toLowerCase().includes('colorful'),
    gradient: cleanName.toLowerCase().includes('gradient'),
    
    // Tech indicators
    tech: cleanName.toLowerCase().includes('tech'),
    innovator: cleanName.toLowerCase().includes('innovator'),
    dark: cleanName.toLowerCase().includes('dark'),
    
    // Special features
    sidebar: cleanName.toLowerCase().includes('sidebar'),
    timeline: cleanName.toLowerCase().includes('timeline'),
    avatar: cleanName.toLowerCase().includes('avatar'),
    bordered: cleanName.toLowerCase().includes('border'),
    academic: cleanName.toLowerCase().includes('academic'),
  };

  // Generate description based on analysis
  if (nameAnalysis.academic) {
    description = 'Professional academic layout perfect for researchers, professors, and educational positions';
    tags = ['Academic', 'Professional', 'Traditional'];
    industry = ['Education', 'Research', 'Academia'];
    features = ['Clean Layout', 'Professional', 'ATS-Friendly'];
  } else if (nameAnalysis.executive) {
    description = 'Premium executive design for senior leadership and C-level positions';
    tags = ['Executive', 'Premium', 'Leadership'];
    industry = ['Executive', 'Management', 'Corporate'];
    isPremium = true;
    difficulty = 'Advanced';
    features = ['Executive', 'Premium', 'Leadership'];
  } else if (nameAnalysis.tech || nameAnalysis.innovator) {
    description = 'Cutting-edge design for technology professionals and innovators';
    tags = ['Tech', 'Innovation', 'Modern'];
    industry = ['Technology', 'Software', 'IT'];
    isPremium = true;
    difficulty = 'Advanced';
    features = ['Tech Focus', 'Innovation', 'Modern'];
  } else if (nameAnalysis.creative || nameAnalysis.colorful) {
    description = 'Vibrant creative design perfect for designers and creative professionals';
    tags = ['Creative', 'Colorful', 'Artistic'];
    industry = ['Design', 'Marketing', 'Media'];
    isPremium = true;
    difficulty = 'Intermediate';
    features = ['Creative', 'Colorful', 'Artistic'];
  } else if (nameAnalysis.minimal || nameAnalysis.clean) {
    description = 'Clean minimal design with perfect spacing for modern professionals';
    tags = ['Minimal', 'Clean', 'Modern'];
    industry = ['Technology', 'Design', 'Consulting'];
    features = ['Minimal Design', 'Clean', 'Modern'];
  } else if (nameAnalysis.corporate || nameAnalysis.business) {
    description = 'Professional corporate design suitable for business environments';
    tags = ['Corporate', 'Business', 'Professional'];
    industry = ['Corporate', 'Finance', 'Business'];
    features = ['Corporate', 'Professional', 'Business'];
  } else if (nameAnalysis.gradient) {
    description = 'Modern gradient design with beautiful color transitions';
    tags = ['Gradient', 'Modern', 'Colorful'];
    industry = ['Design', 'Technology', 'Marketing'];
    difficulty = 'Intermediate';
    features = ['Gradient', 'Modern', 'Colorful'];
  } else if (nameAnalysis.dark) {
    description = 'Sophisticated dark theme for contemporary professionals';
    tags = ['Dark', 'Sophisticated', 'Modern'];
    industry = ['Technology', 'Design', 'Creative'];
    isPremium = true;
    difficulty = 'Intermediate';
    features = ['Dark Theme', 'Sophisticated', 'Modern'];
  } else {
    // Default professional template
    description = 'Professional design suitable for various industries and career levels';
    tags = ['Professional', 'Versatile', 'Clean'];
    industry = ['Business', 'General', 'Professional'];
    features = ['Professional', 'Clean', 'Versatile'];
  }

  // Add special features based on name
  if (nameAnalysis.sidebar) {
    features.push('Sidebar Layout');
    tags.push('Sidebar');
  }
  if (nameAnalysis.timeline) {
    features.push('Timeline Layout');
    tags.push('Timeline');
    difficulty = 'Advanced';
  }
  if (nameAnalysis.avatar) {
    features.push('Avatar Support');
    tags.push('Avatar');
    isPremium = true;
  }
  if (nameAnalysis.bordered) {
    features.push('Elegant Borders');
    tags.push('Bordered');
  }

  // Generate readable name
  const readableName = cleanName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\s+/g, ' ');

  // Generate ID
  const id = cleanName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  

  return {
    id,
    name: readableName,
    description,
    category: nameAnalysis.academic ? 'Academic' : 
              nameAnalysis.executive ? 'Executive' :
              nameAnalysis.creative ? 'Creative' :
              nameAnalysis.tech ? 'Tech' :
              nameAnalysis.corporate ? 'Corporate' :
              nameAnalysis.minimal ? 'Minimal' :
              'Professional',
    difficulty,
    features: [...new Set(features)], // Remove duplicates
    component: templateName,
    previewImage: `/thumbnails/${category.toLowerCase()}/${cleanName}.png`,
    bestFor: industry,
    isPremium,
    tags: [...new Set(tags)], // Remove duplicates
    industry: [...new Set(industry)] // Remove duplicates
  };
};

// Function to dynamically discover template files
const discoverTemplateFiles = async () => {
  const templates = [];
  
  try {
    // Client-side discovery using predefined list with dynamic import verification
    const classicTemplates = [
      'TemplateCleanMinimal',
      'TemplateColorfulCardOverlay',
      'TemplateContemporaryEdge',
      'TemplateCreativePortfolio',
      'TemplateDarkGradientCentered',
      'TemplateEmeraldGradient',
      'TemplateGradientCardStyle',
      'TemplateGradientHeader',
      'TemplateGreenAccentBorder',
      'TemplateIndigoBlueGradient',
      'TemplateModernBusiness',
      'TemplateMultiColorGradient',
      'TemplateProfessionalBlue',
      'TemplateSidebarDark',
      'TemplateTimelineLayout',
      'TemplateUltraModernMinimalist'
    ];    const modernTemplates = [
      'TemplateModernCorporate',
      'TemplateModernCreative',
      'TemplateModernMinimal',
      'TemplateModernProfessional',
      'TemplateModernTech',
      'TemplateSoftwareEngineer',
      'TemplateDataScientist',
      'TemplateFinanceManager',
      'TemplateMarketingSpecialist',
      'TemplateNursingProfessional',
      'TemplateGraphicDesigner',
      'TemplateTeacher',
      'TemplateLegalProfessional',
      'TemplateExecutiveLeader',
      'TemplateSalesManager',
      'TemplateConsultingProfessional'
    ];

    // Process Classic templates
    for (const templateName of classicTemplates) {
      try {
        // Try to dynamically import to verify existence
        await import(`../app/resumes/templates/Classic/${templateName}.jsx`);
        templates.push({
          name: templateName,
          category: 'Classic',
          path: `/Classic/${templateName}.jsx`
        });
      } catch (error) {
        console.warn(`Template ${templateName} not found in Classic category`);
      }
    }

    // Process Modern templates
    for (const templateName of modernTemplates) {
      try {
        // Try to dynamically import to verify existence
        await import(`../app/resumes/templates/Modern/${templateName}.jsx`);
        templates.push({
          name: templateName,
          category: 'Modern',
          path: `/Modern/${templateName}.jsx`
        });
      } catch (error) {
        console.warn(`Template ${templateName} not found in Modern category`);
      }
    }

    return templates;
  } catch (error) {
    console.error('Error discovering template files:', error);
    return [];
  }
};

// Main function to get all templates dynamically
export const getAllTemplates = async () => {
  try {
    const templateFiles = await discoverTemplateFiles();
    const templates = [];

    for (const templateFile of templateFiles) {
      const metadata = generateTemplateMetadata(templateFile.name, templateFile.category);
      templates.push({
        ...metadata,
        categoryType: templateFile.category
      });
    }

    return templates;
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

// Get templates by category
export const getTemplatesByCategory = async (category) => {
  const allTemplates = await getAllTemplates();
  return allTemplates.filter(template => template.categoryType === category);
};

// Get template by ID
export const getTemplateById = async (id) => {
  const allTemplates = await getAllTemplates();
  return allTemplates.find(template => template.id === id);
};

// Search templates
export const searchTemplates = async (query) => {
  const allTemplates = await getAllTemplates();
  const lowercaseQuery = query.toLowerCase();
  
  return allTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    template.features.some(feature => feature.toLowerCase().includes(lowercaseQuery)) ||
    template.bestFor.some(use => use.toLowerCase().includes(lowercaseQuery)) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Get templates by difficulty
export const getTemplatesByDifficulty = async (difficulty) => {
  const allTemplates = await getAllTemplates();
  return allTemplates.filter(template => template.difficulty === difficulty);
};

// Legacy function for backward compatibility
export const getTemplateMetadata = async () => {
  const allTemplates = await getAllTemplates();
  const grouped = {
    Classic: [],
    Modern: []
  };

  allTemplates.forEach(template => {
    if (template.categoryType === 'Classic') {
      grouped.Classic.push(template);
    } else if (template.categoryType === 'Modern') {
      grouped.Modern.push(template);
    }
  });

  return grouped;
};
