import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface NotesBotResponse {
  data: {
    id: string;
    summary: string;
    server_name: string;
    server_id: string;
    channel_name: string;
    channel_id: string;
    duration: number;
    participant_count: number;
    created_at: string;
    participants: Array<{
      display_name: string;
      username: string;
    }>;
  };
}

@Injectable()
export class NotesBotService {
  private readonly logger = new Logger(NotesBotService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl =
      this.configService.get<string>('NOTESBOT_API_URL') || 'https://api.notesbot.io/v1';
    this.apiKey = this.configService.get<string>('NOTESBOT_API_KEY');

    if (!this.apiKey) {
      this.logger.warn('NOTESBOT_API_KEY not configured. NotesBot integration will not work.');
    }
  }

  /**
   * Fetch summary from NotesBot API using callId
   * @param callId - The unique identifier from NotesBot
   * @returns The summary text
   */
  async fetchSummary(callId: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('NOTESBOT_API_KEY not configured');
    }

    if (!callId) {
      throw new Error('callId is required');
    }

    try {
      const url = `${this.apiUrl}/calls/${callId}`;
      this.logger.log(`Fetching summary from NotesBot: ${url}`);

      const response = await axios.get<NotesBotResponse>(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      if (!response.data || !response.data.data || !response.data.data.summary) {
        throw new Error('Invalid response from NotesBot: summary field missing');
      }

      this.logger.log(`Successfully fetched summary for callId: ${callId}`);
      return response.data.data.summary;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        this.logger.error(
          `Failed to fetch summary from NotesBot: ${axiosError.message}`,
          axiosError.response?.data
        );

        if (axiosError.response?.status === 404) {
          throw new Error('Call not found in NotesBot');
        }
        if (axiosError.response?.status === 401) {
          throw new Error('Invalid NotesBot API key');
        }
      }

      this.logger.error(`Unexpected error fetching summary: ${error}`);
      throw new Error('Failed to fetch summary from NotesBot');
    }
  }

  /**
   * Validate if a callId is properly formatted
   * @param callId - The callId to validate
   * @returns true if valid
   */
  validateCallId(callId: string): boolean {
    return typeof callId === 'string' && callId.length > 0;
  }
}
