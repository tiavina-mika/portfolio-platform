/*
 * What the payment service needs to know about the booking a payment belongs to, without knowing
 * what a booking is: the domain registers a handler at module load, and a payment flow with no
 * handler simply has no booking to adjust, no payout to protect and no closed booking to refuse.
 */

export type StandingBooking = { requestId: string; rideId: string };

export type PaymentBookingHandler = {
  /** The booking a collection belongs to, when it is still paid and its ride not paid out yet */
  getStandingBookingOfCollection: (requestId: string) => Promise<StandingBooking | undefined>;
  /** The payout of a ride, when one went through or is waiting for its operator */
  getDriverPayoutForRide: (rideId: string) => Promise<Parse.Object | undefined>;
  /** Moves an amount off (or, negative, back onto) the fare of a standing booking and its ride */
  adjustStandingBookingFare: (booking: StandingBooking, amount: number) => Promise<void>;
  /** Whether a booking is no longer waiting for its payment */
  isBookingClosed: (requestId: string) => Promise<boolean>;
};

let bookingHandler: PaymentBookingHandler | undefined;

export const registerPaymentBookingHandler = (handler: PaymentBookingHandler): void => {
  bookingHandler = handler;
};

export const getStandingBookingOfCollection = async (
  requestId: string
): Promise<StandingBooking | undefined> => bookingHandler?.getStandingBookingOfCollection(requestId);

export const getDriverPayoutForRide = async (rideId: string): Promise<Parse.Object | undefined> => (
  bookingHandler?.getDriverPayoutForRide(rideId)
);

export const adjustStandingBookingFare = async (booking: StandingBooking, amount: number): Promise<void> => {
  await bookingHandler?.adjustStandingBookingFare(booking, amount);
};

export const isBookingClosed = async (requestId: string): Promise<boolean> => (
  await bookingHandler?.isBookingClosed(requestId) ?? false
);
