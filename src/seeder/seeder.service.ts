import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { FreelancerProfile, FreelancerProfileDocument } from '../schemas/freelancer-profile.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Proposal, ProposalDocument } from '../schemas/proposal.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FreelancerProfile.name) private freelancerProfileModel: Model<FreelancerProfileDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private configService: ConfigService,
  ) {}

  async seedDatabase(): Promise<void> {
    try {
      this.logger.log('Starting database seeding...');

      // Check if data already exists
      const userCount = await this.userModel.countDocuments();
      const forceReseed = this.configService.get('seeder.forceReseed');
      
      if (userCount > 0 && !forceReseed) {
        this.logger.log('Database already seeded. Skipping...');
        return;
      }

      if (userCount > 0 || forceReseed) {
        this.logger.log('Clearing existing data...');
        await this.clearDatabase();
      }

      // Create users with different roles
      const users = await this.createUsers();
      this.logger.log(`Created ${users.length} users`);

      // Create freelancer profiles
      const freelancerProfiles = await this.createFreelancerProfiles(users);
      this.logger.log(`Created ${freelancerProfiles.length} freelancer profiles`);

      // Create projects
      const projects = await this.createProjects(users);
      this.logger.log(`Created ${projects.length} projects`);

      // Create proposals
      const proposals = await this.createProposals(users, projects);
      this.logger.log(`Created ${proposals.length} proposals`);

      // Create reviews
      const reviews = await this.createReviews(users, projects);
      this.logger.log(`Created ${reviews.length} reviews`);

      // Create notifications
      const notifications = await this.createNotifications(users);
      this.logger.log(`Created ${notifications.length} notifications`);

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async clearDatabase(): Promise<void> {
    await Promise.all([
      this.userModel.deleteMany({}),
      this.freelancerProfileModel.deleteMany({}),
      this.projectModel.deleteMany({}),
      this.proposalModel.deleteMany({}),
      this.reviewModel.deleteMany({}),
      this.notificationModel.deleteMany({}),
    ]);
    this.logger.log('Existing data cleared');
  }

  private async createUsers(): Promise<any[]> {
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    
    const usersData = [
      // Admin User
      {
        email: 'admin@freelancehub.com',
        username: 'admin',
        password: hashedPassword,
        roles: ['client'], // Using client role for roles array since admin is not allowed
        role: 'admin', // Using the role field for admin
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          avatar: 'https://via.placeholder.com/150',
          phone: '+1234567890',
          dateOfBirth: new Date('1990-01-01'),
          location: {
            country: 'United States',
            city: 'New York',
            coordinates: [-74.0059, 40.7128] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true
        },
        preferences: {
          language: 'en',
          timezone: 'UTC',
          currency: 'USD',
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        },
        status: 'active',
        isActive: true
      },

      // Client Users
      {
        email: 'client1@example.com',
        username: 'techstartup_ceo',
        password: hashedPassword,
        roles: ['client'],
        role: 'client',
        profile: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          avatar: 'https://via.placeholder.com/150',
          phone: '+1555123456',
          dateOfBirth: new Date('1985-03-15'),
          location: {
            country: 'United States',
            city: 'San Francisco',
            coordinates: [-122.4194, 37.7749] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true
        },
        status: 'active',
        isActive: true
      },
      {
        email: 'client2@example.com',
        username: 'marketing_director',
        password: hashedPassword,
        roles: ['client'],
        role: 'client',
        profile: {
          firstName: 'Michael',
          lastName: 'Chen',
          avatar: 'https://via.placeholder.com/150',
          phone: '+1555234567',
          dateOfBirth: new Date('1988-07-22'),
          location: {
            country: 'Canada',
            city: 'Toronto',
            coordinates: [-79.3832, 43.6532] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: false
        },
        status: 'active',
        isActive: true
      },
      {
        email: 'client3@example.com',
        username: 'ecommerce_owner',
        password: hashedPassword,
        roles: ['client'],
        role: 'client',
        profile: {
          firstName: 'Emma',
          lastName: 'Williams',
          avatar: 'https://via.placeholder.com/150',
          phone: '+447700900123',
          dateOfBirth: new Date('1992-11-08'),
          location: {
            country: 'United Kingdom',
            city: 'London',
            coordinates: [-0.1276, 51.5074] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: false,
          identityVerified: true
        },
        status: 'active',
        isActive: true
      },

      // Freelancer Users
      {
        email: 'freelancer1@example.com',
        username: 'fullstack_dev',
        password: hashedPassword,
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'Alex',
          lastName: 'Rodriguez',
          avatar: 'https://via.placeholder.com/150',
          phone: '+1555345678',
          dateOfBirth: new Date('1993-05-12'),
          location: {
            country: 'United States',
            city: 'Austin',
            coordinates: [-97.7431, 30.2672] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true
        },
        status: 'active',
        isActive: true
      },
      {
        email: 'freelancer2@example.com',
        username: 'ui_ux_designer',
        password: hashedPassword,
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'Maya',
          lastName: 'Patel',
          avatar: 'https://via.placeholder.com/150',
          phone: '+919876543210',
          dateOfBirth: new Date('1991-09-25'),
          location: {
            country: 'India',
            city: 'Mumbai',
            coordinates: [72.8777, 19.0760] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true
        },
        status: 'active',
        isActive: true
      },
      {
        email: 'freelancer3@example.com',
        username: 'mobile_dev_expert',
        password: hashedPassword,
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'Carlos',
          lastName: 'Silva',
          avatar: 'https://via.placeholder.com/150',
          phone: '+5511987654321',
          dateOfBirth: new Date('1987-12-03'),
          location: {
            country: 'Brazil',
            city: 'São Paulo',
            coordinates: [-46.6333, -23.5505] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true
        },
        status: 'active',
        isActive: true
      },
      {
        email: 'freelancer4@example.com',
        username: 'data_scientist',
        password: hashedPassword,
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'Lisa',
          lastName: 'Zhang',
          avatar: 'https://via.placeholder.com/150',
          phone: '+8613912345678',
          dateOfBirth: new Date('1989-04-18'),
          location: {
            country: 'China',
            city: 'Shanghai',
            coordinates: [121.4737, 31.2304] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true
        },
        status: 'active',
        isActive: true
      },
      {
        email: 'freelancer5@example.com',
        username: 'content_writer',
        password: hashedPassword,
        roles: ['freelancer'],
        role: 'freelancer',
        profile: {
          firstName: 'James',
          lastName: 'Thompson',
          avatar: 'https://via.placeholder.com/150',
          phone: '+61412345678',
          dateOfBirth: new Date('1994-08-14'),
          location: {
            country: 'Australia',
            city: 'Sydney',
            coordinates: [151.2093, -33.8688] as [number, number]
          }
        },
        verification: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: false
        },
        status: 'active',
        isActive: true
      }
    ];

    return await this.userModel.insertMany(usersData) as any;
  }

  private async createFreelancerProfiles(users: any[]): Promise<any[]> {
    const freelancers = users.filter(user => user.roles.includes('freelancer'));
    
    const profilesData = [
      // Full Stack Developer Profile
      {
        userId: freelancers[0]._id,
        professional: {
          title: 'Full Stack Developer & System Architect',
          description: 'Experienced full-stack developer with 5+ years building scalable web applications using modern technologies. Specialized in React, Node.js, Python, and cloud infrastructure. I help startups and enterprises build robust, maintainable applications from concept to deployment.',
          experience: 'expert',
          availability: 'available',
          workingHours: {
            timezone: 'America/Chicago',
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
          primary: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL'],
          secondary: ['Docker', 'AWS', 'Redis', 'GraphQL', 'Next.js'],
          categories: ['Web Development', 'Backend Development', 'Database Design', 'Cloud Computing'],
          detailed: [
            { name: 'JavaScript', level: 'expert', yearsOfExperience: 5 },
            { name: 'React', level: 'expert', yearsOfExperience: 4 },
            { name: 'Node.js', level: 'expert', yearsOfExperience: 4 },
            { name: 'Python', level: 'advanced', yearsOfExperience: 3 },
            { name: 'MongoDB', level: 'advanced', yearsOfExperience: 3 },
            { name: 'AWS', level: 'intermediate', yearsOfExperience: 2 }
          ]
        },
        portfolio: [
          {
            title: 'E-commerce Platform',
            description: 'Built a complete e-commerce solution with React frontend, Node.js backend, and MongoDB. Features include user authentication, payment processing, inventory management, and admin dashboard.',
            images: ['https://via.placeholder.com/600x400', 'https://via.placeholder.com/600x400'],
            liveUrl: 'https://demo-ecommerce.example.com',
            repositoryUrl: 'https://github.com/alexrodriguez/ecommerce-platform',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
            completedAt: new Date('2024-06-15'),
            category: 'Web Development',
            isPublic: true
          },
          {
            title: 'Real-time Chat Application',
            description: 'Developed a scalable real-time messaging app with Socket.io, featuring group chats, file sharing, and message encryption.',
            images: ['https://via.placeholder.com/600x400'],
            liveUrl: 'https://chat-app-demo.example.com',
            technologies: ['React', 'Socket.io', 'Node.js', 'Redis'],
            completedAt: new Date('2024-04-20'),
            category: 'Web Development',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: 75,
          currency: 'USD',
          minimumBudget: 500,
          isNegotiable: true
        },
        availability: {
          hoursPerWeek: 40,
          isFullTime: true,
          responseTime: 2,
          timezone: 'America/Chicago'
        },
        rating: {
          average: 4.9,
          count: 23,
          breakdown: {
            communication: 4.8,
            quality: 5.0,
            expertise: 4.9,
            professionalism: 4.9,
            delivery: 4.8
          }
        },
        stats: {
          totalProjects: 28,
          completedProjects: 26,
          totalEarnings: 45000,
          repeatClients: 8,
          onTimeDelivery: 96
        }
      },

      // UI/UX Designer Profile
      {
        userId: freelancers[1]._id,
        professional: {
          title: 'UI/UX Designer & Product Designer',
          description: 'Creative UI/UX designer with 4+ years of experience crafting beautiful, user-centered digital experiences. Specialized in mobile apps, web applications, and design systems. I combine research-driven insights with modern design principles to create intuitive interfaces that users love.',
          experience: 'intermediate',
          availability: 'available',
          workingHours: {
            timezone: 'Asia/Kolkata',
            schedule: {
              monday: { start: '10:00', end: '18:00', available: true },
              tuesday: { start: '10:00', end: '18:00', available: true },
              wednesday: { start: '10:00', end: '18:00', available: true },
              thursday: { start: '10:00', end: '18:00', available: true },
              friday: { start: '10:00', end: '18:00', available: true },
              saturday: { start: '11:00', end: '15:00', available: true },
              sunday: { start: '11:00', end: '15:00', available: false }
            }
          }
        },
        skills: {
          primary: ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
          secondary: ['User Research', 'Wireframing', 'Design Systems', 'Illustration'],
          categories: ['UI/UX Design', 'Product Design', 'Mobile Design', 'Web Design'],
          detailed: [
            { name: 'Figma', level: 'expert', yearsOfExperience: 4 },
            { name: 'UI Design', level: 'expert', yearsOfExperience: 4 },
            { name: 'UX Design', level: 'advanced', yearsOfExperience: 3 },
            { name: 'Prototyping', level: 'advanced', yearsOfExperience: 3 },
            { name: 'User Research', level: 'intermediate', yearsOfExperience: 2 }
          ]
        },
        portfolio: [
          {
            title: 'FinTech Mobile App',
            description: 'Designed a comprehensive mobile banking app with intuitive navigation, secure transaction flows, and accessibility features. Conducted user research and usability testing.',
            images: ['https://via.placeholder.com/600x400', 'https://via.placeholder.com/600x400'],
            liveUrl: 'https://dribbble.com/shots/fintech-app',
            technologies: ['Figma', 'Principle', 'Maze'],
            completedAt: new Date('2024-07-10'),
            category: 'Mobile Design',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: 45,
          currency: 'USD',
          minimumBudget: 300,
          isNegotiable: true
        },
        availability: {
          hoursPerWeek: 35,
          isFullTime: false,
          responseTime: 4,
          timezone: 'Asia/Kolkata'
        },
        rating: {
          average: 4.7,
          count: 15,
          breakdown: {
            communication: 4.6,
            quality: 4.8,
            expertise: 4.7,
            professionalism: 4.8,
            delivery: 4.6
          }
        },
        stats: {
          totalProjects: 18,
          completedProjects: 17,
          totalEarnings: 22000,
          repeatClients: 5,
          onTimeDelivery: 94
        }
      },

      // Mobile Developer Profile
      {
        userId: freelancers[2]._id,
        professional: {
          title: 'Senior Mobile App Developer',
          description: 'Passionate mobile developer with 6+ years of experience building native and cross-platform applications. Expert in React Native, Flutter, iOS, and Android development. I specialize in creating high-performance mobile apps with excellent user experience and clean architecture.',
          experience: 'expert',
          availability: 'busy',
          workingHours: {
            timezone: 'America/Sao_Paulo',
            schedule: {
              monday: { start: '08:00', end: '16:00', available: true },
              tuesday: { start: '08:00', end: '16:00', available: true },
              wednesday: { start: '08:00', end: '16:00', available: true },
              thursday: { start: '08:00', end: '16:00', available: true },
              friday: { start: '08:00', end: '16:00', available: true },
              saturday: { start: '09:00', end: '13:00', available: false },
              sunday: { start: '09:00', end: '13:00', available: false }
            }
          }
        },
        skills: {
          primary: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
          secondary: ['Firebase', 'REST APIs', 'GraphQL', 'Redux', 'MobX'],
          categories: ['Mobile Development', 'Cross-platform Development', 'Native Development'],
          detailed: [
            { name: 'React Native', level: 'expert', yearsOfExperience: 5 },
            { name: 'Flutter', level: 'expert', yearsOfExperience: 3 },
            { name: 'iOS Development', level: 'advanced', yearsOfExperience: 4 },
            { name: 'Android Development', level: 'advanced', yearsOfExperience: 4 },
            { name: 'Firebase', level: 'advanced', yearsOfExperience: 3 }
          ]
        },
        portfolio: [
          {
            title: 'Food Delivery App',
            description: 'Cross-platform food delivery app built with React Native. Features real-time tracking, payment integration, and push notifications.',
            images: ['https://via.placeholder.com/600x400'],
            technologies: ['React Native', 'Firebase', 'Stripe', 'Google Maps'],
            completedAt: new Date('2024-05-30'),
            category: 'Mobile Development',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: 65,
          currency: 'USD',
          minimumBudget: 800,
          isNegotiable: false
        },
        availability: {
          hoursPerWeek: 25,
          isFullTime: false,
          responseTime: 6,
          timezone: 'America/Sao_Paulo'
        },
        rating: {
          average: 4.8,
          count: 19,
          breakdown: {
            communication: 4.7,
            quality: 4.9,
            expertise: 4.9,
            professionalism: 4.8,
            delivery: 4.7
          }
        },
        stats: {
          totalProjects: 22,
          completedProjects: 21,
          totalEarnings: 38000,
          repeatClients: 7,
          onTimeDelivery: 95
        }
      },

      // Data Scientist Profile
      {
        userId: freelancers[3]._id,
        professional: {
          title: 'Data Scientist & ML Engineer',
          description: 'Experienced data scientist with 5+ years in machine learning, data analysis, and AI solutions. Specialized in Python, TensorFlow, PyTorch, and cloud platforms. I help businesses unlock insights from their data and build intelligent systems.',
          experience: 'expert',
          availability: 'available',
          workingHours: {
            timezone: 'Asia/Shanghai',
            schedule: {
              monday: { start: '09:00', end: '17:00', available: true },
              tuesday: { start: '09:00', end: '17:00', available: true },
              wednesday: { start: '09:00', end: '17:00', available: true },
              thursday: { start: '09:00', end: '17:00', available: true },
              friday: { start: '09:00', end: '17:00', available: true },
              saturday: { start: '10:00', end: '14:00', available: true },
              sunday: { start: '10:00', end: '14:00', available: false }
            }
          }
        },
        skills: {
          primary: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Analysis', 'SQL'],
          secondary: ['R', 'Tableau', 'Power BI', 'Apache Spark', 'Docker'],
          categories: ['Data Science', 'Machine Learning', 'Data Analysis', 'AI'],
          detailed: [
            { name: 'Python', level: 'expert', yearsOfExperience: 5 },
            { name: 'Machine Learning', level: 'expert', yearsOfExperience: 4 },
            { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 3 },
            { name: 'Data Analysis', level: 'expert', yearsOfExperience: 5 },
            { name: 'SQL', level: 'expert', yearsOfExperience: 5 }
          ]
        },
        portfolio: [
          {
            title: 'Customer Churn Prediction Model',
            description: 'Built a machine learning model to predict customer churn with 94% accuracy using ensemble methods and feature engineering.',
            images: ['https://via.placeholder.com/600x400'],
            technologies: ['Python', 'Scikit-learn', 'Pandas', 'Jupyter'],
            completedAt: new Date('2024-06-25'),
            category: 'Data Science',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: 80,
          currency: 'USD',
          minimumBudget: 1000,
          isNegotiable: true
        },
        availability: {
          hoursPerWeek: 30,
          isFullTime: false,
          responseTime: 3,
          timezone: 'Asia/Shanghai'
        },
        rating: {
          average: 4.9,
          count: 12,
          breakdown: {
            communication: 4.8,
            quality: 5.0,
            expertise: 5.0,
            professionalism: 4.9,
            delivery: 4.8
          }
        },
        stats: {
          totalProjects: 15,
          completedProjects: 15,
          totalEarnings: 32000,
          repeatClients: 4,
          onTimeDelivery: 100
        }
      },

      // Content Writer Profile
      {
        userId: freelancers[4]._id,
        professional: {
          title: 'Content Writer & Digital Marketing Specialist',
          description: 'Creative content writer with 3+ years of experience in blog writing, copywriting, and digital marketing. I help businesses tell their story through engaging content that drives results.',
          experience: 'intermediate',
          availability: 'available',
          workingHours: {
            timezone: 'Australia/Sydney',
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
          primary: ['Content Writing', 'Copywriting', 'SEO', 'Blog Writing', 'Social Media'],
          secondary: ['WordPress', 'Google Analytics', 'Email Marketing'],
          categories: ['Content Writing', 'Digital Marketing', 'SEO'],
          detailed: [
            { name: 'Content Writing', level: 'advanced', yearsOfExperience: 3 },
            { name: 'SEO', level: 'intermediate', yearsOfExperience: 2 },
            { name: 'Copywriting', level: 'advanced', yearsOfExperience: 3 }
          ]
        },
        portfolio: [
          {
            title: 'Tech Blog Series',
            description: 'Wrote a 20-article blog series about emerging technologies that increased website traffic by 150%.',
            images: ['https://via.placeholder.com/600x400'],
            liveUrl: 'https://techblog.example.com',
            technologies: ['WordPress', 'Yoast SEO', 'Google Analytics'],
            completedAt: new Date('2024-07-01'),
            category: 'Content Writing',
            isPublic: true
          }
        ],
        pricing: {
          hourlyRate: 35,
          currency: 'USD',
          minimumBudget: 200,
          isNegotiable: true
        },
        availability: {
          hoursPerWeek: 40,
          isFullTime: true,
          responseTime: 2,
          timezone: 'Australia/Sydney'
        },
        rating: {
          average: 4.6,
          count: 8,
          breakdown: {
            communication: 4.7,
            quality: 4.6,
            expertise: 4.5,
            professionalism: 4.7,
            delivery: 4.5
          }
        },
        stats: {
          totalProjects: 10,
          completedProjects: 10,
          totalEarnings: 8500,
          repeatClients: 3,
          onTimeDelivery: 100
        }
      }
    ];

    return await this.freelancerProfileModel.insertMany(profilesData) as any;
  }

  private async createProjects(users: any[]): Promise<any[]> {
    const clients = users.filter(user => user.roles.includes('client'));
    
    const projectsData = [
      {
        clientId: clients[0]._id,
        title: 'Build a Modern E-commerce Platform',
        description: 'We need a complete e-commerce solution for our fashion startup. The platform should include user authentication, product catalog, shopping cart, payment processing, order management, and admin dashboard. We prefer modern technologies like React for frontend and Node.js for backend. The design should be mobile-responsive and user-friendly. We have detailed wireframes and brand guidelines ready.',
        category: 'Web Development',
        subcategory: 'E-commerce',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Payment Integration', 'REST API'],
        type: 'fixed',
        budget: {
          amount: 5000,
          maxAmount: 7000,
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
          mustHaveSkills: ['React', 'Node.js', 'MongoDB'],
          niceToHaveSkills: ['AWS', 'Docker', 'Redux'],
          experienceLevel: 'intermediate',
          minimumRating: 4.5,
          minimumCompletedProjects: 5,
          preferredLanguages: ['English'],
          preferredCountries: ['United States', 'Canada', 'United Kingdom']
        },
        attachments: [],
        visibility: 'public',
        status: 'open',
        tags: ['ecommerce', 'react', 'nodejs', 'fullstack'],
        publishedAt: new Date(),
        views: 45,
        proposalsCount: 8
      },
      {
        clientId: clients[1]._id,
        title: 'UI/UX Design for Mobile Banking App',
        description: 'Looking for an experienced UI/UX designer to create a comprehensive design for our mobile banking application. The app should provide seamless user experience for banking operations including account management, transfers, bill payments, and investment tracking. We need complete user research, wireframes, prototypes, and final designs for both iOS and Android platforms.',
        category: 'Design',
        subcategory: 'Mobile App Design',
        requiredSkills: ['UI Design', 'UX Design', 'Figma', 'Mobile Design', 'User Research'],
        type: 'fixed',
        budget: {
          amount: 3500,
          maxAmount: 4500,
          currency: 'USD',
          type: 'fixed'
        },
        timeline: {
          duration: 30,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isUrgent: true,
          isFlexible: false
        },
        requirements: {
          mustHaveSkills: ['UI Design', 'UX Design', 'Figma'],
          niceToHaveSkills: ['Principle', 'InVision', 'Sketch'],
          experienceLevel: 'intermediate',
          minimumRating: 4.0,
          minimumCompletedProjects: 3
        },
        attachments: [],
        visibility: 'public',
        status: 'open',
        tags: ['uiux', 'mobile', 'banking', 'fintech'],
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        views: 32,
        proposalsCount: 12
      },
      {
        clientId: clients[2]._id,
        title: 'WordPress Website Development',
        description: 'Need a professional WordPress website for our consulting business. The site should include home page, about us, services, blog, contact page, and client testimonials. We need custom theme development, SEO optimization, and integration with contact forms and analytics.',
        category: 'Web Development',
        subcategory: 'WordPress',
        requiredSkills: ['WordPress', 'PHP', 'HTML', 'CSS', 'JavaScript'],
        type: 'fixed',
        budget: {
          amount: 1500,
          maxAmount: 2000,
          currency: 'USD',
          type: 'fixed'
        },
        timeline: {
          duration: 20,
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          isUrgent: false,
          isFlexible: true
        },
        requirements: {
          mustHaveSkills: ['WordPress', 'PHP'],
          experienceLevel: 'entry',
          minimumRating: 4.0
        },
        attachments: [],
        visibility: 'public',
        status: 'open',
        tags: ['wordpress', 'website', 'business'],
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        views: 28,
        proposalsCount: 6
      },
      {
        clientId: clients[0]._id,
        title: 'Data Analysis and Visualization Dashboard',
        description: 'We need a comprehensive data analysis project to understand our customer behavior and sales patterns. The deliverable should include data cleaning, statistical analysis, machine learning models for predictions, and an interactive dashboard for visualization.',
        category: 'Data Science',
        subcategory: 'Data Analysis',
        requiredSkills: ['Python', 'Data Analysis', 'Machine Learning', 'Tableau', 'SQL'],
        type: 'hourly',
        budget: {
          amount: 50,
          currency: 'USD',
          type: 'hourly'
        },
        timeline: {
          duration: 25,
          isUrgent: false,
          isFlexible: true
        },
        requirements: {
          mustHaveSkills: ['Python', 'Data Analysis'],
          experienceLevel: 'expert',
          minimumRating: 4.7
        },
        attachments: [],
        visibility: 'public',
        status: 'open',
        tags: ['data', 'analytics', 'python', 'visualization'],
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 22,
        proposalsCount: 4
      },
      {
        clientId: clients[1]._id,
        title: 'Content Writing for Tech Blog',
        description: 'Looking for a skilled content writer to create high-quality blog posts about technology trends, software development, and digital transformation. We need 10 articles per month, each 1500-2000 words, with SEO optimization.',
        category: 'Writing',
        subcategory: 'Blog Writing',
        requiredSkills: ['Content Writing', 'SEO', 'Technical Writing', 'Research'],
        type: 'hourly',
        budget: {
          amount: 25,
          currency: 'USD',
          type: 'hourly'
        },
        timeline: {
          duration: 90,
          isUrgent: false,
          isFlexible: true
        },
        requirements: {
          mustHaveSkills: ['Content Writing', 'SEO'],
          experienceLevel: 'intermediate',
          minimumRating: 4.3
        },
        attachments: [],
        visibility: 'public',
        status: 'in_progress',
        selectedFreelancer: users.find(u => u.username === 'content_writer')?._id,
        tags: ['content', 'writing', 'tech', 'blog'],
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        views: 18,
        proposalsCount: 7
      },
      {
        clientId: clients[2]._id,
        title: 'Mobile App Development - React Native',
        description: 'We need a cross-platform mobile app for our food delivery service. The app should include user registration, restaurant listings, menu browsing, ordering system, payment integration, order tracking, and push notifications.',
        category: 'Mobile Development',
        subcategory: 'Cross-platform',
        requiredSkills: ['React Native', 'JavaScript', 'API Integration', 'Push Notifications'],
        type: 'fixed',
        budget: {
          amount: 8000,
          maxAmount: 10000,
          currency: 'USD',
          type: 'fixed'
        },
        timeline: {
          duration: 60,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isUrgent: false,
          isFlexible: false
        },
        requirements: {
          mustHaveSkills: ['React Native', 'JavaScript'],
          experienceLevel: 'expert',
          minimumRating: 4.5,
          minimumCompletedProjects: 8
        },
        attachments: [],
        visibility: 'public',
        status: 'open',
        tags: ['react-native', 'mobile', 'food-delivery', 'cross-platform'],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        views: 67,
        proposalsCount: 15
      }
    ];

    return await this.projectModel.insertMany(projectsData) as any;
  }

  private async createProposals(users: any[], projects: any[]): Promise<any[]> {
    const freelancers = users.filter(user => user.roles.includes('freelancer'));
    
    const proposalsData = [
      // Proposals for E-commerce project
      {
        projectId: projects[0]._id,
        freelancerId: freelancers[0]._id, // fullstack_dev
        coverLetter: 'Hi Sarah! I\'m excited about your e-commerce project. With over 5 years of full-stack development experience, I\'ve built several successful e-commerce platforms using React and Node.js. I can deliver a modern, scalable solution that meets all your requirements. I\'ve reviewed your wireframes and can provide valuable suggestions to enhance the user experience. Let\'s discuss your project in detail!',
        pricing: {
          amount: 5500,
          currency: 'USD',
          type: 'fixed',
          estimatedHours: 200,
          breakdown: 'Frontend (React): $2000, Backend (Node.js): $2000, Database design: $800, Payment integration: $500, Testing & deployment: $200'
        },
        timeline: {
          deliveryTime: 40,
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          milestones: [
            {
              title: 'Backend API Development',
              description: 'Complete backend with authentication and core APIs',
              deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              amount: 2000
            },
            {
              title: 'Frontend Development',
              description: 'React frontend with all components and pages',
              deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              amount: 2500
            },
            {
              title: 'Integration & Testing',
              description: 'Full integration, testing, and deployment',
              deliveryDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
              amount: 1000
            }
          ]
        },
        attachments: [],
        status: 'pending',
        isInvited: false
      },
      {
        projectId: projects[0]._id,
        freelancerId: freelancers[2]._id, // mobile_dev_expert
        coverLetter: 'Hello! While I specialize in mobile development, I also have extensive experience with React and Node.js for web applications. I can build your e-commerce platform with a mobile-first approach, ensuring it works perfectly on all devices. My experience with payment integrations and e-commerce flows will be valuable for your project.',
        pricing: {
          amount: 6000,
          currency: 'USD',
          type: 'fixed',
          estimatedHours: 220
        },
        timeline: {
          deliveryTime: 45,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        attachments: [],
        status: 'pending',
        isInvited: false
      },

      // Proposals for UI/UX Design project
      {
        projectId: projects[1]._id,
        freelancerId: freelancers[1]._id, // ui_ux_designer
        coverLetter: 'Hi Michael! I\'m passionate about creating intuitive financial interfaces. I have extensive experience designing mobile banking apps and understand the unique challenges of fintech UX. I\'ll conduct thorough user research, create detailed user personas, and design a seamless experience that builds trust and encourages engagement. My portfolio includes several fintech projects with excellent results.',
        pricing: {
          amount: 4000,
          currency: 'USD',
          type: 'fixed',
          estimatedHours: 120,
          breakdown: 'User research: $800, Wireframes: $1000, UI Design: $1500, Prototyping: $700'
        },
        timeline: {
          deliveryTime: 28,
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          milestones: [
            {
              title: 'Research & Wireframes',
              description: 'User research, personas, and wireframes',
              deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
              amount: 1800
            },
            {
              title: 'UI Design',
              description: 'Complete UI design for all screens',
              deliveryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
              amount: 1500
            },
            {
              title: 'Prototyping & Handoff',
              description: 'Interactive prototypes and developer handoff',
              deliveryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
              amount: 700
            }
          ]
        },
        attachments: [],
        status: 'pending',
        isInvited: false
      },

      // Proposals for Data Analysis project
      {
        projectId: projects[3]._id,
        freelancerId: freelancers[3]._id, // data_scientist
        coverLetter: 'Hello! I\'m excited about your data analysis project. With my expertise in Python, machine learning, and data visualization, I can provide deep insights into your customer behavior and sales patterns. I\'ll use advanced statistical methods and ML algorithms to uncover hidden patterns and create predictive models. The interactive dashboard will be built using modern visualization libraries.',
        pricing: {
          amount: 65,
          currency: 'USD',
          type: 'hourly',
          estimatedHours: 80
        },
        timeline: {
          deliveryTime: 20,
          startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        },
        attachments: [],
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isInvited: false
      },

      // Proposals for Content Writing project
      {
        projectId: projects[4]._id,
        freelancerId: freelancers[4]._id, // content_writer
        coverLetter: 'Hi! I\'m passionate about technology and have extensive experience writing technical content. I can create engaging, SEO-optimized blog posts that will drive traffic and establish your thought leadership. I stay updated with the latest tech trends and can write in a way that\'s accessible to both technical and non-technical audiences.',
        pricing: {
          amount: 30,
          currency: 'USD',
          type: 'hourly',
          estimatedHours: 160
        },
        timeline: {
          deliveryTime: 85,
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        attachments: [],
        status: 'accepted',
        acceptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        isInvited: false
      },

      // More proposals for mobile app project
      {
        projectId: projects[5]._id,
        freelancerId: freelancers[2]._id, // mobile_dev_expert
        coverLetter: 'Perfect project for my expertise! I\'ve built several food delivery apps using React Native. I understand the complexities of real-time order tracking, payment integrations, and push notifications. I can deliver a high-performance app that works seamlessly on both iOS and Android platforms.',
        pricing: {
          amount: 9000,
          currency: 'USD',
          type: 'fixed',
          estimatedHours: 300
        },
        timeline: {
          deliveryTime: 55,
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        attachments: [],
        status: 'pending',
        isInvited: false
      }
    ];

    return await this.proposalModel.insertMany(proposalsData) as any;
  }

  private async createReviews(users: any[], projects: any[]): Promise<any[]> {
    const reviewsData = [
      {
        projectId: projects[4]._id, // Content writing project
        reviewerId: users.find(u => u.username === 'marketing_director')?._id,
        revieweeId: users.find(u => u.username === 'content_writer')?._id,
        reviewerType: 'client',
        rating: {
          overall: 4.8,
          communication: 4.9,
          quality: 4.7,
          expertise: 4.8,
          professionalism: 4.9,
          delivery: 4.6
        },
        title: 'Outstanding Content Quality',
        comment: 'James delivered exceptional blog content that exceeded our expectations. His technical writing skills are top-notch, and he consistently met deadlines. The articles are well-researched, engaging, and have significantly improved our website traffic. Highly recommended!',
        isPublic: true,
        isVerified: true,
        helpfulCount: 3
      },
      {
        projectId: projects[3]._id, // Data analysis project
        reviewerId: users.find(u => u.username === 'techstartup_ceo')?._id,
        revieweeId: users.find(u => u.username === 'data_scientist')?._id,
        reviewerType: 'client',
        rating: {
          overall: 5.0,
          communication: 5.0,
          quality: 5.0,
          expertise: 5.0,
          professionalism: 5.0,
          delivery: 5.0
        },
        title: 'Incredible Data Insights',
        comment: 'Lisa provided amazing insights from our data that we never knew existed. Her analysis was thorough, the visualizations were beautiful, and the predictive models are already helping us make better business decisions. Exceptional work and communication throughout the project.',
        isPublic: true,
        isVerified: true,
        helpfulCount: 5
      }
    ];

    return await this.reviewModel.insertMany(reviewsData) as any;
  }

  private async createNotifications(users: any[]): Promise<any[]> {
    const notificationsData = [
      {
        userId: users.find(u => u.username === 'fullstack_dev')?._id,
        type: 'proposal_submitted',
        title: 'Proposal Submitted Successfully',
        message: 'Your proposal for "Build a Modern E-commerce Platform" has been submitted and is under review.',
        data: {
          projectId: 'project_id_here',
          projectTitle: 'Build a Modern E-commerce Platform'
        },
        isRead: false,
        priority: 'medium'
      },
      {
        userId: users.find(u => u.username === 'ui_ux_designer')?._id,
        type: 'new_project_match',
        title: 'New Project Match',
        message: 'A new project "UI/UX Design for Mobile Banking App" matches your skills!',
        data: {
          projectId: 'project_id_here',
          projectTitle: 'UI/UX Design for Mobile Banking App'
        },
        isRead: false,
        priority: 'high'
      },
      {
        userId: users.find(u => u.username === 'techstartup_ceo')?._id,
        type: 'proposal_received',
        title: 'New Proposal Received',
        message: 'You received a new proposal for your project "Build a Modern E-commerce Platform"',
        data: {
          projectId: 'project_id_here',
          freelancerId: 'freelancer_id_here'
        },
        isRead: true,
        priority: 'high'
      },
      {
        userId: users.find(u => u.username === 'data_scientist')?._id,
        type: 'proposal_accepted',
        title: 'Proposal Accepted!',
        message: 'Congratulations! Your proposal for "Data Analysis and Visualization Dashboard" has been accepted.',
        data: {
          projectId: 'project_id_here',
          projectTitle: 'Data Analysis and Visualization Dashboard'
        },
        isRead: false,
        priority: 'high'
      },
      {
        userId: users.find(u => u.username === 'content_writer')?._id,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'You have received a payment of $500 for your completed milestone.',
        data: {
          amount: 500,
          currency: 'USD'
        },
        isRead: false,
        priority: 'medium'
      }
    ];

    return await this.notificationModel.insertMany(notificationsData) as any;
  }
}
