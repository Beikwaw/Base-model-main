import React from 'react';
import { getRequestDetails } from '@/lib/firestore';

export default function ViewDetails({ requestId }: { requestId: string }) {
  type RequestDetails = {
    id: string;
    title: string;
    userName: string;
    roomNumber: string;
    description: string;
    priority: string;
    status: string;
  };

  const [details, setDetails] = React.useState<RequestDetails | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getRequestDetails(requestId);
        setDetails(data);
      } catch (err) {
        if ((err as any).code === 'permission-denied') {
          setError('Missing or insufficient permissions.');
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    fetchDetails();
  }, [requestId]);

  if (error) return <div>{error}</div>;
  if (!details) return <div>Loading...</div>;

  return (
    <div>
      <h2>Request Details</h2>
      <p>ID: {details.id}</p>
      <p>Title: {details.title}</p>
      <p>User: {details.userName}</p>
      <p>Room: {details.roomNumber}</p>
      <p>Description: {details.description}</p>
      <p>Priority: {details.priority}</p>
      <p>Status: {details.status}</p>
    </div>
  );
}
