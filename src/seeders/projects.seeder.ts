import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class ProjectsSeeder implements Seeder {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed(): Promise<any> {
    // Check if projects already exist
    const existingProjects = await this.projectModel.find().exec();
    if (existingProjects.length > 0) {
      console.log(`Found ${existingProjects.length} existing projects. Skipping project seeding.`);
      return;
    }

    // Get client users for project ownership
    const clients = await this.userModel.find({ roles: 'client' }).exec();
    
    if (clients.length === 0) {
      throw new Error('No client users found. Please seed users first.');
    }

    const projects = [
      // E-commerce Platform Project
      {
        title: 'Modern E-commerce Platform Development',
        description: 'Looking for an experienced full-stack developer to build a modern e-commerce platform with React frontend and Node.js backend. The platform should include user authentication, product catalog, shopping cart, payment processing with Stripe, order management, and admin dashboard. Must be responsive and mobile-friendly.',
        category: 'Web Development',
        subcategory: 'Full Stack Development',
        budget: {
          type: 'fixed',
          amount: 8000,
          currency: 'USD'
        },
        duration: {
          type: 'weeks',
          value: 8
        },
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'CSS', 'Stripe API'],
        experienceLevel: 'expert',
        projectType: 'web_development',
        status: 'active',
        postedBy: clients[0]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'United States',
          timezone: 'America/Chicago'
        },
        requirements: {
          portfolio: true,
          interview: true,
          testProject: false,
          availability: '40 hours/week',
          startDate: new Date('2024-08-15'),
          preferredTimezone: 'America/Chicago'
        },
        features: [
          'User authentication and authorization',
          'Product catalog with search and filters',
          'Shopping cart and wishlist',
          'Secure payment processing',
          'Order tracking and history',
          'Admin dashboard for inventory management',
          'Responsive design for mobile and desktop',
          'Email notifications',
          'Customer reviews and ratings'
        ],
        tags: ['react', 'nodejs', 'ecommerce', 'fullstack', 'mongodb', 'stripe'],
        applicationsCount: 12,
        viewsCount: 156,
        isUrgent: false,
        isFeatured: true,
        attachments: [],
        questions: [
          'How many years of experience do you have with React and Node.js?',
          'Can you provide examples of e-commerce platforms you\'ve built?',
          'What is your approach to handling payment security?'
        ],
        createdAt: new Date('2024-07-20'),
        updatedAt: new Date('2024-07-20')
      },

      // Mobile App Design Project
      {
        title: 'FinTech Mobile App UI/UX Design',
        description: 'Seeking a talented UI/UX designer to create a modern, intuitive design for a mobile banking application. The app will include features like account management, money transfers, bill payments, investment tracking, and financial analytics. Design should prioritize security, accessibility, and user experience.',
        category: 'Design',
        subcategory: 'UI/UX Design',
        budget: {
          type: 'fixed',
          amount: 3500,
          currency: 'USD'
        },
        duration: {
          type: 'weeks',
          value: 4
        },
        skillsRequired: ['Figma', 'UI Design', 'UX Design', 'Mobile Design', 'Prototyping', 'User Research'],
        experienceLevel: 'intermediate',
        projectType: 'design',
        status: 'active',
        postedBy: clients[1]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'Canada',
          timezone: 'America/Toronto'
        },
        requirements: {
          portfolio: true,
          interview: true,
          testProject: true,
          availability: '25 hours/week',
          startDate: new Date('2024-08-10'),
          preferredTimezone: 'America/Toronto'
        },
        features: [
          'User onboarding flow',
          'Dashboard with account overview',
          'Transfer money between accounts',
          'Bill payment interface',
          'Investment portfolio tracking',
          'Transaction history and analytics',
          'Security features (biometric login)',
          'Settings and profile management'
        ],
        tags: ['ui', 'ux', 'mobile', 'fintech', 'figma', 'banking'],
        applicationsCount: 8,
        viewsCount: 92,
        isUrgent: true,
        isFeatured: false,
        attachments: [],
        questions: [
          'Do you have experience designing for financial applications?',
          'How do you approach user research and testing?',
          'Can you show examples of mobile app designs you\'ve created?'
        ],
        createdAt: new Date('2024-07-25'),
        updatedAt: new Date('2024-07-25')
      },

      // Mobile App Development Project
      {
        title: 'Cross-Platform Food Delivery App',
        description: 'Need an experienced mobile developer to build a cross-platform food delivery application using React Native or Flutter. The app should include user registration, restaurant browsing, menu viewing, ordering system, real-time order tracking, payment integration, and push notifications.',
        category: 'Mobile Development',
        subcategory: 'Cross-Platform Development',
        budget: {
          type: 'hourly',
          amount: 65,
          currency: 'USD'
        },
        duration: {
          type: 'months',
          value: 3
        },
        skillsRequired: ['React Native', 'Flutter', 'Firebase', 'Payment Integration', 'Google Maps API', 'Push Notifications'],
        experienceLevel: 'expert',
        projectType: 'mobile_development',
        status: 'in_progress',
        postedBy: clients[2]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'United Kingdom',
          timezone: 'Europe/London'
        },
        requirements: {
          portfolio: true,
          interview: true,
          testProject: false,
          availability: '30 hours/week',
          startDate: new Date('2024-07-15'),
          preferredTimezone: 'Europe/London'
        },
        features: [
          'User authentication and profiles',
          'Restaurant discovery and search',
          'Menu browsing with images',
          'Shopping cart and checkout',
          'Multiple payment options',
          'Real-time order tracking',
          'Push notifications',
          'Rating and review system',
          'Order history',
          'Customer support chat'
        ],
        tags: ['react-native', 'flutter', 'mobile', 'food-delivery', 'firebase'],
        applicationsCount: 15,
        viewsCount: 203,
        isUrgent: false,
        isFeatured: true,
        attachments: [],
        questions: [
          'Which framework do you prefer: React Native or Flutter, and why?',
          'How do you handle real-time features like order tracking?',
          'What\'s your experience with payment gateway integration?'
        ],
        createdAt: new Date('2024-07-10'),
        updatedAt: new Date('2024-07-28')
      },

      // Data Analysis Project
      {
        title: 'Customer Analytics and ML Model Development',
        description: 'Looking for a data scientist to analyze customer behavior data and build predictive models for our e-commerce platform. Tasks include data cleaning, exploratory data analysis, feature engineering, building machine learning models for customer segmentation and churn prediction, and creating visualizations and reports.',
        category: 'Data Science',
        subcategory: 'Machine Learning',
        budget: {
          type: 'fixed',
          amount: 6000,
          currency: 'USD'
        },
        duration: {
          type: 'weeks',
          value: 6
        },
        skillsRequired: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Data Visualization', 'SQL'],
        experienceLevel: 'expert',
        projectType: 'data_science',
        status: 'active',
        postedBy: clients[0]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'United States',
          timezone: 'America/New_York'
        },
        requirements: {
          portfolio: true,
          interview: true,
          testProject: true,
          availability: '35 hours/week',
          startDate: new Date('2024-08-20'),
          preferredTimezone: 'America/New_York'
        },
        features: [
          'Data cleaning and preprocessing',
          'Exploratory data analysis',
          'Customer segmentation analysis',
          'Churn prediction model',
          'Recommendation system',
          'Data visualization dashboards',
          'Model performance evaluation',
          'Documentation and reporting'
        ],
        tags: ['python', 'machine-learning', 'data-science', 'analytics', 'pandas'],
        applicationsCount: 6,
        viewsCount: 78,
        isUrgent: false,
        isFeatured: false,
        attachments: [],
        questions: [
          'What machine learning frameworks do you prefer for this type of project?',
          'How do you approach feature engineering for customer data?',
          'Can you provide examples of similar analytics projects you\'ve completed?'
        ],
        createdAt: new Date('2024-07-30'),
        updatedAt: new Date('2024-07-30')
      },

      // Content Writing Project
      {
        title: 'Tech Blog Content Writing & SEO',
        description: 'Seeking a skilled content writer to create engaging blog posts for our technology company. Need 20 high-quality articles covering topics like AI, blockchain, web development, and digital transformation. Each article should be 1500-2000 words, SEO-optimized, and include relevant keywords.',
        category: 'Writing',
        subcategory: 'Blog Writing',
        budget: {
          type: 'fixed',
          amount: 2500,
          currency: 'USD'
        },
        duration: {
          type: 'weeks',
          value: 5
        },
        skillsRequired: ['Content Writing', 'SEO', 'Blog Writing', 'Technology Writing', 'Research'],
        experienceLevel: 'intermediate',
        projectType: 'writing',
        status: 'completed',
        postedBy: clients[1]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'Australia',
          timezone: 'Australia/Sydney'
        },
        requirements: {
          portfolio: true,
          interview: false,
          testProject: true,
          availability: '20 hours/week',
          startDate: new Date('2024-06-15'),
          preferredTimezone: 'Australia/Sydney'
        },
        features: [
          '20 original blog articles',
          'SEO keyword optimization',
          'Technical accuracy verification',
          'Engaging headlines and meta descriptions',
          'Internal linking strategy',
          'Image suggestions and alt text',
          'Social media promotion text',
          'Content calendar planning'
        ],
        tags: ['content-writing', 'seo', 'blog', 'technology', 'copywriting'],
        applicationsCount: 18,
        viewsCount: 234,
        isUrgent: false,
        isFeatured: false,
        attachments: [],
        questions: [
          'Do you have experience writing about technology topics?',
          'How do you ensure SEO best practices in your writing?',
          'Can you provide samples of technical blog posts you\'ve written?'
        ],
        createdAt: new Date('2024-06-10'),
        updatedAt: new Date('2024-07-20')
      },

      // WordPress Development Project
      {
        title: 'WordPress Website Redesign & Optimization',
        description: 'Looking for a WordPress developer to redesign and optimize our company website. The project includes creating a modern, responsive design, improving site speed, implementing SEO best practices, setting up analytics, and ensuring security. Experience with custom themes and plugins required.',
        category: 'Web Development',
        subcategory: 'WordPress Development',
        budget: {
          type: 'fixed',
          amount: 4500,
          currency: 'USD'
        },
        duration: {
          type: 'weeks',
          value: 6
        },
        skillsRequired: ['WordPress', 'PHP', 'CSS', 'JavaScript', 'SEO', 'Page Speed Optimization'],
        experienceLevel: 'intermediate',
        projectType: 'web_development',
        status: 'active',
        postedBy: clients[2]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'Germany',
          timezone: 'Europe/Berlin'
        },
        requirements: {
          portfolio: true,
          interview: true,
          testProject: false,
          availability: '25 hours/week',
          startDate: new Date('2024-08-12'),
          preferredTimezone: 'Europe/Berlin'
        },
        features: [
          'Custom WordPress theme development',
          'Responsive design implementation',
          'Page speed optimization',
          'SEO optimization',
          'Contact forms and lead generation',
          'Google Analytics setup',
          'Security hardening',
          'Content migration',
          'Admin training'
        ],
        tags: ['wordpress', 'php', 'web-development', 'seo', 'responsive-design'],
        applicationsCount: 22,
        viewsCount: 167,
        isUrgent: true,
        isFeatured: false,
        attachments: [],
        questions: [
          'How many WordPress websites have you built or redesigned?',
          'What\'s your approach to WordPress security?',
          'How do you ensure optimal page loading speeds?'
        ],
        createdAt: new Date('2024-07-28'),
        updatedAt: new Date('2024-07-28')
      },

      // Logo Design Project
      {
        title: 'Professional Logo Design for Tech Startup',
        description: 'Need a creative designer to create a modern, professional logo for our AI technology startup. Looking for multiple concepts, variations, and final files in all formats. The logo should convey innovation, trust, and technological advancement.',
        category: 'Design',
        subcategory: 'Logo Design',
        budget: {
          type: 'fixed',
          amount: 800,
          currency: 'USD'
        },
        duration: {
          type: 'weeks',
          value: 2
        },
        skillsRequired: ['Logo Design', 'Brand Identity', 'Adobe Illustrator', 'Graphic Design'],
        experienceLevel: 'intermediate',
        projectType: 'design',
        status: 'completed',
        postedBy: clients[0]._id,
        visibility: 'public',
        location: {
          type: 'remote',
          country: 'United States',
          timezone: 'America/Pacific'
        },
        requirements: {
          portfolio: true,
          interview: false,
          testProject: false,
          availability: '10 hours/week',
          startDate: new Date('2024-06-20'),
          preferredTimezone: 'America/Pacific'
        },
        features: [
          '5 initial logo concepts',
          '3 rounds of revisions',
          'Final logo in multiple formats',
          'Color and black/white versions',
          'Brand guidelines document',
          'Business card design',
          'Social media profile versions',
          'Vector and raster files'
        ],
        tags: ['logo-design', 'branding', 'graphic-design', 'illustrator'],
        applicationsCount: 35,
        viewsCount: 445,
        isUrgent: false,
        isFeatured: true,
        attachments: [],
        questions: [
          'Can you show examples of logos you\'ve designed for tech companies?',
          'What\'s your design process from concept to final delivery?',
          'How many revision rounds are included in your package?'
        ],
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-07-05')
      }
    ];

    return this.projectModel.insertMany(projects);
  }

  async drop(): Promise<any> {
    return this.projectModel.deleteMany({});
  }
}
