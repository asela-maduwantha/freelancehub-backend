import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Contract, ContractDocument } from '../schemas/contract.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async getPlatformStats() {
    const [
      totalProjects,
      totalFreelancers, 
      totalClients,
      completedProjects,
      activeProjects,
      totalEarnings,
      averageRating,
      countriesCount
    ] = await Promise.all([
      this.projectModel.countDocuments(),
      this.userModel.countDocuments({ roles: 'freelancer' }),
      this.userModel.countDocuments({ roles: 'client' }),
      this.projectModel.countDocuments({ status: 'completed' }),
      this.projectModel.countDocuments({ status: { $in: ['active', 'in_progress'] } }),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      this.reviewModel.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).then(result => Math.round((result[0]?.avgRating || 0) * 10) / 10),
      this.userModel.distinct('profile.location.country').then(countries => countries.length)
    ]);

    return {
      totalProjects,
      totalFreelancers,
      totalClients,
      completedProjects,
      activeProjects,
      totalEarnings,
      averageRating,
      countriesRepresented: countriesCount
    };
  }

  async getCategories() {
    // Predefined categories with project counts
    const categories = [
      { id: 'web-development', name: 'Web Development', description: 'Frontend, backend, and full-stack development', icon: 'code' },
      { id: 'mobile-development', name: 'Mobile Development', description: 'iOS, Android, and cross-platform apps', icon: 'smartphone' },
      { id: 'design', name: 'Design & Creative', description: 'UI/UX, graphic design, branding', icon: 'palette' },
      { id: 'writing', name: 'Writing & Translation', description: 'Content writing, copywriting, translation', icon: 'edit' },
      { id: 'marketing', name: 'Digital Marketing', description: 'SEO, social media, advertising', icon: 'trending-up' },
      { id: 'data-science', name: 'Data Science & AI', description: 'Machine learning, data analysis, AI', icon: 'brain' },
      { id: 'video-animation', name: 'Video & Animation', description: 'Video editing, 3D animation, motion graphics', icon: 'video' },
      { id: 'business', name: 'Business', description: 'Consulting, project management, strategy', icon: 'briefcase' }
    ];

    // Get project counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const projectCount = await this.projectModel.countDocuments({ 
          category: category.id 
        });
        
        const avgBudgetResult = await this.projectModel.aggregate([
          { $match: { category: category.id } },
          { $group: { _id: null, avgBudget: { $avg: '$budget.amount' } } }
        ]);
        
        return {
          ...category,
          projectCount,
          averageBudget: Math.round(avgBudgetResult[0]?.avgBudget || 0),
          popular: projectCount > 50
        };
      })
    );

    return categoriesWithCounts.sort((a, b) => b.projectCount - a.projectCount);
  }

  async getFeaturedTestimonials(limit: number = 10) {
    const testimonials = await this.reviewModel
      .find({ 
        rating: { $gte: 4.5 },
        comment: { $exists: true, $ne: '' }
      })
      .populate('reviewerId', 'username profile.firstName profile.lastName profile.avatar roles')
      .populate('projectId', 'title category')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .lean() as any[];

    return testimonials.map((testimonial: any) => ({
      id: testimonial._id,
      userName: `${testimonial.reviewerId.profile.firstName} ${testimonial.reviewerId.profile.lastName}`,
      userRole: testimonial.reviewerId.roles.includes('client') ? 'client' : 'freelancer',
      userAvatar: testimonial.reviewerId.profile.avatar,
      rating: testimonial.rating,
      comment: testimonial.comment,
      projectTitle: testimonial.projectId?.title,
      projectCategory: testimonial.projectId?.category,
      createdAt: testimonial.createdAt
    }));
  }

  async getSkills({ category, popular }: { category?: string, popular?: boolean }) {
    // Predefined skills list
    const skillsData = [
      { name: 'JavaScript', category: 'programming' },
      { name: 'React', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'Python', category: 'programming' },
      { name: 'PHP', category: 'backend' },
      { name: 'WordPress', category: 'cms' },
      { name: 'Figma', category: 'design' },
      { name: 'Photoshop', category: 'design' },
      { name: 'SEO', category: 'marketing' },
      { name: 'Content Writing', category: 'writing' },
      { name: 'Flutter', category: 'mobile' },
      { name: 'Swift', category: 'mobile' },
      { name: 'Machine Learning', category: 'ai' },
      { name: 'Data Analysis', category: 'data' }
    ];

    // Get freelancer and project counts for each skill
    const skillsWithData = await Promise.all(
      skillsData.map(async (skill) => {
        const freelancerCount = await this.userModel.countDocuments({
          roles: 'freelancer',
          'freelancerProfile.skills': { $regex: skill.name, $options: 'i' }
        });

        const projectCount = await this.projectModel.countDocuments({
          skills: { $regex: skill.name, $options: 'i' }
        });

        const avgRateResult = await this.userModel.aggregate([
          { 
            $match: { 
              roles: 'freelancer',
              'freelancerProfile.skills': { $regex: skill.name, $options: 'i' }
            }
          },
          { $group: { _id: null, avgRate: { $avg: '$freelancerProfile.hourlyRate.amount' } } }
        ]);

        return {
          id: skill.name.toLowerCase().replace(/\s+/g, '-'),
          name: skill.name,
          category: skill.category,
          freelancerCount,
          projectCount,
          averageRate: Math.round(avgRateResult[0]?.avgRate || 0),
          trending: projectCount > 20
        };
      })
    );

    let filteredSkills = skillsWithData;

    if (category) {
      filteredSkills = filteredSkills.filter(skill => skill.category === category);
    }

    if (popular) {
      filteredSkills = filteredSkills.filter(skill => skill.freelancerCount > 10);
    }

    return filteredSkills.sort((a, b) => b.freelancerCount - a.freelancerCount);
  }

  async getFeaturedProjects(limit: number = 6) {
    return this.projectModel
      .find({ 
        status: 'active',
        featured: true 
      })
      .populate('clientId', 'username profile.firstName profile.lastName profile.avatar')
      .select('-proposalDetails -clientNotes')
      .sort({ createdAt: -1, proposalCount: -1 })
      .limit(limit)
      .lean();
  }

  async getFeaturedFreelancers(limit: number = 8) {
    return this.userModel
      .find({ 
        roles: 'freelancer',
        isVerified: true,
        'freelancerProfile.featured': true
      })
      .select('username profile freelancerProfile.title freelancerProfile.skills freelancerProfile.hourlyRate')
      .sort({ 'freelancerProfile.rating': -1, 'freelancerProfile.completedProjects': -1 })
      .limit(limit)
      .lean();
  }
}
