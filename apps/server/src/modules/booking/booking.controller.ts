import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApproveBookingDto, RejectBookingDto, CancelBookingDto } from './dto/update-booking.dto';
import {
  SetAvailabilityDto,
  UpdateAvailabilityDto,
  GetAvailableSlotsDto,
  AvailabilityResponseDto,
  AvailableSlotsResponseDto,
  UpdateDayAvailabilityDto,
  UpdateDateOverrideDto,
} from './dto/availability.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { BookingStatus } from './interfaces/booking-status.enum';

/**
 * Controller handling all booking-related HTTP requests
 * Follows RESTful API design principles
 */
@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create a new booking request
   */
  @Post()
  @ApiOperation({
    summary: 'Student requests a booking with a mentor',
    description: 'Creates a new booking request with REQUESTED status',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: 'Booking request created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Mentor not found' })
  @ApiResponse({ status: 409, description: 'Time slot conflict' })
  async createBookingRequest(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    // For testing: accept studentId from body, otherwise get from auth
    // TODO: Remove studentId from body in production and use only auth
    const studentId = createBookingDto.studentId || req.user?.id;

    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }

    return this.bookingService.createBookingRequest(studentId, createBookingDto);
  }

  /**
   * Mentor approves a booking request
   */
  @Put(':id/approve')
  @ApiOperation({
    summary: 'Mentor approves a booking request',
    description: 'Changes booking status to APPROVED and adds meeting link',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({ type: ApproveBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking approved successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async approveBooking(
    @Param('id') id: string,
    @Body() approveDto: ApproveBookingDto,
    @Req() req: any
  ) {
    // For testing: accept mentorId from body, otherwise get from auth
    // TODO: Remove mentorId from body in production and use only auth
    const mentorId = approveDto.mentorId || req.user?.id;

    if (!mentorId) {
      throw new BadRequestException('Mentor ID is required');
    }

    return this.bookingService.approveBooking(id, mentorId, approveDto);
  }

  /**
   * Mentor rejects a booking request
   */
  @Put(':id/reject')
  @ApiOperation({
    summary: 'Mentor rejects a booking request',
    description: 'Changes booking status to REJECTED with reason',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({ type: RejectBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking rejected',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async rejectBooking(
    @Param('id') id: string,
    @Body() rejectDto: RejectBookingDto,
    @Req() req: any
  ) {
    // For testing: accept mentorId from body, otherwise get from auth
    // TODO: Remove mentorId from body in production and use only auth
    const mentorId = rejectDto.mentorId || req.user?.id;

    if (!mentorId) {
      throw new BadRequestException('Mentor ID is required');
    }

    return this.bookingService.rejectBooking(id, mentorId, rejectDto);
  }

  /**
   * Cancel a booking (mentor or student)
   */
  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a booking',
    description: 'Either mentor or student can cancel (2+ hours before)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({ type: CancelBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel (too close to start time)' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @Req() req: any
  ) {
    // For testing: accept userId from body, otherwise get from auth
    // TODO: Remove userId from body in production and use only auth
    const userId = cancelDto.userId || req.user?.id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.bookingService.cancelBooking(id, userId, cancelDto.cancellationReason);
  }

  /**
   * Get all bookings for a specific mentor
   */
  @Get('mentor/:mentorId')
  @ApiOperation({
    summary: 'Get all bookings for a mentor',
    description: 'Returns list of bookings filtered by mentor and optional status',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiQuery({
    name: 'status',
    enum: BookingStatus,
    required: false,
    description: 'Filter by booking status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
    type: [BookingResponseDto],
  })
  async getBookingsByMentor(
    @Param('mentorId') mentorId: string,
    @Query('status') status?: BookingStatus
  ) {
    return this.bookingService.getBookingsByMentor(mentorId, status);
  }

  /**
   * Get all bookings for a specific student
   */
  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Get all bookings for a student',
    description: 'Returns list of bookings filtered by student and optional status',
  })
  @ApiParam({ name: 'studentId', description: 'Student user ID' })
  @ApiQuery({
    name: 'status',
    enum: BookingStatus,
    required: false,
    description: 'Filter by booking status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
    type: [BookingResponseDto],
  })
  async getBookingsByStudent(
    @Param('studentId') studentId: string,
    @Query('status') status?: BookingStatus
  ) {
    return this.bookingService.getBookingsByStudent(studentId, status);
  }

  /**
   * Get a single booking by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get booking details',
    description: 'Returns detailed information about a specific booking',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  // ============ Availability Management Endpoints ============

  /**
   * Set mentor availability
   */
  @Post('availability/:mentorId')
  @ApiOperation({
    summary: 'Set mentor availability schedule',
    description: 'Creates a new availability schedule for a mentor',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiBody({ type: SetAvailabilityDto })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or user is not a mentor' })
  @ApiResponse({ status: 404, description: 'Mentor not found' })
  @ApiResponse({ status: 409, description: 'Availability already exists for this mentor' })
  async setAvailability(
    @Param('mentorId') mentorId: string,
    @Body() availabilityDto: SetAvailabilityDto,
    @Req() req: any
  ) {
    // TODO: In production, verify mentorId matches authenticated user
    if (!mentorId) {
      throw new BadRequestException('Mentor ID is required');
    }

    return this.bookingService.setAvailability(mentorId, availabilityDto);
  }

  /**
   * Update mentor availability
   */
  @Put('availability/:mentorId')
  @ApiOperation({
    summary: 'Update mentor availability schedule',
    description: 'Updates an existing availability schedule for a mentor',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiBody({ type: UpdateAvailabilityDto })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async updateAvailability(
    @Param('mentorId') mentorId: string,
    @Body() availabilityDto: UpdateAvailabilityDto,
    @Req() req: any
  ) {
    // TODO: In production, verify mentorId matches authenticated user
    if (!mentorId) {
      throw new BadRequestException('Mentor ID is required');
    }

    return this.bookingService.updateAvailability(mentorId, availabilityDto);
  }

  /**
   * Get mentor availability
   */
  @Get('availability/:mentorId')
  @ApiOperation({
    summary: 'Get mentor availability schedule',
    description: 'Returns the availability schedule for a specific mentor',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiResponse({
    status: 200,
    description: 'Mentor availability',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No availability set for this mentor' })
  async getAvailability(@Param('mentorId') mentorId: string) {
    const availability = await this.bookingService.getAvailability(mentorId);
    if (!availability) {
      throw new NotFoundException('No availability set for this mentor');
    }
    return availability;
  }

  /**
   * Get available time slots for booking
   */
  @Get('availability/:mentorId/slots')
  @ApiOperation({
    summary: 'Get available time slots for a mentor',
    description:
      'Returns available time slots within a date range, accounting for existing bookings',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (YYYY-MM-DD)',
    example: '2024-01-07',
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    description: 'Required duration in minutes',
    example: 60,
  })
  @ApiResponse({
    status: 200,
    description: 'Available time slots',
    type: AvailableSlotsResponseDto,
  })
  async getAvailableSlots(
    @Param('mentorId') mentorId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('duration') duration?: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const query: GetAvailableSlotsDto = {
      startDate,
      endDate,
      duration: duration ? parseInt(duration, 10) : 60,
    };

    return this.bookingService.getAvailableSlots(mentorId, query);
  }

  /**
   * Update a specific day's availability
   */
  @Put('availability/:mentorId/day/:dayOfWeek')
  @ApiOperation({
    summary: 'Update or remove a specific day from weekly schedule',
    description: 'Update time slots for a specific day or remove it completely',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiParam({
    name: 'dayOfWeek',
    description: 'Day of week (0=Sunday, 6=Saturday)',
    type: Number,
  })
  @ApiBody({ type: UpdateDayAvailabilityDto })
  @ApiResponse({
    status: 200,
    description: 'Day availability updated successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async updateDayAvailability(
    @Param('mentorId') mentorId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() dto: UpdateDayAvailabilityDto,
    @Req() req: any
  ) {
    // TODO: In production, verify mentorId matches authenticated user
    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 0 || day > 6) {
      throw new BadRequestException('Invalid day of week. Must be 0-6');
    }

    return this.bookingService.updateDayAvailability(mentorId, day, dto.timeSlots);
  }

  /**
   * Update or add a date-specific override
   */
  @Put('availability/:mentorId/override/:date')
  @ApiOperation({
    summary: 'Add or update a date-specific override',
    description: 'Override availability for a specific date (e.g., holidays, special schedules)',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiBody({ type: UpdateDateOverrideDto })
  @ApiResponse({
    status: 200,
    description: 'Date override updated successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async updateDateOverride(
    @Param('mentorId') mentorId: string,
    @Param('date') dateStr: string,
    @Body() dto: UpdateDateOverrideDto,
    @Req() req: any
  ) {
    // TODO: In production, verify mentorId matches authenticated user
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.bookingService.updateDateOverride(mentorId, date, dto.timeSlots, dto.reason);
  }

  /**
   * Delete/reset mentor availability completely
   */
  @Delete('availability/:mentorId')
  @ApiOperation({
    summary: 'Delete mentor availability',
    description: 'Completely reset/remove all availability settings for a mentor',
  })
  @ApiParam({ name: 'mentorId', description: 'Mentor user ID' })
  @ApiResponse({
    status: 200,
    description: 'Availability deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async deleteAvailability(@Param('mentorId') mentorId: string, @Req() req: any) {
    // TODO: In production, verify mentorId matches authenticated user
    if (!mentorId) {
      throw new BadRequestException('Mentor ID is required');
    }

    return this.bookingService.deleteAvailability(mentorId);
  }
}
