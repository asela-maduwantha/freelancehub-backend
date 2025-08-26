import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { FreelancerProfile, FreelancerProfileDocument } from '../schemas/freelancer-profile.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class FreelancerProfilesSeeder implements Seeder {
  constructor(
    @InjectModel(FreelancerProfile.name) private readonly freelancerProfileModel: Model<FreelancerProfileDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed(): Promise<any> {
    // Check if profiles already exist
    const existingProfiles = await this.freelancerProfileModel.find().exec();
    if (existingProfiles.length > 0) {
      console.log(`Found ${existingProfiles.length} existing freelancer profiles. Skipping profile seeding.`);
      return;
    }

    // First get all freelancer users
    const freelancers = await this.userModel.find({ roles: 'freelancer' }).exec();
    
    if (freelancers.length === 0) {
      throw new Error('No freelancer users found. Please seed users first.');
    }

    const profiles = [
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
          hourlyRate: {
            min: 70,
            max: 80,
            currency: 'USD'
          },
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
          hourlyRate: {
            min: 40,
            max: 50,
            currency: 'USD'
          },
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
          hourlyRate: {
            min: 60,
            max: 70,
            currency: 'USD'
          },
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
          hourlyRate: {
            min: 75,
            max: 85,
            currency: 'USD'
          },
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
          hourlyRate: {
            min: 30,
            max: 40,
            currency: 'USD'
          },
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

    return this.freelancerProfileModel.insertMany(profiles);
  }

  async drop(): Promise<any> {
    return this.freelancerProfileModel.deleteMany({});
  }
}
