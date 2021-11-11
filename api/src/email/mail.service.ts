import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserType } from '../user/types/user.type';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(usersToInform: UserType[]): Promise<void> {
    usersToInform.forEach((user) => {
      this.sendUserConfirmation(user);
    });
  }

  async sendUserConfirmation(user: UserType): Promise<void> {
    const email = await this.mailerService.sendMail({
      to: user.email,
      subject: user.summary,
      html: `
                <p>${user.email}</p>
                <p>${user.summary}</p>
        `,
    });
    console.log(email.accepted, 'email');
  }
}
