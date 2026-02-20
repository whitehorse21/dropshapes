'use client';

import React, { useEffect, useState } from 'react';

export default function AnalyticsView() {
    const [fileCount, setFileCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('dropshapes_files');
        if (saved) {
            try {
                const files = JSON.parse(saved);
                setFileCount(files.length);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    return (
        <section id="view-analytics" className="view-section active-view" aria-label="Analytics">
            <div className="header-minimal">
                <h1>Insights</h1>
                <p>Your productivity and activity overview</p>
            </div>
            <div className="analytics-grid">
                <div className="card stat-card">
                    <div className="stat-label">Focus Score</div>
                    <div className="stat-value">84%</div>
                    <div className="stat-trend positive">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                        ↑ 12% from last week
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Saved Files</div>
                    <div className="stat-value">{fileCount}</div>
                    <div className="stat-trend positive">Live updates</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Deep Work</div>
                    <div className="stat-value">14h</div>
                    <div className="stat-trend positive">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                        ↑ 2h
                    </div>
                </div>
            </div>
            <div className="card chart-container">
                <div className="chart-header">Weekly Activity</div>
                <div className="chart-subtitle">Hours of focused work per day</div>
                <div className="bar-chart">
                    {/* Using inline styles for CSS variable --h is valid */}
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '40%' } as React.CSSProperties}></div><span className="bar-label">Mon</span><span className="bar-value">3.2h</span></div>
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '65%' } as React.CSSProperties}></div><span className="bar-label">Tue</span><span className="bar-value">5.2h</span></div>
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '85%' } as React.CSSProperties}></div><span className="bar-label">Wed</span><span className="bar-value">6.8h</span></div>
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '50%' } as React.CSSProperties}></div><span className="bar-label">Thu</span><span className="bar-value">4.0h</span></div>
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '90%' } as React.CSSProperties}></div><span className="bar-label">Fri</span><span className="bar-value">7.2h</span></div>
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '30%' } as React.CSSProperties}></div><span className="bar-label">Sat</span><span className="bar-value">2.4h</span></div>
                    <div className="bar-col"><div className="bar-visual" style={{ '--h': '20%' } as React.CSSProperties}></div><span className="bar-label">Sun</span><span className="bar-value">1.6h</span></div>
                </div>
            </div>
        </section>
    );
}
