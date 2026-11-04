import { css, Global, type Theme } from '@emotion/react';

import type { Theme as MUITheme } from '@mui/material';

import { FONT_FAMILY_MONO } from '@/constants/_core/ui/ui.constants';

interface IThemeProps {
  theme: Theme & MUITheme;
}

const getGlobalStyles = (theme: IThemeProps['theme']) => {
  return css`
    body {
      margin: 0;
      font-family: ${theme.typography.fontFamily};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* one monospace stack for the whole interface — the same one identifiers and amounts use */
    code {
      font-family: ${FONT_FAMILY_MONO};
    }

    /* ------------------ Font styles ------------------ */

    .font-Montserrat-medium {
      font-family: 'Montserrat-Medium', sans-serif;
    }

    .flexRow {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .flexColumn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex-wrap: nowrap;
    }

    .flexCenter {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
    }

    .flexStretch {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .stretch {
      align-items: stretch;
    }

    .center {
      align-items: center;
    }

    .flexStart {
      align-items: flex-start;
    }

    .flexEnd {
      align-items: flex-end;
    }

    .flexBaseline {
      align-items: baseline;
    }

    .spaceBetween {
      justify-content: space-between;
    }

    .spaceAround {
      justify-content: space-around;
    }

    .justifyStart {
      justify-content: flex-start;
    }

    .justifyEnd {
      justify-content: flex-end;
    }

    .justifyCenter {
      justify-content: center;
    }

    .stretchSelf {
      align-self: stretch;
    }

    .justifySelf {
      justify-self: stretch;
    }

    .centerSelf {
      align-self: center;
    }
    .endSelf {
      align-self: flex-end;
    }

    .flex1 {
      flex: 1;
    }

    .flex2 {
      flex: 2;
    }

    .wrap {
      flex-wrap: wrap;
    }

    .nowrap {
      flex-wrap: nowrap;
    }

    .shrink0 {
      flex-shrink: 0;
    }

    .shrink1 {
      flex-shrink: 1;
    }

    .flexItem {
      padding: 10px;
    }

    .transparentButton {
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    .positionRelative {
      position: relative;
    }

    .positionAbsolute {
      position: absolute;
    }

    .positionSticky {
      position: sticky;
    }

    .minHeight100 {
      min-height: 100vh;
    }

    .h4Grey600 {
      color: ${theme.palette.text.secondary};
    }

    .fw700 {
      font-weight: 700;
    }

    .cursorPointer {
      cursor: pointer;
    }

    .textCenter {
      text-align: center;
    }
    .textUpperCase {
      text-transform: uppercase;
    }
    .textLeft {
      text-align: left;
    }
    .lh1 {
      line-height: 1;
    }
    .lh15 {
      line-height: 1.5;
    }
    .transparentButton {
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    .gapTwo {
      gap: 2px;
    }

    .gapFour {
      gap: 4px;
    }

    .gapEight {
      gap: 8px;
    }

    .gapTen {
      gap: 10px;
    }

    .gapSixteen {
      gap: 16px;
    }

    .gapTwentyFour {
      gap: 24px;
    }

    .gapThirtyTwo {
      gap: 32px;
    }

    .gapFortyEight {
      gap: 48px;
    }

    /* ------------ COLORS ------------ */
    .grey50 {
      color: ${theme.palette.grey[50]} !important;
    }
    .grey100 {
      color: ${theme.palette.grey[100]} !important;
    }
    .grey300 {
      color: ${theme.palette.grey[300]} !important;
    }
    .grey600 {
      color: ${theme.palette.text.secondary} !important;
    }
    .grey800 {
      color: ${theme.palette.grey[800]} !important;
    }
    .grey900 {
      color: ${theme.palette.grey[900]} !important;
    }
    /*
     * The block that used to sit here painted flat red / blue / pink backgrounds - layout debug
     * helpers, referenced by nothing, and the only colours in this file that came from outside the
     * palette. Anything that needs a colour reads it off the theme, like the greys above.
     */
    /* ------------ COLORS ------------ */

    /* ------------ SCROLL ------------ */
    .hideScrollbar {
      /* hide scrollbar for IE, Edge and Firefox */
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* hide scrollbar for chrome, safari and opera */
    .hideScrollbar::-webkit-scrollbar {
      display: none;
    }

    .scrollX {
      overflow-x: scroll;
    }
    .scrollY {
      overflow-y: scroll;
    }
    .scrollY {
      overflow: scroll;
    }
    /* ------------ SCROLL ------------ */
  `;
};

export const GlobalStyles = ({
  theme,
}: IThemeProps) => <Global styles={getGlobalStyles(theme)} />;
