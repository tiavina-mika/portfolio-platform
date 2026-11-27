import {
  expect, fn, userEvent, within,
} from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Simulator from '@/containers/simulator/Simulator';

// a euro amount, whatever space the language puts in it ("3 100 €", "€3,100")
const amount = (digits: string) => new RegExp(digits.replace(/(\d)(?=(\d{3})+$)/g, '$1[\\s\\u00a0,.]?'));

const meta = {
  title: 'Containers/Simulator/Simulator',
  component: Simulator,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onRequestQuote: fn(),
    onCopySummary: fn(),
  },
} satisfies Meta<typeof Simulator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A mobile app of 100 screens, specifications in hand: the screens (2 000) and the mockups (600)
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText(amount('2600')).length).toBeGreaterThan(0);
  },
};

/**
 * An example sets every answer at once; choosing it again takes the simulator back to its start
 */
export const ExampleThenBack: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // the examples are the only toggle buttons of the page
    const backOfficeExample = canvas.getAllByRole('button', { pressed: false })[2];

    await userEvent.click(backOfficeExample);
    await expect(backOfficeExample).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getAllByText(amount('8400')).length).toBeGreaterThan(0);

    await userEvent.click(backOfficeExample);
    await expect(backOfficeExample).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getAllByText(amount('2600')).length).toBeGreaterThan(0);
  },
};

/**
 * A small website is topped up to the minimum order of the web (1 500): the price is a "from"
 */
export const MinimumOrderOfTheWeb: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [web, , mobile] = canvas.getAllByRole('checkbox');
    const mockup = canvas.getAllByRole('radio')[2];

    await userEvent.click(web);
    await userEvent.click(mobile);
    await userEvent.click(mockup);

    const screens = canvas.getAllByRole('spinbutton')[0];

    await userEvent.clear(screens);
    await userEvent.type(screens, '10');
    await userEvent.tab();

    await expect(canvas.getAllByText(amount('1500')).length).toBeGreaterThan(0);
  },
};

/**
 * Mobile alone starts at 2 000, however few screens there are
 */
export const MinimumOrderWithMobile: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mockup = canvas.getAllByRole('radio')[2];

    await userEvent.click(mockup);

    const screens = canvas.getAllByRole('spinbutton')[0];

    await userEvent.clear(screens);
    await userEvent.type(screens, '10');
    await userEvent.tab();

    await expect(canvas.getAllByText(amount('2000')).length).toBeGreaterThan(0);
  },
};

/**
 * The mockups count towards the minimum order: the screens (1 300) and the mockups (300) of the second
 * example are topped up by 400 to reach 2 000
 */
export const MockupsCountTowardsTheMinimum: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const result = within(canvas.getByRole('complementary'));

    await userEvent.click(canvas.getAllByRole('button', { pressed: false })[1]);

    await expect(result.getAllByText(amount('2000')).length).toBeGreaterThan(0);
    await expect(result.getByText(amount('400'))).toBeInTheDocument();
  },
};

/**
 * The online payment of the mobile app adds its first integration (500) and each one more (22)
 */
export const PaymentOption: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // the platforms come first, then the mobile options: chat, payment
    const payment = canvas.getAllByRole('checkbox')[5];

    await userEvent.click(payment);
    await expect(canvas.getAllByText(amount('3100')).length).toBeGreaterThan(0);

    await userEvent.selectOptions(canvas.getByRole('combobox'), '3');
    await expect(canvas.getAllByText(amount('3144')).length).toBeGreaterThan(0);
  },
};

/**
 * Asking for a quote hands the estimate over: the supports picked and what the visitor brings
 */
export const RequestQuote: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const result = within(canvas.getByRole('complementary'));

    await userEvent.click(result.getAllByRole('button')[0]);
    await expect(args.onRequestQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        bring: 'spec',
        sup: { web: false, app: false, mobile: true, bo: false },
      })
    );
  },
};

/**
 * Copying the summary hands the text over
 */
export const CopySummary: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const result = within(canvas.getByRole('complementary'));

    await userEvent.click(result.getAllByRole('button')[1]);
    await expect(args.onCopySummary).toHaveBeenCalledTimes(1);
  },
};
