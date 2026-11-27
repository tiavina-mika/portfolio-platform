export type SimulatorSupport = 'web' | 'app' | 'mobile' | 'bo';

// what the visitor already has: the more is drawn, the less the mockups cost
export type SimulatorBring = 'idea' | 'spec' | 'mockup';

export type SimulatorComplexity = 'standard' | 'some' | 'heavy';

// how demanding the web application interface is
export type SimulatorRich = 'simple' | 'rich';

// the supports that can take an online payment
export type SimulatorPaymentSupport = 'mobile' | 'app';

export type SimulatorExampleId = 'saas' | 'mobile' | 'back' | 'both';

/**
 * Everything the visitor answers. The screens of a support that is not picked are kept (so picking
 * it again finds them) but they do not count: see `getEffectiveState`.
 */
export interface ISimulatorState {
  /**
   * What the visitor brings: it sets the price per screen of the mockups
   */
  bring: SimulatorBring;
  sup: Record<SimulatorSupport, boolean>;
  web: number;
  app: number;
  mobile: number;
  bo: number;
  rich: SimulatorRich;
  pay: Record<SimulatorPaymentSupport, boolean>;
  payN: Record<SimulatorPaymentSupport, number>;
  chat: boolean;
  /**
   * `null` until an example sets it: counts as `standard`
   */
  cx: SimulatorComplexity | null;
}

/**
 * The state of the screen: the answers and the example that filled them, if any
 */
export interface ISimulatorViewState extends ISimulatorState {
  example: SimulatorExampleId | null;
}

export interface ISimulatorParts {
  web: number;
  app: number;
  mobile: number;
  bo: number;
  payMobile: number;
  payApp: number;
  chat: number;
  design: number;
  /**
   * What is added to reach the minimum order
   */
  floorAdj: number;
}

export interface ISimulatorEstimate {
  parts: ISimulatorParts;
  /**
   * The number of screens priced for each support (a back-office alone has a minimum)
   */
  screens: Record<SimulatorSupport, number>;
  /**
   * What one screen of each support costs, complexity included, before any rounding
   */
  unitPrices: Record<SimulatorSupport, number>;
  /**
   * The number of screens the mockups are priced on
   */
  designScreens: number;
  /**
   * What the mockups of one screen cost
   */
  designRate: number;
  paymentCounts: Record<SimulatorPaymentSupport, number>;
  /**
   * The minimum order that applies to these answers
   */
  floor: number;
  /**
   * The screens alone, before the mockups and the options
   */
  total: number;
  price: number;
  /**
   * Past the ceiling the simulator stops estimating: the project is discussed
   */
  isOverCeiling: boolean;
  /**
   * The price is the minimum order, nothing more
   */
  isAtFloor: boolean;
  isBackOfficeOnly: boolean;
}

export interface ISimulatorMaintenanceTier {
  id: 'essential' | 'standard' | 'ongoing';
  /**
   * In euros per month
   */
  price: number;
}

export interface ISimulatorExample {
  id: SimulatorExampleId;
  /**
   * The answers the example sets; the other ones go back to their empty value
   */
  state: Partial<ISimulatorState>;
}

// a line of the detail of the estimate
export type SimulatorLineKey = keyof ISimulatorParts;

// when each of the three instalments of the price is paid
export type SimulatorInstalment = 'signature' | 'midway' | 'launch';

/**
 * How the price is shown: a floor ("from €1,500"), a large project, or the exact amount
 */
export type SimulatorPriceDisplay =
  | { kind: 'from'; amount: number } |
  { kind: 'large' } |
  { kind: 'exact'; amount: number };

/**
 * The words the written summary of an estimate is made of
 */
export interface ISimulatorRecapLabels {
  with: string;
  complexity: string;
  about: (screens: number) => string;
  bring: Record<SimulatorBring, string>;
  support: Record<SimulatorSupport, string>;
  complexityLevel: Record<SimulatorComplexity, string>;
  richLabel: string;
  chatLabel: string;
  paymentLabel: string;
}
