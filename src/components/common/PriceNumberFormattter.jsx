import React from 'react';

const PriceNumberFormatter = ({ children }) => {
  // Handle non-numeric input
  if (isNaN(children)) return <span>-</span>;

  // Convert to number and format to 2 decimal places
  const formattedNumber = Number(children).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return <span>{formattedNumber}</span>;
};

export default PriceNumberFormatter;