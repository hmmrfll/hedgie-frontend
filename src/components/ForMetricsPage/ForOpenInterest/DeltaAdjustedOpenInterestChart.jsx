import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as echarts from 'echarts';
import './DeltaAdjustedOpenInterestChart.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { ShieldAlert, Camera } from 'lucide-react';
import { CACHE_TTL, optionsCache, expirationCache, useCachedApiCall } from "../../../utils/cacheService";


const DeltaAdjustedOpenInterestChart = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [expiration, setExpiration] = useState('All Expirations');
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Кешированный запрос expirations
    const {
        data: expirationsData,
        loading: expirationsLoading,
        error: expirationsError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/expirations/${asset.toLowerCase()}`,
        null,
        expirationCache,
        CACHE_TTL.LONG
    );

    const expirations = ['All Expirations', ...(Array.isArray(expirationsData) ? expirationsData : [])];

    // Кешированный запрос delta-adjusted данных
    const {
        data: chartData,
        loading: dataLoading,
        error: dataError
    } = useCachedApiCall(
        `${import.meta.env.VITE_API_URL}/api/delta-adjusted-open-interest-by-strike/${asset.toLowerCase()}/${expiration === 'All Expirations' ? 'all' : expiration}`,
        { exchange },
        optionsCache,
        CACHE_TTL.SHORT
    );

    const data = Array.isArray(chartData) ? chartData : [];
    const loading = expirationsLoading || dataLoading;
    const error = expirationsError || dataError;

    // Генерация графика
    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            const chartInstance = echarts.init(chartRef.current);
            chartInstanceRef.current = chartInstance;

            const strikePrices = data.map(d => d.strike);
            const deltaAdjustedPuts = data.map(d => -Math.abs(parseFloat(d.puts_delta_adjusted).toFixed(2)));
            const deltaAdjustedCalls = data.map(d => Math.abs(parseFloat(d.calls_delta_adjusted).toFixed(2)));

            const option = {
                backgroundColor: '#151518',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                    formatter: function (params) {
                        const tooltipDate = params[0].axisValue;
                        let result = `<b>${tooltipDate}</b><br/>`;
                        params.forEach((item) => {
                            result += `<span style="color:${item.color};">●</span> ${item.seriesName}: ${parseFloat(item.value).toFixed(2)}<br/>`;
                        });
                        return result;
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textStyle: {
                        color: '#000',
                        fontFamily: 'JetBrains Mono',
                    },
                },
                legend: {
                    data: ['Puts', 'Calls'],
                    textStyle: {
                        color: '#FFFFFF',
                        fontFamily: 'JetBrains Mono',
                    },
                    top: 10,
                },
                xAxis: {
                    type: 'category',
                    data: strikePrices,
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        rotate: 45,
                        fontFamily: 'JetBrains Mono',
                    },
                },
                yAxis: {
                    type: 'value',
                    name: 'Delta Adjusted Open Interest',
                    axisLine: { lineStyle: { color: '#A9A9A9' } },
                    axisLabel: {
                        color: '#7E838D',
                        fontFamily: 'JetBrains Mono',
                    },
                    splitLine: { lineStyle: { color: '#393E47' } },
                },
                series: [
                    {
                        name: 'Puts',
                        type: 'bar',
                        data: deltaAdjustedPuts,
                        itemStyle: { color: '#ff3e3e' },
                        barWidth: '30%',
                    },
                    {
                        name: 'Calls',
                        type: 'bar',
                        data: deltaAdjustedCalls,
                        itemStyle: { color: '#00cc96' },
                        barWidth: '30%',
                    },
                ],
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    top: '15%',
                    containLabel: true,
                },
            };

            chartInstance.setOption(option);

            const handleResize = () => {
                chartInstance.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstance.dispose();
            };
        }
    }, [data]);

    const handleDownload = () => {
        if (chartInstanceRef.current) {
            // Создаем временный div для нового графика
            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.style.width = chartInstanceRef.current.getWidth() + 'px';
            tempDiv.style.height = chartInstanceRef.current.getHeight() + 'px';
            document.body.appendChild(tempDiv);

            // Создаем временный экземпляр графика
            const tempChart = echarts.init(tempDiv);

            // Получаем текущие опции и добавляем водяной знак
            const currentOption = chartInstanceRef.current.getOption();
            const optionWithWatermark = {
                ...currentOption,
                graphic: [{
                    type: 'text',
                    left: '50%',
                    top: '50%',
                    z: -1,
                    style: {
                        text: 'hedgie.org',
                        fontSize: 80,
                        fontFamily: 'JetBrains Mono',
                        fontWeight: 'bold',
                        fill: 'rgba(255, 255, 255, 0.06)',
                        align: 'center',
                        verticalAlign: 'middle',
                        transform: 'translate(-50%, -50%)'
                    }
                }]
            };

            // Применяем опции к временному графику
            tempChart.setOption(optionWithWatermark);

            // Ждем отрисовки данных
            setTimeout(() => {
                // Создаем URL и скачиваем
                const url = tempChart.getDataURL({
                    type: 'png',
                    pixelRatio: 2,
                    backgroundColor: '#151518',
                });

                // Очищаем временные элементы
                tempChart.dispose();
                document.body.removeChild(tempDiv);

                // Скачиваем изображение
                const a = document.createElement('a');
                a.href = url;
                a.download = `open_interest_by_strike_${asset}.png`;
                a.click();
            }, 1000); // Задержка в 1000мс для полной отрисовки
        }
    };

    return (
        <div className="flow-option-container">
            <div className="flow-option-header-menu">
                <div className="flow-option-header-container">
                    <h2>👻 Delta Adjusted Open Interest By Strike</h2>
                    <Camera className="icon" id="deltaCamera"
                            onClick={handleDownload}
                            data-tooltip-html="Export image"/>
                    <Tooltip anchorId="deltaCamera" html={true}/>
                    <ShieldAlert
                        className="icon"
                        id="deltaInfo"
                        data-tooltip-html={`
       <div style="font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; padding: 10px;">
           <div style="margin-bottom: 10px;">
               <b>Delta-Adjusted Open Interest</b> shows the potential</br> market impact of options positions when dealers need</br> to maintain delta neutrality.
           </div>
           
           <div style="margin-left: 10px; margin-bottom: 10px;">
               How to read:
               <div style="margin-top: 5px;">• Green bars - Call options (positive delta exposure)</div>
               <div>• Red bars - Put options (negative delta exposure)</div>
               <div>• Bar height - Number of contracts × Delta value</div>
               <div style="margin-bottom: 5px;">• X-axis shows strike prices in ascending order</div>
           </div>

           <div style="margin-left: 10px; margin-bottom: 10px;">
               Key concepts:
               <div style="margin-top: 5px;">• Delta measures option's sensitivity to price changes</div>
               <div>• Positive values indicate potential buying pressure</div>
               <div style="margin-bottom: 5px;">• Negative values indicate potential selling pressure</div>
           </div>

           <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
               <b>Trading Applications:</b>
               <div style="margin-top: 5px;">• Reveals potential dealer hedging flows</div>
               <div>• Shows market maker positioning pressure</div>
               <div style="margin-bottom: 5px;">• Helps predict price movement catalysts</div>
           </div>
       </div>
   `}
                    />
                    <Tooltip anchorId="deltaInfo" html={true}/>
                    <div className="asset-option-buttons">
                        <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                            <option value="BTC">Bitcoin</option>
                            <option value="ETH">Ethereum</option>
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div className="asset-option-buttons">
                        <select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
                            {expirations.map((exp) => (
                                <option key={exp} value={exp}>
                                    {exp}
                                </option>
                            ))}
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div className="asset-option-buttons">
                        <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
                            <option value="DER">Deribit</option>
                            <option value="OKX">OKX</option>
                        </select>
                        <span className="custom-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667"
                                      stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                </div>
                <div className="flow-option-dedicated"></div>
            </div>
            <div className="graph">
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                )}
                {!loading && error && (
                    <div className="error-container">
                        <p>Error: {error}</p>
                    </div>
                )}
                {!loading && !error && data.length === 0 && (
                    <div className="no-data-container">
                        <p>No data available</p>
                    </div>
                )}
                {!loading && !error && data.length > 0 && (
                    <div ref={chartRef} style={{ width: '100%', height: '490px' }}></div>
                )}
            </div>
        </div>
    );
};

export default DeltaAdjustedOpenInterestChart;
