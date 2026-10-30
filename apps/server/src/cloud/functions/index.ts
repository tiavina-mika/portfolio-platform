import { IS_LOCAL, IS_TEST } from '@/constants/_core/constants';

// _core = generic/reusable functions (kept as-is when this repo is cloned as a boilerplate)
import './_core/accountHelp.functions';
import './_core/app.functions';
import './_core/auditLog.functions';
import './_core/article.functions';
import './_core/auth.functions';
import './_core/category.functions';
import './_core/faq.functions';
import './_core/contact.functions';
import './_core/contentVersion.functions';
import './_core/globalSearch.functions';
import './_core/impersonation.functions';
import './_core/invitation.functions';
import './_core/mfa.functions';
import './_core/receipt.functions';
import './_core/misc.functions';
import './_core/passwordResetDelay.functions';
import './_core/page.functions';
import './_core/pageSection.functions';
import './_core/role.functions';
import './_core/user.functions';
import './_core/utils.functions';
import './_core/notification.functions';
import './_core/payment.functions';
import './_core/report.functions';
import './_core/admins.functions';
import './_core/dashboard.functions';
import './_core/statistics.functions';
import './_core/stepUpVerification.functions';
import './_core/contactChange.functions';
import './_core/payoutPhone.functions';
import './_core/ticket-message.functions';
import './_core/userSession.functions';

// _domain = business-domain functions (the portfolio projects)
import './_domain/project.functions';

if (IS_LOCAL || IS_TEST) {
  void import('./_core/test.functions');
}
