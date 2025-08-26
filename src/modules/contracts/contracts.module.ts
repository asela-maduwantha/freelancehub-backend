import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract, ContractSchema } from '../../schemas/contract.schema';
import { Project, ProjectSchema } from '../../schemas/project.schema';
import { Proposal, ProposalSchema } from '../../schemas/proposal.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => ProjectsModule),
  ],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    {
      provide: 'ContractsService',
      useClass: ContractsService,
    },
  ],
  exports: [ContractsService, 'ContractsService'],
})
export class ContractsModule {}
