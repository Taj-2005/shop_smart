import type { IEmailProviderStrategy } from "../interfaces/IEmailProviderStrategy";
import type { IEmailService } from "../interfaces/IEmailService";

/** Facade over {@link IEmailProviderStrategy} for {@link IEmailService}. */
export class NodemailerEmailService implements IEmailService {
  constructor(private readonly provider: IEmailProviderStrategy) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    return this.provider.sendMail(to, subject, html);
  }
}
