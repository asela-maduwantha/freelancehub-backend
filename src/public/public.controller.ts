import {
  Controller,
  Get,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller({ path: 'public', version: '1' })
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics for landing page' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Platform statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalProjects: { type: 'number' },
        totalFreelancers: { type: 'number' },
        totalClients: { type: 'number' },
        totalEarnings: { type: 'number' },
        completedProjects: { type: 'number' },
        activeProjects: { type: 'number' },
        averageRating: { type: 'number' },
        countriesRepresented: { type: 'number' }
      }
    }
  })
  async getPlatformStats() {
    return this.publicService.getPlatformStats();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get project categories' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          projectCount: { type: 'number' },
          averageBudget: { type: 'number' },
          popular: { type: 'boolean' }
        }
      }
    }
  })
  async getCategories() {
    return this.publicService.getCategories();
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Get featured testimonials' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of testimonials to return' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Testimonials retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userName: { type: 'string' },
          userRole: { type: 'string', enum: ['client', 'freelancer'] },
          userAvatar: { type: 'string' },
          rating: { type: 'number' },
          comment: { type: 'string' },
          projectTitle: { type: 'string' },
          projectCategory: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getTestimonials(@Query('limit') limit: number = 10) {
    return this.publicService.getFeaturedTestimonials(limit);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get available skills' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'popular', required: false, type: Boolean, description: 'Get only popular skills' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Skills retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          freelancerCount: { type: 'number' },
          projectCount: { type: 'number' },
          averageRate: { type: 'number' },
          trending: { type: 'boolean' }
        }
      }
    }
  })
  async getSkills(
    @Query('category') category?: string,
    @Query('popular') popular?: boolean
  ) {
    return this.publicService.getSkills({ category, popular });
  }

  @Get('featured-projects')
  @ApiOperation({ summary: 'Get featured projects for landing page' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Featured projects retrieved successfully' 
  })
  async getFeaturedProjects(@Query('limit') limit: number = 6) {
    return this.publicService.getFeaturedProjects(limit);
  }

  @Get('featured-freelancers')
  @ApiOperation({ summary: 'Get featured freelancers for landing page' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Featured freelancers retrieved successfully' 
  })
  async getFeaturedFreelancers(@Query('limit') limit: number = 8) {
    return this.publicService.getFeaturedFreelancers(limit);
  }
}
