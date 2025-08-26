import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder } from 'nestjs-seeder';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed(): Promise<any> {
    // Check if users already exist
    const existingUsers = await this.userModel.find().exec();
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users. Skipping user seeding.`);
      return;
    }
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    
    const users = [
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

    return this.userModel.insertMany(users);
  }

  async drop(): Promise<any> {
    return this.userModel.deleteMany({});
  }
}
