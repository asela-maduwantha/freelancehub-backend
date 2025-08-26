import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
  ) {}

  async createProject(createProjectDto: CreateProjectDto, clientId: string): Promise<Project> {
    const client = await this.userModel.findById(clientId);
    if (!client || !client.roles.includes('client')) {
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
    if (!freelancer || !freelancer.roles.includes('freelancer')) {
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

  async acceptProposal(proposalId: string, clientId: string): Promise<{ success: boolean }> {
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

    return { success: true };
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
}
