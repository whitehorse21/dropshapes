const demoData = {
  personalInfo: {
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Maple Street, Springfield, USA",
    location: "Springfield, USA",
    linkedin: "https://www.linkedin.com/in/alexjohnson",
    website: "https://alexjohnson.dev",
  },
  profession: "Full Stack Developer",
  experience: [
    {
      company: "Tech Solutions Inc.",
      role: "Senior Developer",
      location: "Springfield, USA",
      startDate: "2020-01-15",
      endDate: "2023-06-30",
      current: false,
      description:
        "Developed full-stack applications using React, Node.js, and MongoDB. Led a team of 5 developers and improved system performance by 30%.",
    },
    {
      company: "Web Innovations LLC",
      role: "Frontend Developer",
      location: "Springfield, USA",
      startDate: "2018-05-01",
      endDate: "2019-12-31",
      current: false,
      description:
        "Created responsive web applications using HTML, CSS, and JavaScript. Collaborated with designers and backend developers.",
    },
  ],
  education: [
    {
      institution: "Springfield University",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: "2014-09-01",
      endDate: "2018-06-15",
      current: false,
    },
  ],
  skills: [
    { name: "JavaScript", level: "Expert" },
    { name: "React", level: "Advanced" },
    { name: "Node.js", level: "Advanced" },
    { name: "MongoDB", level: "Intermediate" },
    { name: "CSS", level: "Advanced" },
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "French", level: "Fluent" },
  ],
  summary:
    "Full Stack Developer with 5+ years of experience building scalable web applications and leading development teams.",
  hobbies: ["Reading", "Gaming", "Traveling"],
  certifications: [
    {
      name: "AWS Certified Developer",
      organization: "Amazon",
      startDate: "2022-03-01",
      endDate: "",
      certificateLink: "https://aws.amazon.com/certification/",
    },
  ],
  custom_section: [
    {
      title: "Projects",
      items: [
        {
          name: "Portfolio Website",
          description:
            "Built a responsive personal portfolio website using React and Tailwind CSS.",
        },
        {
          name: "E-commerce Platform",
          description:
            "Developed a full-stack e-commerce web application with Node.js, Express, and MongoDB.",
        },
      ],
    },
    {
      title: "Volunteer Work",
      items: [
        {
          name: "Coding Mentor",
          description:
            "Mentored students in web development and software engineering principles.",
        },
      ],
    },
  ],
};
export const templates = [
  {
    id: "modern",
    name: "Modern Resume",
    category: "modern",
    thumbnail: "/templates/resumes/modern.png",
    hasSidebar: true,
    sidebarPosition: "left",
    sidebarSections: ["contact", "skills", "languages"],

    layout: {
      type: "double",
      columns: {
        widths: [30, 70], // Sidebar on left
        main: ["header", "summary", "experience", "education"],
        sidebar: ["contact", "skills", "languages", "hobbies"],
      },
      sectionPlacement: {
        contact: {
          single: { mode: "inline", target: "header" },
          double: { mode: "section", target: "sidebar" },
        },
      },
    },

    style: {
      sidebarBg: "white", // or any color you want
      sidebarColor: "#000000", // text color inside sidebar
      headerBg: "#2c3e50",
      headerColor: "#fff",
      sectionTitleColor: "#3498db",
      fontFamily: "Arial, sans-serif",
      fontSizes: {
        name: "24pt",
        profession: "16pt",
        sectionTitle: "14pt",
        body: "11pt",
      },
      skillColors: {
        expert: "#3498db",
        advanced: "#2980b9",
        intermediate: "#95a5a6",
      },
      tagBg: "#3498db",
      tagColor: "#fff",
      datePosition: "right",
      profilePicture: true,
      profilePictureAlignment: "center",
      headerLayout: "profile-left",
    },

    sectionOrder: [
      "header",
      "contact",
      "summary",
      "experience",
      "education",
      "skills",
      "languages",
      "certifications",
      "hobbies",
      "custom_section",
    ],

    data: demoData,
  },

  {
    id: "classic",
    name: "Classic Resume",
    category: "classic",
    thumbnail: "/templates/resumes/classic.png",
    hasSidebar: true,
    sidebarPosition: "left",
    sidebarSections: ["contact", "skills", "languages"],

    layout: {
      type: "double",
      columns: {
        widths: [30, 70],
        main: ["header", "summary", "experience", "education"],
        sidebar: ["contact", "skills", "languages", "hobbies"],
      },
      sectionPlacement: {
        contact: {
          single: { mode: "inline", target: "header" },
          double: { mode: "section", target: "sidebar" },
        },
      },
    },

    style: {
      sidebarBg: "white", // or any color you want
      sidebarColor: "#000000", // text color inside sidebar
      profilePictureAlignment: "left",
      profilePicture: true,
      headerBg: "#f8f8f8",
      headerColor: "#000",
      sectionTitleColor: "#000",
      fontFamily: "Georgia, serif",
      fontSizes: {
        name: "24pt",
        profession: "16pt",
        sectionTitle: "14pt",
        body: "11pt",
      },
      skillColors: {
        expert: "#000",
        advanced: "#333",
        intermediate: "#666",
      },
      tagBg: "#000",
      tagColor: "#fff",
      datePosition: "right",
      headerLayout: "center",
    },

    sectionOrder: [
      "header",
      "contact",
      "summary",
      "education",
      "experience",
      "skills",
      "languages",
      "hobbies",
      "certifications",
      "custom_section",
    ],

    data: demoData,
  },

  {
    id: "minimalStandard",
    name: "Minimal Standard Resume",
    category: "standard",
    thumbnail: "/templates/resumes/minimal-standard.png",
    hasSidebar: false,
    sidebarPosition: null,
    sidebarSections: [],

    layout: {
      type: "single",
      columns: {
        widths: [100],
        main: [
          "header",
          "contact", // Inline contact still possible, but included here for single column mode
          "summary",
          "experience",
          "education",
          "skills",
          "languages",
          "hobbies",
          "custom_section",
        ],
        sidebar: [],
      },
      sectionPlacement: {
        contact: {
          single: { mode: "inline", target: "header" },
          double: { mode: "section", target: "sidebar" },
        },
      },
    },

    style: {
      sidebarBg: "white",
      sidebarColor: "#000000",
      profilePicture: false,
      profilePictureAlignment: "center",
      headerBg: "#ffffff",
      headerColor: "#000000",
      sectionTitleColor: "#000000",
      fontFamily: "Times New Roman, serif",
      fontSizes: {
        name: "24pt",
        profession: "16pt",
        sectionTitle: "14pt",
        body: "11pt",
      },
      skillColors: {
        expert: "#000000",
        advanced: "#000000",
        intermediate: "#000000",
      },
      tagBg: "#000000",
      tagColor: "#ffffff",
      datePosition: "right",
      headerLayout: "center",
    },

    sectionOrder: [
      "header",
      "contact",
      "summary",
      "experience",
      "education",
      "skills",
      "languages",
      "hobbies",
      "certifications",
      "custom_section",
    ],

    data: demoData,
  },
  {
    id: "executiveStandardSidebar",
    name: "Executive Standard Sidebar Resume",
    category: "standard",
    thumbnail: "/templates/resumes/executive-standard.png",
    hasSidebar: true,
    sidebarPosition: "right",
    sidebarSections: ["contact", "skills", "languages"],

    layout: {
      type: "double",
      columns: {
        widths: [70, 30], // main, sidebar
        main: [
          "header",
          "summary",
          "experience",
          "education",
          "certifications",
          "custom_section",
        ],
        sidebar: ["contact", "skills", "languages", "hobbies"],
      },
      sectionPlacement: {
        contact: {
          single: { mode: "section", target: "main" },
          double: { mode: "section", target: "sidebar" },
        },
      },
    },

    style: {
      sidebarBg: "white", // or any color you want
      sidebarColor: "#000000", // text color inside sidebar
      profilePicture: false,
      profilePictureAlignment: "center",
      headerBg: "#ffffff",
      headerColor: "#000000",
      sectionTitleColor: "#000000",
      fontFamily: "Times New Roman, serif",
      fontSizes: {
        name: "22pt",
        profession: "14pt",
        sectionTitle: "12pt",
        body: "10.5pt",
      },
      skillColors: {
        expert: "#000000",
        advanced: "#000000",
        intermediate: "#000000",
      },
      tagBg: "#000000",
      tagColor: "#ffffff",
      datePosition: "right",
      headerLayout: "center",
    },

    sectionOrder: [
      "header",
      "summary",
      "experience",
      "education",
      "skills",
      "languages",
      "hobbies",
      "certifications",
      "custom_section",
    ],

    data: demoData,
  },
];
