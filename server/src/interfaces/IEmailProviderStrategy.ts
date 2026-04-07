/** Pluggable transactional email transport (Strategy). */
export interface IEmailProviderStrategy {
  sendMail(to: string, subject: string, html: string): Promise<void>;
}
