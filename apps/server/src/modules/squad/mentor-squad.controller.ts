import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICurrentUser, UserRole } from '@sos-academy/shared';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SquadService } from './squad.service';

/**
 * The mentor's own view of their squads. Kept apart from `SquadController` (admin/kage
 * management) and registered before it, so `/squads/mine` isn't read as `/squads/:id`.
 */
@ApiTags('Squads')
@ApiBearerAuth()
@Controller('squads/mine')
@Auth(UserRole.MENTOR, UserRole.KAGE)
export class MentorSquadController {
  constructor(private readonly squadService: SquadService) {}

  @Get()
  @ApiOperation({ summary: "The logged-in mentor's squads and their members" })
  @ApiResponse({ status: 200, description: 'Squads led by the mentor (empty array if none)' })
  @ApiResponse({ status: 403, description: 'Not an active mentor or kage' })
  async findMine(@CurrentUser() user: ICurrentUser) {
    return this.squadService.findMine(String(user._id));
  }
}
