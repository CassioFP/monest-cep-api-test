import { Injectable, Logger } from '@nestjs/common';

export interface NotificationService {
  send(message: string, payload?: any): void;
}

@Injectable()
export class EmailService implements NotificationService {
  private readonly logger = new Logger(EmailService.name);

  send(message: string, payload?: any): void {
    this.logger.warn('EMAIL SENT', {
      message,
      payload,
    });
  }
}
