'use client';

import { BusinessWithDemographic } from "@/db/schema";

interface BusinessDocumentsProps {
  business: BusinessWithDemographic;
}

export default function BusinessDocuments({ business }: BusinessDocumentsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Business Documents</h2>
      <ul>
        {business.material1Url && (
          <li>
            <a href={business.material1Url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {business.material1Title || 'Document 1'}
            </a>
          </li>
        )}
        {business.material2Url && (
          <li>
            <a href={business.material2Url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {business.material2Title || 'Document 2'}
            </a>
          </li>
        )}
        {business.material3Url && (
          <li>
            <a href={business.material3Url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {business.material3Title || 'Document 3'}
            </a>
          </li>
        )}
        {business.material4Url && (
          <li>
            <a href={business.material4Url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {business.material4Title || 'Document 4'}
            </a>
          </li>
        )}
        {business.material5Url && (
          <li>
            <a href={business.material5Url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {business.material5Title || 'Document 5'}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
