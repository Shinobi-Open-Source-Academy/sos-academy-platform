import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Availability, AvailabilitySchema } from './schemas/availability.schema';

/**
 * Module for booking functionality
 * Manages dependencies and exports for mentor-student booking system
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Availability.name, schema: AvailabilitySchema },
    ]),
    UserModule,
    EmailModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService, MongooseModule],
})
export class BookingModule {}
