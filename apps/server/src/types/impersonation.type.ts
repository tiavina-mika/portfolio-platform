export interface IImpersonationSessionAttributes {
  id: string;
  targetUser: Parse.User;
  adminId: string;
  adminEmail: string;
  reason: string;
  sessionToken: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}

export interface IImpersonationSession extends Parse.Object<IImpersonationSessionAttributes> {
  id: string;
}

export type CreateImpersonationSessionResult = {
  sessionToken: string;
  sessionId: string;
  expiresAt: Date;
};
