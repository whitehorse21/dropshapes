'use client';

import React from 'react';
// Modern
import TemplateModernCorporate from './Modern/TemplateModernCorporate';
import TemplateModernMinimal from './Modern/TemplateModernMinimal';
import TemplateModernTech from './Modern/TemplateModernTech';
import TemplateModernProfessional from './Modern/TemplateModernProfessional';
import TemplateSoftwareEngineer from './Modern/TemplateSoftwareEngineer';
import TemplateDataScientist from './Modern/TemplateDataScientist';
import TemplateFinanceManager from './Modern/TemplateFinanceManager';
import TemplateNursingProfessional from './Modern/TemplateNursingProfessional';
import TemplateTeacher from './Modern/TemplateTeacher';
import TemplateLegalProfessional from './Modern/TemplateLegalProfessional';
import TemplateExecutiveLeader from './Modern/TemplateExecutiveLeader';
import TemplateSalesManager from './Modern/TemplateSalesManager';
import TemplateConsultingProfessional from './Modern/TemplateConsultingProfessional';
import TemplateHRProfessional from './Modern/TemplateHRProfessional';
import TemplateModernCreative from './Modern/TemplateModernCreative';
import TemplateGraphicDesigner from './Modern/TemplateGraphicDesigner';
import TemplateMarketingSpecialist from './Modern/TemplateMarketingSpecialist';
import TemplateModernDark from './Modern/TemplateModernDark';
// Classic
import ProfessionalTemplate from './Classic/ProfessionalTemplate';
import ModernTemplate from './Classic/ModernTemplate';
import FinanceTemplate from './Classic/FinanceTemplate';
import ExecutiveTemplate from './Classic/ExecutiveTemplate';
import AcademicTemplate from './Classic/AcademicTemplate';
import LegalTemplate from './Classic/LegalTemplate';
import DataScienceTemplate from './Classic/DataScienceTemplate';
import NursingTemplate from './Classic/NursingTemplate';
import TechTemplate from './Classic/TechTemplate';
import StartupTemplate from './Classic/StartupTemplate';
import RemoteTemplate from './Classic/RemoteTemplate';
import ProjectManagerTemplate from './Classic/ProjectManagerTemplate';
import ConsultingTemplate from './Classic/ConsultingTemplate';
import CreativeTemplate from './Classic/CreativeTemplate';
import MarketingTemplate from './Classic/MarketingTemplate';
import EducationTemplate from './Classic/EducationTemplate';

/**
 * Renders the selected cover letter template (same as old_frontend final/Preview.jsx).
 * Props: coverLetterData (object), selectedTemplate (component name string), font (string).
 */
export default function CoverLetterPreview({ coverLetterData, selectedTemplate, font }) {
  const templateProps = {
    coverLetterData: coverLetterData || {},
    font: font || 'sans-serif',
  };

  const renderTemplate = () => {
    try {
      switch (selectedTemplate) {
        case 'TemplateModernCorporate':
          return <TemplateModernCorporate {...templateProps} />;
        case 'TemplateModernMinimal':
          return <TemplateModernMinimal {...templateProps} />;
        case 'TemplateModernProfessional':
          return <TemplateModernProfessional {...templateProps} />;
        case 'TemplateModernTech':
          return <TemplateModernTech {...templateProps} />;
        case 'TemplateModernCreative':
          return <TemplateModernCreative {...templateProps} />;
        case 'TemplateModernDark':
          return <TemplateModernDark {...templateProps} />;
        case 'TemplateSoftwareEngineer':
          return <TemplateSoftwareEngineer {...templateProps} />;
        case 'TemplateDataScientist':
          return <TemplateDataScientist {...templateProps} />;
        case 'TemplateFinanceManager':
          return <TemplateFinanceManager {...templateProps} />;
        case 'TemplateNursingProfessional':
          return <TemplateNursingProfessional {...templateProps} />;
        case 'TemplateTeacher':
          return <TemplateTeacher {...templateProps} />;
        case 'TemplateLegalProfessional':
          return <TemplateLegalProfessional {...templateProps} />;
        case 'TemplateExecutiveLeader':
          return <TemplateExecutiveLeader {...templateProps} />;
        case 'TemplateSalesManager':
          return <TemplateSalesManager {...templateProps} />;
        case 'TemplateConsultingProfessional':
          return <TemplateConsultingProfessional {...templateProps} />;
        case 'TemplateHRProfessional':
          return <TemplateHRProfessional {...templateProps} />;
        case 'TemplateGraphicDesigner':
          return <TemplateGraphicDesigner {...templateProps} />;
        case 'TemplateMarketingSpecialist':
          return <TemplateMarketingSpecialist {...templateProps} />;
        case 'AcademicTemplate':
          return <AcademicTemplate {...templateProps} />;
        case 'DataScienceTemplate':
          return <DataScienceTemplate {...templateProps} />;
        case 'ExecutiveTemplate':
          return <ExecutiveTemplate {...templateProps} />;
        case 'FinanceTemplate':
          return <FinanceTemplate {...templateProps} />;
        case 'LegalTemplate':
          return <LegalTemplate {...templateProps} />;
        case 'ModernTemplate':
          return <ModernTemplate {...templateProps} />;
        case 'NursingTemplate':
          return <NursingTemplate {...templateProps} />;
        case 'ProfessionalTemplate':
          return <ProfessionalTemplate {...templateProps} />;
        case 'ProjectManagerTemplate':
          return <ProjectManagerTemplate {...templateProps} />;
        case 'RemoteTemplate':
          return <RemoteTemplate {...templateProps} />;
        case 'StartupTemplate':
          return <StartupTemplate {...templateProps} />;
        case 'TechTemplate':
          return <TechTemplate {...templateProps} />;
        case 'ConsultingTemplate':
          return <ConsultingTemplate {...templateProps} />;
        case 'CreativeTemplate':
          return <CreativeTemplate {...templateProps} />;
        case 'MarketingTemplate':
          return <MarketingTemplate {...templateProps} />;
        case 'EducationTemplate':
          return <EducationTemplate {...templateProps} />;
        default:
          return <TemplateModernCorporate {...templateProps} />;
      }
    } catch (error) {
      console.error('Error rendering template:', error);
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Template Error</h3>
          <p className="text-red-600 text-sm">Failed to load template: {selectedTemplate}</p>
          <p className="text-red-500 text-xs mt-2">{error?.message}</p>
        </div>
      );
    }
  };

  return <div className="cover-letter-preview min-w-2xl">{renderTemplate()}</div>;
}
