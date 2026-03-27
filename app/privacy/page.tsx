import type { Metadata } from 'next';
import { LegalPageShell } from '@/src/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for MyShopLink.',
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      intro="This policy explains what information MyShopLink collects, how we use it, and how we protect it when you use our storefront and merchant dashboard."
      updatedAt="March 27, 2026"
      sections={[
        {
          title: 'Information we collect',
          body: [
            'We collect account details such as your name, email address, username, WhatsApp number, billing plan, and profile information when you sign up or update your account.',
            'We also collect store data you add to the platform, including product information, images, order notes, storefront settings, and analytics events such as store views and WhatsApp clicks.',
          ],
        },
        {
          title: 'How we use your information',
          body: [
            'We use your information to provide the service, maintain your storefront, process billing, support your account, and improve the product.',
            'We may also use service-level analytics and operational logs to monitor reliability, prevent abuse, and troubleshoot issues.',
          ],
        },
        {
          title: 'Customer information in your store',
          body: [
            'If shoppers interact with your storefront, we may store limited activity and order-related data on your behalf so you can manage inquiries and sales inside MyShopLink.',
            'You are responsible for making sure your own customers understand how you handle their information when they contact you or place an order.',
          ],
        },
        {
          title: 'Sharing and storage',
          body: [
            'We do not sell your personal information. We may share data with infrastructure, storage, analytics, payment, and support providers only as needed to operate MyShopLink.',
            'Your data may be stored and processed using third-party hosting, database, and file-storage providers that support the platform.',
          ],
        },
        {
          title: 'Your choices',
          body: [
            'You can update your profile, store information, and billing settings from your account. You can also contact us if you want help deleting your account or exported business data.',
            'For privacy-related questions, contact us at support@myshoplink.site.',
          ],
        },
      ]}
    />
  );
}
