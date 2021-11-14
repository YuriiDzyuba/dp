import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CommentEntity } from '../comment/entities/comment.entity';
import { UserType } from '../user/types/user.type';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  // send email with auto-generated password to users who registered by google OAuth
  sendMailToNewUser(userToInform: UserType, password: string): void {
    this.sendLetter(
      userToInform,
      `your auto generated password - ${password} for login by email and password. Change your password!!!`,
    );
  }

  sendEmailToRelatedUsers(
    usersToInform: UserType[],
    comment: CommentEntity,
  ): void {
    usersToInform.forEach((user) => {
      this.sendLetter(
        user,
        `your have been mentioned in this comment = ${comment.text}`,
      );
    });
  }

  async sendLetter(receiver: UserType, message: string): Promise<void> {
    const email = await this.mailerService.sendMail({
      to: receiver.email,
      subject: `to - ${receiver.username}`,
      html: `
                <p>${message}</p>
        `,
    });
    console.log(email.accepted, 'email');
  }
}
