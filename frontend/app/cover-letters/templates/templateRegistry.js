/**
 * Template slug/id -> component name (from old_frontend cover-letters/templates/index.js).
 * Used to resolve cover_template_category (slug or component name) to the template to render.
 */
export const templateComponents = {
  'modern-corporate': 'TemplateModernCorporate',
  'modern-creative': 'TemplateModernCreative',
  'modern-minimal': 'TemplateModernMinimal',
  'modern-professional': 'TemplateModernProfessional',
  'modern-tech': 'TemplateModernTech',
  'software-engineer': 'TemplateSoftwareEngineer',
  'data-scientist': 'TemplateDataScientist',
  'finance-manager': 'TemplateFinanceManager',
  'marketing-specialist': 'TemplateMarketingSpecialist',
  'nursing-professional': 'TemplateNursingProfessional',
  'graphic-designer': 'TemplateGraphicDesigner',
  teacher: 'TemplateTeacher',
  'legal-professional': 'TemplateLegalProfessional',
  'executive-leader': 'TemplateExecutiveLeader',
  'sales-manager': 'TemplateSalesManager',
  'consulting-professional': 'TemplateConsultingProfessional',
  'hr-professional': 'TemplateHRProfessional',
  minimal: 'MinimalTemplate',
  professional: 'ProfessionalTemplate',
  modern: 'ModernTemplate',
  creative: 'CreativeTemplate',
  marketing: 'MarketingTemplate',
  finance: 'FinanceTemplate',
  executive: 'ExecutiveTemplate',
  academic: 'AcademicTemplate',
  sales: 'SalesTemplate',
  legal: 'LegalTemplate',
  dataScience: 'DataScienceTemplate',
  devops: 'DevOpsTemplate',
  nursing: 'NursingTemplate',
  consulting: 'ConsultingTemplate',
  tech: 'TechTemplate',
  startup: 'StartupTemplate',
  remote: 'RemoteTemplate',
  projectManager: 'ProjectManagerTemplate',
  'project-manager': 'ProjectManagerTemplate',
  education: 'EducationTemplate',
};

export function getTemplateComponent(templateId) {
  if (!templateId) return 'TemplateModernCorporate';
  const key = String(templateId).toLowerCase().trim().replace(/\s+/g, '-');
  return templateComponents[key] || templateComponents[templateId] || 'TemplateModernCorporate';
}
