import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { Proposal, ProposalDocument } from '../schemas/proposal.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class ProposalsSeeder implements Seeder {
  constructor(
    @InjectModel(Proposal.name) private readonly proposalModel: Model<ProposalDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed(): Promise<any> {
    // Check if proposals already exist
    const existingProposals = await this.proposalModel.find().exec();
    if (existingProposals.length > 0) {
      console.log(`Found ${existingProposals.length} existing proposals. Skipping proposal seeding.`);
      return;
    }

    // Get freelancers and projects
    const freelancers = await this.userModel.find({ roles: 'freelancer' }).exec();
    const projects = await this.projectModel.find().exec();
    
    if (freelancers.length === 0 || projects.length === 0) {
      throw new Error('No freelancers or projects found. Please seed users and projects first.');
    }

    const proposals = [
      // Proposal 1: Full Stack Developer for E-commerce Platform
      {
        projectId: projects[0]._id, // E-commerce Platform
        freelancerId: freelancers[0]._id, // Alex Rodriguez - Full Stack Developer
        coverLetter: `Hi there! I'm excited about your e-commerce platform project. With over 5 years of full-stack development experience, I've built several e-commerce solutions using React, Node.js, and MongoDB - exactly the tech stack you're looking for.

I recently completed a similar project where I developed a complete e-commerce platform with all the features you mentioned: user authentication, product catalog, shopping cart, Stripe payment integration, and admin dashboard. The client was thrilled with the results and saw a 40% increase in conversions.

My approach for your project:
• Week 1-2: Set up project structure, user authentication, and basic frontend
• Week 3-4: Implement product catalog, search, and shopping cart
• Week 5-6: Integrate payment processing and order management
• Week 7-8: Build admin dashboard, testing, and deployment

I'm available to start immediately and can dedicate 40 hours per week to ensure timely delivery. I believe in clean, maintainable code and excellent communication throughout the project.

Looking forward to discussing your project in detail!`,
        
        bid: {
          amount: 7500,
          currency: 'USD',
          type: 'fixed'
        },
        
        timeline: {
          duration: 7,
          unit: 'weeks',
          milestones: [
            {
              title: 'Project Setup & Authentication',
              description: 'Set up project structure, user registration/login, and basic frontend',
              duration: 2,
              amount: 1500
            },
            {
              title: 'Product Catalog & Shopping Cart',
              description: 'Implement product listing, search, filters, and shopping cart functionality',
              duration: 2,
              amount: 2000
            },
            {
              title: 'Payment & Order Management',
              description: 'Integrate Stripe payments and build order management system',
              duration: 2,
              amount: 2000
            },
            {
              title: 'Admin Dashboard & Deployment',
              description: 'Build admin panel, testing, and deploy to production',
              duration: 1,
              amount: 2000
            }
          ]
        },
        
        skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Stripe API'],
        
        portfolio: [
          {
            title: 'ShopEasy E-commerce Platform',
            description: 'Full-stack e-commerce solution with React and Node.js',
            url: 'https://shopeasy-demo.example.com',
            image: 'https://via.placeholder.com/400x300'
          }
        ],
        
        questions: [
          {
            question: 'How many years of experience do you have with React and Node.js?',
            answer: 'I have 5+ years of experience with both React and Node.js. I\'ve been working with React since version 16 and have built numerous full-stack applications using the MERN stack.'
          },
          {
            question: 'Can you provide examples of e-commerce platforms you\'ve built?',
            answer: 'Yes! I\'ve built 3 major e-commerce platforms in the past 2 years. My most recent project was ShopEasy, which handles 10k+ products and processes 500+ orders daily. I can share the demo link and case study.'
          },
          {
            question: 'What is your approach to handling payment security?',
            answer: 'I use Stripe for secure payment processing, implement HTTPS everywhere, validate all inputs, use secure session management, and follow PCI compliance best practices. I never store sensitive card data on our servers.'
          }
        ],
        
        attachments: [
          {
            name: 'E-commerce_Project_Portfolio.pdf',
            url: 'https://example.com/portfolio.pdf',
            size: 2048000,
            type: 'application/pdf'
          }
        ],
        
        status: 'pending',
        isShortlisted: true,
        clientViewed: true,
        
        submittedAt: new Date('2024-07-21'),
        updatedAt: new Date('2024-07-21')
      },

      // Proposal 2: UI/UX Designer for FinTech App
      {
        projectId: projects[1]._id, // FinTech Mobile App
        freelancerId: freelancers[1]._id, // Priya Sharma - UI/UX Designer
        coverLetter: `Hello! I'm thrilled about the opportunity to design your FinTech mobile app. As a UI/UX designer with 4+ years of experience, I specialize in creating intuitive, secure, and beautiful financial applications.

I recently designed a mobile banking app for a credit union that increased user engagement by 60% and reduced customer support tickets by 35%. I understand the unique challenges of FinTech design - balancing security with usability, building trust through design, and creating accessible experiences for all users.

My design process for your project:
• Week 1: User research, competitive analysis, and user personas
• Week 2: Information architecture and user flow mapping
• Week 3: Wireframing and low-fidelity prototypes
• Week 4: High-fidelity designs, prototyping, and design system

I'll deliver:
- Complete UI designs for all screens
- Interactive prototypes for testing
- Design system and component library
- Accessibility compliance documentation
- Handoff assets for development

I'm passionate about creating designs that users love and businesses thrive with. Let's build something amazing together!`,
        
        bid: {
          amount: 3200,
          currency: 'USD',
          type: 'fixed'
        },
        
        timeline: {
          duration: 4,
          unit: 'weeks',
          milestones: [
            {
              title: 'Research & Strategy',
              description: 'User research, competitive analysis, and design strategy',
              duration: 1,
              amount: 800
            },
            {
              title: 'Wireframes & User Flows',
              description: 'Information architecture and wireframe creation',
              duration: 1,
              amount: 800
            },
            {
              title: 'UI Design & Prototyping',
              description: 'High-fidelity designs and interactive prototypes',
              duration: 1.5,
              amount: 1200
            },
            {
              title: 'Design System & Handoff',
              description: 'Component library and developer handoff',
              duration: 0.5,
              amount: 400
            }
          ]
        },
        
        skills: ['Figma', 'UI Design', 'UX Design', 'Mobile Design', 'Prototyping', 'User Research'],
        
        portfolio: [
          {
            title: 'CreditMax Mobile Banking App',
            description: 'Complete UI/UX design for a mobile banking application',
            url: 'https://dribbble.com/shots/creditmax-app',
            image: 'https://via.placeholder.com/400x300'
          },
          {
            title: 'InvestSmart Portfolio Tracker',
            description: 'Investment tracking app with complex data visualization',
            url: 'https://behance.net/investsmart-design',
            image: 'https://via.placeholder.com/400x300'
          }
        ],
        
        questions: [
          {
            question: 'Do you have experience designing for financial applications?',
            answer: 'Yes! I\'ve designed 3 financial applications including a mobile banking app, investment tracker, and expense management tool. I understand compliance requirements, security considerations, and user trust factors in FinTech.'
          },
          {
            question: 'How do you approach user research and testing?',
            answer: 'I start with stakeholder interviews, conduct user surveys, create personas, and do competitive analysis. For testing, I use tools like Maze and UserTesting for prototype validation and iterate based on feedback.'
          },
          {
            question: 'Can you show examples of mobile app designs you\'ve created?',
            answer: 'Absolutely! My portfolio includes several mobile apps. I can share my Dribbble and Behance profiles with detailed case studies showing my design process and results achieved.'
          }
        ],
        
        attachments: [
          {
            name: 'FinTech_Design_Portfolio.pdf',
            url: 'https://example.com/fintech-portfolio.pdf',
            size: 5120000,
            type: 'application/pdf'
          }
        ],
        
        status: 'accepted',
        isShortlisted: true,
        clientViewed: true,
        
        submittedAt: new Date('2024-07-26'),
        updatedAt: new Date('2024-07-28')
      },

      // Proposal 3: Mobile Developer for Food Delivery App
      {
        projectId: projects[2]._id, // Food Delivery App
        freelancerId: freelancers[2]._id, // Carlos Silva - Mobile Developer
        coverLetter: `Hi! I'm excited about your food delivery app project. As a senior mobile developer with 6+ years of experience in React Native and Flutter, I've built several successful food delivery and marketplace applications.

I recently developed "QuickEats" - a food delivery app that now serves 50k+ users across 3 cities. The app includes all the features you mentioned: real-time tracking, payment integration, push notifications, and more. I achieved 4.8-star ratings on both iOS and Android app stores.

Why choose me for your project:
✅ Expert in React Native & Flutter
✅ Extensive experience with food delivery apps
✅ Firebase integration specialist
✅ Real-time features implementation
✅ Payment gateway integration (Stripe, PayPal)
✅ 95% on-time delivery rate

My development approach:
• Phase 1: Core app structure and user authentication
• Phase 2: Restaurant listings and menu system
• Phase 3: Ordering flow and payment integration
• Phase 4: Real-time tracking and notifications
• Phase 5: Testing, optimization, and app store deployment

I'm available to start immediately and can work in your timezone. Let's create an amazing food delivery experience together!`,
        
        bid: {
          amount: 70,
          currency: 'USD',
          type: 'hourly'
        },
        
        timeline: {
          duration: 12,
          unit: 'weeks',
          milestones: [
            {
              title: 'App Foundation & Auth',
              description: 'Project setup, user authentication, and basic navigation',
              duration: 2,
              amount: 5600
            },
            {
              title: 'Restaurant & Menu System',
              description: 'Restaurant listings, search, filters, and menu display',
              duration: 3,
              amount: 8400
            },
            {
              title: 'Ordering & Payments',
              description: 'Cart functionality, checkout flow, and payment integration',
              duration: 3,
              amount: 8400
            },
            {
              title: 'Real-time Features',
              description: 'Order tracking, push notifications, and chat support',
              duration: 2,
              amount: 5600
            },
            {
              title: 'Testing & Deployment',
              description: 'App testing, optimization, and app store submission',
              duration: 2,
              amount: 5600
            }
          ]
        },
        
        skills: ['React Native', 'Flutter', 'Firebase', 'Payment Integration', 'Google Maps API', 'Push Notifications'],
        
        portfolio: [
          {
            title: 'QuickEats Food Delivery',
            description: 'Complete food delivery app with 50k+ active users',
            url: 'https://apps.apple.com/quickeats',
            image: 'https://via.placeholder.com/400x300'
          },
          {
            title: 'MarketPlace Grocery App',
            description: 'Grocery delivery app with real-time tracking',
            url: 'https://play.google.com/marketplace-grocery',
            image: 'https://via.placeholder.com/400x300'
          }
        ],
        
        questions: [
          {
            question: 'Which framework do you prefer: React Native or Flutter, and why?',
            answer: 'I\'m proficient in both, but for food delivery apps, I prefer React Native because of its excellent ecosystem for location services, payment integration, and push notifications. However, I can work with either based on your preference.'
          },
          {
            question: 'How do you handle real-time features like order tracking?',
            answer: 'I use Firebase Realtime Database or Socket.io for real-time updates, combined with Google Maps SDK for live tracking. I implement efficient polling strategies and optimize battery usage for location tracking.'
          },
          {
            question: 'What\'s your experience with payment gateway integration?',
            answer: 'I\'ve integrated multiple payment gateways including Stripe, PayPal, Razorpay, and local payment methods. I ensure PCI compliance, handle edge cases, and implement secure payment flows with proper error handling.'
          }
        ],
        
        attachments: [
          {
            name: 'Mobile_Apps_Portfolio.pdf',
            url: 'https://example.com/mobile-portfolio.pdf',
            size: 3072000,
            type: 'application/pdf'
          }
        ],
        
        status: 'pending',
        isShortlisted: true,
        clientViewed: true,
        
        submittedAt: new Date('2024-07-12'),
        updatedAt: new Date('2024-07-15')
      },

      // Proposal 4: Data Scientist for Customer Analytics
      {
        projectId: projects[3]._id, // Customer Analytics Project
        freelancerId: freelancers[3]._id, // Li Wei - Data Scientist
        coverLetter: `Hello! I'm excited about your customer analytics and ML project. As a data scientist with 5+ years of experience in machine learning and customer behavior analysis, I've helped numerous e-commerce companies increase retention and revenue through data-driven insights.

I recently completed a similar project for an online retailer where I built a churn prediction model with 94% accuracy and a recommendation system that increased sales by 28%. I specialize in turning complex data into actionable business insights.

My approach for your project:

📊 Data Analysis Phase (Weeks 1-2):
• Comprehensive data exploration and quality assessment
• Customer behavior pattern identification
• Statistical analysis and visualization

🤖 Model Development Phase (Weeks 3-4):
• Feature engineering and selection
• Customer segmentation using clustering algorithms
• Churn prediction model development and validation

📈 Implementation Phase (Weeks 5-6):
• Recommendation system development
• Model deployment and monitoring setup
• Interactive dashboard creation
• Comprehensive documentation and training

Deliverables:
✅ Clean, well-documented Python code
✅ Trained ML models with performance metrics
✅ Interactive Tableau/PowerBI dashboard
✅ Detailed analysis reports and insights
✅ Model deployment guide and maintenance plan

I'm passionate about turning data into business value. Let's unlock the insights hidden in your customer data!`,
        
        bid: {
          amount: 5800,
          currency: 'USD',
          type: 'fixed'
        },
        
        timeline: {
          duration: 6,
          unit: 'weeks',
          milestones: [
            {
              title: 'Data Exploration & Analysis',
              description: 'Data cleaning, EDA, and initial insights',
              duration: 2,
              amount: 1800
            },
            {
              title: 'Customer Segmentation',
              description: 'Clustering analysis and customer profiling',
              duration: 1.5,
              amount: 1500
            },
            {
              title: 'Churn Prediction Model',
              description: 'ML model development and validation',
              duration: 1.5,
              amount: 1500
            },
            {
              title: 'Recommendation System',
              description: 'Build and test recommendation algorithms',
              duration: 1,
              amount: 1000
            }
          ]
        },
        
        skills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Data Visualization', 'SQL'],
        
        portfolio: [
          {
            title: 'E-commerce Customer Analytics',
            description: 'Complete customer behavior analysis and churn prediction',
            url: 'https://github.com/liwei/customer-analytics',
            image: 'https://via.placeholder.com/400x300'
          },
          {
            title: 'Retail Recommendation Engine',
            description: 'ML-powered product recommendation system',
            url: 'https://github.com/liwei/recommendation-engine',
            image: 'https://via.placeholder.com/400x300'
          }
        ],
        
        questions: [
          {
            question: 'What machine learning frameworks do you prefer for this type of project?',
            answer: 'I primarily use Python with scikit-learn for traditional ML algorithms and TensorFlow/PyTorch for deep learning. For this project, I\'d use scikit-learn for clustering and classification, pandas for data manipulation, and matplotlib/seaborn for visualization.'
          },
          {
            question: 'How do you approach feature engineering for customer data?',
            answer: 'I start with domain knowledge, create RFM features, calculate behavioral metrics, engineer time-based features, and use techniques like polynomial features and interaction terms. I always validate feature importance and avoid data leakage.'
          },
          {
            question: 'Can you provide examples of similar analytics projects you\'ve completed?',
            answer: 'Yes! I\'ve completed 5+ customer analytics projects. Notable ones include a churn prediction model for a SaaS company (92% accuracy) and a customer lifetime value model for an e-commerce platform that improved marketing ROI by 35%.'
          }
        ],
        
        attachments: [
          {
            name: 'Data_Science_Portfolio.pdf',
            url: 'https://example.com/ds-portfolio.pdf',
            size: 4096000,
            type: 'application/pdf'
          }
        ],
        
        status: 'pending',
        isShortlisted: false,
        clientViewed: true,
        
        submittedAt: new Date('2024-07-31'),
        updatedAt: new Date('2024-07-31')
      },

      // Proposal 5: Content Writer for Tech Blog
      {
        projectId: projects[4]._id, // Tech Blog Content
        freelancerId: freelancers[4]._id, // Emma Thompson - Content Writer
        coverLetter: `Hi! I'm excited about the opportunity to create engaging tech blog content for your company. As a content writer with 3+ years of experience in technology writing, I specialize in making complex technical topics accessible and engaging for diverse audiences.

I recently completed a similar project for a software development company where I wrote 25 technical articles that increased their organic traffic by 150% and generated 200+ qualified leads. I understand how to balance technical accuracy with readability while optimizing for SEO.

My content creation process:

🔍 Research & Planning (Week 1):
• Topic research and keyword analysis
• Competitor content analysis
• Content calendar creation
• SEO strategy development

✍️ Content Creation (Weeks 2-4):
• Write 20 high-quality articles (1500-2000 words each)
• Technical accuracy verification
• SEO optimization with target keywords
• Engaging headlines and meta descriptions

📈 Optimization & Delivery (Week 5):
• Internal linking strategy implementation
• Image suggestions and alt text
• Social media promotion snippets
• Performance tracking setup

Each article will include:
✅ Original, well-researched content
✅ SEO-optimized with target keywords
✅ Engaging headlines and introductions
✅ Technical accuracy and credibility
✅ Call-to-action and lead generation focus
✅ Social media ready snippets

I'm passionate about technology and skilled at translating technical concepts into compelling content that drives results. Let's grow your audience together!`,
        
        bid: {
          amount: 2200,
          currency: 'USD',
          type: 'fixed'
        },
        
        timeline: {
          duration: 5,
          unit: 'weeks',
          milestones: [
            {
              title: 'Research & Strategy',
              description: 'Content strategy, keyword research, and topic planning',
              duration: 1,
              amount: 400
            },
            {
              title: 'Content Creation - Batch 1',
              description: 'First 10 articles with SEO optimization',
              duration: 2,
              amount: 900
            },
            {
              title: 'Content Creation - Batch 2',
              description: 'Remaining 10 articles with optimization',
              duration: 1.5,
              amount: 700
            },
            {
              title: 'Final Review & Optimization',
              description: 'Content review, linking strategy, and delivery',
              duration: 0.5,
              amount: 200
            }
          ]
        },
        
        skills: ['Content Writing', 'SEO', 'Blog Writing', 'Technology Writing', 'Research'],
        
        portfolio: [
          {
            title: 'TechCorp Blog Series',
            description: '25-article series on software development and AI',
            url: 'https://techcorp.com/blog/author/emma',
            image: 'https://via.placeholder.com/400x300'
          },
          {
            title: 'DevTools Weekly Newsletter',
            description: 'Weekly technical content for developer audience',
            url: 'https://devtools-weekly.com',
            image: 'https://via.placeholder.com/400x300'
          }
        ],
        
        questions: [
          {
            question: 'Do you have experience writing about technology topics?',
            answer: 'Yes! I\'ve been writing about technology for 3+ years, covering topics like AI, blockchain, web development, cybersecurity, and digital transformation. I have a computer science background which helps me understand technical concepts deeply.'
          },
          {
            question: 'How do you ensure SEO best practices in your writing?',
            answer: 'I use tools like SEMrush and Ahrefs for keyword research, optimize title tags and meta descriptions, include target keywords naturally, create proper heading structures, and focus on search intent and user experience.'
          },
          {
            question: 'Can you provide samples of technical blog posts you\'ve written?',
            answer: 'Absolutely! I can share my published articles on topics like "Machine Learning for Beginners", "Blockchain in Supply Chain", and "Web Development Trends 2024". All are available in my portfolio with performance metrics.'
          }
        ],
        
        attachments: [
          {
            name: 'Writing_Samples_Portfolio.pdf',
            url: 'https://example.com/writing-samples.pdf',
            size: 1536000,
            type: 'application/pdf'
          }
        ],
        
        status: 'accepted',
        isShortlisted: true,
        clientViewed: true,
        
        submittedAt: new Date('2024-06-12'),
        updatedAt: new Date('2024-06-15')
      }
    ];

    return this.proposalModel.insertMany(proposals);
  }

  async drop(): Promise<any> {
    return this.proposalModel.deleteMany({});
  }
}
