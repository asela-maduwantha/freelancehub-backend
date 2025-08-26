import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class ReviewsSeeder implements Seeder {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async seed(): Promise<any> {
    // Check if reviews already exist
    const existingReviews = await this.reviewModel.find().exec();
    if (existingReviews.length > 0) {
      console.log(`Found ${existingReviews.length} existing reviews. Skipping review seeding.`);
      return;
    }

    // Get users and projects
    const clients = await this.userModel.find({ roles: 'client' }).exec();
    const freelancers = await this.userModel.find({ roles: 'freelancer' }).exec();
    const projects = await this.projectModel.find().exec();
    
    if (clients.length === 0 || freelancers.length === 0 || projects.length === 0) {
      throw new Error('No clients, freelancers, or projects found. Please seed users and projects first.');
    }

    const reviews = [
      // Review 1: Client reviewing Full Stack Developer (Alex Rodriguez)
      {
        projectId: projects[0]._id, // E-commerce Platform
        reviewerId: clients[0]._id, // John Smith (Client)
        revieweeId: freelancers[0]._id, // Alex Rodriguez (Freelancer)
        reviewerType: 'client',
        revieweeType: 'freelancer',
        
        rating: {
          overall: 5.0,
          communication: 5.0,
          quality: 5.0,
          expertise: 5.0,
          professionalism: 5.0,
          delivery: 4.8
        },
        
        title: 'Outstanding Full Stack Developer - Exceeded Expectations!',
        comment: `Alex delivered an exceptional e-commerce platform that exceeded all our expectations. His technical expertise in React and Node.js is top-notch, and he demonstrated excellent problem-solving skills throughout the project.

What impressed me most:
✅ Delivered 2 days ahead of schedule
✅ Code quality was pristine and well-documented
✅ Proactive communication and regular updates
✅ Went above and beyond with additional features
✅ Post-delivery support was outstanding

The platform he built handles our 10,000+ products seamlessly and has already increased our conversion rate by 35%. Alex is a true professional who takes pride in his work. I'll definitely hire him for future projects and highly recommend him to others.

If you're looking for a reliable, skilled full-stack developer who delivers quality work on time, Alex is your guy!`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Exceptional code quality',
          'Excellent communication',
          'Delivered ahead of schedule',
          'Great problem-solving skills',
          'Professional and reliable'
        ],
        
        cons: [
          'None - perfect execution'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-07-22'),
        updatedAt: new Date('2024-07-22')
      },

      // Review 2: Freelancer reviewing Client (mutual review)
      {
        projectId: projects[0]._id, // E-commerce Platform
        reviewerId: freelancers[0]._id, // Alex Rodriguez (Freelancer)
        revieweeId: clients[0]._id, // John Smith (Client)
        reviewerType: 'freelancer',
        revieweeType: 'client',
        
        rating: {
          overall: 4.9,
          communication: 5.0,
          payment: 5.0,
          clarity: 4.8,
          cooperation: 5.0,
          professionalism: 4.8
        },
        
        title: 'Excellent Client - Clear Requirements and Prompt Payments',
        comment: `John was an absolute pleasure to work with! He provided clear project requirements from the start and was always available for questions and clarifications. His feedback was constructive and helped improve the final product.

Highlights of working with John:
✅ Crystal clear project specifications
✅ Prompt payment as agreed
✅ Quick response to questions
✅ Realistic timeline expectations
✅ Collaborative and supportive

John trusted my technical decisions and gave me the creative freedom to implement the best solutions. He was patient during the development process and provided valuable business insights that improved the user experience.

I would definitely work with John again and recommend him to other freelancers. He's the type of client every developer hopes to work with!`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Clear communication',
          'Prompt payments',
          'Realistic expectations',
          'Collaborative approach',
          'Professional attitude'
        ],
        
        cons: [
          'Minor scope changes during development'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-07-23'),
        updatedAt: new Date('2024-07-23')
      },

      // Review 3: Client reviewing UI/UX Designer (Priya Sharma)
      {
        projectId: projects[1]._id, // FinTech Mobile App
        reviewerId: clients[1]._id, // Sarah Johnson (Client)
        revieweeId: freelancers[1]._id, // Priya Sharma (Designer)
        reviewerType: 'client',
        revieweeType: 'freelancer',
        
        rating: {
          overall: 4.7,
          communication: 4.6,
          quality: 4.8,
          expertise: 4.7,
          professionalism: 4.8,
          delivery: 4.6
        },
        
        title: 'Talented Designer with Great Eye for User Experience',
        comment: `Priya created beautiful and intuitive designs for our FinTech mobile app. Her understanding of user experience principles and attention to detail really impressed our team.

What she delivered:
✅ Comprehensive UI/UX designs for all screens
✅ Interactive prototypes for user testing
✅ Detailed design system and components
✅ Accessibility considerations
✅ Developer handoff documentation

The designs she created tested well with our target users, and the development team found her handoff materials very detailed and helpful. Priya was responsive to feedback and made revisions promptly.

The only minor issue was a small delay in the final delivery due to some additional revisions we requested, but the quality of the final product made up for it.

I would recommend Priya for any UI/UX design project, especially for financial or complex applications.`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Excellent design skills',
          'Good understanding of UX principles',
          'Detailed deliverables',
          'Responsive to feedback',
          'Professional attitude'
        ],
        
        cons: [
          'Minor delay in final delivery'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-07-29'),
        updatedAt: new Date('2024-07-29')
      },

      // Review 4: Content Writer review
      {
        projectId: projects[4]._id, // Tech Blog Content
        reviewerId: clients[1]._id, // Sarah Johnson (Client)
        revieweeId: freelancers[4]._id, // Emma Thompson (Content Writer)
        reviewerType: 'client',
        revieweeType: 'freelancer',
        
        rating: {
          overall: 4.6,
          communication: 4.7,
          quality: 4.6,
          expertise: 4.5,
          professionalism: 4.7,
          delivery: 4.5
        },
        
        title: 'Great Content Writer - Quality Articles with Good SEO',
        comment: `Emma delivered high-quality blog articles for our tech company. Her writing is engaging and she has a good understanding of technical topics, which is crucial for our audience.

What she provided:
✅ 20 well-researched articles
✅ SEO-optimized content with target keywords
✅ Engaging headlines and meta descriptions
✅ Proper formatting and structure
✅ Timely delivery of each batch

The articles have started ranking well on Google and we're seeing increased organic traffic. Emma's research skills are excellent and she was able to simplify complex topics without losing technical accuracy.

Some articles needed minor revisions for tone and style to match our brand voice better, but Emma was quick to make the changes.

I would work with Emma again for content projects and recommend her for technical writing assignments.`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Quality writing',
          'Good technical understanding',
          'SEO knowledge',
          'Timely delivery',
          'Professional communication'
        ],
        
        cons: [
          'Minor style adjustments needed'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-07-21'),
        updatedAt: new Date('2024-07-21')
      },

      // Review 5: Mobile Developer review
      {
        projectId: projects[2]._id, // Food Delivery App
        reviewerId: clients[2]._id, // Mike Wilson (Client)
        revieweeId: freelancers[2]._id, // Carlos Silva (Mobile Developer)
        reviewerType: 'client',
        revieweeType: 'freelancer',
        
        rating: {
          overall: 4.8,
          communication: 4.7,
          quality: 4.9,
          expertise: 4.9,
          professionalism: 4.8,
          delivery: 4.7
        },
        
        title: 'Exceptional Mobile Developer - Built a Fantastic App',
        comment: `Carlos built an amazing food delivery app for us using React Native. His expertise in mobile development and attention to performance details really showed in the final product.

Outstanding features he implemented:
✅ Smooth and intuitive user interface
✅ Real-time order tracking with maps
✅ Seamless payment integration
✅ Push notifications system
✅ Excellent performance on both iOS and Android
✅ Clean, maintainable code

The app has been live for 2 months now and we've received excellent feedback from users. Carlos was very professional throughout the project and kept us updated with regular progress reports.

He also provided valuable suggestions for improving the user experience and helped us avoid potential technical pitfalls.

Highly recommend Carlos for any mobile app development project!`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Expert mobile development skills',
          'Excellent app performance',
          'Professional communication',
          'Valuable technical insights',
          'High-quality code'
        ],
        
        cons: [
          'Project took slightly longer than estimated'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-07-16'),
        updatedAt: new Date('2024-07-16')
      },

      // Review 6: Data Scientist review
      {
        projectId: projects[3]._id, // Customer Analytics
        reviewerId: clients[0]._id, // John Smith (Client)
        revieweeId: freelancers[3]._id, // Li Wei (Data Scientist)
        reviewerType: 'client',
        revieweeType: 'freelancer',
        
        rating: {
          overall: 4.9,
          communication: 4.8,
          quality: 5.0,
          expertise: 5.0,
          professionalism: 4.9,
          delivery: 4.8
        },
        
        title: 'Brilliant Data Scientist - Exceptional Insights and Models',
        comment: `Li Wei delivered outstanding results for our customer analytics project. Her expertise in machine learning and data analysis is truly impressive, and the insights she provided have already started improving our business decisions.

What she accomplished:
✅ Comprehensive customer behavior analysis
✅ Highly accurate churn prediction model (94% accuracy)
✅ Effective customer segmentation
✅ Valuable business insights and recommendations
✅ Interactive dashboards for ongoing monitoring
✅ Well-documented code and methodologies

The machine learning models she built are now helping us identify at-risk customers and take proactive measures to improve retention. Li Wei explained complex concepts in simple terms and provided actionable recommendations.

Her work has directly contributed to a 20% improvement in customer retention and better targeting of our marketing campaigns.

I would definitely work with Li Wei again and highly recommend her for any data science or analytics projects.`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Expert data science skills',
          'High model accuracy',
          'Clear explanations',
          'Actionable insights',
          'Excellent documentation'
        ],
        
        cons: [
          'None - exceeded expectations'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-01')
      },

      // Review 7: Logo Design review
      {
        projectId: projects[6]._id, // Logo Design Project
        reviewerId: clients[0]._id, // John Smith (Client)
        revieweeId: freelancers[1]._id, // Using designer for this review
        reviewerType: 'client',
        revieweeType: 'freelancer',
        
        rating: {
          overall: 4.8,
          communication: 4.9,
          quality: 4.8,
          expertise: 4.7,
          professionalism: 4.9,
          delivery: 4.8
        },
        
        title: 'Creative Designer - Beautiful Logo and Brand Identity',
        comment: `The designer created a stunning logo for our tech startup that perfectly captures our brand vision. The creative process was collaborative and the final results exceeded our expectations.

Deliverables received:
✅ 5 initial logo concepts
✅ Multiple revision rounds
✅ Logo in all required formats
✅ Brand guidelines document
✅ Business card design
✅ Social media variations

The logo has received great feedback from our customers and partners. It's modern, professional, and memorable - exactly what we were looking for.

The designer was very responsive to feedback and made revisions quickly. The entire process was smooth and professional.

Highly recommend for any branding or logo design needs!`,
        
        projectOutcome: 'completed_successfully',
        
        pros: [
          'Creative and original designs',
          'Responsive to feedback',
          'Professional delivery',
          'Complete brand package',
          'Excellent communication'
        ],
        
        cons: [
          'Initial concepts needed some refinement'
        ],
        
        wouldWorkAgain: true,
        wouldRecommend: true,
        
        isPublic: true,
        isVerified: true,
        
        createdAt: new Date('2024-07-06'),
        updatedAt: new Date('2024-07-06')
      }
    ];

    return this.reviewModel.insertMany(reviews);
  }

  async drop(): Promise<any> {
    return this.reviewModel.deleteMany({});
  }
}
