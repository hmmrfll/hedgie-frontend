// src/components/ForMetricsPage/Overview.jsx
import React from 'react';
import BTCETHOptionFlow from '../components/ForMetricsPage/ForOverview/BTCETHOptionFlow.jsx';
import BTCETHBlockTrades from '../components/ForMetricsPage/ForForBlockTrades/BTCETHBlockTrades.jsx';
import MaxPainByExpiration from '../components/ForMetricsPage/ForOverview/MaxPainByExpiration.jsx';
import OptionVolumeChart from '../components/ForMetricsPage/ForOverview/OptionVolumeChart.jsx';
import StrikeActivityChart from "../components/ForMetricsPage/ForOverview/StrikeActivityChart.jsx";
import ExpirationActivityChart from "../components/ForMetricsPage/ForOverview/ExpirationActivityChart.jsx";
import TimeDistributionChart from "../components/ForMetricsPage/ForOverview/TimeDistributionChart.jsx";
import KeyMetrics from "../components/ForMetricsPage/ForOverview/KeyMetrics.jsx";
import './Overview.css';

const Overview = () => {
    return (
        <div>
            <h1 className="page-title">Overview Metrics Dashboard</h1>
            <div className="flow-row">
                <div className="rounded-container">
                    <BTCETHOptionFlow asset="BTC"/>
                </div>
            </div>
            <div className="flow-row">
                <div className="rounded-container">
                    <MaxPainByExpiration/>
                </div>
                <div className="rounded-container">
                    <OptionVolumeChart/>
                </div>
            </div>
            <div className="flow-row">
                <div className="rounded-container">
                    <StrikeActivityChart/>
                </div>
                <div className="rounded-container">
                    <ExpirationActivityChart/>
                </div>
            </div>
            <div className="flow-row">
                <div className="full-width-container">
                    <TimeDistributionChart/>
                </div>
            </div>
            <div className="flow-row">
                <div className="full-width-container">
                    <KeyMetrics/>
                </div>
            </div>
        </div>
    );
};

export default Overview;