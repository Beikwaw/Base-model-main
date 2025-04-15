import React from 'react';
import { updateRequestStatus } from '@/lib/firestore';

export default function UpdateStatus({ requestId }: { requestId: string }) {
  const [status, setStatus] = React.useState('');

  const handleUpdate = async () => {
    await updateRequestStatus(requestId, status);
    alert('Status updated successfully');
  };

  return (
    <div>
      <h2>Update Status</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
