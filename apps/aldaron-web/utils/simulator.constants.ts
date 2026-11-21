import {
  ISimulatorExample,
  ISimulatorViewState,
  SimulatorBring,
  SimulatorComplexity,
  SimulatorPaymentSupport,
  SimulatorSupport,
} from '@/types/simulator.type';

/*
 * Every number of the estimate, in euros. They are the price list of the pricing page: change one
 * here and both pages follow.
 */
export const SIMULATOR_PRICING = {
  // minimum order: with a mobile app, and for the web alone
  floor: 2500,
  floorWeb: 1500,
  // per screen, what the mockups cost according to what the visitor brings
  design: { idea: 8, spec: 6, mockup: 0 } satisfies Record<SimulatorBring, number>,
  // per screen
  screen: 25,
  screenApp: 18,
  screenRich: 30,
  // a back-office screen costs one and a half times a plain one
  boFactor: 1.5,
  // multiplies the price of the screens
  complexity: { standard: 1, some: 1.5, heavy: 2.5 } satisfies Record<SimulatorComplexity, number>,
  // the part of the screens the business logic touches: half of them
  complexityShare: 0.5,
  // past these totals the simulator stops estimating
  ceiling: 15000,
  ceilingRich: 10000,
  // the first payment integration, then each one more
  payFirst: 500,
  payExtra: 22,
  chat: 500,
} as const;

// a back-office alone is never estimated under this number of screens
export const BACK_OFFICE_MIN_SCREENS = 15;

export const SCREENS_MAX = 250;
export const PAYMENT_COUNT_MIN = 1;
export const PAYMENT_COUNT_MAX = 5;

// the amounts of the estimate are rounded to the hundred
export const ESTIMATE_ROUNDING = 100;

// the order of the supports on the screen, in the summary and in the lines of the estimate
export const SIMULATOR_SUPPORTS: SimulatorSupport[] = ['web', 'app', 'mobile', 'bo'];
export const SIMULATOR_BRING: SimulatorBring[] = ['idea', 'spec', 'mockup'];
export const SIMULATOR_PAYMENT_SUPPORTS: SimulatorPaymentSupport[] = ['mobile', 'app'];
export const SIMULATOR_PAYMENT_COUNTS = [1, 2, 3, 4, 5];

export const SIMULATOR_INITIAL_STATE: ISimulatorViewState = {
  bring: 'spec',
  sup: { web: false, app: false, mobile: true, bo: false },
  web: 0,
  app: 85,
  mobile: 100,
  bo: 15,
  rich: 'simple',
  pay: { mobile: false, app: false },
  payN: { mobile: 1, app: 1 },
  chat: false,
  maintenance: false,
  cx: null,
  example: null,
};

// what an example resets before it sets its own answers
export const SIMULATOR_EMPTY_ANSWERS = {
  web: 0,
  app: 0,
  mobile: 0,
  bo: 0,
  rich: 'simple',
  maintenance: false,
  chat: false,
  pay: { mobile: false, app: false },
  payN: { mobile: 1, app: 1 },
} satisfies Partial<ISimulatorViewState>;

export const SIMULATOR_EXAMPLES: ISimulatorExample[] = [
  { id: 'saas', state: { bring: 'idea', web: 25, mobile: 0, bo: 15, cx: 'standard' } },
  { id: 'mobile', state: { bring: 'spec', web: 0, mobile: 200, bo: 0, cx: 'standard' } },
  { id: 'back', state: { bring: 'mockup', web: 0, mobile: 180, bo: 40, cx: 'heavy' } },
  {
    id: 'both',
    state: {
      bring: 'spec',
      web: 140,
      mobile: 140,
      bo: 15,
      cx: 'standard',
      pay: { mobile: true, app: false },
      payN: { mobile: 1, app: 1 },
    },
  },
];

// the lines of the estimate, in this order
export const SIMULATOR_LINES = [
  'web', 'app', 'mobile', 'bo', 'design', 'chat', 'payMobile', 'payApp', 'floorAdj',
] as const;
