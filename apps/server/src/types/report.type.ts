export enum ReportTargetTypeEnum {
  USER = 'user',
  RIDE = 'ride',
  RATING = 'rating',
  VEHICLE = 'vehicle'
}

export type ReportTargetType = `${ReportTargetTypeEnum}`;

export enum ReportStatusEnum {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export type ReportStatus = `${ReportStatusEnum}`;

export enum ReportReasonEnum {
  FAKE_REVIEW = 'fake_review',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  NO_SHOW = 'no_show',
  DANGEROUS_DRIVING = 'dangerous_driving',
  HARASSMENT = 'harassment',
  FRAUD = 'fraud',
  INAPPROPRIATE_BEHAVIOR = 'inappropriate_behavior',
  VEHICLE_MISMATCH = 'vehicle_mismatch',
  WRONG_ROUTE = 'wrong_route',
  EXTRA_PASSENGERS = 'extra_passengers',
  PRICE_DISPUTE = 'price_dispute',
  PERSONAL_DATA = 'personal_data',
  COERCED_REVIEW = 'coerced_review',
  OTHER = 'other'
}

export type ReportReason = `${ReportReasonEnum}`;

export interface IReportAttributes {
  id: string;
  reportedBy: Parse.User;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  /** the operator who took the report in charge — set when it moves to under review */
  reviewedBy?: Parse.User;
  reviewStartedAt?: Date;
  resolvedBy?: Parse.User;
  resolvedAt?: Date;
  resolution?: string;
  /** the photos that back the message of a report on a ride */
  attachments?: { publicId: string; url: string }[];
  /** the person of the reported ride the report is about */
  concernedUser?: Parse.User;
  isAnonymous: boolean;
  deleted: boolean;
}

export interface IReport extends Parse.Object<IReportAttributes> {
  id: string;
}
