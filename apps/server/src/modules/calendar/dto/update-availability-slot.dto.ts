import { PartialType } from '@nestjs/mapped-types';
import { CreateAvailabilitySlotDto } from './create-availability-slot.dto';

export class UpdateAvailabilitySlotDto extends PartialType(CreateAvailabilitySlotDto) {}
