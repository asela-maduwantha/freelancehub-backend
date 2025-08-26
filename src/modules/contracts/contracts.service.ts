import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument } from '../../schemas/contract.schema';
import { Project, ProjectDocument } from '../../schemas/project.schema';
import { Proposal, ProposalDocument } from '../../schemas/proposal.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import {
  CreateContractDto,
  UpdateContractDto,
  SubmitMilestoneDto,
  ReviewMilestoneDto,
  ContractModificationDto,
  UpdateContractStatusDto,
  SearchContractsDto,
  PaginatedContractsResponseDto,
} from '../../dto/contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create a new contract from an accepted proposal
  async createContract(createContractDto: CreateContractDto, clientId: string): Promise<Contract> {
    const { projectId, freelancerId, proposalId, terms, milestones } = createContractDto;

    // Validate project exists and belongs to client
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.clientId.toString() !== clientId) {
      throw new ForbiddenException('You can only create contracts for your own projects');
    }

    // Validate proposal exists and is accepted
    const proposal = await this.proposalModel.findById(proposalId);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    if (proposal.status !== 'accepted') {
      throw new BadRequestException('Can only create contracts from accepted proposals');
    }

    // Validate freelancer exists
    const freelancer = await this.userModel.findById(freelancerId);
    if (!freelancer) {
      throw new NotFoundException('Freelancer not found');
    }

    // Check if contract already exists for this project
    const existingContract = await this.contractModel.findOne({ projectId });
    if (existingContract) {
      throw new BadRequestException('Contract already exists for this project');
    }

    // Validate milestone amounts sum to total amount
    const milestoneTotal = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    if (Math.abs(milestoneTotal - terms.totalAmount) > 0.01) {
      throw new BadRequestException('Milestone amounts must sum to total contract amount');
    }

    // Create contract
    const contract = new this.contractModel({
      projectId: new Types.ObjectId(projectId),
      clientId: new Types.ObjectId(clientId),
      freelancerId: new Types.ObjectId(freelancerId),
      proposalId: new Types.ObjectId(proposalId),
      terms,
      milestones: milestones.map((milestone, index) => ({
        ...milestone,
        status: index === 0 ? 'pending' : 'pending', // First milestone starts as pending
      })),
      currentMilestone: 0,
      status: 'draft',
      startDate: new Date(),
    });

    const savedContract = await contract.save();

    // Update project status
    await this.projectModel.findByIdAndUpdate(projectId, {
      status: 'in_progress',
      selectedFreelancer: freelancerId,
      contract: savedContract._id,
    });

    return savedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Get contract by ID
  async getContractById(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.contractModel
      .findById(contractId)
      .populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Check if user has access to this contract
    if (
      contract.clientId.toString() !== userId &&
      contract.freelancerId.toString() !== userId
    ) {
      throw new ForbiddenException('You do not have access to this contract');
    }

    return contract;
  }

  // Get contracts for a user (client or freelancer)
  async getUserContracts(
    userId: string,
    searchDto: SearchContractsDto,
  ): Promise<PaginatedContractsResponseDto> {
    const { 
      status, 
      category, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = searchDto;

    // Build query
    const query: any = {
      $or: [{ clientId: userId }, { freelancerId: userId }],
    };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build aggregation pipeline for category filtering
    const pipeline: any[] = [
      { $match: query },
    ];

    if (category) {
      pipeline.push(
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project',
          },
        },
        {
          $match: {
            'project.category': category,
          },
        },
      );
    }

    // Add population
    pipeline.push(
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'clientId',
          foreignField: '_id',
          as: 'clientDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'freelancerId',
          foreignField: '_id',
          as: 'freelancerDetails',
        },
      },
    );

    // Add sorting
    const sortStage: any = {};
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sortStage });

    // Execute aggregation for total count
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await this.contractModel.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit },
    );

    const contracts = await this.contractModel.aggregate(pipeline);

    return {
      contracts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update contract details
  async updateContract(
    contractId: string,
    updateContractDto: UpdateContractDto,
    userId: string,
  ): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only client can update contract before it's active
    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('Only the client can update contract details');
    }

    if (contract.status !== 'draft') {
      throw new BadRequestException('Can only update contracts in draft status');
    }

    // Validate milestone amounts if milestones are being updated
    if (updateContractDto.milestones) {
      const totalAmount = updateContractDto.terms?.totalAmount || contract.terms.totalAmount;
      const milestoneTotal = updateContractDto.milestones.reduce(
        (sum, milestone) => sum + milestone.amount,
        0,
      );

      if (Math.abs(milestoneTotal - totalAmount) > 0.01) {
        throw new BadRequestException('Milestone amounts must sum to total contract amount');
      }
    }

    const updatedContract = await this.contractModel
      .findByIdAndUpdate(contractId, updateContractDto, { new: true })
      .populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);

    if (!updatedContract) {
      throw new NotFoundException('Contract not found after update');
    }

    return updatedContract;
  }

  // Activate contract (move from draft to active)
  async activateContract(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only client can activate contract
    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('Only the client can activate the contract');
    }

    if (contract.status !== 'draft') {
      throw new BadRequestException('Can only activate contracts in draft status');
    }

    // Update contract status and first milestone
    contract.status = 'active';
    contract.startDate = new Date();
    
    // Set first milestone to in_progress
    if (contract.milestones.length > 0) {
      contract.milestones[0].status = 'in_progress';
    }

    const updatedContract = await contract.save();
    return updatedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Submit milestone deliverables
  async submitMilestone(
    contractId: string,
    milestoneIndex: number,
    submitDto: SubmitMilestoneDto,
    freelancerId: string,
  ): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new ForbiddenException('Only the assigned freelancer can submit milestones');
    }

    if (contract.status !== 'active') {
      throw new BadRequestException('Contract must be active to submit milestones');
    }

    if (milestoneIndex >= contract.milestones.length) {
      throw new BadRequestException('Invalid milestone index');
    }

    const milestone = contract.milestones[milestoneIndex];

    if (milestone.status !== 'in_progress') {
      throw new BadRequestException('Milestone must be in progress to submit');
    }

    // Add submission
    milestone.submissions.push({
      files: submitDto.files,
      notes: submitDto.notes,
      submittedAt: new Date(),
    });

    milestone.status = 'submitted';

    const updatedContract = await contract.save();
    return updatedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Review milestone submission
  async reviewMilestone(
    contractId: string,
    milestoneIndex: number,
    reviewDto: ReviewMilestoneDto,
    clientId: string,
  ): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.clientId.toString() !== clientId) {
      throw new ForbiddenException('Only the client can review milestones');
    }

    if (milestoneIndex >= contract.milestones.length) {
      throw new BadRequestException('Invalid milestone index');
    }

    const milestone = contract.milestones[milestoneIndex];

    if (milestone.status !== 'submitted') {
      throw new BadRequestException('Milestone must be submitted for review');
    }

    // Update milestone based on review
    milestone.feedback = reviewDto.feedback;

    if (reviewDto.status === 'approved') {
      milestone.status = 'approved';
      milestone.approvedAt = new Date();

      // Start next milestone if available
      if (milestoneIndex + 1 < contract.milestones.length) {
        contract.milestones[milestoneIndex + 1].status = 'in_progress';
        contract.currentMilestone = milestoneIndex + 1;
      } else {
        // All milestones completed
        contract.status = 'completed';
        contract.completedAt = new Date();

        // Update project status
        await this.projectModel.findByIdAndUpdate(contract.projectId, {
          status: 'completed',
        });
      }
    } else {
      milestone.status = 'rejected';
      milestone.rejectedAt = new Date();
      milestone.rejectionReason = reviewDto.rejectionReason;
      
      // Set back to in_progress for resubmission
      milestone.status = 'in_progress';
    }

    const updatedContract = await contract.save();
    return updatedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Request contract modification
  async requestModification(
    contractId: string,
    modificationDto: ContractModificationDto,
    requesterId: string,
  ): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Check if user is part of the contract
    if (
      contract.clientId.toString() !== requesterId &&
      contract.freelancerId.toString() !== requesterId
    ) {
      throw new ForbiddenException('You are not part of this contract');
    }

    if (contract.status !== 'active') {
      throw new BadRequestException('Can only modify active contracts');
    }

    // Add modification request
    contract.modifications.push({
      type: modificationDto.type,
      description: modificationDto.description,
      previousValue: modificationDto.previousValue,
      newValue: modificationDto.newValue,
      requestedBy: new Types.ObjectId(requesterId),
      status: 'pending',
      requestedAt: new Date(),
    });

    const updatedContract = await contract.save();
    return updatedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Approve/reject contract modification
  async handleModification(
    contractId: string,
    modificationIndex: number,
    approve: boolean,
    rejectionReason: string = '',
    userId: string,
  ): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (modificationIndex >= contract.modifications.length) {
      throw new BadRequestException('Invalid modification index');
    }

    const modification = contract.modifications[modificationIndex];

    // Check if user can approve (opposite party from requester)
    const isClient = contract.clientId.toString() === userId;
    const isFreelancer = contract.freelancerId.toString() === userId;
    const wasRequestedByClient = modification.requestedBy.toString() === contract.clientId.toString();

    if (wasRequestedByClient && !isFreelancer) {
      throw new ForbiddenException('Only the freelancer can approve client-requested modifications');
    }
    if (!wasRequestedByClient && !isClient) {
      throw new ForbiddenException('Only the client can approve freelancer-requested modifications');
    }

    if (modification.status !== 'pending') {
      throw new BadRequestException('Modification has already been processed');
    }

    if (approve) {
      modification.status = 'approved';
      modification.approvedAt = new Date();

      // Apply the modification based on type
      switch (modification.type) {
        case 'budget_increase':
          contract.terms.totalAmount = modification.newValue;
          break;
        case 'timeline_extension':
          contract.endDate = modification.newValue;
          break;
        case 'scope_change':
          contract.terms.scope = modification.newValue;
          break;
        // Add more modification types as needed
      }
    } else {
      modification.status = 'rejected';
      modification.rejectedAt = new Date();
      modification.rejectionReason = rejectionReason;
    }

    const updatedContract = await contract.save();
    return updatedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Update contract status
  async updateContractStatus(
    contractId: string,
    statusDto: UpdateContractStatusDto,
    userId: string,
  ): Promise<Contract> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Check if user has permission to update status
    if (
      contract.clientId.toString() !== userId &&
      contract.freelancerId.toString() !== userId
    ) {
      throw new ForbiddenException('You do not have permission to update this contract');
    }

    // Validate status transitions
    const validTransitions = {
      draft: ['active', 'cancelled'],
      active: ['completed', 'cancelled', 'disputed', 'paused'],
      paused: ['active', 'cancelled'],
      disputed: ['active', 'cancelled'],
    };

    if (!validTransitions[contract.status]?.includes(statusDto.status)) {
      throw new BadRequestException(`Cannot change status from ${contract.status} to ${statusDto.status}`);
    }

    // Update status and related fields
    contract.status = statusDto.status;

    if (statusDto.status === 'completed') {
      contract.completedAt = new Date();
      await this.projectModel.findByIdAndUpdate(contract.projectId, { status: 'completed' });
    } else if (statusDto.status === 'cancelled') {
      contract.cancelledAt = new Date();
      contract.cancellationReason = statusDto.reason;
      await this.projectModel.findByIdAndUpdate(contract.projectId, { status: 'cancelled' });
    }

    const updatedContract = await contract.save();
    return updatedContract.populate(['projectId', 'clientId', 'freelancerId', 'proposalId']);
  }

  // Get contract statistics
  async getContractStats(userId: string): Promise<any> {
    const stats = await this.contractModel.aggregate([
      {
        $match: {
          $or: [{ clientId: new Types.ObjectId(userId) }, { freelancerId: new Types.ObjectId(userId) }],
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$terms.totalAmount' },
        },
      },
    ]);

    const isClient = await this.contractModel.findOne({ clientId: userId });
    const role = isClient ? 'client' : 'freelancer';

    return {
      role,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalValue: stat.totalValue,
        };
        return acc;
      }, {}),
    };
  }

  // Delete contract (only if in draft status)
  async deleteContract(contractId: string, userId: string): Promise<void> {
    const contract = await this.contractModel.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    // Only client can delete and only in draft status
    if (contract.clientId.toString() !== userId) {
      throw new ForbiddenException('Only the client can delete the contract');
    }

    if (contract.status !== 'draft') {
      throw new BadRequestException('Can only delete contracts in draft status');
    }

    await this.contractModel.findByIdAndDelete(contractId);

    // Update project status back to open
    await this.projectModel.findByIdAndUpdate(contract.projectId, {
      status: 'open',
      selectedFreelancer: null,
      contract: null,
    });
  }
}
