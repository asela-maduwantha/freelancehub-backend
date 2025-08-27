import { Injectable, NotFoundException, ForbiddenException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../../schemas/project.schema';
import { Proposal, ProposalDocument } from '../../schemas/proposal.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto, SubmitProposalDto } from '../../dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => 'ContractsService')) private contractsService?: any,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, clientId: string): Promise<Project> {
    const client = await this.userModel.findById(clientId);
    if (!client || !client.role.includes('client')) {
      throw new ForbiddenException('Only clients can create projects');
    }

    const projectData = {
      ...createProjectDto,
      clientId: new Types.ObjectId(clientId),
      skills: createProjectDto.requiredSkills || [],
      attachments: createProjectDto.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const project = new this.projectModel(projectData);
    await project.save();

    return project.populate('clientId', 'username email profile.firstName profile.lastName profile.company');
  }

  async getProjects(filterDto: ProjectFilterDto, userId?: string): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      category,
      budget,
      skills,
      location,
      projectType,
      status = 'open',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = filterDto;

    const skip = (page - 1) * limit;
    const query: any = {};

    // Build query filters
    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (projectType) {
      query.projectType = projectType;
    }

    if (budget) {
      if (budget.min) query['budget.amount'] = { $gte: budget.min };
      if (budget.max) {
        query['budget.amount'] = query['budget.amount'] || {};
        query['budget.amount'].$lte = budget.max;
      }
    }

    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    if (location) {
      if (location.country) {
        query['location.country'] = location.country;
      }
      if (location.city) {
        query['location.city'] = location.city;
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    // If user is provided, exclude their own projects
    if (userId) {
      query.clientId = { $ne: new Types.ObjectId(userId) };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(query)
        .populate('clientId', 'username email profile.firstName profile.lastName profile.company profile.avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(query),
    ]);

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProjectById(projectId: string, userId?: string): Promise<Project> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findById(projectId)
      .populate('clientId', 'username email profile.firstName profile.lastName profile.company profile.avatar')
      .populate('assignedFreelancer', 'username email profile.firstName profile.lastName profile.avatar')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // If user is provided, increment view count (but not for the project owner)
    if (userId && project.clientId.toString() !== userId) {
      await this.projectModel.findByIdAndUpdate(projectId, {
        $addToSet: { viewedBy: new Types.ObjectId(userId) },
      });
    }

    return project;
  }

  async updateProject(projectId: string, updateProjectDto: UpdateProjectDto, clientId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    if (project.status === 'in_progress' || project.status === 'completed') {
      throw new BadRequestException('Cannot update project that is in progress or completed');
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { ...updateProjectDto, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .populate('clientId', 'username email profile.firstName profile.lastName profile.company profile.avatar')
      .exec();

    return updatedProject!;
  }

  async deleteProject(projectId: string, clientId: string): Promise<{ success: boolean }> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    if (project.status === 'in_progress') {
      throw new BadRequestException('Cannot delete project that is in progress');
    }

    // Delete associated proposals
    await this.proposalModel.deleteMany({ projectId: new Types.ObjectId(projectId) });

    await this.projectModel.findByIdAndDelete(projectId);

    return { success: true };
  }

  async getMyProjects(clientId: string, status?: string): Promise<Project[]> {
    const query: any = { clientId: new Types.ObjectId(clientId) };
    
    if (status) {
      query.status = status;
    }

    return this.projectModel
      .find(query)
      .populate('assignedFreelancer', 'username email profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async submitProposal(projectId: string, proposalDto: SubmitProposalDto, freelancerId: string): Promise<Proposal> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== 'open') {
      throw new BadRequestException('Project is not accepting proposals');
    }

    if (project.clientId.toString() === freelancerId) {
      throw new BadRequestException('You cannot submit a proposal to your own project');
    }

    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can submit proposals');
    }

    // Check if freelancer already submitted a proposal
    const existingProposal = await this.proposalModel.findOne({
      projectId: new Types.ObjectId(projectId),
      freelancerId: new Types.ObjectId(freelancerId),
    });

    if (existingProposal) {
      throw new BadRequestException('You have already submitted a proposal for this project');
    }

    const proposalData = {
      ...proposalDto,
      projectId: new Types.ObjectId(projectId),
      freelancerId: new Types.ObjectId(freelancerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const proposal = new this.proposalModel(proposalData);
    await proposal.save();

    // Increment proposal count - will use a proposal counter in the schema
    await this.projectModel.findByIdAndUpdate(projectId, {
      $inc: { 'proposalsCount': 1 },
    });

    return proposal.populate([
      { path: 'freelancerId', select: 'username email profile.firstName profile.lastName profile.avatar' },
      { path: 'projectId', select: 'title budget' },
    ]);
  }

  async getProjectProposals(projectId: string, clientId: string): Promise<Proposal[]> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only view proposals for your own projects');
    }

    return this.proposalModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('freelancerId', 'username email profile.firstName profile.lastName profile.avatar freelancerProfile.hourlyRate freelancerProfile.bio')
      .sort({ createdAt: -1 })
      .exec();
  }

  async acceptProposal(proposalId: string, clientId: string): Promise<{ success: boolean; contractId?: string }> {
    const proposal = await this.proposalModel
      .findById(proposalId)
      .populate('projectId')
      .exec();

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const project = proposal.projectId as any;
    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only accept proposals for your own projects');
    }

    if (proposal.status !== 'pending') {
      throw new BadRequestException('Proposal is not in pending status');
    }

    if (project.status !== 'open') {
      throw new BadRequestException('Project is not accepting proposals');
    }

    // Update proposal status
    await this.proposalModel.findByIdAndUpdate(proposalId, {
      status: 'accepted',
      acceptedAt: new Date(),
      updatedAt: new Date(),
    });

    // Update project status and assign freelancer
    await this.projectModel.findByIdAndUpdate(project._id, {
      status: 'in_progress',
      assignedFreelancer: proposal.freelancerId,
      updatedAt: new Date(),
    });

    // Reject all other proposals for this project
    await this.proposalModel.updateMany(
      {
        projectId: project._id,
        _id: { $ne: proposalId },
        status: 'pending',
      },
      {
        status: 'rejected',
        updatedAt: new Date(),
      }
    );

    // Create contract automatically if ContractsService is available
    let contractId: string | undefined;
    if (this.contractsService) {
      try {
        // Convert proposal to contract data
        const contractData = await this.generateContractFromProposal(proposal, project);
        const contract = await this.contractsService.createContract(contractData, clientId);
        contractId = contract._id.toString();
        
        // Update project with contract reference
        await this.projectModel.findByIdAndUpdate(project._id, {
          contract: contract._id,
        });
      } catch (error) {
        console.error('Failed to create contract automatically:', error);
        // Don't fail the proposal acceptance if contract creation fails
      }
    }

    return { success: true, contractId };
  }

  // Helper method to convert proposal to contract data
  private async generateContractFromProposal(proposal: any, project: any): Promise<any> {
    const contractTerms = {
      totalAmount: proposal.pricing.amount,
      currency: proposal.pricing.currency || 'USD',
      paymentType: proposal.pricing.type,
      hourlyRate: proposal.pricing.type === 'hourly' ? proposal.pricing.amount : undefined,
      estimatedHours: proposal.pricing.estimatedHours,
      scope: project.description,
      deliverables: project.deliverables || [project.description],
      deadline: proposal.timeline?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      revisions: 2, // Default revisions
      additionalTerms: proposal.coverLetter || '',
    };

    // Convert timeline milestones to contract milestones
    const milestones = proposal.timeline?.milestones?.length > 0 
      ? proposal.timeline.milestones.map((milestone: any) => ({
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          dueDate: milestone.deliveryDate || milestone.dueDate,
          deliverables: [milestone.description],
        }))
      : [
          {
            title: 'Project Completion',
            description: 'Complete all project deliverables',
            amount: proposal.pricing.amount,
            dueDate: proposal.timeline?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            deliverables: [project.description],
          }
        ];

    return {
      projectId: project._id.toString(),
      freelancerId: proposal.freelancerId.toString(),
      proposalId: proposal._id.toString(),
      terms: contractTerms,
      milestones,
    };
  }

  async rejectProposal(proposalId: string, clientId: string): Promise<{ success: boolean }> {
    const proposal = await this.proposalModel
      .findById(proposalId)
      .populate('projectId')
      .exec();

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const project = proposal.projectId as any;
    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only reject proposals for your own projects');
    }

    if (proposal.status !== 'pending') {
      throw new BadRequestException('Proposal is not in pending status');
    }

    await this.proposalModel.findByIdAndUpdate(proposalId, {
      status: 'rejected',
      updatedAt: new Date(),
    });

    return { success: true };
  }

  async getFreelancerProposals(freelancerId: string, status?: string): Promise<Proposal[]> {
    const query: any = { freelancerId: new Types.ObjectId(freelancerId) };
    
    if (status) {
      query.status = status;
    }

    return this.proposalModel
      .find(query)
      .populate('projectId', 'title budget status clientId')
      .populate({
        path: 'projectId',
        populate: {
          path: 'clientId',
          select: 'username email profile.firstName profile.lastName profile.company profile.avatar',
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async completeProject(projectId: string, clientId: string): Promise<{ success: boolean }> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only complete your own projects');
    }

    if (project.status !== 'in_progress') {
      throw new BadRequestException('Project must be in progress to be completed');
    }

    await this.projectModel.findByIdAndUpdate(projectId, {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  }

  async getProjectAnalytics(projectId: string, clientId: string): Promise<any> {
    const project = await this.projectModel.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only view analytics for your own projects');
    }

    const proposalsCount = await this.proposalModel.countDocuments({
      projectId: new Types.ObjectId(projectId),
    });

    const proposalsByStatus = await this.proposalModel.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return {
      views: (project as any).viewedBy?.length || 0,
      proposals: proposalsCount,
      proposalsByStatus: proposalsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      createdAt: (project as any).createdAt,
      updatedAt: (project as any).updatedAt,
    };
  }

  // Public Projects (no authentication)
  async getPublicProjects(filters: {
    page: number;
    limit: number;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    projectType?: 'fixed' | 'hourly';
    skills?: string[];
  }) {
    const { page, limit, category, minBudget, maxBudget, projectType, skills } = filters;
    const skip = (page - 1) * limit;

    const query: any = {
      status: 'active',
      visibility: 'public'
    };

    if (category) {
      query.category = category;
    }

    if (minBudget || maxBudget) {
      query['budget.amount'] = {};
      if (minBudget) query['budget.amount'].$gte = minBudget;
      if (maxBudget) query['budget.amount'].$lte = maxBudget;
    }

    if (projectType) {
      query.projectType = projectType;
    }

    if (skills && skills.length > 0) {
      query.skills = { $in: skills.map(skill => new RegExp(skill, 'i')) };
    }

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(query)
        .populate('clientId', 'username profile.firstName profile.lastName profile.avatar profile.company profile.location')
        .select('-proposalDetails -clientNotes -attachments')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.projectModel.countDocuments(query)
    ]);

    return {
      projects: projects.map(project => ({
        ...project,
        proposalCount: Math.floor(Math.random() * 20), 
        timePosted: this.calculateTimeAgo(project.createdAt)
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Bookmark functionality
  async bookmarkProject(projectId: string, freelancerId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can bookmark projects');
    }

    if (!freelancer.freelancerProfile) {
      freelancer.freelancerProfile = {
        bookmarkedProjects: [],
        skills: [],
        categories: []
      };
    }

    if (!freelancer.freelancerProfile.bookmarkedProjects) {
      freelancer.freelancerProfile.bookmarkedProjects = [];
    }

    if (!freelancer.freelancerProfile.bookmarkedProjects.includes(new Types.ObjectId(projectId))) {
      freelancer.freelancerProfile.bookmarkedProjects.push(new Types.ObjectId(projectId));
      await freelancer.save();
    }

    return { success: true, message: 'Project bookmarked successfully' };
  }

  async removeBookmark(projectId: string, freelancerId: string) {
    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can manage bookmarks');
    }

    if (freelancer.freelancerProfile?.bookmarkedProjects) {
      freelancer.freelancerProfile.bookmarkedProjects = freelancer.freelancerProfile.bookmarkedProjects.filter(
        (id: any) => !id.equals(new Types.ObjectId(projectId))
      );
      await freelancer.save();
    }

    return { success: true, message: 'Bookmark removed successfully' };
  }

  // Recommended projects for freelancers
  async getRecommendedProjects(freelancerId: string, limit: number = 20) {
    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new ForbiddenException('Only freelancers can get recommendations');
    }

    const userSkills = freelancer.freelancerProfile?.skills || [];
    const userCategories = freelancer.freelancerProfile?.categories || [];

    // Build recommendation query
    const query: any = {
      status: 'active',
      clientId: { $ne: new Types.ObjectId(freelancerId) }
    };

    // Match skills or categories
    if (userSkills.length > 0 || userCategories.length > 0) {
      query.$or = [];
      
      if (userSkills.length > 0) {
        query.$or.push({ 
          skills: { $in: userSkills.map(skill => new RegExp(skill, 'i')) } 
        });
      }
      
      if (userCategories.length > 0) {
        query.$or.push({ 
          category: { $in: userCategories } 
        });
      }
    }

    const projects = await this.projectModel
      .find(query)
      .populate('clientId', 'username profile.firstName profile.lastName profile.avatar profile.company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return projects.map(project => ({
      ...project,
      matchScore: this.calculateMatchScore(project, userSkills, userCategories),
      proposalCount: Math.floor(Math.random() * 15)
    }));
  }

  // Project templates
  async getProjectTemplates(category?: string) {
    const templates = [
      {
        id: 'web-app-template',
        title: 'Web Application Development',
        description: 'Build a modern web application with latest technologies',
        category: 'web-development',
        estimatedBudget: { min: 2000, max: 10000 },
        estimatedDuration: '4-8 weeks',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        milestones: [
          'UI/UX Design and Wireframes',
          'Frontend Development',
          'Backend API Development',
          'Database Integration',
          'Testing and Deployment'
        ]
      },
      {
        id: 'mobile-app-template',
        title: 'Mobile App Development',
        description: 'Create a cross-platform mobile application',
        category: 'mobile-development',
        estimatedBudget: { min: 3000, max: 15000 },
        estimatedDuration: '6-12 weeks',
        requiredSkills: ['React Native', 'Flutter', 'iOS', 'Android'],
        milestones: [
          'App Design and Prototyping',
          'Core Functionality Development',
          'API Integration',
          'Testing on Multiple Devices',
          'App Store Submission'
        ]
      },
      {
        id: 'website-template',
        title: 'Business Website',
        description: 'Professional website for your business',
        category: 'web-development',
        estimatedBudget: { min: 500, max: 3000 },
        estimatedDuration: '2-4 weeks',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
        milestones: [
          'Design Mockups',
          'Homepage Development',
          'Content Pages',
          'Contact Forms & Integration',
          'SEO Optimization'
        ]
      }
    ];

    if (category) {
      return templates.filter(template => template.category === category);
    }

    return templates;
  }

  // Invite freelancer to project
  async inviteFreelancer(projectId: string, freelancerId: string, clientId: string, message?: string) {
    const [project, freelancer] = await Promise.all([
      this.projectModel.findById(projectId),
      this.userModel.findById(freelancerId)
    ]);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only invite freelancers to your own projects');
    }

    if (!freelancer || !freelancer.role.includes('freelancer')) {
      throw new NotFoundException('Freelancer not found');
    }

    // Check if already invited
    const existingInvitation = await this.proposalModel.findOne({
      projectId: new Types.ObjectId(projectId),
      freelancerId: new Types.ObjectId(freelancerId),
      type: 'invitation'
    });

    if (existingInvitation) {
      throw new BadRequestException('Freelancer already invited to this project');
    }

    // Create invitation record
    const invitation = new this.proposalModel({
      projectId: new Types.ObjectId(projectId),
      freelancerId: new Types.ObjectId(freelancerId),
      type: 'invitation',
      status: 'pending',
      invitationMessage: message,
      createdAt: new Date()
    });

    await invitation.save();

    // You might want to send a notification here
    
    return { 
      success: true, 
      message: 'Freelancer invited successfully',
      invitationId: invitation._id 
    };
  }

  // Helper methods
  private calculateMatchScore(project: any, userSkills: string[], userCategories: string[]): number {
    let score = 0;
    
    // Category match
    if (userCategories.includes(project.category)) {
      score += 40;
    }
    
    // Skills match
    const projectSkills = project.skills || [];
    const matchingSkills = userSkills.filter(skill => 
      projectSkills.some((ps: string) => ps.toLowerCase().includes(skill.toLowerCase()))
    );
    
    score += (matchingSkills.length / Math.max(userSkills.length, 1)) * 60;
    
    return Math.min(score, 100);
  }

  private calculateTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
}
