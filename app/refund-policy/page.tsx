import type { Metadata } from 'next';
import { LegalPageShell } from '@/src/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for MyShopLink subscriptions.',
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Refund Policy"
      title="Refund Policy"
      intro="This policy explains how trials, cancellations, and refunds work for MyShopLink subscriptions."
      updatedAt="March 27, 2026"
      sections={[
        {
          title: 'Free trial',
          body: [
            'New merchants may receive a limited free trial of Pro features. If you cancel before the trial ends, you will not be charged for the next billing period.',
            'When a trial ends, your account may move to the applicable paid plan or back to a lower plan depending on the billing setup shown in your account.',
          ],
        },
        {
          title: 'Subscription charges',
          body: [
            'Paid subscriptions are billed according to the plan and billing interval shown at checkout. By subscribing, you authorize us to charge the selected payment method for recurring renewals unless you cancel.',
            'If a payment fails or a subscription expires, paid features may be limited or removed until billing is restored.',
          ],
        },
        {
          title: 'Refunds',
          body: [
            'Subscription fees are generally non-refundable once a billing period has started, except where required by law or where we explicitly agree otherwise.',
            'If you believe you were charged in error, contact support@myshoplink.site with your account email and billing details so we can review the case.',
          ],
        },
        {
          title: 'Cancellations',
          body: [
            'You can cancel future renewals from your billing settings. Cancellation stops the next renewal charge but does not usually reverse charges already processed for the current billing period.',
            'Any refund exception, account credit, or manual adjustment remains at MyShopLink’s sole discretion unless local law says otherwise.',
          ],
        },
      ]}
    />
  );
}
