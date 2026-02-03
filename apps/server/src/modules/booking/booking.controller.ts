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
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@sos-academy/shared';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
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
@UseGuards(AuthGuard)
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
  async createBookingRequest(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    return this.bookingService.createBookingRequest(user.id, createBookingDto);
  }

  /**
   * Mentor approves a booking request
   */
  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
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
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can approve bookings');
    }

    return this.bookingService.approveBooking(id, user.id, approveDto);
  }

  /**
   * Mentor rejects a booking request
   */
  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
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
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can reject bookings');
    }

    return this.bookingService.rejectBooking(id, user.id, rejectDto);
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
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    return this.bookingService.cancelBooking(id, user.id, cancelDto.cancellationReason);
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
   * Set mentor availability (mentors only)
   */
  @Post('availability')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Set your availability schedule',
    description: 'Creates a new availability schedule for the authenticated mentor',
  })
  @ApiBody({ type: SetAvailabilityDto })
  @ApiResponse({
    status: 201,
    description: 'Availability created successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or user is not a mentor' })
  @ApiResponse({ status: 409, description: 'Availability already exists for this mentor' })
  async setAvailability(
    @Body() availabilityDto: SetAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can set availability');
    }

    return this.bookingService.setAvailability(user.id, availabilityDto);
  }

  /**
   * Update mentor availability (mentors only)
   */
  @Put('availability')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Update your availability schedule',
    description: 'Updates your existing availability schedule',
  })
  @ApiBody({ type: UpdateAvailabilityDto })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async updateAvailability(
    @Body() availabilityDto: UpdateAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can update availability');
    }

    return this.bookingService.updateAvailability(user.id, availabilityDto);
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
   * Update a specific day's availability (mentors only)
   */
  @Put('availability/day/:dayOfWeek')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Update or remove a specific day from your weekly schedule',
    description: 'Update time slots for a specific day or remove it completely',
  })
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
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() dto: UpdateDayAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can update availability');
    }

    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 0 || day > 6) {
      throw new BadRequestException('Invalid day of week. Must be 0-6');
    }

    return this.bookingService.updateDayAvailability(user.id, day, dto.timeSlots);
  }

  /**
   * Update or add a date-specific override (mentors only)
   */
  @Put('availability/override/:date')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Add or update a date-specific override for your availability',
    description: 'Override availability for a specific date (e.g., holidays, special schedules)',
  })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiBody({ type: UpdateDateOverrideDto })
  @ApiResponse({
    status: 200,
    description: 'Date override updated successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async updateDateOverride(
    @Param('date') dateStr: string,
    @Body() dto: UpdateDateOverrideDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can update availability');
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.bookingService.updateDateOverride(user.id, date, dto.timeSlots, dto.reason);
  }

  /**
   * Delete/reset mentor availability completely (mentors only)
   */
  @Delete('availability')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Delete your availability',
    description: 'Completely reset/remove all your availability settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Availability not found' })
  async deleteAvailability(@CurrentUser() user: AuthenticatedUser) {
    if (!user || !user.id) {
      throw new BadRequestException('Authentication required');
    }

    if (user.role !== UserRole.MENTOR) {
      throw new BadRequestException('Only mentors can delete availability');
    }

    return this.bookingService.deleteAvailability(user.id);
  }
}
