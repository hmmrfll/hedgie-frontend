import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './KeyMetricsBlockTrades.css';

const KeyMetricsBlockTrades = () => {
    const [asset, setAsset] = useState('BTC');
    const [exchange, setExchange] = useState('DER');
    const [metrics, setMetrics] = useState({
        avg_price: 0,
        total_nominal_volume: 0,
        total_premium: 0,
    });
    const [loading, setLoading] = useState(true);
    const [loadingAI, setLoadingAI] = useState(true);
    const [error, setError] = useState(null);
    const [errorAI, setErrorAI] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysis, setAnalysis] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/block-trades/key-metrics/${asset.toLowerCase()}`, {
                    params: { timeRange }
                });
                const data = response.data;

                setMetrics({
                    avg_price: Number(data.avg_price) || 0,
                    total_nominal_volume: Number(data.total_nominal_volume) || 0,
                    total_premium: Number(data.total_premium) || 0,
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchMetrics();
    }, [asset, timeRange]);

    const getAIAnalysis = async () => {
        setLoadingAI(true);
        setErrorAI(null);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/analyze-metrics`, {
                metrics: {
                    avgPrice: metrics.avg_price,
                    totalVolume: metrics.total_nominal_volume,
                    totalPremium: metrics.total_premium,
                    timeRange,
                    asset,
                    exchange
                }
            });
            setAnalysis(response.data.analysis);
        } catch (errorAI) {
            setErrorAI('Failed to load analysis');
        }
        setLoadingAI(false);
    };

    return (
        <div className="metrics-key-container">
            <div className="asset-key-buttons-block">
                <div className="asset-option-buttons">
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option value="24h">Past 24 Hours</option>
                        <option value="7d">Last Week</option>
                        <option value="30d">Last Month</option>
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
                    <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                        <option value="BTC">Bitcoin</option>
                        <option value="ETH">Ethereum</option>
                    </select>
                    <span className="custom-arrow">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" stroke-width="1.66667" stroke-linecap="round"
                                  stroke-linejoin="round"/>
                        </svg>
                    </span>
                </div>
                <button
                    className="analyze-button"
                    onClick={() => {
                        setShowAnalysis(true);
                        getAIAnalysis();
                    }}
                >
                    AI Analysis
                </button>
                {/*<div className="asset-option-buttons">*/}
                {/*    <select value={exchange} onChange={(e) => setExchange(e.target.value)}>*/}
                {/*        <option value="DER">Deribit</option>*/}
                {/*        /!*<option value="OKX">OKX</option>*!/*/}
                {/*    </select>*/}
                {/*    <span className="custom-arrow">*/}
                {/*        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                {/*            <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round"*/}
                {/*                  strokeLinejoin="round"/>*/}
                {/*        </svg>*/}
                {/*    </span>*/}
                {/*</div>*/}
            </div>
            <div className="metrics-key-grid">
                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="metric-key-content">
                        {loading && <div className="loading-container">
                            <div className="spinner-small"></div>
                        </div>}
                        {error && <div className="error-container"><p>Error: {error}</p></div>}
                        {!loading && !error && (
                            <div className="metric-key-content">
                                <p className="metric-label" id="avgPrice"
                                   data-tooltip-content="Average price of transactions">
                                    <div className="metric-label-image">🤑</div>
                                    Average Price
                                </p>
                                <Tooltip anchorId="avgPrice" />
                                <p className="metric-value">
                                    {Number(metrics.avg_price).toLocaleString(undefined, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    })} $
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="metric-key-content">
                        {loading && <div className="loading-container">
                            <div className="spinner-small"></div>
                        </div>}
                        {error && <div className="error-container"><p>Error: {error}</p></div>}
                        {!loading && !error && (
                            <div className="metric-key-content">
                                <p className="metric-label" id="totalVolume"
                                   data-tooltip-content="Nominal volume">
                                    <div className="metric-label-image">📊</div>
                                    Total Volume
                                </p>
                                <Tooltip anchorId="totalVolume" />
                                <p className="metric-value">
                                    {Number(metrics.total_nominal_volume).toLocaleString(undefined, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    })} $
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="metric-key-block">
                    <div className="icon-container">
                        <i className="fas fa-coins"></i>
                    </div>
                    <div className="metric-key-content">
                        {loading && <div className="loading-container">
                            <div className="spinner-small"></div>
                        </div>}
                        {error && <div className="error-container"><p>Error: {error}</p></div>}
                        {!loading && !error && (
                            <div className="metric-key-content">
                                <p className="metric-label" id="totalPremium"
                                   data-tooltip-content="Premium paid">
                                    <div className="metric-label-image">📈</div>
                                    Total Premium
                                </p>
                                <Tooltip anchorId="totalPremium" />
                                <p className="metric-value">
                                    {Number(metrics.total_premium).toLocaleString(undefined, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    })} $
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {showAnalysis && (
                    <div className="analysis-modal" onClick={() => setShowAnalysis(false)}>
                        <div className="analysis-container" onClick={e => e.stopPropagation()}>
                            <h3 className="analysis-title">AI Analysis</h3>
                            <button className="close-button" onClick={() => setShowAnalysis(false)}>×</button>
                            {loadingAI ? (
                                <div className="analysis-loading">Loading...</div>
                            ) : errorAI ? (
                                <div className="analysis-error">{errorAI}</div>
                            ) : (
                                <div className="analysis-content">{analysis}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeyMetricsBlockTrades;


