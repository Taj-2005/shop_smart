export abstract class BaseEmailTemplate {
  protected abstract getSubject(): string;
  protected abstract getBody(): string;

  /**
   * The Template Method generating the final email object.
   */
  public render(): { subject: string; html: string } {
    const subject = this.getSubject();
    const body = this.getBody();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          ${body}
        </div>
      </body>
      </html>
    `;
    
    return { subject, html };
  }
}
