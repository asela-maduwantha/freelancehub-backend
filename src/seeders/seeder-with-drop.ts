import { NestFactory } from '@nestjs/core';
import { Injectable, Module } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Import schemas
import { User, UserSchema, UserDocument } from '../schemas/user.schema';
import { FreelancerProfile, FreelancerProfileSchema, FreelancerProfileDocument } from '../schemas/freelancer-profile.schema';
import { Project, ProjectSchema, ProjectDocument } from '../schemas/project.schema';
import { Proposal, ProposalSchema, ProposalDocument } from '../schemas/proposal.schema';
import { Review, ReviewSchema, ReviewDocument } from '../schemas/review.schema';
import { Notification, NotificationSchema, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
class DatabaseSeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FreelancerProfile.name) private freelancerProfileModel: Model<FreelancerProfileDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async clearDatabase() {
    console.log('🗑️  Clearing existing data...');
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

  async seedUsers() {
    console.log('� Seeding users...');
    const users = [
      // Admin User
      {
        username: 'admin',
        email: 'admin@freelancehub.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        roles: ['admin'],
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System administrator with full access to the platform.',
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
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date()
      },
      // Client Users
      {
        username: 'johnsmith',
        email: 'john.smith@techcorp.com',
        passwordHash: await bcrypt.hash('client123', 10),
        roles: ['client'],
        profile: {
          firstName: 'John',
          lastName: 'Smith',
          bio: 'CEO of TechCorp, looking for talented developers to build innovative solutions.',
          location: {
            country: 'United States',
            city: 'Austin',
            coordinates: [-97.7431, 30.2672]
          },
          contactInfo: {
            phone: '+1-555-0102',
            website: 'https://techcorp.com'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-06-15'),
        lastLoginAt: new Date('2024-07-20')
      },
      {
        username: 'sarahjohnson',
        email: 'sarah.johnson@fintech.com',
        passwordHash: await bcrypt.hash('client123', 10),
        roles: ['client'],
        profile: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          bio: 'Product Manager at FinTech Solutions, passionate about creating user-friendly financial applications.',
          location: {
            country: 'Canada',
            city: 'Toronto',
            coordinates: [-79.3832, 43.6532]
          },
          contactInfo: {
            phone: '+1-555-0203',
            website: 'https://fintech-solutions.com'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-07-01'),
        lastLoginAt: new Date('2024-07-25')
      },
      {
        username: 'mikewilson',
        email: 'mike.wilson@startup.com',
        passwordHash: await bcrypt.hash('client123', 10),
        roles: ['client'],
        profile: {
          firstName: 'Mike',
          lastName: 'Wilson',
          bio: 'Startup founder looking for mobile developers to bring our food delivery idea to life.',
          location: {
            country: 'United Kingdom',
            city: 'London',
            coordinates: [-0.1276, 51.5074]
          },
          contactInfo: {
            phone: '+44-555-0304'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-06-20'),
        lastLoginAt: new Date('2024-07-15')
      },
      // Freelancer Users
      {
        username: 'alexrodriguez',
        email: 'alex.rodriguez@freelancer.com',
        passwordHash: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        profile: {
          firstName: 'Alex',
          lastName: 'Rodriguez',
          bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
          location: {
            country: 'United States',
            city: 'Chicago',
            coordinates: [-87.6298, 41.8781]
          },
          contactInfo: {
            phone: '+1-555-0405',
            website: 'https://alexdev.portfolio.com'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-05-10'),
        lastLoginAt: new Date('2024-07-21')
      },
      {
        username: 'priyasharma',
        email: 'priya.sharma@designer.com',
        passwordHash: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        profile: {
          firstName: 'Priya',
          lastName: 'Sharma',
          bio: 'UI/UX designer specializing in mobile applications and user experience research.',
          location: {
            country: 'India',
            city: 'Mumbai',
            coordinates: [72.8777, 19.0760]
          },
          contactInfo: {
            phone: '+91-555-0506',
            website: 'https://priyauxdesign.com'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-04-15'),
        lastLoginAt: new Date('2024-07-26')
      },
      {
        username: 'carlossilva',
        email: 'carlos.silva@mobile.com',
        passwordHash: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        profile: {
          firstName: 'Carlos',
          lastName: 'Silva',
          bio: 'Senior mobile developer with expertise in React Native and Flutter for cross-platform applications.',
          location: {
            country: 'Brazil',
            city: 'São Paulo',
            coordinates: [-46.6333, -23.5505]
          },
          contactInfo: {
            phone: '+55-555-0607',
            website: 'https://carlosmobile.dev'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-03-20'),
        lastLoginAt: new Date('2024-07-12')
      },
      {
        username: 'liwei',
        email: 'li.wei@datascientist.com',
        passwordHash: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        profile: {
          firstName: 'Li',
          lastName: 'Wei',
          bio: 'Data scientist and machine learning engineer with expertise in Python, TensorFlow, and big data analytics.',
          location: {
            country: 'China',
            city: 'Shanghai',
            coordinates: [121.4737, 31.2304]
          },
          contactInfo: {
            phone: '+86-555-0708',
            website: 'https://liwei-datascience.com'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-02-10'),
        lastLoginAt: new Date('2024-07-31')
      },
      {
        username: 'emmathompson',
        email: 'emma.thompson@writer.com',
        passwordHash: await bcrypt.hash('freelancer123', 10),
        roles: ['freelancer'],
        profile: {
          firstName: 'Emma',
          lastName: 'Thompson',
          bio: 'Content writer and digital marketing specialist with a focus on technology and business content.',
          location: {
            country: 'Australia',
            city: 'Sydney',
            coordinates: [151.2093, -33.8688]
          },
          contactInfo: {
            phone: '+61-555-0809',
            website: 'https://emmawrites.com'
          }
        },
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2024-05-25'),
        lastLoginAt: new Date('2024-06-12')
      }
    ];

    await this.userModel.insertMany(users);
    console.log(`✅ Seeded ${users.length} users`);
  }

  async seedProjects() {
    console.log('🎯 Seeding projects...');
    const clients = await this.userModel.find({ roles: 'client' }).exec();
    
    const projects = [
      {
        title: 'Modern E-commerce Platform Development',
        description: 'Looking for an experienced full-stack developer to build a modern e-commerce platform with React frontend and Node.js backend.',
        category: 'Web Development',
        subcategory: 'Full Stack Development',
        budget: { type: 'fixed', amount: 8000, currency: 'USD' },
        duration: { type: 'weeks', value: 8 },
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript'],
        experienceLevel: 'expert',
        projectType: 'web_development',
        status: 'active',
        postedBy: clients[0]._id,
        visibility: 'public',
        location: { type: 'remote', country: 'United States' },
        createdAt: new Date('2024-07-20')
      },
      {
        title: 'FinTech Mobile App UI/UX Design',
        description: 'Seeking a talented UI/UX designer to create a modern, intuitive design for a mobile banking application.',
        category: 'Design',
        subcategory: 'UI/UX Design',
        budget: { type: 'fixed', amount: 3500, currency: 'USD' },
        duration: { type: 'weeks', value: 4 },
        skillsRequired: ['Figma', 'UI Design', 'UX Design', 'Mobile Design'],
        experienceLevel: 'intermediate',
        projectType: 'design',
        status: 'active',
        postedBy: clients[1]._id,
        visibility: 'public',
        location: { type: 'remote', country: 'Canada' },
        createdAt: new Date('2024-07-25')
      }
    ];

    await this.projectModel.insertMany(projects);
    console.log(`✅ Seeded ${projects.length} projects`);
  }

  async seedAll() {
    await this.clearDatabase();
    await this.seedUsers();
    await this.seedProjects();
    console.log('🎉 Database seeding completed successfully!');
  }
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/freelancehub'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FreelancerProfile.name, schema: FreelancerProfileSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [DatabaseSeederService],
})
class SeederModule {}

async function bootstrap() {
  console.log('🌱 Starting database seeding...');
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(DatabaseSeederService);
  
  try {
    await seeder.seedAll();
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
