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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  SubmitProposalDto,
} from '../../dto/project.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Projects')
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Project created successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only clients can create projects' })
  async createProject(
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.createProject(createProjectDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all projects with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Project category' })
  @ApiQuery({ name: 'skills', required: false, type: [String], description: 'Required skills' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Project location' })
  @ApiQuery({ name: 'projectType', required: false, enum: ['fixed', 'hourly'], description: 'Project type' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'in_progress', 'completed', 'cancelled'], description: 'Project status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Projects retrieved successfully' })
  async getProjects(
    @Query(ValidationPipe) filterDto: ProjectFilterDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.projectsService.getProjects(filterDto, userId);
  }

  @Get('my-projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user projects' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User projects retrieved successfully' })
  async getMyProjects(@Request() req: any, @Query('status') status?: string) {
    return this.projectsService.getMyProjects(req.user.id, status);
  }

    // Public endpoints (no authentication required)
  @Get('public')
  @ApiOperation({ summary: 'Browse projects publicly (no authentication required)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minBudget', required: false, type: Number })
  @ApiQuery({ name: 'maxBudget', required: false, type: Number })
  @ApiQuery({ name: 'projectType', required: false, enum: ['fixed', 'hourly'] })
  @ApiQuery({ name: 'skills', required: false, type: String, description: 'Comma-separated skills' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Public projects retrieved successfully' })
  async getPublicProjects(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('category') category?: string,
    @Query('minBudget') minBudget?: number,
    @Query('maxBudget') maxBudget?: number,
    @Query('projectType') projectType?: 'fixed' | 'hourly',
    @Query('skills') skills?: string,
  ) {
    return this.projectsService.getPublicProjects({
      page,
      limit,
      category,
      minBudget,
      maxBudget,
      projectType,
      skills: skills?.split(',').map(s => s.trim()),
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  async getProjectById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.projectsService.getProjectById(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only update your own projects' })
  async updateProject(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.updateProject(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only delete your own projects' })
  async deleteProject(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.deleteProject(id, req.user.id);
  }

  @Post(':id/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a proposal to a project' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Proposal submitted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Project is not accepting proposals' })
  async submitProposal(
    @Param('id') projectId: string,
    @Body(ValidationPipe) proposalDto: SubmitProposalDto,
    @Request() req: any,
  ) {
    return this.projectsService.submitProposal(projectId, proposalDto, req.user.id);
  }

  @Get(':id/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get proposals for a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Proposals retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only view proposals for your own projects' })
  async getProjectProposals(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.getProjectProposals(projectId, req.user.id);
  }

  @Post('proposals/:proposalId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a proposal' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Proposal accepted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proposal not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only accept proposals for your own projects' })
  async acceptProposal(@Param('proposalId') proposalId: string, @Request() req: any) {
    return this.projectsService.acceptProposal(proposalId, req.user.id);
  }

  @Post('proposals/:proposalId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a proposal' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Proposal rejected successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proposal not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only reject proposals for your own projects' })
  async rejectProposal(@Param('proposalId') proposalId: string, @Request() req: any) {
    return this.projectsService.rejectProposal(proposalId, req.user.id);
  }

  @Get('freelancer/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get freelancer proposals' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Freelancer proposals retrieved successfully' })
  async getFreelancerProposals(@Request() req: any, @Query('status') status?: string) {
    return this.projectsService.getFreelancerProposals(req.user.id, status);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark project as completed' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project completed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only complete your own projects' })
  async completeProject(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.completeProject(projectId, req.user.id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project analytics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only view analytics for your own projects' })
  async getProjectAnalytics(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.getProjectAnalytics(projectId, req.user.id);
  }

  @Get(':id/bookmark')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project bookmarked successfully' })
  async bookmarkProject(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.bookmarkProject(projectId, req.user.id);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove bookmark from project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookmark removed successfully' })
  async removeBookmark(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.removeBookmark(projectId, req.user.id);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('freelancer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended projects for freelancer' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recommended projects retrieved successfully' })
  async getRecommendedProjects(@Request() req: any, @Query('limit') limit: number = 20) {
    return this.projectsService.getRecommendedProjects(req.user.id, limit);
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project templates' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project templates retrieved successfully' })
  async getProjectTemplates(@Query('category') category?: string) {
    return this.projectsService.getProjectTemplates(category);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('client')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite freelancer to project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Freelancer invited successfully' })
  async inviteFreelancer(
    @Param('id') projectId: string,
    @Body() inviteDto: { freelancerId: string; message?: string },
    @Request() req: any
  ) {
    return this.projectsService.inviteFreelancer(projectId, inviteDto.freelancerId, req.user.id, inviteDto.message);
  }
}
