// Template exports for cover letters (organized like resume templates)

// Modern Templates (from Modern/ directory - matches resume Modern structure)
export { default as TemplateModernCorporate } from './Modern/TemplateModernCorporate';
export { default as TemplateModernCreative } from './Modern/TemplateModernCreative';
export { default as TemplateModernMinimal } from './Modern/TemplateModernMinimal';
export { default as TemplateModernProfessional } from './Modern/TemplateModernProfessional';
export { default as TemplateModernTech } from './Modern/TemplateModernTech';

// Modern Industry-Specific Templates (from Modern/ directory)
export { default as TemplateSoftwareEngineer } from './Modern/TemplateSoftwareEngineer';
export { default as TemplateDataScientist } from './Modern/TemplateDataScientist';
export { default as TemplateFinanceManager } from './Modern/TemplateFinanceManager';
export { default as TemplateMarketingSpecialist } from './Modern/TemplateMarketingSpecialist';
export { default as TemplateNursingProfessional } from './Modern/TemplateNursingProfessional';
export { default as TemplateGraphicDesigner } from './Modern/TemplateGraphicDesigner';
export { default as TemplateTeacher } from './Modern/TemplateTeacher';
export { default as TemplateLegalProfessional } from './Modern/TemplateLegalProfessional';
export { default as TemplateExecutiveLeader } from './Modern/TemplateExecutiveLeader';
export { default as TemplateSalesManager } from './Modern/TemplateSalesManager';
export { default as TemplateConsultingProfessional } from './Modern/TemplateConsultingProfessional';
export { default as TemplateHRProfessional } from './Modern/TemplateHRProfessional';

// Classic Templates (from Classic/ directory - matches resume Classic structure)
export { default as MinimalTemplate } from './Classic/MinimalTemplate';
export { default as ProfessionalTemplate } from './Classic/ProfessionalTemplate';
export { default as ModernTemplate } from './Classic/ModernTemplate';
export { default as CreativeTemplate } from './Classic/CreativeTemplate';
export { default as MarketingTemplate } from './Classic/MarketingTemplate';
export { default as FinanceTemplate } from './Classic/FinanceTemplate';
export { default as ExecutiveTemplate } from './Classic/ExecutiveTemplate';
export { default as AcademicTemplate } from './Classic/AcademicTemplate';
export { default as SalesTemplate } from './Classic/SalesTemplate';
export { default as LegalTemplate } from './Classic/LegalTemplate';
export { default as DataScienceTemplate } from './Classic/DataScienceTemplate';
export { default as DevOpsTemplate } from './Classic/DevOpsTemplate';
export { default as NursingTemplate } from './Classic/NursingTemplate';
export { default as ConsultingTemplate } from './Classic/ConsultingTemplate';
export { default as TechTemplate } from './Classic/TechTemplate';
export { default as StartupTemplate } from './Classic/StartupTemplate';
export { default as RemoteTemplate } from './Classic/RemoteTemplate';
export { default as ProjectManagerTemplate } from './Classic/ProjectManagerTemplate';
export { default as EducationTemplate } from './Classic/EducationTemplate';

// Template mapping for easy access (matches resume template structure)
export const templateComponents = {
  // Modern Style Templates
  'modern-corporate': 'TemplateModernCorporate',
  'modern-creative': 'TemplateModernCreative',
  'modern-minimal': 'TemplateModernMinimal',
  'modern-professional': 'TemplateModernProfessional',
  'modern-tech': 'TemplateModernTech',
  
  // Industry-Specific Templates
  'software-engineer': 'TemplateSoftwareEngineer',
  'data-scientist': 'TemplateDataScientist',
  'finance-manager': 'TemplateFinanceManager',
  'marketing-specialist': 'TemplateMarketingSpecialist',
  'nursing-professional': 'TemplateNursingProfessional',
  'graphic-designer': 'TemplateGraphicDesigner',
  'teacher': 'TemplateTeacher',
  'legal-professional': 'TemplateLegalProfessional',
  'executive-leader': 'TemplateExecutiveLeader',
  'sales-manager': 'TemplateSalesManager',
  'consulting-professional': 'TemplateConsultingProfessional',
  'hr-professional': 'TemplateHRProfessional',
  
  // Legacy Mapping (for backward compatibility)
  1: 'ProfessionalTemplate', // Classic Professional
  2: 'ModernTemplate',       // Modern Minimal
  3: 'CreativeTemplate',     // Creative Impact
  4: 'ExecutiveTemplate',    // Executive Leadership
  5: 'TechTemplate',         // Tech Innovator
  6: 'SalesTemplate',        // Sales Champion
  7: 'NursingTemplate',      // Healthcare Professional
  8: 'AcademicTemplate',     // Academic Scholar
  9: 'StartupTemplate',      // Startup Dynamo
  10: 'ConsultingTemplate',   // Consulting Expert
  11: 'RemoteTemplate',       // Remote Worker Pro
  12: 'ProfessionalTemplate', // Non-Profit Mission
  13: 'MarketingTemplate',    // Marketing Maverick
  14: 'FinanceTemplate',      // Financial Analyst Pro
  15: 'ProfessionalTemplate', // Customer Success Hero
  16: 'DataScienceTemplate',  // Data Science Explorer
  17: 'ProfessionalTemplate', // HR People Champion
  18: 'LegalTemplate',        // Legal Professional
  19: 'ProjectManagerTemplate', // Project Manager Elite
  20: 'EducationTemplate'     // Education Innovator
};

// Template metadata for better organization (matches resume template structure)
export const templateMetadata = {
  // Modern Style Templates
  'modern-corporate': {
    name: 'Modern Corporate',
    description: 'Professional corporate design for business environments',
    component: 'TemplateModernCorporate',
    category: 'Modern',
    difficulty: 'Beginner',
    features: ['Corporate Design', 'Professional Layout', 'Business Focus'],
    industry: ['Corporate', 'Business', 'Finance']
  },
  'modern-creative': {
    name: 'Modern Creative',
    description: 'Vibrant creative design with gradient elements',
    component: 'TemplateModernCreative',
    category: 'Creative',
    difficulty: 'Intermediate',
    features: ['Gradient Design', 'Creative Layout', 'Visual Impact'],
    industry: ['Design', 'Creative', 'Marketing']
  },
  'modern-minimal': {
    name: 'Modern Minimal',
    description: 'Ultra-clean minimal design with perfect spacing',
    component: 'TemplateModernMinimal',
    category: 'Minimal',
    difficulty: 'Beginner',
    features: ['Minimal Design', 'Clean Layout', 'Simple'],
    industry: ['Technology', 'Design', 'Consulting']
  },
  'modern-professional': {
    name: 'Modern Professional',
    description: 'Contemporary professional format with modern touches',
    component: 'TemplateModernProfessional',
    category: 'Professional',
    difficulty: 'Beginner',
    features: ['Professional', 'Modern', 'Clean'],
    industry: ['Business', 'Professional', 'Corporate']
  },
  'modern-tech': {
    name: 'Modern Tech',
    description: 'Technology-focused design with gradient elements',
    component: 'TemplateModernTech',
    category: 'Technology',
    difficulty: 'Intermediate',
    features: ['Tech Focus', 'Gradient', 'Modern'],
    industry: ['Technology', 'Software', 'Innovation']
  },
  
  // Industry-Specific Templates
  'software-engineer': {
    name: 'Software Engineer',
    description: 'Technical format optimized for software development roles',
    component: 'TemplateSoftwareEngineer',
    category: 'Technology',
    difficulty: 'Intermediate',
    features: ['Technical Focus', 'Code Integration', 'GitHub Links'],
    industry: ['Software Development', 'Programming', 'Tech']
  },
  'data-scientist': {
    name: 'Data Scientist',
    description: 'Analytics-focused format for data science roles',
    component: 'TemplateDataScientist',
    category: 'Technology',
    difficulty: 'Advanced',
    features: ['Data Focus', 'Analytics', 'Research'],
    industry: ['Data Science', 'Analytics', 'Research']
  },
  'finance-manager': {
    name: 'Finance Manager',
    description: 'Professional format for finance and analytical roles',
    component: 'TemplateFinanceManager',
    category: 'Finance',
    difficulty: 'Intermediate',
    features: ['Financial Focus', 'Analytics', 'Professional'],
    industry: ['Finance', 'Banking', 'Accounting']
  },
  'marketing-specialist': {
    name: 'Marketing Specialist',
    description: 'Creative format for marketing professionals',
    component: 'TemplateMarketingSpecialist',
    category: 'Marketing',
    difficulty: 'Intermediate',
    features: ['Creative', 'Brand Focus', 'Campaign Highlights'],
    industry: ['Marketing', 'Advertising', 'Brand Management']
  },
  'nursing-professional': {
    name: 'Nursing Professional',
    description: 'Healthcare-focused format for nursing professionals',
    component: 'TemplateNursingProfessional',
    category: 'Healthcare',
    difficulty: 'Beginner',
    features: ['Healthcare Focus', 'Patient Care', 'Certifications'],
    industry: ['Healthcare', 'Nursing', 'Medical']
  },
  'graphic-designer': {
    name: 'Graphic Designer',
    description: 'Creative visual format for graphic design professionals',
    component: 'TemplateGraphicDesigner',
    category: 'Creative',
    difficulty: 'Intermediate',
    features: ['Creative Design', 'Portfolio Integration', 'Visual'],
    industry: ['Design', 'Creative', 'Visual Arts']
  },
  'teacher': {
    name: 'Teacher',
    description: 'Educational format for teaching professionals',
    component: 'TemplateTeacher',
    category: 'Education',
    difficulty: 'Beginner',
    features: ['Educational Focus', 'Student Impact', 'Curriculum'],
    industry: ['Education', 'Teaching', 'Academia']
  },
  'legal-professional': {
    name: 'Legal Professional',
    description: 'Professional format for legal and compliance professionals',
    component: 'TemplateLegalProfessional',
    category: 'Professional',
    difficulty: 'Advanced',
    features: ['Legal Focus', 'Compliance', 'Professional'],
    industry: ['Legal', 'Law', 'Compliance']
  },
  'executive-leader': {
    name: 'Executive Leader',
    description: 'Sophisticated design for C-suite and senior leadership',
    component: 'TemplateExecutiveLeader',
    category: 'Executive',
    difficulty: 'Advanced',
    features: ['Executive', 'Leadership', 'Premium'],
    industry: ['Executive', 'Leadership', 'C-Suite']
  },
  'sales-manager': {
    name: 'Sales Manager',
    description: 'Results-driven format for sales professionals',
    component: 'TemplateSalesManager',
    category: 'Sales',
    difficulty: 'Intermediate',
    features: ['Sales Focus', 'Results', 'Metrics'],
    industry: ['Sales', 'Business Development', 'Account Management']
  },
  'consulting-professional': {
    name: 'Consulting Professional',
    description: 'Strategic format for management consulting roles',
    component: 'TemplateConsultingProfessional',
    category: 'Professional',
    difficulty: 'Advanced',
    features: ['Strategic', 'Consulting', 'Problem Solving'],
    industry: ['Consulting', 'Strategy', 'Professional Services']
  },
  'hr-professional': {
    name: 'HR Professional',
    description: 'People-focused format for human resources professionals',
    component: 'TemplateHRProfessional',
    category: 'Professional',
    difficulty: 'Intermediate',
    features: ['HR Focus', 'People Development', 'Culture'],
    industry: ['Human Resources', 'Talent', 'People Operations']
  },
  
  // Legacy Templates (for backward compatibility)
  minimal: {
    name: 'Minimal Template',
    description: 'Clean and simple design for all industries',
    component: 'MinimalTemplate',
    category: 'Professional'
  },
  professional: {
    name: 'Professional Template',
    description: 'Traditional business format with modern touches',
    component: 'ProfessionalTemplate',
    category: 'Professional'
  },
  modern: {
    name: 'Modern Template',
    description: 'Contemporary design for tech and innovative companies',
    component: 'ModernTemplate',
    category: 'Modern'
  },
  creative: {
    name: 'Creative Template',
    description: 'Bold and visually appealing for creative industries',
    component: 'CreativeTemplate',
    category: 'Creative'
  },
  marketing: {
    name: 'Marketing Template',
    description: 'Campaign-focused design for marketing professionals',
    component: 'MarketingTemplate',
    category: 'Marketing'
  },
  finance: {
    name: 'Finance Template',
    description: 'Professional format for finance and analytical roles',
    component: 'FinanceTemplate',
    category: 'Finance'
  },
  executive: {
    name: 'Executive Template',
    description: 'Sophisticated design for C-suite and senior leadership roles',
    component: 'ExecutiveTemplate',
    category: 'Executive'
  },
  academic: {
    name: 'Academic Template',
    description: 'Research-focused format for academic and educational positions',
    component: 'AcademicTemplate',
    category: 'Academic'
  },
  sales: {
    name: 'Sales Template',
    description: 'Results-driven design for sales and business development roles',
    component: 'SalesTemplate',
    category: 'Sales'
  },
  legal: {
    name: 'Legal Template',
    description: 'Professional format for legal and compliance professionals',
    component: 'LegalTemplate',
    category: 'Professional'
  },
  dataScience: {
    name: 'Data Science Template',
    description: 'Technical format for data scientists and ML engineers',
    component: 'DataScienceTemplate',
    category: 'Technology'
  },
  devops: {
    name: 'DevOps Template',
    description: 'Technical format for DevOps and infrastructure professionals',
    component: 'DevOpsTemplate',
    category: 'Technology'
  },
  nursing: {
    name: 'Nursing Template',
    description: 'Healthcare-focused format for nursing and medical professionals',
    component: 'NursingTemplate',
    category: 'Healthcare'
  },
  consulting: {
    name: 'Consulting Template',
    description: 'Strategic format for management consulting and professional services',
    component: 'ConsultingTemplate',
    category: 'Professional'
  },
  tech: {
    name: 'Tech Template',
    description: 'Modern format for software engineers and tech innovators',
    component: 'TechTemplate',
    category: 'Technology'
  },
  startup: {
    name: 'Startup Template',
    description: 'Dynamic format for startup environments and fast-paced companies',
    component: 'StartupTemplate',
    category: 'Modern'
  },
  remote: {
    name: 'Remote Template',
    description: 'Specialized format for remote work and distributed teams',
    component: 'RemoteTemplate',
    category: 'Modern'
  },
  projectManager: {
    name: 'Project Manager Template',
    description: 'Results-focused format for project management and leadership roles',
    component: 'ProjectManagerTemplate',
    category: 'Management'
  },
  education: {
    name: 'Education Template',
    description: 'Inspiring format for educators and training professionals',
    component: 'EducationTemplate',
    category: 'Education'
  }
};

// Helper function to get template component by ID
export const getTemplateComponent = (templateId) => {
  return templateComponents[templateId] || 'ProfessionalTemplate';
};

// Helper function to get all available templates
export const getAvailableTemplates = () => {
  return Object.entries(templateMetadata).map(([key, metadata]) => ({
    id: key,
    ...metadata
  }));
};
