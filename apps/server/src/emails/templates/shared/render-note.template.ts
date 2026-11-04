import { EMAIL_COLORS } from '@/emails/theme';

const { light } = EMAIL_COLORS;

/** A small muted remark closing a message */
export const renderNote = (text: string): string => `
  <p class="em-muted" style="margin:0;font-size:14px;color:${light.muted};">${text}</p>
`;
