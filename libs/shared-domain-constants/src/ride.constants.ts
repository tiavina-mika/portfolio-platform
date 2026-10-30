/**
 * Bucket label used when a cancelled ride carries no `cancelReason`. Shared because the server
 * builds the bucket and the back-office translates it — a second literal would silently stop
 * matching the day either side changes.
 */
export const UNSPECIFIED_CANCEL_REASON = 'UNSPECIFIED';

/**
 * Photos or screenshots a member may join to a "report a problem" on a ride — a capture of the
 * payment request, a photo of the wrong plate. Three show a situation from more than one side
 * without turning the report into an album support has to sift.
 */
export const RIDE_PROBLEM_ATTACHMENT_MAX_COUNT = 3;
