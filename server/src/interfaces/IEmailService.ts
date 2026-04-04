/** Low-level transactional email delivery (DIP: strategies depend on this abstraction). */
export interface IEmailService {
  sendMail(to: string, subject: string, html: string): Promise<void>;
}
