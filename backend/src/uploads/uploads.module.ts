import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminUploadsController } from './admin-uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminUploadsController],
  providers: [UploadsService, JwtAuthGuard, RolesGuard],
})
export class UploadsModule {}
