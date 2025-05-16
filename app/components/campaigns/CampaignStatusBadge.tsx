import React from 'react';

interface CampaignStatusBadgeProps {
  status: 'active' | 'completed' | 'upcoming';
}

export default function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'active':
      bgColor = 'bg-green-100 dark:bg-green-900/30';
      textColor = 'text-green-800 dark:text-green-300';
      break;
    case 'completed':
      bgColor = 'bg-gray-100 dark:bg-gray-700/50';
      textColor = 'text-gray-800 dark:text-gray-300';
      break;
    case 'upcoming':
      bgColor = 'bg-blue-100 dark:bg-blue-900/30';
      textColor = 'text-blue-800 dark:text-blue-300';
      break;
    default:
      bgColor = 'bg-purple-100 dark:bg-purple-900/30';
      textColor = 'text-purple-800 dark:text-purple-300';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
} 