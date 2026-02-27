'use client';

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../../components/ThemeProvider";
import { ArrowRight, Search, Star, Crown, Download, Filter, Clock, TrendingUp } from "lucide-react";

export default function CoverLetterTemplates() {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular"); // popular, rating, newest, name
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  // Enhanced template data with modern, professional options
  const coverLetterTemplates = [
    {
      id: 1,
      name: "Classic Professional",
      description: "A traditional, professional cover letter format suitable for corporate environments and conservative industries.",
      image: "/cover-letter-templates/classic.jpg",
      isPremium: false,
      category: "Professional",
      features: ["Professional layout", "Company research section", "Achievement highlights", "Call to action"],
      rating: 4.5,
      downloads: 1850,
      industries: ["Finance", "Consulting", "Legal", "Government"],
      difficulty: "Beginner",
      estimatedTime: "15 min"
    },
    {
      id: 2,
      name: "Modern Minimal",
      description: "Clean, minimal design perfect for tech and creative industries with emphasis on skills and achievements.",
      image: "/cover-letter-templates/modern.jpg",
      isPremium: false,
      category: "Modern",
      features: ["Modern styling", "Skills integration", "Clean typography", "ATS-friendly"],
      rating: 4.8,
      downloads: 2350,
      industries: ["Technology", "Startups", "Digital Marketing", "UX/UI"],
      difficulty: "Beginner",
      estimatedTime: "12 min"
    },
    {
      id: 3,
      name: "Creative Impact",
      description: "Bold design with visual elements, ideal for creative professionals and design-focused roles.",
      image: "/cover-letter-templates/creative.jpg",
      isPremium: true,
      category: "Creative",
      features: ["Visual appeal", "Color accents", "Creative layout", "Portfolio integration"],
      rating: 4.7,
      downloads: 1200,
      industries: ["Design", "Advertising", "Media", "Arts"],
      difficulty: "Intermediate",
      estimatedTime: "20 min"
    },
    {
      id: 4,
      name: "Executive Leadership",
      description: "Sophisticated template for senior positions and leadership roles with executive styling.",
      image: "/cover-letter-templates/executive.jpg",
      isPremium: true,
      category: "Executive",
      features: ["Executive styling", "Leadership focus", "Premium design", "Strategic positioning"],
      rating: 4.9,
      downloads: 890,
      industries: ["C-Suite", "Management", "Strategy", "Operations"],
      difficulty: "Advanced",
      estimatedTime: "25 min"
    },
    {
      id: 5,
      name: "Tech Innovator",
      description: "Perfect for software developers, engineers, and tech professionals with technical skill emphasis.",
      image: "/cover-letter-templates/tech.jpg",
      isPremium: false,
      category: "Technology",
      features: ["Technical focus", "Project highlights", "Skills matrix", "GitHub integration"],
      rating: 4.6,
      downloads: 1950,
      industries: ["Software Development", "Engineering", "Data Science", "DevOps"],
      difficulty: "Intermediate",
      estimatedTime: "18 min"
    },
    {
      id: 6,
      name: "Sales Champion",
      description: "Results-driven template for sales professionals emphasizing achievements and metrics.",
      image: "/cover-letter-templates/sales.jpg",
      isPremium: true,
      category: "Sales",
      features: ["Results emphasis", "Metrics showcase", "Achievement focus", "Performance data"],
      rating: 4.4,
      downloads: 1100,
      industries: ["Sales", "Business Development", "Account Management", "Retail"],
      difficulty: "Intermediate",
      estimatedTime: "20 min"
    },
    {
      id: 7,
      name: "Healthcare Professional",
      description: "Designed for healthcare workers with emphasis on certifications and patient care experience.",
      image: "/cover-letter-templates/healthcare.jpg",
      isPremium: false,
      category: "Healthcare",
      features: ["Certification focus", "Care experience", "Professional credentials", "Ethics emphasis"],
      rating: 4.7,
      downloads: 1400,
      industries: ["Healthcare", "Nursing", "Medical", "Pharmaceuticals"],
      difficulty: "Beginner",
      estimatedTime: "15 min"
    },
    {
      id: 8,
      name: "Academic Scholar",
      description: "Perfect for academic positions, research roles, and educational institutions.",
      image: "/cover-letter-templates/academic.jpg",
      isPremium: true,
      category: "Academic",
      features: ["Research focus", "Publication list", "Academic credentials", "Teaching experience"],
      rating: 4.8,
      downloads: 750,
      industries: ["Education", "Research", "Universities", "Think Tanks"],
      difficulty: "Advanced",
      estimatedTime: "30 min"
    },
    {
      id: 9,
      name: "Startup Dynamo",
      description: "Energetic template perfect for startup environments and fast-paced companies seeking innovation.",
      image: "/cover-letter-templates/startup.jpg",
      isPremium: false,
      category: "Modern",
      features: ["Dynamic layout", "Innovation focus", "Agile mindset", "Growth potential"],
      rating: 4.6,
      downloads: 1650,
      industries: ["Startups", "Tech", "Innovation", "Venture Capital"],
      difficulty: "Beginner",
      estimatedTime: "15 min"
    },
    {
      id: 10,
      name: "Consulting Expert",
      description: "Strategic template designed for management consulting and professional services roles.",
      image: "/cover-letter-templates/consulting.jpg",
      isPremium: true,
      category: "Professional",
      features: ["Strategic thinking", "Problem-solving focus", "Client impact", "Analytical approach"],
      rating: 4.8,
      downloads: 980,
      industries: ["Consulting", "Strategy", "Analytics", "Professional Services"],
      difficulty: "Advanced",
      estimatedTime: "25 min"
    },
    {
      id: 11,
      name: "Remote Worker Pro",
      description: "Optimized for remote positions with emphasis on self-motivation and digital collaboration.",
      image: "/cover-letter-templates/remote.jpg",
      isPremium: false,
      category: "Modern",
      features: ["Remote skills", "Digital tools", "Self-management", "Virtual collaboration"],
      rating: 4.5,
      downloads: 2100,
      industries: ["Remote Work", "Digital Nomad", "Virtual Teams", "Online Services"],
      difficulty: "Beginner",
      estimatedTime: "12 min"
    },    
    {
      id: 12,
      name: "Non-Profit Mission",
      description: "Purpose-driven template for non-profit organizations and social impact roles.",
      image: "/cover-letter-templates/nonprofit.jpg",
      isPremium: false,
      category: "Professional",
      features: ["Mission alignment", "Social impact", "Volunteer experience", "Community focus"],
      rating: 4.7,
      downloads: 890,
      industries: ["Non-Profit", "Social Work", "Community Development", "Advocacy"],
      difficulty: "Intermediate",
      estimatedTime: "20 min"
    },
    {
      id: 13,
      name: "Marketing Maverick",
      description: "Dynamic template for marketing professionals showcasing campaign successes and creative strategies.",
      image: "/cover-letter-templates/marketing.jpg",
      isPremium: true,
      category: "Marketing",
      features: ["Campaign highlights", "ROI metrics", "Creative strategy", "Brand positioning"],
      rating: 4.6,
      downloads: 1780,
      industries: ["Digital Marketing", "Brand Management", "Content Marketing", "Social Media"],
      difficulty: "Intermediate",
      estimatedTime: "18 min"
    },
    {
      id: 14,
      name: "Financial Analyst Pro",
      description: "Numbers-focused template perfect for finance and accounting professionals with analytical emphasis.",
      image: "/cover-letter-templates/finance.jpg",
      isPremium: false,
      category: "Finance",
      features: ["Financial modeling", "Data analysis", "Risk assessment", "Performance metrics"],
      rating: 4.8,
      downloads: 1420,
      industries: ["Investment Banking", "Corporate Finance", "Accounting", "Financial Planning"],
      difficulty: "Advanced",
      estimatedTime: "22 min"
    },
    {
      id: 15,
      name: "Customer Success Hero",
      description: "Relationship-focused template for customer service and success roles emphasizing client satisfaction.",
      image: "/cover-letter-templates/customer-success.jpg",
      isPremium: false,
      category: "Professional",
      features: ["Customer satisfaction", "Relationship building", "Problem solving", "Communication skills"],
      rating: 4.5,
      downloads: 1650,
      industries: ["Customer Service", "Account Management", "Client Relations", "Support"],
      difficulty: "Beginner",
      estimatedTime: "15 min"
    },
    {
      id: 16,
      name: "Data Science Explorer",
      description: "Analytics-driven template for data scientists and analysts with focus on insights and methodology.",
      image: "/cover-letter-templates/data-science.jpg",
      isPremium: true,
      category: "Technology",
      features: ["Statistical analysis", "Machine learning", "Data visualization", "Research methodology"],
      rating: 4.9,
      downloads: 1320,
      industries: ["Data Science", "Business Intelligence", "Research", "AI/ML"],
      difficulty: "Advanced",
      estimatedTime: "25 min"
    },
    {
      id: 17,
      name: "HR People Champion",
      description: "People-centric template for human resources professionals focusing on talent development and culture.",
      image: "/cover-letter-templates/hr.jpg",
      isPremium: false,
      category: "Professional",
      features: ["Talent acquisition", "Employee development", "Culture building", "Policy development"],
      rating: 4.4,
      downloads: 1150,
      industries: ["Human Resources", "Recruitment", "Organizational Development", "Training"],
      difficulty: "Intermediate",
      estimatedTime: "20 min"
    },
    {
      id: 18,
      name: "Legal Professional",
      description: "Sophisticated template for legal professionals emphasizing expertise, ethics, and client advocacy.",
      image: "/cover-letter-templates/legal.jpg",
      isPremium: true,
      category: "Professional",
      features: ["Legal expertise", "Case management", "Client advocacy", "Regulatory compliance"],
      rating: 4.7,
      downloads: 890,
      industries: ["Law Firms", "Corporate Legal", "Government Legal", "Compliance"],
      difficulty: "Advanced",
      estimatedTime: "28 min"
    },
    {
      id: 19,
      name: "Project Manager Elite",
      description: "Results-oriented template for project managers highlighting leadership and delivery excellence.",
      image: "/cover-letter-templates/project-manager.jpg",
      isPremium: false,
      category: "Management",
      features: ["Project delivery", "Team leadership", "Risk management", "Stakeholder communication"],
      rating: 4.6,
      downloads: 2100,
      industries: ["Project Management", "Construction", "IT Projects", "Operations"],
      difficulty: "Intermediate",
      estimatedTime: "20 min"
    },
    {
      id: 20,
      name: "Education Innovator",
      description: "Inspiring template for educators and training professionals emphasizing student impact and innovation.",
      image: "/cover-letter-templates/education.jpg",
      isPremium: false,
      category: "Education",
      features: ["Student engagement", "Curriculum development", "Learning outcomes", "Educational technology"],
      rating: 4.8,
      downloads: 1580,
      industries: ["K-12 Education", "Higher Education", "Corporate Training", "E-Learning"],
      difficulty: "Beginner",
      estimatedTime: "18 min"
    }
  ];  const categories = [
    { id: "all", name: "All Templates", count: coverLetterTemplates.length },
    { id: "Professional", name: "Professional", count: coverLetterTemplates.filter(t => t.category === "Professional").length },
    { id: "Modern", name: "Modern", count: coverLetterTemplates.filter(t => t.category === "Modern").length },
    { id: "Creative", name: "Creative", count: coverLetterTemplates.filter(t => t.category === "Creative").length },
    { id: "Executive", name: "Executive", count: coverLetterTemplates.filter(t => t.category === "Executive").length },
    { id: "Technology", name: "Technology", count: coverLetterTemplates.filter(t => t.category === "Technology").length },
    { id: "Sales", name: "Sales", count: coverLetterTemplates.filter(t => t.category === "Sales").length },
    { id: "Healthcare", name: "Healthcare", count: coverLetterTemplates.filter(t => t.category === "Healthcare").length },
    { id: "Academic", name: "Academic", count: coverLetterTemplates.filter(t => t.category === "Academic").length },
    { id: "Marketing", name: "Marketing", count: coverLetterTemplates.filter(t => t.category === "Marketing").length },
    { id: "Finance", name: "Finance", count: coverLetterTemplates.filter(t => t.category === "Finance").length },
    { id: "Management", name: "Management", count: coverLetterTemplates.filter(t => t.category === "Management").length },
    { id: "Education", name: "Education", count: coverLetterTemplates.filter(t => t.category === "Education").length }
  ];

  const sortOptions = [
    { id: "popular", name: "Most Popular", icon: TrendingUp },
    { id: "rating", name: "Highest Rated", icon: Star },
    { id: "newest", name: "Newest", icon: Clock },
    { id: "name", name: "Name (A-Z)", icon: Filter }
  ];

  const filteredAndSortedTemplates = coverLetterTemplates
    .filter(template => {
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.industries.some(industry => 
                             industry.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      const matchesPremium = !showPremiumOnly || template.isPremium;
      return matchesCategory && matchesSearch && matchesPremium;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return b.id - a.id; // Assuming higher ID means newer
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Cover Letter Templates
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Professional templates designed to help you create compelling cover letters that stand out to employers.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link 
              href="/cover-letters"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Back to Cover Letters
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">        {/* Enhanced Search and Filter */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates, industries, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              
              {/* Premium Filter Toggle */}
              <button
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                  showPremiumOnly
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Premium
              </button>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto lg:overflow-visible">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredAndSortedTemplates.length} of {coverLetterTemplates.length} templates
            </span>
            {(searchTerm || selectedCategory !== "all" || showPremiumOnly) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setShowPremiumOnly(false);
                  setSortBy('popular');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>        {/* Enhanced Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group overflow-hidden">
              <div className="relative overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Template Preview</span>
                </div>
                
                {/* Template Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    {template.isPremium && (
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </div>
                    )}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                      template.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      template.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {template.difficulty}
                    </div>
                  </div>
                  
                  <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {template.estimatedTime}
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="space-y-2">
                    <Link 
                      href={`/cover-letters/create?template=${template.id}`}
                      className="block bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 transform translate-y-2 group-hover:translate-y-0 text-center"
                    >
                      Use Template
                    </Link>
                    <button className="block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 transform translate-y-2 group-hover:translate-y-0 w-full">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{template.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{template.features.length - 2} more
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Best for:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.industries.slice(0, 2).map((industry, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        {industry}
                      </span>
                    ))}
                    {template.industries.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{template.industries.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {template.downloads.toLocaleString()}
                  </div>                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.category === 'Professional' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    template.category === 'Modern' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    template.category === 'Creative' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    template.category === 'Executive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    template.category === 'Technology' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    template.category === 'Sales' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    template.category === 'Healthcare' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                    template.category === 'Academic' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    template.category === 'Marketing' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                    template.category === 'Finance' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                    template.category === 'Management' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' :
                    template.category === 'Education' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {template.category}
                  </span>
                </div>
                
                <Link 
                  href={`/cover-letters/create?template=${template.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>        {filteredAndSortedTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn't find any templates matching your criteria. Try adjusting your filters or search terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setShowPremiumOnly(false);
                  setSortBy('popular');
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
              <Link
                href="/cover-letters/create"
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Start from Scratch
              </Link>
            </div>
          </div>
        )}

        {/* Template Statistics */}
        {filteredAndSortedTemplates.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {coverLetterTemplates.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Total Templates</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {coverLetterTemplates.filter(t => !t.isPremium).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Free Templates</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {coverLetterTemplates.filter(t => t.isPremium).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Premium Templates</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Categories</div>
            </div>
          </div>
        )}        {/* Enhanced Call to Action */}
        <div className="mt-16 space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Need Help Choosing the Perfect Template?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Our cover letter templates are designed by HR professionals and optimized for different industries. 
                Each template includes industry-specific guidance and proven strategies to help you stand out.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Professional Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Designed by experts with proven results in real hiring scenarios
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">ATS-Optimized</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All templates are optimized to pass Applicant Tracking Systems
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Industry Specific</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tailored features and content for different career paths
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/cover-letters/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Start Creating Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link 
                href="/cover-letters"
                className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                View My Cover Letters
              </Link>
            </div>
          </div>

          {/* Industry Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Popular Templates by Industry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Technology</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Tech Innovator, Data Science Explorer
                </p>
                <button 
                  onClick={() => setSelectedCategory('Technology')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Healthcare</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Healthcare Professional
                </p>
                <button 
                  onClick={() => setSelectedCategory('Healthcare')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Finance</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Financial Analyst Pro, Executive Leadership
                </p>
                <button 
                  onClick={() => setSelectedCategory('Finance')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Creative</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Creative Impact, Marketing Maverick
                </p>
                <button 
                  onClick={() => setSelectedCategory('Creative')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Education</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Education Innovator, Academic Scholar
                </p>
                <button 
                  onClick={() => setSelectedCategory('Education')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Management</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Project Manager Elite, Executive Leadership
                </p>
                <button 
                  onClick={() => setSelectedCategory('Management')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Marketing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Marketing Maverick, Modern Minimal
                </p>
                <button 
                  onClick={() => setSelectedCategory('Marketing')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Professional Services</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Legal Professional, HR People Champion
                </p>
                <button 
                  onClick={() => setSelectedCategory('Professional')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Templates →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}