import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
export const EMAIL_ADMIN = process.env.EMAIL_ADMIN || 'andreavandero@gmail.com';