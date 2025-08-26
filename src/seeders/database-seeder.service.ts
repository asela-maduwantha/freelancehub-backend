import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { FreelancerProfile } from '../schemas/freelancer-profile.schema';
import { Project } from '../schemas/project.schema';
import { Proposal } from '../schemas/proposal.schema';
import { Review } from '../schemas/review.schema';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(FreelancerProfile.name) private freelancerProfileModel: Model<FreelancerProfile>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Proposal.name) private proposalModel: Model<Proposal>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async clearDatabase() {
    console.log('🗑️ Clearing database...');
    await Promise.all([
      this.notificationModel.deleteMany({}).exec(),
      this.reviewModel.deleteMany({}).exec(),
      this.proposalModel.deleteMany({}).exec(),
      this.projectModel.deleteMany({}).exec(),
      this.freelancerProfileModel.deleteMany({}).exec(),
      this.userModel.deleteMany({}).exec(),
    ]);
    console.log('✅ Database cleared successfully');
  }

  async seedAll() {
    await this.clearDatabase();
    await this.seedUsers();
    await this.seedFreelancerProfiles();
    await this.seedProjects();
    await this.seedProposals();
    await this.seedReviews();
    await this.seedNotifications();
    console.log('🎉 Database seeding completed successfully!');
  }

  async seedUsers() {
    console.log('🌱 Seeding users...');
    
    const users = [
      // Admin User - using client role in array but admin in single role field
      {
        username: 'admin',
        email: 'admin@freelancehub.com',
        password: await bcrypt.hash('admin123', 10),
        roles: ['client'], // Schema only allows freelancer/client in roles array
        role: 'admin', // But single role field allows admin
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System administrator with full access to the platform.',
          avatar: 'https://example.com/admin-avatar.jpg',
          location: {
            country: 'United States',
            city: 'San Francisco',
            coordinates: [-122.4194, 37.7749]
          },
          contactInfo: {
            phone: '+1-555-0001',
            website: 'https://freelancehub.com'
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
        },
        status: 'active',
        isActive: true,
      },
      // Client Users
      {
        username: 'johnsmith',
        email: 'john.smith@techcorp.com',
        password: await bcrypt.hash('client123', 10),
        roles: ['client'],
        role: 'client',
        profile: {
          firstName: 'John',
          lastName: 'Smith',
          bio: 'CEO of TechCorp, looking for talented developers to build innovative solutions.',
          avatar: 'https://example.com/john-avatar.jpg',
          location: {
            country: 'United States',
            city: 'Austin',
            coordinates: [-97.7431, 30.2672]
          },
          contactInfo: {
            phone: '+1-555-0002',
            website: 'https://techcorp.com'
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: false,
        },
        status: 'active',
        isActive: true,
      },
      {
        username: 'sarahjones',
        email: 'sarah.jones@designstudio.com',
        password: await bcrypt.hash('client123', 10),
        roles: ['client'],
        role: 'client',
        profile: {
          firstName: 'Sarah',
          lastName: 'Jones',
          bio: 'Creative director seeking talented designers and developers for various projects.',
          avatar: 'https://example.com/sarah-avatar.jpg',
          location: {
            country: 'Canada',
            city: 'Toronto',
            coordinates: [-79.3832, 43.6532]
          },
          contactInfo: {
            phone: '+1-416-555-0003',
            website: 'https://designstudio.com'
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
        },
        status: 'active',
        isActive: true,
      },
      // Freelancer Users
      {
        username: 'alexdev',
        email: 'alex.martinez@email.com',
        password: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'Alex',
          lastName: 'Martinez',
          bio: 'Full-stack developer with 5+ years experience in React, Node.js, and Python.',
          avatar: 'https://example.com/alex-avatar.jpg',
          location: {
            country: 'Spain',
            city: 'Barcelona',
            coordinates: [2.1734, 41.3851]
          },
          contactInfo: {
            phone: '+34-666-123-456',
            website: 'https://alexdev.portfolio.com'
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true,
        },
        status: 'active',
        isActive: true,
      },
      {
        username: 'emilydesign',
        email: 'emily.chen@email.com',
        password: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'Emily',
          lastName: 'Chen',
          bio: 'UI/UX designer passionate about creating beautiful and functional user experiences.',
          avatar: 'https://example.com/emily-avatar.jpg',
          location: {
            country: 'United States',
            city: 'Los Angeles',
            coordinates: [-118.2437, 34.0522]
          },
          contactInfo: {
            phone: '+1-555-0005',
            website: 'https://emilydesign.com'
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: false,
          identityVerified: true,
        },
        status: 'active',
        isActive: true,
      },
    ];

    // Insert users one by one to avoid unique index conflicts
    for (const userData of users) {
      await this.userModel.create(userData);
    }
    console.log('✅ Users seeded successfully');
  }

  async seedFreelancerProfiles() {
    console.log('🌱 Seeding freelancer profiles...');
    
    // Get freelancer users
    const freelancers = await this.userModel.find({ roles: { $in: ['freelancer'] } });
    
    if (freelancers.length === 0) {
      console.log('❌ No freelancers found, skipping profiles');
      return;
    }

    const profiles = [
      {
        userId: freelancers[0]._id, // Alex Martinez
        professional: {
          title: 'Full-Stack Developer',
          description: 'Experienced full-stack developer specializing in modern web technologies. I have 5+ years of experience building scalable web applications using React, Node.js, and Python.',
          experience: 'expert',
          availability: 'available',
          workingHours: {
            timezone: 'Europe/Madrid',
            schedule: {
              monday: { start: '09:00', end: '17:00', available: true },
              tuesday: { start: '09:00', end: '17:00', available: true },
              wednesday: { start: '09:00', end: '17:00', available: true },
              thursday: { start: '09:00', end: '17:00', available: true },
              friday: { start: '09:00', end: '17:00', available: true },
              saturday: { start: '10:00', end: '14:00', available: false },
              sunday: { start: '10:00', end: '14:00', available: false }
            }
          }
        },
        skills: {
          primary: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
          secondary: ['Python', 'PostgreSQL', 'MongoDB'],
          categories: ['web-development', 'backend-development', 'frontend-development'],
          detailed: [
            { name: 'JavaScript', level: 'expert', yearsOfExperience: 6 },
            { name: 'React', level: 'expert', yearsOfExperience: 5 },
            { name: 'Node.js', level: 'expert', yearsOfExperience: 5 },
            { name: 'Python', level: 'advanced', yearsOfExperience: 3 }
          ]
        },
        portfolio: [
          {
            title: 'E-commerce Platform',
            description: 'Built a complete e-commerce solution using React and Node.js with payment integration and admin panel.',
            images: ['https://example.com/portfolio1.jpg'],
            liveUrl: 'https://demo-ecommerce.alexdev.com',
            repositoryUrl: 'https://github.com/alexdev/ecommerce',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            completedAt: new Date('2024-01-15'),
            category: 'web-development',
            isPublic: true
          },
          {
            title: 'Task Management App',
            description: 'Developed a collaborative task management application with real-time updates and team collaboration features.',
            images: ['https://example.com/portfolio2.jpg'],
            liveUrl: 'https://taskapp.alexdev.com',
            repositoryUrl: 'https://github.com/alexdev/taskapp',
            technologies: ['React', 'Node.js', 'Socket.io', 'PostgreSQL'],
            completedAt: new Date('2024-02-20'),
            category: 'web-development',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: {
            min: 50,
            max: 85,
            currency: 'USD'
          }
        },
        education: [{
          institution: 'Universidad Politécnica de Cataluña',
          degree: 'Bachelor of Computer Science',
          fieldOfStudy: 'Software Engineering',
          startYear: 2014,
          endYear: 2018,
          isCurrent: false
        }],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuingOrganization: 'Amazon Web Services',
            issueDate: new Date('2023-06-15'),
            expirationDate: new Date('2026-06-15')
          },
          {
            name: 'MongoDB Certified Developer',
            issuingOrganization: 'MongoDB Inc.',
            issueDate: new Date('2023-08-20'),
            expirationDate: new Date('2026-08-20')
          }
        ],
        languages: [
          { name: 'English', proficiency: 'fluent' },
          { name: 'Spanish', proficiency: 'native' }
        ],
        stats: {
          totalEarnings: 45000,
          totalProjects: 18,
          completedProjects: 16,
          ongoingProjects: 2,
          totalReviews: 14,
          averageRating: 4.8,
          successRate: 95,
          responseTime: 2,
          repeatClientRate: 40
        },
        isActive: true
      },
      {
        userId: freelancers[1]._id, // Emily Chen
        professional: {
          title: 'UI/UX Designer',
          description: 'Creative UI/UX designer passionate about creating beautiful and functional user experiences. I specialize in mobile and web design with a focus on user-centered design principles.',
          experience: 'intermediate',
          availability: 'available',
          workingHours: {
            timezone: 'America/Los_Angeles',
            schedule: {
              monday: { start: '10:00', end: '18:00', available: true },
              tuesday: { start: '10:00', end: '18:00', available: true },
              wednesday: { start: '10:00', end: '18:00', available: true },
              thursday: { start: '10:00', end: '18:00', available: true },
              friday: { start: '10:00', end: '16:00', available: true },
              saturday: { start: '10:00', end: '14:00', available: false },
              sunday: { start: '10:00', end: '14:00', available: false }
            }
          }
        },
        skills: {
          primary: ['UI Design', 'UX Design', 'Figma', 'Adobe XD'],
          secondary: ['Photoshop', 'Illustrator', 'Prototyping'],
          categories: ['design', 'user-experience', 'mobile-design'],
          detailed: [
            { name: 'Figma', level: 'expert', yearsOfExperience: 4 },
            { name: 'UI Design', level: 'advanced', yearsOfExperience: 5 },
            { name: 'UX Research', level: 'intermediate', yearsOfExperience: 3 },
            { name: 'Prototyping', level: 'advanced', yearsOfExperience: 4 }
          ]
        },
        portfolio: [
          {
            title: 'Mobile Banking App Design',
            description: 'Complete UI/UX design for a mobile banking application with focus on security and user experience.',
            images: ['https://example.com/portfolio3.jpg'],
            liveUrl: 'https://dribbble.com/emilydesign/banking',
            technologies: ['Figma', 'Principle', 'Adobe XD'],
            completedAt: new Date('2024-01-10'),
            category: 'mobile-design',
            isPublic: true
          },
          {
            title: 'SaaS Dashboard Redesign',
            description: 'Redesigned dashboard for better user experience with improved information architecture and visual hierarchy.',
            images: ['https://example.com/portfolio4.jpg'],
            liveUrl: 'https://behance.net/emilydesign/dashboard',
            technologies: ['Figma', 'Miro', 'UserTesting'],
            completedAt: new Date('2024-02-28'),
            category: 'web-design',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: {
            min: 40,
            max: 65,
            currency: 'USD'
          }
        },
        education: [{
          institution: 'Art Center College of Design',
          degree: 'Bachelor of Fine Arts',
          fieldOfStudy: 'Graphic Design',
          startYear: 2016,
          endYear: 2020,
          isCurrent: false
        }],
        certifications: [
          {
            name: 'Google UX Design Certificate',
            issuingOrganization: 'Google',
            issueDate: new Date('2023-03-10'),
            expirationDate: new Date('2026-03-10')
          },
          {
            name: 'Adobe Certified Expert',
            issuingOrganization: 'Adobe',
            issueDate: new Date('2023-09-15'),
            expirationDate: new Date('2025-09-15')
          }
        ],
        languages: [
          { name: 'English', proficiency: 'native' },
          { name: 'Mandarin', proficiency: 'conversational' }
        ],
        stats: {
          totalEarnings: 28000,
          totalProjects: 12,
          completedProjects: 11,
          ongoingProjects: 1,
          totalReviews: 9,
          averageRating: 4.6,
          successRate: 92,
          responseTime: 4,
          repeatClientRate: 25
        },
        isActive: true
      }
    ];

    await this.freelancerProfileModel.insertMany(profiles);
    console.log('✅ Freelancer profiles seeded successfully');
  }

  async seedProjects() {
    console.log('🌱 Seeding projects...');
    
    // Get client users
    const clients = await this.userModel.find({ roles: { $in: ['client'] } });
    
    if (clients.length === 0) {
      console.log('❌ No clients found, skipping projects');
      return;
    }

    const projects = [
      {
        title: 'E-commerce Website Development',
        description: 'Need a modern e-commerce website built with React and Node.js. Must include payment integration, user authentication, and admin panel. The website should be responsive, fast, and SEO optimized. We need shopping cart functionality, product catalog, order management, and customer account features.',
        clientId: clients[0]._id,
        category: 'web-development',
        subcategory: 'full-stack-development',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Payment Integration', 'JavaScript'],
        type: 'fixed',
        budget: {
          amount: 5000,
          currency: 'USD',
          type: 'fixed'
        },
        timeline: {
          duration: 60,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isUrgent: false,
          isFlexible: true
        },
        requirements: {
          mustHaveSkills: ['React', 'Node.js', 'MongoDB'],
          niceToHaveSkills: ['Redux', 'TypeScript', 'AWS'],
          experienceLevel: 'intermediate',
          minimumRating: 4.0,
          minimumCompletedProjects: 5,
          preferredLanguages: ['English']
        },
        status: 'open',
        visibility: 'public',
        attachments: [],
        tags: ['ecommerce', 'react', 'nodejs', 'mongodb'],
        views: 45,
        publishedAt: new Date(),
        isUrgent: false,
        isFeatured: false
      },
      {
        title: 'Mobile App UI/UX Design',
        description: 'Looking for a talented designer to create modern UI/UX designs for our fitness tracking mobile app. Need complete wireframes, user flows, high-fidelity mockups, and interactive prototypes. The design should be clean, modern, and user-friendly with focus on accessibility and usability.',
        clientId: clients[1]._id,
        category: 'design',
        subcategory: 'mobile-design',
        requiredSkills: ['UI Design', 'UX Design', 'Figma', 'Mobile Design', 'Prototyping'],
        type: 'hourly',
        budget: {
          amount: 50,
          currency: 'USD',
          type: 'hourly'
        },
        timeline: {
          duration: 30,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isUrgent: true,
          isFlexible: false
        },
        requirements: {
          mustHaveSkills: ['UI Design', 'UX Design', 'Figma'],
          niceToHaveSkills: ['Adobe XD', 'Principle', 'After Effects'],
          experienceLevel: 'intermediate',
          minimumRating: 4.5,
          minimumCompletedProjects: 3,
          preferredLanguages: ['English']
        },
        status: 'open',
        visibility: 'public',
        attachments: [],
        tags: ['ui', 'ux', 'mobile', 'fitness', 'app'],
        views: 32,
        publishedAt: new Date(),
        isUrgent: true,
        isFeatured: true
      },
      {
        title: 'API Development and Integration',
        description: 'Need to develop RESTful APIs and integrate with third-party services for our existing platform. The project includes creating new endpoints, optimizing existing ones, implementing authentication, rate limiting, and comprehensive documentation. Experience with microservices architecture is preferred.',
        clientId: clients[0]._id,
        category: 'backend-development',
        subcategory: 'api-development',
        requiredSkills: ['Node.js', 'Express', 'API Development', 'Third-party Integration', 'MongoDB'],
        type: 'fixed',
        budget: {
          amount: 3000,
          currency: 'USD',
          type: 'fixed'
        },
        timeline: {
          duration: 45,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          isUrgent: false,
          isFlexible: true
        },
        requirements: {
          mustHaveSkills: ['Node.js', 'Express', 'API Development'],
          niceToHaveSkills: ['GraphQL', 'Docker', 'AWS'],
          experienceLevel: 'expert',
          minimumRating: 4.2,
          minimumCompletedProjects: 8,
          preferredLanguages: ['English']
        },
        status: 'in_progress',
        visibility: 'public',
        attachments: [],
        tags: ['api', 'backend', 'nodejs', 'integration'],
        views: 28,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isUrgent: false,
        isFeatured: false
      }
    ];

    await this.projectModel.insertMany(projects);
    console.log('✅ Projects seeded successfully');
  }

  async seedProposals() {
    console.log('🌱 Seeding proposals...');
    
    const projects = await this.projectModel.find();
    const freelancers = await this.userModel.find({ roles: { $in: ['freelancer'] } });
    
    if (projects.length === 0 || freelancers.length === 0) {
      console.log('❌ No projects or freelancers found, skipping proposals');
      return;
    }

    const proposals = [
      {
        projectId: projects[0]._id, // E-commerce Website Development
        freelancerId: freelancers[0]._id, // Alex Martinez
        coverLetter: 'I am excited to work on your e-commerce project. With 5+ years of experience in React and Node.js, I can deliver a high-quality solution within your timeline. I have successfully built similar e-commerce platforms with payment integration, user authentication, and admin panels. I\'ll ensure your website is responsive, fast, and SEO optimized with all the features you need.',
        pricing: {
          amount: 4800,
          currency: 'USD',
          type: 'fixed',
          breakdown: 'Frontend Development (React): $2000, Backend Development (Node.js): $1800, Payment Integration: $600, Testing & Deployment: $400'
        },
        timeline: {
          deliveryTime: 56, // 8 weeks in days
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Start in 1 week
          milestones: [
            {
              title: 'Frontend Development',
              description: 'Complete React frontend with responsive design',
              deliveryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              amount: 2000
            },
            {
              title: 'Backend & Integration',
              description: 'Backend APIs and payment integration',
              deliveryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
              amount: 2400
            },
            {
              title: 'Testing & Deployment',
              description: 'Final testing and deployment',
              deliveryDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
              amount: 400
            }
          ]
        },
        status: 'pending',
        attachments: []
      },
      {
        projectId: projects[1]._id, // Mobile App UI/UX Design
        freelancerId: freelancers[1]._id, // Emily Chen
        coverLetter: 'Hi! I specialize in mobile UI/UX design and would love to create amazing designs for your fitness app. I have experience designing user-friendly fitness applications with focus on accessibility and usability. Please check my portfolio for similar work. I can provide wireframes, user flows, high-fidelity mockups, and interactive prototypes.',
        pricing: {
          amount: 45,
          currency: 'USD',
          type: 'hourly',
          estimatedHours: 80,
          breakdown: 'Research & Wireframes: 20 hours, UI Design: 35 hours, Prototyping: 15 hours, Revisions: 10 hours'
        },
        timeline: {
          deliveryTime: 28, // 4 weeks in days
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Start in 3 days
          milestones: [
            {
              title: 'Research & Wireframes',
              description: 'User research and low-fidelity wireframes',
              deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
              amount: 900
            },
            {
              title: 'UI Design',
              description: 'High-fidelity mockups and design system',
              deliveryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              amount: 1575
            },
            {
              title: 'Prototyping',
              description: 'Interactive prototypes and final deliverables',
              deliveryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
              amount: 1125
            }
          ]
        },
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Accepted 2 days ago
        attachments: []
      },
      {
        projectId: projects[2]._id, // API Development and Integration
        freelancerId: freelancers[0]._id, // Alex Martinez
        coverLetter: 'I have extensive experience in API development and third-party integrations. I can start immediately and deliver within your deadline. My approach includes comprehensive documentation, rate limiting, authentication, and optimized performance. I have experience with microservices architecture and can implement scalable solutions.',
        pricing: {
          amount: 2800,
          currency: 'USD',
          type: 'fixed',
          breakdown: 'API Development: $1500, Third-party Integrations: $800, Documentation: $300, Testing: $200'
        },
        timeline: {
          deliveryTime: 42, // 6 weeks in days
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 1 week ago
          milestones: [
            {
              title: 'Core API Development',
              description: 'Main API endpoints and authentication',
              deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              amount: 1500
            },
            {
              title: 'Third-party Integration',
              description: 'Integration with external services',
              deliveryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
              amount: 800
            },
            {
              title: 'Documentation & Testing',
              description: 'Complete documentation and testing',
              deliveryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
              amount: 500
            }
          ]
        },
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // Accepted 6 days ago
        attachments: []
      }
    ];

    await this.proposalModel.insertMany(proposals);
    console.log('✅ Proposals seeded successfully');
  }

  async seedReviews() {
    console.log('🌱 Seeding reviews...');
    
    const users = await this.userModel.find();
    const projects = await this.projectModel.find();
    
    if (users.length === 0 || projects.length === 0) {
      console.log('❌ No users or projects found, skipping reviews');
      return;
    }

    // Create some mock contract IDs (using project IDs as references)
    const reviews = [
      {
        contractId: projects[2]._id, // Using project ID as contract reference for API Development project
        reviewerId: users.find(u => u.username === 'johnsmith')?._id,
        revieweeId: users.find(u => u.username === 'alexdev')?._id,
        type: 'client_to_freelancer',
        overallRating: 5,
        criteria: {
          communication: 5,
          quality: 5,
          timeliness: 4,
          professionalism: 5,
          expertise: 5,
          value: 4
        },
        comment: 'Excellent work! Alex delivered the API ahead of schedule and the code quality is outstanding. Communication was clear throughout the project and all requirements were met perfectly.',
        tags: ['excellent', 'professional', 'quality'],
        wouldRecommend: true,
        wouldWorkAgain: true,
        isPublic: true
      },
      {
        contractId: projects[2]._id, // Same project, freelancer reviewing client
        reviewerId: users.find(u => u.username === 'alexdev')?._id,
        revieweeId: users.find(u => u.username === 'johnsmith')?._id,
        type: 'freelancer_to_client',
        overallRating: 5,
        criteria: {
          communication: 5,
          quality: 5,
          timeliness: 5,
          professionalism: 5,
          expertise: 4,
          value: 5
        },
        comment: 'Great client to work with. Clear requirements and prompt communication throughout the project. Payment was made on time and feedback was constructive.',
        tags: ['great-client', 'clear-requirements', 'prompt-payment'],
        wouldRecommend: true,
        wouldWorkAgain: true,
        isPublic: true
      },
      {
        contractId: projects[1]._id, // Mobile App UI/UX Design project
        reviewerId: users.find(u => u.username === 'sarahjones')?._id,
        revieweeId: users.find(u => u.username === 'emilydesign')?._id,
        type: 'client_to_freelancer',
        overallRating: 4,
        criteria: {
          communication: 4,
          quality: 5,
          timeliness: 4,
          professionalism: 4,
          expertise: 5,
          value: 4
        },
        comment: 'Beautiful designs and great attention to detail. Minor revisions needed but overall very satisfied with the final deliverables. Emily has excellent design skills.',
        tags: ['creative', 'detailed', 'skilled'],
        wouldRecommend: true,
        wouldWorkAgain: true,
        isPublic: true
      },
      {
        contractId: projects[1]._id, // Same project, freelancer reviewing client
        reviewerId: users.find(u => u.username === 'emilydesign')?._id,
        revieweeId: users.find(u => u.username === 'sarahjones')?._id,
        type: 'freelancer_to_client',
        overallRating: 4,
        criteria: {
          communication: 4,
          quality: 4,
          timeliness: 4,
          professionalism: 4,
          expertise: 4,
          value: 4
        },
        comment: 'Good working relationship with clear project goals. Some feedback could have been more specific initially, but overall a positive experience.',
        tags: ['good-client', 'clear-goals'],
        wouldRecommend: true,
        wouldWorkAgain: true,
        isPublic: true
      }
    ];

    await this.reviewModel.insertMany(reviews);
    console.log('✅ Reviews seeded successfully');
  }

  async seedNotifications() {
    console.log('🌱 Seeding notifications...');
    
    const users = await this.userModel.find();
    const projects = await this.projectModel.find();
    
    if (users.length === 0) {
      console.log('❌ No users found, skipping notifications');
      return;
    }

    const notifications = [
      {
        userId: users.find(u => u.username === 'alexdev')?._id,
        title: 'New Project Posted',
        message: 'A new project matching your skills has been posted: E-commerce Website Development',
        type: 'project_posted',
        priority: 'medium',
        data: {
          projectId: projects[0]?._id,
          title: 'E-commerce Website Development',
          url: `/projects/${projects[0]?._id}`
        },
        isRead: false
      },
      {
        userId: users.find(u => u.username === 'johnsmith')?._id,
        title: 'Proposal Received',
        message: 'You received a new proposal for your project: E-commerce Website Development',
        type: 'proposal_received',
        priority: 'high',
        data: {
          projectId: projects[0]?._id,
          title: 'E-commerce Website Development',
          url: `/projects/${projects[0]?._id}/proposals`
        },
        isRead: false
      },
      {
        userId: users.find(u => u.username === 'emilydesign')?._id,
        title: 'Proposal Accepted',
        message: 'Your proposal for Mobile App UI/UX Design has been accepted!',
        type: 'proposal_accepted',
        priority: 'high',
        data: {
          projectId: projects[1]?._id,
          title: 'Mobile App UI/UX Design',
          url: `/projects/${projects[1]?._id}`
        },
        isRead: true,
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Read 1 day ago
      },
      {
        userId: users.find(u => u.username === 'sarahjones')?._id,
        title: 'Review Received',
        message: 'You received a new review from Emily Chen for the Mobile App UI/UX Design project.',
        type: 'review_received',
        priority: 'medium',
        data: {
          projectId: projects[1]?._id,
          title: 'Mobile App UI/UX Design',
          url: `/reviews`
        },
        isRead: false
      },
      {
        userId: users.find(u => u.username === 'alexdev')?._id,
        title: 'Contract Created',
        message: 'A contract has been created for your accepted proposal on API Development project.',
        type: 'contract_created',
        priority: 'high',
        data: {
          projectId: projects[2]?._id,
          contractId: projects[2]?._id, // Using project ID as mock contract ID
          title: 'API Development and Integration',
          url: `/contracts/${projects[2]?._id}`
        },
        isRead: false
      },
      {
        userId: users.find(u => u.username === 'admin')?._id,
        title: 'System Announcement',
        message: 'Welcome to FreelanceHub! Your admin account has been set up successfully.',
        type: 'system_announcement',
        priority: 'low',
        data: {
          title: 'Welcome to FreelanceHub',
          description: 'Admin account setup complete',
          url: '/admin/dashboard'
        },
        isRead: true,
        readAt: new Date()
      }
    ];

    await this.notificationModel.insertMany(notifications);
    console.log('✅ Notifications seeded successfully');
  }
}
