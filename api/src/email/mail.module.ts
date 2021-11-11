import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SOURCE_EMAIL, SOURCE_EMAIL_PASSWORD } from '../config';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: SOURCE_EMAIL,
          pass: SOURCE_EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" japanDevs@example.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
