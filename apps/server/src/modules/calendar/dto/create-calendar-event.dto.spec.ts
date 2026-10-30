import { ValidationPipe } from '@nestjs/common';
import { CreateCalendarEventDto } from './create-calendar-event.dto';

// Same options as the global pipe in main.ts
const pipe = new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true });
const validate = (body: Record<string, unknown>) =>
  pipe.transform(body, { type: 'body', metatype: CreateCalendarEventDto });

/** Payload sent by the admin "New event" form when the optional fields are left empty */
const adminForm = (overrides: Record<string, unknown> = {}) => ({
  title: 'Weekly standup',
  description: '',
  startTime: '2026-10-10T16:00:00.000Z',
  endTime: '2026-10-10T17:00:00.000Z',
  eventType: 'WEEKLY_CALL',
  meetingLink: '',
  location: '',
  organizer: '000000000000000000000000',
  isFeatured: false,
  ...overrides,
});

describe('CreateCalendarEventDto', () => {
  it('accepts an event without a meeting link (empty field in the admin form)', async () => {
    const dto = await validate(adminForm());

    expect(dto.meetingLink).toBeUndefined();
  });

  it('accepts a valid meeting link', async () => {
    const dto = await validate(adminForm({ meetingLink: 'https://meet.google.com/abc-defg-hij' }));

    expect(dto.meetingLink).toBe('https://meet.google.com/abc-defg-hij');
  });

  it('still rejects an invalid meeting link', async () => {
    await expect(validate(adminForm({ meetingLink: 'not a url' }))).rejects.toThrow();
  });
});
