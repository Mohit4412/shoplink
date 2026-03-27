import type { Metadata } from 'next';
import { LegalPageShell } from '@/src/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for MyShopLink.',
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms of Service"
      title="Terms of Service"
      intro="These terms govern your access to and use of MyShopLink. By creating an account or using the service, you agree to these terms."
      updatedAt="March 27, 2026"
      sections={[
        {
          title: 'Using MyShopLink',
          body: [
            'You may use MyShopLink to create a storefront, publish product information, track store activity, and manage customer inquiries and orders.',
            'You are responsible for the accuracy of the information you publish, including prices, stock, policies, legal pages, and any claims you make to customers.',
          ],
        },
        {
          title: 'Accounts and access',
          body: [
            'You are responsible for keeping your login credentials secure and for all activity that happens through your account.',
            'We may suspend or restrict access if we detect fraud, abuse, illegal activity, or use of the platform in a way that harms MyShopLink, other merchants, or customers.',
          ],
        },
        {
          title: 'Plans and billing',
          body: [
            'MyShopLink may offer free plans, trial periods, and paid subscriptions. Paid features remain active only while the related subscription or billing term is active.',
            'You are responsible for any applicable taxes, payment method issues, charge failures, or subscription renewals associated with your chosen plan.',
          ],
        },
        {
          title: 'Your content',
          body: [
            'You retain ownership of the product images, descriptions, branding, and other content you upload. You grant MyShopLink permission to host, process, and display that content as needed to operate the service.',
            'You must not upload content that is unlawful, infringing, deceptive, abusive, or violates another party’s rights.',
          ],
        },
        {
          title: 'Service availability and liability',
          body: [
            'We work to keep MyShopLink reliable, but we do not guarantee uninterrupted availability, error-free operation, or suitability for every business use case.',
            'To the extent allowed by law, MyShopLink is not liable for indirect, incidental, or consequential losses arising from your use of the service.',
          ],
        },
      ]}
    />
  );
}
