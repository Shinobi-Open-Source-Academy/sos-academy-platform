import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole } from '@sos-academy/shared';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApproveBookingDto, RejectBookingDto } from './dto/update-booking.dto';
import { BookingStatus, VALID_STATUS_TRANSITIONS } from './interfaces/booking-status.enum';
import { Booking, BookingDocument } from './schemas/booking.schema';

/**
 * Service handling all booking business logic
 * Follows single responsibility and clean architecture principles
 */
@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private userService: UserService,
    private emailService: EmailService
  ) {}

  /**
   * Create a new booking request from student
   */
  async createBookingRequest(
    studentId: string,
    createBookingDto: CreateBookingDto
  ): Promise<BookingDocument> {
    await this.validateBookingRequest(studentId, createBookingDto);

    const booking = await this.bookingModel.create({
      ...createBookingDto,
      studentId: new Types.ObjectId(studentId),
      mentorId: new Types.ObjectId(createBookingDto.mentorId),
      status: BookingStatus.REQUESTED,
      requestedDate: new Date(createBookingDto.requestedDate),
    });

    await booking.populate(['mentorId', 'studentId']);

    await this.notifyMentorOfRequest(booking);

    return booking;
  }

  /**
   * Mentor approves a booking request
   */
  async approveBooking(
    bookingId: string,
    mentorId: string,
    approveDto: ApproveBookingDto
  ): Promise<BookingDocument> {
    const booking = await this.findBookingForMentor(bookingId, mentorId);

    this.validateStatusTransition(booking, BookingStatus.APPROVED);

    booking.status = BookingStatus.APPROVED;
    booking.meetingLink = approveDto.meetingLink;
    if (approveDto.mentorNotes) {
      booking.mentorNotes = approveDto.mentorNotes;
    }

    await booking.save();
    await booking.populate(['mentorId', 'studentId']);

    await this.notifyStudentOfApproval(booking);

    return booking;
  }

  /**
   * Mentor rejects a booking request
   */
  async rejectBooking(
    bookingId: string,
    mentorId: string,
    rejectDto: RejectBookingDto
  ): Promise<BookingDocument> {
    const booking = await this.findBookingForMentor(bookingId, mentorId);

    this.validateStatusTransition(booking, BookingStatus.REJECTED);

    booking.status = BookingStatus.REJECTED;
    booking.rejectionReason = rejectDto.reason;

    await booking.save();
    await booking.populate(['mentorId', 'studentId']);

    await this.notifyStudentOfRejection(booking);

    return booking;
  }

  /**
   * Cancel a booking (either party can cancel)
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    cancellationReason?: string
  ): Promise<BookingDocument> {
    const booking = await this.findBookingForUser(bookingId, userId);

    if (!booking.canBeCancelled()) {
      throw new BadRequestException(
        'Cannot cancel booking. Either already cancelled/completed or less than 2 hours before start time'
      );
    }

    this.validateStatusTransition(booking, BookingStatus.CANCELLED);

    booking.status = BookingStatus.CANCELLED;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
    await booking.save();
    await booking.populate(['mentorId', 'studentId']);

    await this.notifyCancellation(booking, userId);

    return booking;
  }

  /**
   * Get all bookings for a mentor
   */
  async getBookingsByMentor(mentorId: string, status?: BookingStatus): Promise<BookingDocument[]> {
    const filter: any = { mentorId: new Types.ObjectId(mentorId) };
    if (status) {
      filter.status = status;
    }

    return this.bookingModel
      .find(filter)
      .populate('studentId', 'name email profilePicture githubProfile')
      .sort({ requestedDate: 1, startTime: 1 })
      .exec();
  }

  /**
   * Get all bookings for a student
   */
  async getBookingsByStudent(
    studentId: string,
    status?: BookingStatus
  ): Promise<BookingDocument[]> {
    const filter: any = { studentId: new Types.ObjectId(studentId) };
    if (status) {
      filter.status = status;
    }

    return this.bookingModel
      .find(filter)
      .populate('mentorId', 'name email profilePicture expertise githubProfile')
      .sort({ requestedDate: 1, startTime: 1 })
      .exec();
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(bookingId: string): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findById(bookingId)
      .populate(['mentorId', 'studentId'])
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  // ============ Private Helper Methods ============

  /**
   * Validate a booking request before creating
   */
  private async validateBookingRequest(studentId: string, dto: CreateBookingDto): Promise<void> {
    const mentor = await this.userService.findOne(dto.mentorId);
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }
    if (mentor.role !== UserRole.MENTOR) {
      throw new BadRequestException('Selected user is not a mentor');
    }

    const requestedDate = new Date(dto.requestedDate);
    if (requestedDate <= new Date()) {
      throw new BadRequestException('Booking must be scheduled for a future date');
    }

    await this.checkTimeConflicts(dto.mentorId, dto.requestedDate, dto.startTime, dto.duration);
  }

  /**
   * Check for booking time conflicts
   */
  private async checkTimeConflicts(
    mentorId: string,
    date: string,
    startTime: string,
    duration: number
  ): Promise<void> {
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(requestedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingBookings = await this.bookingModel.find({
      mentorId: new Types.ObjectId(mentorId),
      requestedDate: {
        $gte: requestedDate,
        $lt: nextDay,
      },
      status: { $in: [BookingStatus.REQUESTED, BookingStatus.APPROVED] },
    });

    const requestedStart = this.timeToMinutes(startTime);
    const requestedEnd = requestedStart + duration;

    for (const booking of existingBookings) {
      const bookingStart = this.timeToMinutes(booking.startTime);
      const bookingEnd = bookingStart + booking.duration;

      if (
        (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
        (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
        (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
      ) {
        throw new ConflictException('Time slot conflicts with an existing booking');
      }
    }
  }

  /**
   * Convert time string to minutes for comparison
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Validate if status transition is allowed
   */
  private validateStatusTransition(booking: BookingDocument, newStatus: BookingStatus): void {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[booking.status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${newStatus}`);
    }
  }

  /**
   * Find booking for mentor with authorization check
   */
  private async findBookingForMentor(
    bookingId: string,
    mentorId: string
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      mentorId: new Types.ObjectId(mentorId),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or you are not authorized');
    }

    return booking;
  }

  /**
   * Find booking for any user (mentor or student)
   */
  private async findBookingForUser(bookingId: string, userId: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findOne({
      _id: bookingId,
      $or: [{ mentorId: new Types.ObjectId(userId) }, { studentId: new Types.ObjectId(userId) }],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or you are not authorized');
    }

    return booking;
  }

  // ============ Email Notification Methods ============

  /**
   * Notify mentor of new booking request
   */
  private async notifyMentorOfRequest(booking: BookingDocument): Promise<void> {
    try {
      const mentor = booking.mentorId as any;
      const student = booking.studentId as any;

      await this.emailService.sendSimpleEmail(
        mentor.email,
        'New Booking Request',
        `
        <h2>New Booking Request</h2>
        <p>You have received a new booking request from ${student.name}.</p>
        <p><strong>Date:</strong> ${booking.requestedDate.toDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} (${booking.duration} minutes)</p>
        <p><strong>Topic:</strong> ${booking.topic}</p>
        ${booking.description ? `<p><strong>Description:</strong> ${booking.description}</p>` : ''}
        <p>Please log in to approve or reject this request.</p>
        `
      );
    } catch (error) {
      console.error('Failed to send mentor notification:', error);
      // Email failure shouldn't break booking creation
    }
  }

  /**
   * Notify student of booking approval
   */
  private async notifyStudentOfApproval(booking: BookingDocument): Promise<void> {
    try {
      const student = booking.studentId as any;
      const mentor = booking.mentorId as any;

      await this.emailService.sendSimpleEmail(
        student.email,
        'Booking Approved!',
        `
        <h2>Your Booking Has Been Approved!</h2>
        <p>${mentor.name} has approved your booking request.</p>
        <p><strong>Date:</strong> ${booking.requestedDate.toDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} (${booking.duration} minutes)</p>
        <p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>
        ${booking.mentorNotes ? `<p><strong>Mentor Notes:</strong> ${booking.mentorNotes}</p>` : ''}
        <p>See you there!</p>
        `
      );
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  }

  /**
   * Notify student of booking rejection
   */
  private async notifyStudentOfRejection(booking: BookingDocument): Promise<void> {
    try {
      const student = booking.studentId as any;
      const mentor = booking.mentorId as any;

      await this.emailService.sendSimpleEmail(
        student.email,
        'Booking Request Update',
        `
        <h2>Booking Request Update</h2>
        <p>${mentor.name} is unable to accept your booking request at this time.</p>
        <p><strong>Reason:</strong> ${booking.rejectionReason}</p>
        <p>Please feel free to request another time slot.</p>
        `
      );
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }
  }

  /**
   * Notify other party of booking cancellation
   */
  private async notifyCancellation(booking: BookingDocument, cancelledBy: string): Promise<void> {
    try {
      const mentor = booking.mentorId as any;
      const student = booking.studentId as any;
      const isMentorCancelling = mentor._id.toString() === cancelledBy;
      const recipientEmail = isMentorCancelling ? student.email : mentor.email;
      const cancellerName = isMentorCancelling ? mentor.name : student.name;

      await this.emailService.sendSimpleEmail(
        recipientEmail,
        'Booking Cancelled',
        `
        <h2>Booking Cancelled</h2>
        <p>${cancellerName} has cancelled the booking.</p>
        <p><strong>Date:</strong> ${booking.requestedDate.toDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime}</p>
        <p><strong>Topic:</strong> ${booking.topic}</p>
        `
      );
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }
  }
}
