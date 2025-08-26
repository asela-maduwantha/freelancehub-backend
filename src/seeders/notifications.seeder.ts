import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class NotificationsSeeder implements Seeder {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async seed(): Promise<any> {
    // Check if notifications already exist
    const existingNotifications = await this.notificationModel.find().exec();
    if (existingNotifications.length > 0) {
      console.log(`Found ${existingNotifications.length} existing notifications. Skipping notification seeding.`);
      return;
    }

    // Get users and projects
    const users = await this.userModel.find().exec();
    const projects = await this.projectModel.find().exec();
    
    if (users.length === 0 || projects.length === 0) {
      throw new Error('No users or projects found. Please seed users and projects first.');
    }

    // Helper function to find user by email safely
    const findUser = (email: string) => {
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }
      return user;
    };

    // Helper function to find admin user safely
    const findAdminUser = () => {
      const admin = users.find(u => u.roles.includes('admin'));
      if (!admin) {
        throw new Error('Admin user not found');
      }
      return admin;
    };

    const notifications = [
      // Notifications for Client 1 (John Smith)
      {
        userId: findUser('john.smith@techcorp.com')._id,
        type: 'proposal_received',
        title: 'New Proposal Received',
        message: 'Alex Rodriguez submitted a proposal for your E-commerce Platform project.',
        data: {
          projectId: projects[0]._id,
          freelancerId: findUser('alex.rodriguez@freelancer.com')._id,
          proposalAmount: 7500
        },
        priority: 'high',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-21T10:30:00Z'),
        createdAt: new Date('2024-07-21T09:15:00Z')
      },
      
      {
        userId: findUser('john.smith@techcorp.com')._id,
        type: 'project_milestone',
        title: 'Milestone Completed',
        message: 'Alex Rodriguez completed the "Project Setup & Authentication" milestone.',
        data: {
          projectId: projects[0]._id,
          freelancerId: findUser('alex.rodriguez@freelancer.com')._id,
          milestoneTitle: 'Project Setup & Authentication',
          milestoneAmount: 1500
        },
        priority: 'medium',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-23T14:20:00Z'),
        createdAt: new Date('2024-07-23T14:00:00Z')
      },
      
      {
        userId: findUser('john.smith@techcorp.com')._id,
        type: 'payment_processed',
        title: 'Payment Processed',
        message: 'Payment of $1,500 has been processed for milestone completion.',
        data: {
          projectId: projects[0]._id,
          amount: 1500,
          currency: 'USD',
          paymentMethod: 'credit_card'
        },
        priority: 'low',
        category: 'payment',
        isRead: false,
        createdAt: new Date('2024-07-23T15:00:00Z')
      },
      
      {
        userId: findUser('john.smith@techcorp.com')._id,
        type: 'message_received',
        title: 'New Message',
        message: 'You have a new message from Alex Rodriguez regarding the E-commerce Platform project.',
        data: {
          senderId: findUser('alex.rodriguez@freelancer.com')._id,
          projectId: projects[0]._id,
          messagePreview: 'Hi John, I wanted to update you on the progress...'
        },
        priority: 'medium',
        category: 'communication',
        isRead: true,
        readAt: new Date('2024-07-24T09:45:00Z'),
        createdAt: new Date('2024-07-24T09:30:00Z')
      },

      // Notifications for Freelancer 1 (Alex Rodriguez)
      {
        userId: findUser('alex.rodriguez@freelancer.com')._id,
        type: 'proposal_accepted',
        title: 'Proposal Accepted!',
        message: 'Congratulations! Your proposal for the E-commerce Platform project has been accepted.',
        data: {
          projectId: projects[0]._id,
          clientId: findUser('john.smith@techcorp.com')._id,
          projectAmount: 7500
        },
        priority: 'high',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-22T11:00:00Z'),
        createdAt: new Date('2024-07-22T10:45:00Z')
      },
      
      {
        userId: findUser('alex.rodriguez@freelancer.com')._id,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'You received $1,500 for completing the Project Setup milestone.',
        data: {
          projectId: projects[0]._id,
          amount: 1500,
          currency: 'USD',
          clientId: findUser('john.smith@techcorp.com')._id
        },
        priority: 'high',
        category: 'payment',
        isRead: true,
        readAt: new Date('2024-07-23T15:30:00Z'),
        createdAt: new Date('2024-07-23T15:15:00Z')
      },
      
      {
        userId: findUser('alex.rodriguez@freelancer.com')._id,
        type: 'review_received',
        title: 'New Review Received',
        message: 'John Smith left you a 5-star review for the E-commerce Platform project.',
        data: {
          reviewerId: findUser('john.smith@techcorp.com')._id,
          projectId: projects[0]._id,
          rating: 5.0,
          reviewTitle: 'Outstanding Full Stack Developer - Exceeded Expectations!'
        },
        priority: 'medium',
        category: 'review',
        isRead: false,
        createdAt: new Date('2024-07-22T16:30:00Z')
      },

      // Notifications for Client 2 (Sarah Johnson)
      {
        userId: findUser('sarah.johnson@fintech.com')._id,
        type: 'proposal_received',
        title: 'New Proposal Received',
        message: 'Priya Sharma submitted a proposal for your FinTech Mobile App Design project.',
        data: {
          projectId: projects[1]._id,
          freelancerId: findUser('priya.sharma@designer.com')._id,
          proposalAmount: 3200
        },
        priority: 'high',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-26T13:20:00Z'),
        createdAt: new Date('2024-07-26T12:45:00Z')
      },
      
      {
        userId: findUser('sarah.johnson@fintech.com')._id,
        type: 'project_started',
        title: 'Project Started',
        message: 'Priya Sharma has started working on your FinTech Mobile App Design project.',
        data: {
          projectId: projects[1]._id,
          freelancerId: findUser('priya.sharma@designer.com')._id,
          startDate: new Date('2024-07-28')
        },
        priority: 'medium',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-28T10:15:00Z'),
        createdAt: new Date('2024-07-28T10:00:00Z')
      },
      
      {
        userId: findUser('sarah.johnson@fintech.com')._id,
        type: 'deadline_reminder',
        title: 'Project Deadline Reminder',
        message: 'Reminder: Your FinTech Mobile App Design project is due in 3 days.',
        data: {
          projectId: projects[1]._id,
          dueDate: new Date('2024-08-25'),
          daysRemaining: 3
        },
        priority: 'medium',
        category: 'reminder',
        isRead: false,
        createdAt: new Date('2024-08-22T09:00:00Z')
      },

      // Notifications for Freelancer 2 (Priya Sharma)
      {
        userId: findUser('priya.sharma@designer.com')._id,
        type: 'project_invite',
        title: 'Project Invitation',
        message: 'Sarah Johnson invited you to submit a proposal for the FinTech Mobile App Design project.',
        data: {
          projectId: projects[1]._id,
          clientId: findUser('sarah.johnson@fintech.com')._id,
          inviteMessage: 'Hi Priya, I\'ve reviewed your portfolio and would like to invite you to submit a proposal for our mobile app design project.'
        },
        priority: 'high',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-25T14:30:00Z'),
        createdAt: new Date('2024-07-25T14:00:00Z')
      },
      
      {
        userId: findUser('priya.sharma@designer.com')._id,
        type: 'profile_view',
        title: 'Profile Viewed',
        message: 'Sarah Johnson viewed your profile.',
        data: {
          viewerId: findUser('sarah.johnson@fintech.com')._id,
          viewerType: 'client'
        },
        priority: 'low',
        category: 'profile',
        isRead: true,
        readAt: new Date('2024-07-25T13:45:00Z'),
        createdAt: new Date('2024-07-25T13:30:00Z')
      },

      // Notifications for Mobile Developer (Carlos Silva)
      {
        userId: findUser('carlos.silva@mobile.com')._id,
        type: 'proposal_shortlisted',
        title: 'Proposal Shortlisted',
        message: 'Your proposal for the Food Delivery App project has been shortlisted.',
        data: {
          projectId: projects[2]._id,
          clientId: findUser('mike.wilson@startup.com')._id
        },
        priority: 'medium',
        category: 'project',
        isRead: true,
        readAt: new Date('2024-07-13T11:20:00Z'),
        createdAt: new Date('2024-07-13T11:00:00Z')
      },
      
      {
        userId: findUser('carlos.silva@mobile.com')._id,
        type: 'skill_badge_earned',
        title: 'Skill Badge Earned',
        message: 'Congratulations! You\'ve earned the "React Native Expert" badge.',
        data: {
          badgeName: 'React Native Expert',
          badgeLevel: 'expert',
          skillName: 'React Native'
        },
        priority: 'low',
        category: 'achievement',
        isRead: false,
        createdAt: new Date('2024-07-20T16:00:00Z')
      },

      // System notifications for multiple users
      {
        userId: findUser('alex.rodriguez@freelancer.com')._id,
        type: 'system_maintenance',
        title: 'Scheduled Maintenance',
        message: 'The platform will undergo scheduled maintenance on Sunday, August 4th from 2:00 AM to 4:00 AM UTC.',
        data: {
          maintenanceStart: new Date('2024-08-04T02:00:00Z'),
          maintenanceEnd: new Date('2024-08-04T04:00:00Z'),
          affectedServices: ['messaging', 'file uploads']
        },
        priority: 'low',
        category: 'system',
        isRead: false,
        createdAt: new Date('2024-08-01T12:00:00Z')
      },
      
      {
        userId: findUser('priya.sharma@designer.com')._id,
        type: 'platform_update',
        title: 'New Platform Features',
        message: 'New features available: Enhanced portfolio showcase and improved project matching.',
        data: {
          features: ['portfolio showcase', 'project matching', 'skill assessments'],
          updateVersion: '2.1.0'
        },
        priority: 'low',
        category: 'update',
        isRead: false,
        createdAt: new Date('2024-07-30T10:00:00Z')
      },

      // Content Writer notifications
      {
        userId: findUser('emma.thompson@writer.com')._id,
        type: 'contract_signed',
        title: 'Contract Signed',
        message: 'Sarah Johnson has signed the contract for the Tech Blog Content project.',
        data: {
          projectId: projects[4]._id,
          clientId: findUser('sarah.johnson@fintech.com')._id,
          contractAmount: 2200
        },
        priority: 'high',
        category: 'contract',
        isRead: true,
        readAt: new Date('2024-06-13T09:30:00Z'),
        createdAt: new Date('2024-06-13T09:15:00Z')
      },
      
      {
        userId: findUser('emma.thompson@writer.com')._id,
        type: 'weekly_summary',
        title: 'Weekly Summary',
        message: 'Your weekly summary: 3 articles delivered, 1 project completed, $2,200 earned.',
        data: {
          articlesDelivered: 3,
          projectsCompleted: 1,
          weeklyEarnings: 2200,
          weekStart: new Date('2024-07-15'),
          weekEnd: new Date('2024-07-21')
        },
        priority: 'low',
        category: 'summary',
        isRead: false,
        createdAt: new Date('2024-07-21T18:00:00Z')
      },

      // Admin notifications
      {
        userId: findAdminUser()._id,
        type: 'user_verification',
        title: 'User Verification Required',
        message: 'New freelancer Li Wei has submitted documents for profile verification.',
        data: {
          userId: findUser('li.wei@datascientist.com')._id,
          documentType: 'identity_verification',
          submittedAt: new Date('2024-07-18T14:30:00Z')
        },
        priority: 'medium',
        category: 'admin',
        isRead: true,
        readAt: new Date('2024-07-19T09:00:00Z'),
        createdAt: new Date('2024-07-18T14:30:00Z')
      },
      
      {
        userId: findAdminUser()._id,
        type: 'dispute_raised',
        title: 'Project Dispute Raised',
        message: 'A dispute has been raised for the WordPress Development project.',
        data: {
          projectId: projects[5]._id,
          disputeType: 'scope_disagreement',
          raisedBy: 'client',
          disputeAmount: 1000
        },
        priority: 'high',
        category: 'dispute',
        isRead: false,
        createdAt: new Date('2024-08-01T11:30:00Z')
      }
    ];

    return this.notificationModel.insertMany(notifications);
  }

  async drop(): Promise<any> {
    return this.notificationModel.deleteMany({});
  }
}
