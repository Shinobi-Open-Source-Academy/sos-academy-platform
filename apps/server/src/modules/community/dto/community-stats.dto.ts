import { ApiProperty } from '@nestjs/swagger';

export class CommunityStatsDto {
  @ApiProperty({
    description: 'Total number of active communities',
    example: 5,
  })
  totalCommunities: number;

  @ApiProperty({
    description: 'Total number of members across all communities',
    example: 150,
  })
  totalMembers: number;

  @ApiProperty({
    description: 'Total number of mentors across all communities',
    example: 25,
  })
  totalMentors: number;

  @ApiProperty({
    description: 'Total number of projects across all communities',
    example: 30,
  })
  totalProjects: number;
}
