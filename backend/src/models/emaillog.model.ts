import mongoose from "mongoose";
interface IEmailLog {
  recipient: string;
  recipientUser?: mongoose.Types.ObjectId;
  type: 'welcome' | 'verification' | 'notification' | 'newsletter' | 'password-reset';
  subject: string;
  status: 'sent' | 'failed' | 'bounced' | 'opened';
  sentAt: Date;
  openedAt?: Date;
  error?: string;
}