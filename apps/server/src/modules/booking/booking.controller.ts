import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
}
