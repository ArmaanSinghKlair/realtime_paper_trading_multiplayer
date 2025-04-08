import Papa from 'papaparse';

/**
 * @returns 50 char long random string
 */
export const createRandomString = (strLen = 50) => {
  const allPossibleCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randStr = '';
  for(let i=0; i < strLen; i++){
      randStr += allPossibleCharacters.charAt(Math.ceil(Math.random() * (allPossibleCharacters.length-1)));
  }
  return randStr;
}

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

  let minsFilledArr = [];
  const ONE_MIN_MS = 60 * 1000;

  //===============================================================================================================================================
  //SIMULATE Missing minute data. Does a linear interpolation between missing candles.
  //===============================================================================================================================================
  // minsFilledArr.push(ohlcDataArr[0]);
  let prevMinCandle = 0;  //last candle we added to result
  for (let i = 0; i < ohlcDataArr.length; i++) {
      const currentCandle = ohlcDataArr[i];
      //if NO data or less than $10 change in the minute, simulate data (Don't use actual data)
      if(currentCandle.high == currentCandle.low || Math.abs(currentCandle.high-currentCandle.low)<10){
        continue;
      }
      // Calculate time difference in milliseconds
      const msDiff = currentCandle.timestamp - prevMinCandle.timestamp;
      const missingMinutes = msDiff / ONE_MIN_MS - 1;

      // If there are missing candles
      if (missingMinutes > 0) {
          let prevCandleClose = prevMinCandle.close; //prev close

          // Fill in the missing candles using linear interpolation
          for (let j = 0; j < missingMinutes; j++) {
              const missingTimestamp = prevMinCandle.timestamp + ((j+1) * ONE_MIN_MS);
              let priceDiff = Math.abs(currentCandle.open-prevMinCandle.close);
              let curCandleClose = null;
              let curCandleOpen = prevCandleClose;  //never changed anywhere. For reference
              if(currentCandle.open >= prevMinCandle.close){
                //green candles interpolation
                curCandleClose = prevCandleClose + (priceDiff/missingMinutes)
              } else{
                //red candles interpolation
                curCandleClose = prevCandleClose - (priceDiff/missingMinutes);
              }
              // Linearly interpolate OHLC values
              const interpolatedCandle = {
                  timestamp: missingTimestamp,
                  open: prevCandleClose,
                  high: Math.max(curCandleOpen, curCandleClose) + priceDiff*(1/missingMinutes),
                  low: Math.min(curCandleOpen, curCandleClose) - priceDiff*(1/missingMinutes),
                  close: curCandleClose, //interpolate(prevCandle.close, currentCandle.close, fraction),
                  volume: 0, // Volume and trades still set to 0 for missing candles
                  trades: 0
              };
              minsFilledArr.push(interpolatedCandle);
              prevCandleClose = curCandleClose;
          }
      }

      // Add the current candle
      minsFilledArr.push(currentCandle);
      prevMinCandle = currentCandle;
  }

  //===============================================================================================================================================
  //Finally, simulate seconds. Does a linear interpolation of prices from OPEN -> HIGH -> LOW -> CLOSE. Eveything changes except 'open' price point.
  //===============================================================================================================================================
  const SECS_MIN = 60;
  let secsFilledArr = [];
  for (let i = 0; i < minsFilledArr.length; i++) {
    let curMinsCandle = minsFilledArr[i];
    //Total price diff to simulate sec-by-sec = open(0th sec) -> high -> low -> close(59th sec)
    let totSecLen = (curMinsCandle.high-curMinsCandle.open) + (curMinsCandle.high-curMinsCandle.low) + (curMinsCandle.close-curMinsCandle.low);
    let perSecChange = totSecLen/(SECS_MIN-1);
    let curClose = curMinsCandle.open;
    let curHigh = curClose;
    let curLow = curClose;
    let isPriceDec=false; //help in simulating prices going up to high -> down to low -> back up to close

    if(i==0){
      secsFilledArr.push(curMinsCandle);
      continue;
    }
    for(let sec=0;sec<SECS_MIN;sec++){
      if(sec == SECS_MIN-1){
        secsFilledArr.push(curMinsCandle);
      } else{
        secsFilledArr.push({
          ...curMinsCandle,
          open: curMinsCandle.open,
          close: curClose,
          high: curHigh,
          low: curLow,
        });

        curClose = isPriceDec ? curClose-perSecChange : curClose+perSecChange;
        //if simulated prices matches/overshoots high, bring it down to opp direction
        if(curClose >= curMinsCandle.high){
          isPriceDec = true;
          curClose = curMinsCandle.high-(curClose-curMinsCandle.high);
          curHigh = curMinsCandle.high;
        } else if(curClose <= curMinsCandle.low){
          //else if price drops below low, flip it upwards
          isPriceDec = false;
          curClose = curMinsCandle.low + (curMinsCandle.low-curClose);
          curLow = curMinsCandle.low;
        }
        
        curHigh = Math.max(curHigh, curClose);
        curLow = Math.min(curLow, curClose);
        curClose = curClose;
        if(i==1){
          // console.log('curClose', curClose, 'isPriceDec', isPriceDec,secsFilledArr[secsFilledArr.length-1])
        }
      }
    }
  }
  // console.log(secsFilledArr.slice(10))
  return secsFilledArr;
}

// Helper function for linear interpolation
function interpolate(start, end, fraction) {
  return start + (end - start) * fraction;
}