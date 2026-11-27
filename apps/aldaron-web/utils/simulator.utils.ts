import {
  IEstimate,
} from '@/types/estimate.type';
import {
  ISimulatorEstimate,
  ISimulatorParts,
  ISimulatorRecapLabels,
  ISimulatorState,
  ISimulatorViewState,
  SimulatorBring,
  SimulatorExampleId,
  SimulatorPaymentSupport,
  SimulatorPriceDisplay,
  SimulatorSupport,
} from '@/types/simulator.type';

import {
  BACK_OFFICE_MIN_SCREENS,
  ESTIMATE_ROUNDING,
  PAYMENT_COUNT_MAX,
  PAYMENT_COUNT_MIN,
  SCREENS_MAX,
  SIMULATOR_EMPTY_ANSWERS,
  SIMULATOR_EXAMPLES,
  SIMULATOR_INITIAL_STATE,
  SIMULATOR_PAYMENT_SUPPORTS,
  SIMULATOR_PRICING,
  SIMULATOR_SUPPORTS,
} from './simulator.constants';

const NBSP = '\u00a0';

const roundToHundred = (value: number): number =>
  Math.round(value / ESTIMATE_ROUNDING) * ESTIMATE_ROUNDING;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * An amount in euros, written the way the language of the page writes it ("2 500 €", "€2,500")
 */
export const formatEuros = (amount: number, locale: string): string =>
  new Intl.NumberFormat(locale === 'en' ? 'en-IE' : 'fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u202f/g, NBSP);

export const clampScreens = (value: number | string): number =>
  Math.min(SCREENS_MAX, Math.max(0, Math.round(Number(value)) || 0));

export const clampPaymentCount = (value: number | string): number =>
  Math.min(PAYMENT_COUNT_MAX, Math.max(PAYMENT_COUNT_MIN, Math.round(Number(value)) || PAYMENT_COUNT_MIN));

/**
 * The answers that count: the screens of a support that is not picked weigh nothing, the options of a
 * support that is not picked are off, and the interface is only "rich" for a web application.
 */
export const getEffectiveState = (state: ISimulatorState): ISimulatorState => {
  const effective: ISimulatorState = { ...state, cx: state.cx || 'standard' };

  SIMULATOR_SUPPORTS.forEach((support) => {
    if (!state.sup[support]) effective[support] = 0;
  });
  effective.rich = state.sup.app && state.rich === 'rich' ? 'rich' : 'simple';
  effective.chat = state.chat && state.sup.mobile;
  effective.pay = {
    mobile: state.pay.mobile && state.sup.mobile,
    app: state.pay.app && state.sup.app,
  };

  return effective;
};

const isBackOfficeOnly = (state: ISimulatorState): boolean =>
  state.sup.bo && !state.sup.web && !state.sup.app && !state.sup.mobile;

export const getFloor = (state: ISimulatorState): number =>
  state.mobile > 0 ? SIMULATOR_PRICING.floor : SIMULATOR_PRICING.floorWeb;

const getPaymentCost = (state: ISimulatorState, support: SimulatorPaymentSupport): number =>
  state.pay[support]
    ? SIMULATOR_PRICING.payFirst +
      (SIMULATOR_PRICING.payExtra * (clampPaymentCount(state.payN[support]) - 1))
    : 0;

/**
 * The estimate of effective answers (see `getEffectiveState`): the screens by support and the mockups,
 * topped up to the minimum order, then the options.
 */
export const computeEstimate = (state: ISimulatorState): ISimulatorEstimate => {
  const pricing = SIMULATOR_PRICING;
  const complexity = 1 + (pricing.complexityShare * (pricing.complexity[state.cx || 'standard'] - 1));
  const isRich = state.rich === 'rich';
  // an application shares its screens with the mobile app, so its screens cost less
  const hasMobile = state.mobile > 0;
  const appRate = isRich
    ? (hasMobile ? (pricing.screen + pricing.screenRich) / 2 : pricing.screenRich)
    : (hasMobile ? (pricing.screen + pricing.screenApp) / 2 : pricing.screenApp);
  const isBoOnly = isBackOfficeOnly(state);
  const boScreens = isBoOnly ? Math.max(BACK_OFFICE_MIN_SCREENS, state.bo) : state.bo;

  const screens = {
    web: state.web, app: state.app, mobile: state.mobile, bo: boScreens,
  };
  const unitPrices = {
    web: pricing.screen * complexity,
    app: appRate * complexity,
    mobile: pricing.screen * complexity,
    bo: pricing.screen * pricing.boFactor * complexity,
  };
  const screenParts = {
    web: roundToHundred(screens.web * unitPrices.web),
    app: roundToHundred(screens.app * unitPrices.app),
    mobile: roundToHundred(screens.mobile * unitPrices.mobile),
    bo: roundToHundred(screens.bo * unitPrices.bo),
  };
  const total = screenParts.web + screenParts.app + screenParts.mobile + screenParts.bo;

  // the web application and the mobile app share their mockups: the smaller one counts for half
  const designScreens = state.web +
    boScreens +
    Math.max(state.app, state.mobile) +
    (0.5 * Math.min(state.app, state.mobile));
  const designRate = pricing.design[state.bring];
  const parts: ISimulatorParts = {
    ...screenParts,
    payMobile: getPaymentCost(state, 'mobile'),
    payApp: getPaymentCost(state, 'app'),
    chat: state.chat ? pricing.chat : 0,
    design: roundToHundred(designScreens * designRate),
    floorAdj: 0,
  };
  // the options come on top of the minimum order, while the mockups count towards it
  const options = parts.payMobile + parts.payApp + parts.chat;
  const floor = getFloor(state);
  const base = Math.max(isBoOnly ? 0 : floor, total + parts.design);

  parts.floorAdj = base - total - parts.design;

  return {
    parts,
    screens,
    unitPrices,
    designScreens,
    designRate,
    paymentCounts: {
      mobile: clampPaymentCount(state.payN.mobile),
      app: clampPaymentCount(state.payN.app),
    },
    floor,
    total,
    price: base + options,
    isOverCeiling: total > (isRich ? pricing.ceilingRich : pricing.ceiling),
    isAtFloor: !isBoOnly && base <= floor && !options,
    isBackOfficeOnly: isBoOnly,
  };
};

/**
 * Whether the rounding moved the amount of a line away from "number of screens × price of a screen":
 * the line then says its amount is approximate
 */
export const isApproximateLine = (key: keyof ISimulatorParts, estimate: ISimulatorEstimate): boolean => {
  const {
    parts, screens, unitPrices, designScreens, designRate,
  } = estimate;
  const exactAmounts: Partial<ISimulatorParts> = {
    web: screens.web * unitPrices.web,
    app: screens.app * unitPrices.app,
    mobile: screens.mobile * unitPrices.mobile,
    bo: screens.bo * unitPrices.bo,
    design: designScreens * designRate,
  };
  const exact = exactAmounts[key];

  return exact !== undefined && Math.abs(exact - parts[key]) >= 0.5;
};

/**
 * What the big price of the estimate says: the minimum order while nothing is added to it, "large
 * project" past the ceiling, the amount otherwise
 */
export const getPriceDisplay = (state: ISimulatorState): SimulatorPriceDisplay => {
  const effective = getEffectiveState(state);
  const estimate = computeEstimate(effective);

  if (estimate.isOverCeiling) return { kind: 'large' };
  if (estimate.isAtFloor) return { kind: 'from', amount: getFloor(effective) };

  return { kind: 'exact', amount: estimate.price };
};

export type SimulatorAction =
  | { type: 'setBring'; value: SimulatorBring } |
  { type: 'setSupport'; support: SimulatorSupport; isPicked: boolean } |
  { type: 'setScreens'; support: SimulatorSupport; value: number } |
  { type: 'setRich'; value: ISimulatorState['rich'] } |
  { type: 'setPayment'; support: SimulatorPaymentSupport; isOn: boolean } |
  { type: 'setPaymentCount'; support: SimulatorPaymentSupport; value: number } |
  { type: 'setChat'; isOn: boolean } |
  { type: 'toggleExample'; id: SimulatorExampleId };

export const createInitialState = (): ISimulatorViewState => clone(SIMULATOR_INITIAL_STATE);

const applyExample = (id: SimulatorExampleId): ISimulatorViewState => {
  const example = SIMULATOR_EXAMPLES.find(item => item.id === id);
  const state: ISimulatorViewState = {
    ...createInitialState(),
    ...clone(SIMULATOR_EMPTY_ANSWERS),
    ...clone(example?.state),
    example: id,
  };

  // an example picks the supports it has screens for
  SIMULATOR_SUPPORTS.forEach((support) => {
    state.sup[support] = state[support] > 0;
  });

  return state;
};

export const simulatorReducer = (
  state: ISimulatorViewState,
  action: SimulatorAction
): ISimulatorViewState => {
  switch (action.type) {
    case 'setBring':
      return { ...state, bring: action.value };
    case 'setSupport':
      return {
        ...state,
        sup: { ...state.sup, [action.support]: action.isPicked },
        // the interface is simple again once the web application is dropped
        rich: action.support === 'app' && !action.isPicked ? 'simple' : state.rich,
      };
    case 'setScreens':
      return { ...state, [action.support]: clampScreens(action.value) };
    case 'setRich':
      return { ...state, rich: action.value };
    case 'setPayment':
      return { ...state, pay: { ...state.pay, [action.support]: action.isOn } };
    case 'setPaymentCount':
      return { ...state, payN: { ...state.payN, [action.support]: clampPaymentCount(action.value) } };
    case 'setChat':
      return { ...state, chat: action.isOn };
    case 'toggleExample':
      // choosing the example that is on takes the screen back to its start
      return state.example === action.id ? createInitialState() : applyExample(action.id);
    default:
      return state;
  }
};

/**
 * The written summary of the answers and of the estimate: copied on demand, and handed to the contact
 * form. The amounts are in euros, whatever currency the page shows.
 */
export const buildRecap = (
  state: ISimulatorState,
  labels: ISimulatorRecapLabels,
  locale: string
): string => {
  const effective = getEffectiveState(state);
  const { parts } = computeEstimate(effective);
  const paymentPartKey = { mobile: 'payMobile', app: 'payApp' } as const;

  const lines = [
    `${labels.with} : ${labels.bring[effective.bring].toLowerCase()}`,
    SIMULATOR_SUPPORTS
      .filter(support => state.sup[support])
      .map((support) => {
        const richNote = support === 'app' && effective.rich === 'rich'
          ? ` (${labels.richLabel.toLowerCase()})`
          : '';

        return `${labels.support[support]} : ${labels.about(effective[support])}${richNote}`;
      })
      .join('\n'),
    ...(state.cx ? [`${labels.complexity} : ${labels.complexityLevel[state.cx].toLowerCase()}`] : []),
    ...(effective.chat
      ? [`${labels.chatLabel} (${labels.support.mobile}) : ${formatEuros(SIMULATOR_PRICING.chat, locale)}`]
      : []),
    ...SIMULATOR_PAYMENT_SUPPORTS
      .filter(support => effective.pay[support])
      .map(support => [
        `${labels.paymentLabel} (${labels.support[support]}) : `,
        `${effective.payN[support]} (${formatEuros(parts[paymentPartKey[support]], locale)})`,
      ].join('')),
  ];

  return lines.join('\n');
};

/**
 * What the contact form starts from once the visitor asks for a quote
 */
export const buildEstimate = (
  state: ISimulatorState,
  labels: ISimulatorRecapLabels,
  locale: string
): IEstimate => ({
  text: buildRecap(state, labels, locale),
  sup: {
    web: Boolean(state.sup.web),
    app: Boolean(state.sup.app),
    mobile: Boolean(state.sup.mobile),
    bo: Boolean(state.sup.bo),
  },
  bring: state.bring,
});
