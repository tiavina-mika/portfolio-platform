// _core = generic, no business-domain knowledge (auth, user, ban, notification, payment, RBAC, CMS, reports…)
import './_core/auth.service.cloud';
import './_core/category.service.cloud';
import './_core/contact.service.cloud';
import './_core/right.service.cloud';
import './_core/security.service.cloud';
import './_core/user.service.cloud';
import './_core/userRole.service.cloud';
import './_core/notification.service.cloud';
import './_core/notification-resend.service.cloud';
import './_core/payment.service.cloud';
import './_core/dashboard.service.cloud';
import './_core/statistics.service.cloud';
import './_core/auditLog.service.cloud';
import './_core/cms.service.cloud';
import './_core/report.service.cloud';
import './_core/ticket-message.service.cloud';
import './_core/ticket-notification.service.cloud';
import './_core/userSession.service.cloud';
import './_core/user-list.service.cloud';
import './_core/sms-credit-alert.service.cloud';
// the morning Slack summary; registers the sign-up count, a domain may add its own figures
import './_core/daily-summary.service.cloud';

// _domain = business-domain services (the portfolio projects)
import './_domain/project-dashboard.service.cloud';
import './_domain/project-search.service.cloud';
