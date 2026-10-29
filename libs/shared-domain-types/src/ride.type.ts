// Status enums that the generic (`_core`) code reads: notification statuses, the user stats counted
// from completed bookings, refunds and SOS reports. Only the enums are kept; the portfolio has no
// ride, booking or vehicle model of its own.

export enum RideStatusEnum {
  /**
   * The ride is published and visible to passengers
   * @NOTE also return to this status if the ride has no passenger (after cancellation)
   */
  PUBLISHED = 'PUBLISHED',

  /**
   * The ride is being booked by at least one passenger
   * @NOTE the driver can now cancel the ride
   */
  BOOKED = 'BOOKED',

  /** All available seats have been booked */
  FULL = 'FULL',

  /**
   * The driver has canceled the ride
   * @NOTE all the requests will be marked as canceled
   * @NOTE there is refund process (app to passengers)
   */
  CANCELED = 'CANCELED',

  /**
   * The driver has declared the ride under way (driver and passengers are traveling)
   * @NOTE set by the driver only, inside the start window around the planned departure
   * @NOTE the passenger list is frozen: no booking can be accepted, cancelled, or created
   * @NOTE optional milestone — a ride can still be closed straight from BOOKED/FULL
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * The driver declared the ride done; the payout is held until the passenger contestation window
   * (RIDE_CONFIRMATION_WINDOW_HOURS) elapses, so a ride that never happened can still be disputed
   * before the money moves
   * @NOTE requests are not completed yet; reviews can already be written but stay pending until
   * the payout has left
   * @NOTE a passenger can still report the driver absent: an open report holds the payout
   */
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',

  /**
   * The ride is completed and its driver paid
   * @NOTE reached once the held payout is released, or straight from the closure for a ride left
   * with no passenger (nothing to pay, nobody to dispute it)
   * @NOTE all the requests will be marked as completed
   * @NOTE there is payment process (app to driver)
   */
  COMPLETED = 'COMPLETED',

  /** The ride is archived or removed (e.g., after the departure date) */
  ARCHIVED = 'ARCHIVED'
}

/** Whether a user is acting as a passenger or a driver on a given ride */
export enum RideUserTypeEnum {
  PASSENGER = 'passenger',
  DRIVER = 'driver'
}

/** Status of a passenger's request (booking) on a ride */
export enum RequestStatusEnum {
  /**
   * The booking is being charged, and the seats it asks for are already held on the ride
   * @NOTE temporary: the seats are released again if the payment fails or never confirms
   */
  PENDING = 'PENDING',

  /**
   * The booking is paid and the seat is the passenger's. Written by the server the instant the
   * payment succeeds, never by a client: there is no human decision between paying and boarding.
   * @NOTE the passengers are on the ride from here on
   */
  CONFIRMED = 'CONFIRMED',
  /**
   * The request is canceled by the passenger
   * It is already paid and the passengers added to the ride
   * @NOTE the passengers can be removed from the ride
   * @NOTE There is refund process (app to passenger)
   */
  CANCELED_BY_PASSENGER = 'CANCELED_BY_PASSENGER',
  /**
   * The request is completed
   * Automatically when the ride is completed
   * @NOTE There is payment process (app to driver)
   */
  COMPLETED = 'COMPLETED',
  /**
   * The driver called the booking off: this one alone, or every booking of a ride they cancelled.
   * It is the driver's only veto — nothing is ever refused before it is confirmed
   * @NOTE There is refund process (app to passenger), always in full
   */
  CANCELED_BY_DRIVER = 'CANCELED_BY_DRIVER',
  /**
   * The initial payment failed at booking time: the request was never activated
   * @NOTE terminal — it no longer blocks a new booking on the same ride, and is hidden from the
   * passenger, who books again instead
   */
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  /**
   * The driver declared that the passenger never showed up at departure
   * @NOTE no refund and no penalty: the seat was held, the driver is paid for it at closure
   * @NOTE the passenger can contest it within PASSENGER_NO_SHOW_CONTEST_WINDOW_HOURS; back to this
   * status once support confirms a contest, and then final
   */
  NO_SHOW = 'NO_SHOW',
  /**
   * The passenger contested the no-show declaration, waiting for the support decision
   * @NOTE support either confirms it (back to NO_SHOW) or rejects it (COMPLETED once the ride is
   * closed, CONFIRMED again before that)
   * @NOTE named so its date field (`contestedNoShowAt`) never collides with `noShowAt`: the
   * status date is derived from the two first words of the status
   */
  CONTESTED_NO_SHOW = 'CONTESTED_NO_SHOW'
}

export type RequestStatus = `${RequestStatusEnum}`;

/**
 * Why a booking was refunded. Kept apart from the free-text `canceledReason` a passenger types:
 * this one is counted — it is what tells a driver calling off one confirmed booking from a whole
 * ride being cancelled, and so what measures how often a driver walks back a seat already sold.
 */
export enum RefundReasonEnum {
  CANCELED_BY_PASSENGER = 'CANCELED_BY_PASSENGER',
  /** the driver called off this one booking, on a ride that still runs */
  CANCELED_BY_DRIVER = 'CANCELED_BY_DRIVER',
  /** the whole ride was called off — by its driver, or by support after a confirmed driver no-show */
  RIDE_CANCELED = 'RIDE_CANCELED',
  /**
   * the operator confirmed the payment after the booking had already closed: the money is given
   * straight back, since there is no seat left to give for it
   */
  LATE_PAYMENT = 'LATE_PAYMENT',
  /** support gave the money back by hand, in whole or in part */
  MANUAL = 'MANUAL'
}

export type RideStatus = `${RideStatusEnum}`;

/**
 * What became of the SMS an SOS sends to the caller's emergency contact. An enum rather than a
 * boolean: the alert to support always leaves, only this one message can end several ways.
 */
export enum SosSmsStatusEnum {
  SENT = 'sent',
  /** the provider refused or failed — does not count against the monthly cap */
  FAILED = 'failed',
  /** the monthly cap was already reached — the provider was never called */
  QUOTA_REACHED = 'quota_reached',
  /** the caller has no emergency contact */
  NO_CONTACT = 'no_contact'
}
