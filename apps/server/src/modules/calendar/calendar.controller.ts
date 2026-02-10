import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateAvailabilitySlotDto } from './dto/update-availability-slot.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiBody({ type: CreateCalendarEventDto })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async create(@Body() createCalendarEventDto: CreateCalendarEventDto) {
    return this.calendarService.create(createCalendarEventDto);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all calendar events' })
  @ApiResponse({ status: 200, description: 'List of all events' })
  async findAll() {
    return this.calendarService.findAll();
  }

  @Get('events/upcoming')
  @ApiOperation({ summary: 'Get upcoming events (public)' })
  @ApiResponse({ status: 200, description: 'List of upcoming events' })
  async findUpcoming() {
    return this.calendarService.findUpcoming(5);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiBody({ type: UpdateCalendarEventDto })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateCalendarEventDto: UpdateCalendarEventDto) {
    return this.calendarService.update(id, updateCalendarEventDto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }

  @Get('events/:id/invite-link')
  @ApiOperation({ summary: 'Generate calendar invite link' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Invite link generated successfully',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async generateInviteLink(@Param('id') id: string) {
    return this.calendarService.generateInviteLink(id);
  }

  @Post('availability/slots')
  @ApiOperation({ summary: 'Create a mentor availability slot' })
  @ApiBody({ type: CreateAvailabilitySlotDto })
  @ApiResponse({
    status: 201,
    description: 'Availability slot created successfully',
  })
  async createAvailabilitySlot(@Body() dto: CreateAvailabilitySlotDto) {
    return this.calendarService.createAvailabilitySlot(dto);
  }

  @Get('availability/slots')
  @ApiOperation({ summary: 'List mentor availability slots' })
  @ApiResponse({ status: 200, description: 'List of availability slots' })
  async listAvailabilitySlots(
    @Query('mentorId') mentorId: string,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    if (!mentorId) {
      throw new BadRequestException('mentorId is required');
    }
    const startDate = this.parseDate(start);
    const endDate = this.parseDate(end);
    return this.calendarService.listAvailabilitySlots(mentorId, startDate, endDate);
  }

  @Put('availability/slots/:id')
  @ApiOperation({ summary: 'Update a mentor availability slot' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiBody({ type: UpdateAvailabilitySlotDto })
  @ApiResponse({
    status: 200,
    description: 'Availability slot updated successfully',
  })
  async updateAvailabilitySlot(@Param('id') id: string, @Body() dto: UpdateAvailabilitySlotDto) {
    return this.calendarService.updateAvailabilitySlot(id, dto);
  }

  @Delete('availability/slots/:id')
  @ApiOperation({ summary: 'Delete a mentor availability slot' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability slot deleted successfully',
  })
  async removeAvailabilitySlot(@Param('id') id: string) {
    return this.calendarService.removeAvailabilitySlot(id);
  }

  @Post('availability/blocked')
  @ApiOperation({ summary: 'Create a mentor blocked date' })
  @ApiBody({ type: CreateBlockedDateDto })
  @ApiResponse({
    status: 201,
    description: 'Blocked date created successfully',
  })
  async createBlockedDate(@Body() dto: CreateBlockedDateDto) {
    return this.calendarService.createBlockedDate(dto);
  }

  @Get('availability/blocked')
  @ApiOperation({ summary: 'List mentor blocked dates' })
  @ApiResponse({ status: 200, description: 'List of blocked dates' })
  async listBlockedDates(
    @Query('mentorId') mentorId: string,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    if (!mentorId) {
      throw new BadRequestException('mentorId is required');
    }
    const startDate = this.parseDate(start);
    const endDate = this.parseDate(end);
    return this.calendarService.listBlockedDates(mentorId, startDate, endDate);
  }

  @Delete('availability/blocked/:id')
  @ApiOperation({ summary: 'Delete a mentor blocked date' })
  @ApiParam({ name: 'id', description: 'Blocked date ID' })
  @ApiResponse({
    status: 200,
    description: 'Blocked date deleted successfully',
  })
  async removeBlockedDate(@Param('id') id: string) {
    return this.calendarService.removeBlockedDate(id);
  }

  @Get('availability/booked')
  @ApiOperation({ summary: 'List mentor booked sessions' })
  @ApiResponse({ status: 200, description: 'List of booked sessions' })
  async listBookedSessions(
    @Query('mentorId') mentorId: string,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    if (!mentorId) {
      throw new BadRequestException('mentorId is required');
    }
    const startDate = this.parseDate(start);
    const endDate = this.parseDate(end);
    return this.calendarService.findBookedSessions(mentorId, startDate, endDate);
  }

  private parseDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: ${value}`);
    }
    return date;
  }
}
