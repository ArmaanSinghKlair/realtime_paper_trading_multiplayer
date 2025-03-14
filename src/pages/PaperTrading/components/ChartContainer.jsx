import React, { useEffect, useRef, useState } from 'react';
import { Container, Stack } from 'react-bootstrap';
import SecurityIcon from '../../../assets/ethereum-logo.svg?react';
import { ICON_SMALL_SIZE } from '../../../styles/constants';
import { CandlestickChart, UserSecurityPriceData } from '../../../utils/candlestickChart';
import { getCurrentTheme, THEME_SLICE_VALUES } from '../../../features/theme/themeSlice';
import { useSelector } from 'react-redux';
import { fillMissingCandles, parseCsv } from '../../../utils/genericUtils';
import ohlcDataArrCsv from '../../../assets/security_prices/eth_cad_1/2021-05-01.csv?raw';
const ChartContainer = () => {
  const [loading, setLoading] = useState(true);
  const currentTheme = useSelector(getCurrentTheme);
  const chartContainerRef = useRef(null);
  const chartObjectRef = useRef(null);
  const chartContainerId = "candlestickChartContainer";

  //Initialize candlestick chart
  useEffect(()=>{
    const chartRect = chartContainerRef.current.getBoundingClientRect();
    const chart = new CandlestickChart({chartContainerId: chartContainerId, chartContainerWidth: chartRect.width, chartContainerHeight: chartRect.height});
    chartObjectRef.current = chart;

    //Callback loads data into the chart
    const successCallback = (ohlcDataArr) =>{
      // console.log('data is', ohlcDataArr)
      chart.reloadCandlestickChart(fillMissingCandles(ohlcDataArr));
      setLoading(false);

      // // TODO: Remove later. Random data
      // var securityPriceObj = new UserSecurityPriceData({symbol: 'ETHUSD', symbolFullName: 'Ethereum / U.S. Dollar', candlestickChart: chart});
    }
    parseCsv(ohlcDataArrCsv, successCallback);

    return ()=>{
      //safely remove chart an any event listeners on unmount
      chart.removeChart();
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
      userSecPopoverBgColor: bodyComputedStyled.getPropertyValue('--bs-popover-bg'),
      userSecPopoverBorderColor: 'rgba(0, 0, 0, 0.176)',
      userSecPopoverBorderRadius: bodyComputedStyled.getPropertyValue('--bs-border-radius-xl'),
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
        userSecPopoverBgColor: '#ff',
      };
    }
    // console.log('setting theme in ',themeObj);
    chartObjectRef.current?.setCandlestickTheme(themeObj);
  },[currentTheme]);

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