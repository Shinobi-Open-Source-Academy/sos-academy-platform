import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminSessionGuard } from '../../common/guards/admin-session.guard';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { UpdateCallIdDto } from './dto/update-call-id.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @UseGuards(AdminSessionGuard)
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
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiBody({ type: UpdateCalendarEventDto })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(@Param('id') id: string, @Body() updateCalendarEventDto: UpdateCalendarEventDto) {
    return this.calendarService.update(id, updateCalendarEventDto);
  }

  @Delete('events/:id')
  @UseGuards(AdminSessionGuard)
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
  @ApiResponse({ status: 200, description: 'Invite link generated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async generateInviteLink(@Param('id') id: string) {
    return this.calendarService.generateInviteLink(id);
  }

  @Patch('events/:id/call-id')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Update event with NotesBot callId' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiBody({ type: UpdateCallIdDto })
  @ApiResponse({ status: 200, description: 'CallId updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Invalid callId format' })
  async updateCallId(@Param('id') id: string, @Body() updateCallIdDto: UpdateCallIdDto) {
    return this.calendarService.updateCallId(id, updateCallIdDto.callId);
  }

  @Post('events/:id/fetch-summary')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Fetch summary from NotesBot and store it' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Summary fetched and stored successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event has no callId' })
  @ApiResponse({ status: 500, description: 'Failed to fetch summary from NotesBot' })
  async fetchSummary(@Param('id') id: string) {
    return this.calendarService.fetchAndStoreSummary(id);
  }
}
