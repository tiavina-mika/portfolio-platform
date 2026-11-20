/**
 * The estimate of the simulator, as kept in the browser for the contact form
 */
export interface IEstimate {
  /**
   * The readable summary of the estimate (supports, screens, options, total)
   */
  text: string;
  /**
   * The supports the visitor picked
   */
  sup: { web: boolean; app: boolean; mobile: boolean; bo: boolean };
  /**
   * What the visitor already has (designs, specs…), as picked in the simulator
   */
  bring: string;
}
