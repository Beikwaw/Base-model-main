import React from 'react';
import { ErrorPage } from '@/components/ErrorPage';
import { NextPageContext } from 'next';

const CustomError = ({ statusCode }: { statusCode: number }) => {
  return <ErrorPage statusCode={statusCode} />;
};


CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
