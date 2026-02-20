export const getTemplateDisplayName = (templateName) => {
    const templateDisplayNames = {
      // Modern Templates
      TemplateModernCreative: "Creative",
      TemplateModernMinimal: "Minimal",
      TemplateModernTech: "Tech Style",
      TemplateModernCorporate: " Corporate",
      TemplateModernProfessional: "Professional",
      TemplateSoftwareEngineer: "Software Engineer",
      TemplateDataScientist: "Data Scientist",
      TemplateFinanceManager: "Finance Manager",
      TemplateMarketingSpecialist: "Marketing Specialist",
      TemplateNursingProfessional: "Nursing Professional",
      TemplateGraphicDesigner: "Graphic Designer",
      TemplateTeacher: "Teacher",
      TemplateLegalProfessional: "Legal Professional",
      TemplateExecutiveLeader: "Executive Leader",
      TemplateSalesManager: "Sales Manager",
      TemplateConsultingProfessional: "Consulting Professional",

      // Classic Templates
      TemplateUltraModernMinimalist: " Ultra Modern",
      TemplateGradientCardStyle: "Gradient Card",
      TemplateGradientHeader: "Gradient Header",
      TemplateSidebarDark: "Dark Sidebar",
      TemplateGreenAccentBorder: "Green Accent",
      TemplateEmeraldGradient: "Emerald",
      TemplateDarkGradientCentered: "Dark Centered",
      TemplateColorfulCardOverlay: "Colorful Card",
      TemplateIndigoBlueGradient: "Indigo Blue",
      TemplateMultiColorGradient: "Multi Color",
      TemplateProfessionalBlue: "Professional Blue",
      TemplateCleanMinimal: "Clean Minimal",
      TemplateModernBusiness: "Modern Business",
      TemplateTimelineLayout: "Timeline",
      TemplateCreativePortfolio: "Creative Portfolio",
      TemplateContemporaryEdge: "Contemporary",
    };

    return templateDisplayNames[templateName] || templateName;
  };

  export const modernTemplates = [
    {
      name: "TemplateModernCreative",
      thumbnail: "/thumbnails/modern/creative-template.png",
    },
    {
      name: "TemplateModernMinimal",
      thumbnail: "/thumbnails/modern/minimal-template.png",
    },
    {
      name: "TemplateModernTech",
      thumbnail: "/thumbnails/modern/techstyle-template.png",
    },
    {
      name: "TemplateModernCorporate",
      thumbnail: "/thumbnails/modern/corporate-template.png",
    },
    {
      name: "TemplateModernProfessional",
      thumbnail: "/thumbnails/modern/professional-template.png",
    },
    {
      name: "TemplateSoftwareEngineer",
      thumbnail: "/thumbnails/modern/software-template.png",
    },
    {
      name: "TemplateDataScientist",
      thumbnail: "/thumbnails/modern/data-sciencetist-template.png",
    },
    {
      name: "TemplateFinanceManager",
      thumbnail: "/thumbnails/modern/finance-template.png",
    },
    {
      name: "TemplateMarketingSpecialist",
      thumbnail: "/thumbnails/modern/marketing-template.png",
    },
    {
      name: "TemplateNursingProfessional",
      thumbnail: "/thumbnails/modern/nursing-template.png",
    },
    {
      name: "TemplateGraphicDesigner",
      thumbnail: "/thumbnails/modern/graphic-template.png",
    },
    {
      name: "TemplateTeacher",
      thumbnail: "/thumbnails/modern/teacher-template.png",
    },
    {
      name: "TemplateLegalProfessional",
      thumbnail: "/thumbnails/modern/legal-professor-template.png",
    },
    {
      name: "TemplateExecutiveLeader",
      thumbnail: "/thumbnails/modern/executive-template.png",
    },
    {
      name: "TemplateSalesManager",
      thumbnail: "/thumbnails/modern/sales-template.png",
    },
    {
      name: "TemplateConsultingProfessional",
      thumbnail: "/thumbnails/modern/consulting-template.png",
    },
  ];

 export const classicTemplates = [
    {
      name: "TemplateUltraModernMinimalist",
      thumbnail: "/thumbnails/classic/ultra-modern-template.png",
    },
    {
      name: "TemplateGradientCardStyle",
      thumbnail: "/thumbnails/classic/gradient-template.png",
    },
    {
      name: "TemplateGradientHeader",
      thumbnail: "/thumbnails/classic/gradient-header.png",
    },
    {
      name: "TemplateSidebarDark",
      thumbnail: "/thumbnails/classic/dark-sidebar-template.png",
    },
    {
      name: "TemplateGreenAccentBorder",
      thumbnail: "/thumbnails/classic/green-account-template.png",
    },
    {
      name: "TemplateEmeraldGradient",
      thumbnail: "/thumbnails/classic/emerald-template.png",
    },
    {
      name: "TemplateDarkGradientCentered",
      thumbnail: "/thumbnails/classic/dark-gradient.png",
    },
    {
      name: "TemplateColorfulCardOverlay",
      thumbnail: "/thumbnails/classic/colorful-card.png",
    },
    {
      name: "TemplateIndigoBlueGradient",
      thumbnail: "/thumbnails/classic/indigo-blue.png",
    },
    {
      name: "TemplateMultiColorGradient",
      thumbnail: "/thumbnails/classic/multi-color.png",
    },
    {
      name: "TemplateProfessionalBlue",
      thumbnail: "/thumbnails/classic/pro-blue.png",
    },
    {
      name: "TemplateCleanMinimal",
      thumbnail: "/thumbnails/classic/clean-minimal.png",
    },
    {
      name: "TemplateModernBusiness",
      thumbnail: "/thumbnails/classic/modern-business.png",
    },
    {
      name: "TemplateTimelineLayout",
      thumbnail: "/thumbnails/classic/time-line.png",
    },
    {
      name: "TemplateCreativePortfolio",
      thumbnail: "/thumbnails/classic/creative-portfolio.png",
    },
    {
      name: "TemplateContemporaryEdge",
      thumbnail: "/thumbnails/classic/contemporary.png",
    },
  ];