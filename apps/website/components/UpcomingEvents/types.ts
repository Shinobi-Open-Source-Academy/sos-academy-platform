export interface CountdownProps {
  targetDate: Date;
  onStatusChange?: (hasStarted: boolean) => void;
}

export interface EventJoinButtonProps {
  meetingLink: string;
  startTime: string;
}

export interface ShareButtonsProps {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
}
