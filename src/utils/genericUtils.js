import Papa from 'papaparse';

/**
 * Throttles function calls to timesPerSecond. Silently ignores overlimit function calls
 * @param {T} func 
 * @param {*} timesPerSecond 
 * @returns 
 */
export const throttleFunction = (func, timesPerSecond) => {
  const limit = 1000 / timesPerSecond; // Calculate the interval in milliseconds
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Generates a medium intensity color
 * Why 80-180?
 *  In the RGB color model, each channel (red, green, blue) ranges from 0 to 255.
 *  0-79 is "dark," 181-255 is "bright," and 80-180 is roughly "medium."
 *  This range ensures the colors aren’t too close to black (0) or white (255), meeting the "medium intensity" requirement.
 * 
 * Problem: If R, G, and B are too close (e.g., 120, 122, 119), the color looks grayscale or muted, not "colorful."
 * Solution: Enforce a minimum difference (minDiff = 40) between any two channels.
 * @returns 
 */
export const generateMediumIntensityColor = () => {
  // Define a range for medium intensity (80-180)
  const min = 80;
  const max = 180;
  const range = max - min;

  // Generate initial RGB values
  let r = Math.floor(Math.random() * range) + min;
  let g = Math.floor(Math.random() * range) + min;
  let b = Math.floor(Math.random() * range) + min;

  // Ensure colorfulness by enforcing a minimum difference between channels
  const minDiff = 40; // Minimum difference to avoid grayscale-like colors
  while (
    Math.abs(r - g) < minDiff &&
    Math.abs(g - b) < minDiff &&
    Math.abs(b - r) < minDiff
  ) {
    // If all values are too close, regenerate one or more
    r = Math.floor(Math.random() * range) + min;
    g = Math.floor(Math.random() * range) + min;
    b = Math.floor(Math.random() * range) + min;
  }

  return `rgb(${r},${g},${b})`;
};

/**
 * Gets csv data
 * @param {*} date 
 */
export const parseCsv = async (data, successCallback) => {
  try {
      Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            successCallback(result.data);
          },
          error: (parseError) => {
            console.log(`Error parsing CSV: ${parseError.message}`);
          },
      });
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * Gets 1 min ohlc data and fills in missing candles via linear interpolation
 * @param {*} ohlcDataArr 
 */
export const fillMissingCandles = ohlcDataArr =>{
  // If array is empty or has only one candle, return as is
  if (ohlcDataArr.length <= 1) return ohlcDataArr;

  const filledArr = [];
  const ONE_MIN_MS = 60 * 1000;

  // Add the first candle
  filledArr.push(ohlcDataArr[0]);

  // Loop through the candles starting from the second one
  for (let i = 1; i < ohlcDataArr.length; i++) {
      const prevCandle = ohlcDataArr[i - 1];
      const currentCandle = ohlcDataArr[i];

      // Calculate time difference in milliseconds
      const msDiff = currentCandle.timestamp - prevCandle.timestamp;
      const missingMinutes = msDiff / ONE_MIN_MS - 1;

      // If there are missing candles
      if (missingMinutes > 0) {
          // Fill in the missing candles using linear interpolation
          for (let j = 1; j <= missingMinutes; j++) {
              const missingTimestamp = prevCandle.timestamp + (j * ONE_MIN_MS);
              // const fraction = j / (missingMinutes + 1); // Fraction of the gap
              const fraction = (50/missingMinutes)*(2*j-1)*0.01;
              console.log('prevHigh',prevCandle.high, 'nextHigh', currentCandle.high, 'curJ = ', j, 'fraction=',fraction, 'missingMinsues: ',missingMinutes, '====finalHight=',interpolate(prevCandle.high, currentCandle.high, fraction))
              // Linearly interpolate OHLC values
              const interpolatedCandle = {
                  timestamp: missingTimestamp,
                  open: interpolate(prevCandle.open, currentCandle.open, fraction),
                  high: interpolate(prevCandle.high, currentCandle.high, fraction),
                  low: interpolate(prevCandle.low, currentCandle.low, fraction),
                  close: interpolate(prevCandle.close, currentCandle.close, fraction),
                  volume: 0, // Volume and trades still set to 0 for missing candles
                  trades: 0
              };
              filledArr.push(interpolatedCandle);
          }
      }

      // Add the current candle
      filledArr.push(currentCandle);
  }

  return filledArr;
}

// Helper function for linear interpolation
function interpolate(start, end, fraction) {
  return start + (end - start) * fraction;
}