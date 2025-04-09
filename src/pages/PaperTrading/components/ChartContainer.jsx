import React, { useEffect, useRef } from 'react';
import { Container, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import SecurityIcon from '../../../assets/ethereum-logo.svg?react';
import ohlcDataArrCsv from '../../../assets/security_prices/eth_cad_1/2021-05-01.csv?raw';
import { getCurrentTheme, THEME_SLICE_VALUES } from '../../../features/theme/themeSlice';
import { getTradingRoomUtcStartTime, getUserSecurityPositions } from '../../../features/tradingRoomInfo/tradingRoomInfoSlice';
import { updateChartLatestCandleAsync } from '../../../features/tradingSecurityInfo/tradingSecurityInfoSlice';
import { ICON_SMALL_SIZE } from '../../../styles/constants';
import { CandlestickChart } from '../../../utils/candlestickChart';
import { fillMissingCandles, parseCsv } from '../../../utils/genericUtils';

const PAPER_TRADING_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  FINISHED: 'FINISHED'
}

/**
 * Main chart container component.
 * This component is responsible for rendering the candlestick chart and handling user interactions.
 * It also manages the chart theme and user security positions.
 * @param {*} param0 
 * @returns 
 */
const ChartContainer = ({}) => {
  const curOhlcTradingDataRef = useRef(null);

  const currentTheme = useSelector(getCurrentTheme);
  const userSecPosObj = useSelector(getUserSecurityPositions);
  const tradingRoomUtcStartTime = useSelector(getTradingRoomUtcStartTime);
  const storeDispatch = useDispatch();
  const chartContainerRef = useRef(null);

  const chartContainerId = "candlestickChartContainer";

  let paperTradingState;
  //Trading ONLY starts when we know when trading room was created
  if(tradingRoomUtcStartTime){
    paperTradingState = PAPER_TRADING_STATES.STARTED;
  } else{
    paperTradingState = PAPER_TRADING_STATES.NOT_STARTED;
  }

  //Initialize candlestick chart
  useEffect(()=>{
    const chartRect = chartContainerRef.current.getBoundingClientRect();
    const chart = new CandlestickChart({chartContainerId: chartContainerId, chartContainerWidth: chartRect.width, chartContainerHeight: chartRect.height});
    window.candlestickChart = chart;
    return ()=>{
      //safely remove chart an any event listeners on unmount
      chart.removeChart();
      window.candlestickChart = null;
    }
  },[]);

  /**
   * Set color of the chart
   */
  useEffect(()=>{
    let bodyComputedStyled = window.getComputedStyle(document.body);
    let themeObj = {
      textColor: bodyComputedStyled.getPropertyValue('--bs-body-color'),
      mouseHoverLinesColor: '#9C9C9C',
      chartFontFamily: "Atkinson Hyperlegible Next, sans-serif",
      smTextFontSize: 12,
      defaultTextFontSize: 14,
      greenColor: `rgb(${bodyComputedStyled.getPropertyValue('--bs-success-rgb')})`,
      redColor: `rgb(${bodyComputedStyled.getPropertyValue('--bs-danger-rgb')})`,
      blueColor: `rgb(${bodyComputedStyled.getPropertyValue('--bs-primary-rgb')})`,
      userSecPopoverBorderColor: 'rgba(0, 0, 0, 0.176)',
      userSecPopoverBorderRadius: bodyComputedStyled.getPropertyValue('--bs-border-radius-lg'),
    }

    if(currentTheme == THEME_SLICE_VALUES.DARK){
      themeObj = {
        ...themeObj,  
        gridLinesColor: '#1C1C1C',
        userSecPopoverBgColor: '#212529',
      };
    } else{
      themeObj = {
        ...themeObj,  
        gridLinesColor: '#F3F3F3',
        userSecPopoverBgColor: '#fff',
      };
    }
    window.candlestickChart?.setCandlestickTheme(themeObj);
  },[currentTheme]);

  //Initialize already stored users
  useEffect(()=>{
    // console.log(userSecPosMap);
    if(userSecPosObj){
      window.candlestickChart.updateUserSecPos(userSecPosObj);
    }
  }, [userSecPosObj]);

  //Check and start trading simulation
  useEffect(()=>{
    let simulateFuncInterval = null;

    if(paperTradingState == PAPER_TRADING_STATES.STARTED){
        //Move forward in future by amount of seconds since trading room started
        let secsElapsedSinceTradingStart = Math.floor((Date.now().valueOf()-tradingRoomUtcStartTime)/1000);
        console.log('secsElapsedSinceTradingStart', secsElapsedSinceTradingStart, tradingRoomUtcStartTime, Date.now().valueOf());
        //Callback loads data into the chart
        const successCallback = (ohlcDataArr) =>{
          curOhlcTradingDataRef.current = fillMissingCandles(ohlcDataArr);

          //prefill elapsed time
          let curCandleIndex=secsElapsedSinceTradingStart;
          for(let i=0;i<curCandleIndex;i++){
            window.candlestickChart.updateLatestCandle(curOhlcTradingDataRef.current[i]);
          }
           
          simulateFuncInterval = setInterval(()=>{
            storeDispatch(updateChartLatestCandleAsync(window.candlestickChart, curOhlcTradingDataRef.current[curCandleIndex]))
            curCandleIndex++;
          }, 1000); 
        }
        parseCsv(ohlcDataArrCsv, successCallback);
    } else{
      //clear data
      curOhlcTradingDataRef.current = null;
    }

    return ()=>{
      //clear internval on rerun
      if(simulateFuncInterval){
        clearInterval(simulateFuncInterval);
      }
    }
  }, [paperTradingState]);

  return (
    <Stack className="h-100">
      <Container fluid style={{height: '10%'}} className='px-0'>
          <Stack direction='horizontal' gap={3}>
            <SecurityIcon style={{width: ICON_SMALL_SIZE, height: ICON_SMALL_SIZE}} />
            <span className='app-card-title'>Ethereum / U.S. Dollar</span>
          </Stack>
      </Container>
      <Container ref={chartContainerRef} fluid id={chartContainerId} style={{height: '90%'}}></Container>
    </Stack>
  );  
}

export default ChartContainer;