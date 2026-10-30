export interface IInvitation {
  email: string;
  token: string;
  // absent for the system-generated bootstrap invitation sent to OWNERS_EMAILS — no admin exists yet to invite them
  invitedBy?: Parse.User;
  roles: string[];
  expiresAt: Date;
  consumedAt?: Date;
}
