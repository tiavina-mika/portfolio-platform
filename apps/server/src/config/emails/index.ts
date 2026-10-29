import type { Locale } from '@/types/app.type';
import { APP_NAME } from '@/utils/constants';
import { getClientUrl, getLogoUrl } from '@/utils/util';

import { translate } from '../i18next';

const styles = `
  <style type="text/css">
    @media screen {
      @font-face {
        font-family: 'BasierCircle-Medium';
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2) format('woff2');
      }
    }
    .root {
      background-color: #f2f2f2;
      padding-top: 12px;
      padding-bottom: 20px;
      width: 100%;
    }
    .body {
      font-family: "BasierCircle-Medium", Sans-Serif;
      font-size: 16px;
      padding: 16px 0px;
    }
    .body p, .footer-table p, .footer p {
      font-family: "BasierCircle-Medium", Sans-Serif;
    }
    .footer p {
      font-size: 10px;
    }
    .card {
      background-color: #fff;
      padding: 24px 32px;
      max-width: 500px;
    }
    .table-logo {
      width: 100%;
      padding-top: 6px;
    }
    .prev {
      background-color: #f2f2f2;
      border-radius: 2px;
    }
    .left, .right {
      width: 25%;
    }
    .center {
      width: 75%;
    }
    .main-button {
      background-color: #000;
      color: #fff;
      border-radius: 4px;
      padding: 12px 24px;
      font-size: 16px;
      margin-top: 14px;
    }
    .footer-table {
      width: 100%;
    }
    .footer-paragraph-1 {
      margin-top: 36px;
      font-size: 12px;
      color: #303030;
      text-align: center;
    }
    @media only screen and (max-width: 600px) {
      .center {
        width: 96%;
      }
      .left, .right {
        width: 2%;
      }
    }
    @media only screen and (min-width: 600px) and (max-width: 900px) {
      .center {
        width: 80%;
      }
      .left, .right {
        width: 10%;
      }
    }
  </style>
`;

/**
 *
 * Generate an email template
 * Try it out in https://codesandbox.io/p/github/tiavina-mika/raw-email-template
 * @param title - The title of the email
 * @param content - The content of the email
 * @param buttonUrl - The url of the button
 * @param buttonText - The text of the button
 */
type EmailTemplateProps = {
  /**
   * The title of the email
   * NOTE: This is not the subject of the email, since it's displayed in the email body
   */
  title?: string;
  content: string;
  /**
   * The url to redirect to when the button is clicked
   */
  buttonUrl?: string;
  /**
   * The button text to display
   */
  buttonText?: string;
  /**
   * The footer of the email
   */
  footer?: string;
  /**
   * css inline style for card
   */
  cardStyle?: string;
  locale?: Locale;
};
export const generateEmailTemplate = ({
  title,
  content,
  buttonUrl,
  cardStyle,
  buttonText,
  footer,
  locale,
}: EmailTemplateProps): string => {
  return `
    ${styles}
    <table class="root" role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
      <tr>
        <td>
          <table
            class="table-logo" role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"
          >
            <tr>
              <td align="center">
                <!-- logo -->
                <a href="${getClientUrl()}">
                  <img alt="${APP_NAME}" src="${getLogoUrl()}" width="80px" />
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table class="body" role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <!-- left -->
              <td class="left"></td>
              <!-- center -->
              <td class="card" style="${cardStyle || ''}">
                <table>
                  ${title
                      ? `
                      <!-- title -->
                      <tr>
                        <td>
                          <h1>${title}</h1>
                        </td>
                      </tr>
                    `
                      : ''
                  }
                  <!-- body -->
                  <tr>
                    <td>
                      <!-- dynamic content here -->
                        ${content}
                    </td>
                  </tr>
                  <!-- buttons -->
                  ${buttonUrl
                      ? `
                      <tr>
                        <td align="center">
                          <!-- dynamic url -->
                          <a href="${buttonUrl}" alt="">
                            <button class="main-button">
                              ${buttonText}
                            </button>
                          </a>
                        </td>
                      </tr>
                    `
                      : ''
                  }
                </table>
              </td>
              <td class="right"></td>
            </tr>
          </table>
        </td>
      </tr>
      ${footer
        ? `
          <tr>
            <td>
              <table
                class="footer-table" role="presentation" border="0"
                cellpadding="0" cellspacing="0" align="center"
              >
                <!-- footer -->
                  <tr>
                    <td align="center">
                      <p class="footer-paragraph-1">
                        ${footer}
                      </p>
                    </td>
                  </tr>
              </table>
            </td>
          </tr>
          `
        : ''}

        <tr>
          <td>
            <table
              class="footer" role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"
            >
              <tr>
                <td align="center">
                  <p class="footer-paragraph-1">
                    © ${new Date().getFullYear()}. ${APP_NAME} ${translate('email.allRightsReserved', locale)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
    </table>
  `;
};
