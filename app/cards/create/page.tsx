'use client';

import { useRouter } from 'next/navigation';
import CreateCardForm from '@/components/CreateCardForm';

export default function CreateCardPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isDraft: boolean;
  }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ [Create Card | handleSubmit] User not authenticated');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ [Create Card | handleSubmit] Card created successfully', { 
          message: result.message,
          cardId: result.card?._id 
        });
        router.push('/cards');
      } else {
        console.error('❌ [Create Card | handleSubmit] Failed to create card', { 
          status: response.status,
          error: result.error 
        });
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('❌ [Create Card | handleSubmit] Error creating card', { 
        error: error.message,
        stack: error.stack 
      });
      throw new Error(error.message || 'Failed to create card');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <CreateCardForm onSubmit={handleSubmit} />
    </div>
  );
}
