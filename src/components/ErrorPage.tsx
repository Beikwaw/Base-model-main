import React from 'react';

interface ErrorPageProps {
  statusCode: number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode }) => {
  return (
    <div>
      <h1>{statusCode}</h1>
      <p>An error occurred</p>
    </div>
  );
};

export { ErrorPage };
