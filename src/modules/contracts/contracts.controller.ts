import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractDto,
  SubmitMilestoneDto,
  ReviewMilestoneDto,
  ContractModificationDto,
  UpdateContractStatusDto,
  SearchContractsDto,
  ContractResponseDto,
  PaginatedContractsResponseDto,
} from '../../dto/contract.dto';

@ApiTags('Contracts')
@Controller({ path: 'contracts', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('client')
  @ApiOperation({ summary: 'Create a new contract from accepted proposal' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contract created successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid contract data' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only clients can create contracts' })
  async createContract(
    @Body(ValidationPipe) createContractDto: CreateContractDto,
    @Request() req: any,
  ) {
    return this.contractsService.createContract(createContractDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user contracts with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'active', 'completed', 'cancelled', 'disputed', 'paused'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'totalAmount', 'status', 'deadline'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contracts retrieved successfully',
    type: PaginatedContractsResponseDto,
  })
  async getUserContracts(
    @Query() searchDto: SearchContractsDto,
    @Request() req: any,
  ) {
    return this.contractsService.getUserContracts(req.user.id, searchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contract statistics for the user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['client', 'freelancer'] },
        stats: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              count: { type: 'number' },
              totalValue: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getContractStats(@Request() req: any) {
    return this.contractsService.getContractStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract retrieved successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contract not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  async getContractById(@Param('id') contractId: string, @Request() req: any) {
    return this.contractsService.getContractById(contractId, req.user.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('client')
  @ApiOperation({ summary: 'Update contract details (draft contracts only)' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract updated successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid update data or contract not in draft' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only clients can update contracts' })
  async updateContract(
    @Param('id') contractId: string,
    @Body(ValidationPipe) updateContractDto: UpdateContractDto,
    @Request() req: any,
  ) {
    return this.contractsService.updateContract(contractId, updateContractDto, req.user.id);
  }

  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('client')
  @ApiOperation({ summary: 'Activate contract (move from draft to active)' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract activated successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Contract not in draft status' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only clients can activate contracts' })
  async activateContract(@Param('id') contractId: string, @Request() req: any) {
    return this.contractsService.activateContract(contractId, req.user.id);
  }

  @Post(':id/milestones/:milestoneIndex/submit')
  @UseGuards(RolesGuard)
  @Roles('freelancer')
  @ApiOperation({ summary: 'Submit milestone deliverables' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiParam({ name: 'milestoneIndex', description: 'Milestone index', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Milestone submitted successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid milestone or contract status' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only assigned freelancer can submit milestones' })
  async submitMilestone(
    @Param('id') contractId: string,
    @Param('milestoneIndex', ParseIntPipe) milestoneIndex: number,
    @Body(ValidationPipe) submitDto: SubmitMilestoneDto,
    @Request() req: any,
  ) {
    return this.contractsService.submitMilestone(contractId, milestoneIndex, submitDto, req.user.id);
  }

  @Post(':id/milestones/:milestoneIndex/review')
  @UseGuards(RolesGuard)
  @Roles('client')
  @ApiOperation({ summary: 'Review submitted milestone' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiParam({ name: 'milestoneIndex', description: 'Milestone index', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Milestone reviewed successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Milestone not submitted for review' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only clients can review milestones' })
  async reviewMilestone(
    @Param('id') contractId: string,
    @Param('milestoneIndex', ParseIntPipe) milestoneIndex: number,
    @Body(ValidationPipe) reviewDto: ReviewMilestoneDto,
    @Request() req: any,
  ) {
    return this.contractsService.reviewMilestone(contractId, milestoneIndex, reviewDto, req.user.id);
  }

  @Post(':id/modifications')
  @ApiOperation({ summary: 'Request contract modification' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Modification request submitted successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Contract not active' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not part of this contract' })
  async requestModification(
    @Param('id') contractId: string,
    @Body(ValidationPipe) modificationDto: ContractModificationDto,
    @Request() req: any,
  ) {
    return this.contractsService.requestModification(contractId, modificationDto, req.user.id);
  }

  @Post(':id/modifications/:modificationIndex/approve')
  @ApiOperation({ summary: 'Approve contract modification' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiParam({ name: 'modificationIndex', description: 'Modification index', type: 'number' })
  @ApiQuery({ name: 'approve', type: 'boolean', description: 'Whether to approve or reject' })
  @ApiQuery({ name: 'rejectionReason', required: false, type: String, description: 'Reason for rejection if approve=false' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Modification processed successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid modification or already processed' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Cannot approve own modification request' })
  async handleModification(
    @Param('id') contractId: string,
    @Param('modificationIndex', ParseIntPipe) modificationIndex: number,
    @Query('approve', ParseBoolPipe) approve: boolean,
    @Query('rejectionReason') rejectionReason: string = '',
    @Request() req: any,
  ) {
    return this.contractsService.handleModification(
      contractId,
      modificationIndex,
      approve,
      rejectionReason,
      req.user.id,
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update contract status' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract status updated successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status transition' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'No permission to update contract status' })
  async updateContractStatus(
    @Param('id') contractId: string,
    @Body(ValidationPipe) statusDto: UpdateContractStatusDto,
    @Request() req: any,
  ) {
    return this.contractsService.updateContractStatus(contractId, statusDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('client')
  @ApiOperation({ summary: 'Delete contract (draft contracts only)' })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Contract not in draft status' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only clients can delete contracts' })
  async deleteContract(@Param('id') contractId: string, @Request() req: any) {
    await this.contractsService.deleteContract(contractId, req.user.id);
    return {
      message: 'Contract deleted successfully',
      success: true,
    };
  }
}
