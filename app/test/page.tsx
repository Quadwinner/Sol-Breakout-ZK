import TestCampaignForm from '../components/campaigns/TestCampaignForm';

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Test Campaign Creation</h1>
      <div className="max-w-3xl mx-auto">
        <TestCampaignForm />
      </div>
    </div>
  );
} 