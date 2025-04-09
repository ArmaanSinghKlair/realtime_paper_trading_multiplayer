import React, { useEffect, useState } from "react";
import Papa from 'papaparse';

/**
 * Custom hook to fetch and parse OHLC data from a CSV file.
 * @returns {Array} ohlcDataArr - Array of OHLC data objects parsed from the CSV file.
 */
const useOhlcDataArr = () => {
  const [ohlcDataArr, setOhlcDataArr] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(async ()=>{
    const fetchOhlcDataArr = async (date) => {
      setLoading(true);
      setError(null);
      try {
          const csvModule = await import(`../data/csv/ethereum-${date}.csv?raw`);
          const csvText = csvModule.default;
  
          Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (result) => {
                setOhlcDataArr(result.data);
                setLoading(false);
              },
              error: (parseError) => {
                  console.log(`Error parsing CSV: ${parseError.message}`);
                  setLoading(false);
              },
          });
      } catch (err) {
        console.log(err.message);
          setLoading(false);
      }
    };
    fetchOhlcDataArr('2021-05-01');  

  }, []);
  return ohlcDataArr;
};


export default useOhlcDataArr;
