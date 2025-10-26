// components/artist/ArtistAnalytics/ArtistAnalytics.tsx
"use client";

import { useState, JSX } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import dynamic from "next/dynamic";
import Image from "next/image";

import CustomDropdown from "@/components/ui/CustomDropdown";
import "./styles/artist-analytics.css";

// Dynamic import for Chart.js to avoid SSR issues
const Chart = dynamic(() => import("react-chartjs-2").then(async (mod) => {
    // Import and register required Chart.js components
    const ChartJS = await import('chart.js');
    const { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } = ChartJS;

    ChartJS.Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler
    );

    return mod.Line;
}), {
    ssr: false,
    loading: () => <div className="chart-loading">Зареждане на графика...</div>,
});

interface AnalyticsData {
    overview: {
        totalViews: number;
        profileViews: number;
        paintingViews: number;
        totalSales: number;
        totalRevenue: number;
        totalCommission: number;
        averageSalePrice: number;
        conversionRate: number;
    };
    timeSeries: {
        date: string;
        views: number;
        sales: number;
        revenue: number;
    }[];
    topPaintings: Array<{
        id: string;
        title: string;
        views: number;
        sales: number;
        revenue: number;
        images: string[];
    }>;
    salesByMonth: Array<{
        month: string;
        sales: number;
        revenue: number;
    }>;
    viewsBySource: Array<{
        source: string;
        views: number;
        percentage: number;
    }>;
    period: string;
    startDate: string;
    endDate: string;
}

interface AnalyticsFilters {
    period: string;
    startDate: string;
    endDate: string;
    sortBy: string;
    sortOrder: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArtistAnalytics(): JSX.Element {
    const [filters, setFilters] = useState<AnalyticsFilters>({
        period: "30d",
        startDate: "",
        endDate: "",
        sortBy: "views",
        sortOrder: "desc",
    });
    const [selectedChart, setSelectedChart] = useState("overview");

    const { data, error, isLoading } = useSWR<AnalyticsData>(
        `/api/artist/analytics?${new URLSearchParams(filters as unknown as Record<string, string>)}`,
        fetcher,
        { refreshInterval: 30000 }
    );

    const periodOptions = [
        { value: "7d", label: "Последните 7 дни" },
        { value: "30d", label: "Последните 30 дни" },
        { value: "90d", label: "Последните 90 дни" },
        { value: "1y", label: "Последната година" },
        { value: "custom", label: "Персонализиран период" },
    ];

    const chartOptions = [
        { value: "overview", label: "Общ преглед" },
        { value: "sales", label: "Продажби" },
        { value: "views", label: "Прегледи" },
        { value: "revenue", label: "Приходи" },
    ];

    const sortOptions = [
        { value: "views", label: "Прегледи" },
        { value: "sales", label: "Продажби" },
        { value: "revenue", label: "Приходи" },
        { value: "title", label: "Заглавие" },
    ];

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("bg-BG", {
            style: "currency",
            currency: "BGN",
        }).format(amount);
    };

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat("bg-BG").format(num);
    };

    const formatPercentage = (num: number): string => {
        return `${num.toFixed(1)}%`;
    };

    const handleFilterChange = (key: keyof AnalyticsFilters, value: string): void => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleExportCSV = (): void => {
        if (!data || !data.overview) return;

        const csvData = [
            ["Метрика", "Стойност"],
            ["Общо прегледи", data.overview.totalViews.toString()],
            ["Прегледи на профил", data.overview.profileViews.toString()],
            ["Прегледи на картини", data.overview.paintingViews.toString()],
            ["Общо продажби", data.overview.totalSales.toString()],
            ["Общо приходи", data.overview.totalRevenue.toString()],
            ["Общо комисионна", data.overview.totalCommission.toString()],
            ["Средна цена на продажба", data.overview.averageSalePrice.toString()],
            ["Процент на конверсия", data.overview.conversionRate.toString()],
        ];

        const csvContent = csvData.map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getChartData = () => {
        if (!data || !data.timeSeries) return null;

        // Get CSS variable values
        const getCSSVariable = (variable: string): string => {
            if (typeof window !== 'undefined') {
                return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
            }
            return '';
        };

        const primaryColor = getCSSVariable('--color-primary') || '#16ffe4';
        const primaryColor20 = getCSSVariable('--color-primary-20') || 'rgba(22, 255, 228, 0.2)';
        const promotionColor = getCSSVariable('--color-promotion') || '#ff7016';
        const promotionColor20 = getCSSVariable('--color-promotion-20') || 'rgba(255, 112, 22, 0.2)';
        const accentColor = getCSSVariable('--color-accent') || '#ff16e4';
        const accentColor20 = getCSSVariable('--color-accent-20') || 'rgba(255, 22, 228, 0.2)';
        const foregroundColor = getCSSVariable('--color-foreground') || '#e5e7eb';

        const labels = data.timeSeries.map(item =>
            new Date(item.date).toLocaleDateString("bg-BG", {
                month: "short",
                day: "numeric"
            })
        );

        const datasets = [];

        if (selectedChart === "overview" || selectedChart === "views") {
            datasets.push({
                label: "Прегледи",
                data: data.timeSeries?.map(item => item.views) || [],
                borderColor: primaryColor,
                backgroundColor: primaryColor20,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: primaryColor,
                pointBorderColor: foregroundColor,
                pointBorderWidth: 2,
                pointRadius: 4,
            });
        }

        if (selectedChart === "overview" || selectedChart === "sales") {
            datasets.push({
                label: "Продажби",
                data: data.timeSeries?.map(item => item.sales) || [],
                borderColor: promotionColor,
                backgroundColor: promotionColor20,
                tension: 0.4,
                fill: false,
                pointBackgroundColor: promotionColor,
                pointBorderColor: foregroundColor,
                pointBorderWidth: 2,
                pointRadius: 4,
            });
        }

        if (selectedChart === "overview" || selectedChart === "revenue") {
            datasets.push({
                label: "Приходи (BGN)",
                data: data.timeSeries?.map(item => item.revenue) || [],
                borderColor: accentColor,
                backgroundColor: accentColor20,
                tension: 0.4,
                fill: false,
                yAxisID: "y1",
                pointBackgroundColor: accentColor,
                pointBorderColor: foregroundColor,
                pointBorderWidth: 2,
                pointRadius: 4,
            });
        }

        return {
            labels,
            datasets,
        };
    };

    const chartData = getChartData();

    // Get CSS variable values for chart options
    const getCSSVariable = (variable: string): string => {
        if (typeof window !== 'undefined') {
            return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
        }
        return '';
    };

    const foregroundColor = getCSSVariable('--color-foreground') || '#e5e7eb';
    const backgroundColor = getCSSVariable('--color-background') || '#0b0b0f';
    const primaryColor = getCSSVariable('--color-primary') || '#16ffe4';
    const primaryColor10 = getCSSVariable('--color-primary-10') || 'rgba(22, 255, 228, 0.1)';
    const primaryColor20 = getCSSVariable('--color-primary-20') || 'rgba(22, 255, 228, 0.2)';

    if (error) {
        return (
            <div className="analytics-error">
                <h2>Грешка при зареждане на аналитиката</h2>
                <p>Моля, опитайте отново по-късно.</p>
            </div>
        );
    }

    return (
        <div className="analytics">
            <div className="analytics-header">
                <h1 className="analytics-title">Аналитика</h1>
                <div className="analytics-actions">
                    <button
                        className="analytics-export-button"
                        onClick={handleExportCSV}
                        disabled={!data || !data.overview}
                    >
                        📊 Експорт CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="analytics-filters">
                <div className="analytics-filters-row">
                    <div className="analytics-filter-group">
                        <CustomDropdown
                            options={periodOptions}
                            value={filters.period}
                            onChange={(value) => handleFilterChange("period", value)}
                            aria-label="Период"
                        />
                    </div>

                    {filters.period === "custom" && (
                        <>
                            <div className="analytics-filter-group">
                                <label htmlFor="startDate">От дата</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                    className="analytics-date-input"
                                />
                            </div>
                            <div className="analytics-filter-group">
                                <label htmlFor="endDate">До дата</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                    className="analytics-date-input"
                                />
                            </div>
                        </>
                    )}

                    <div className="analytics-filter-group">
                        <CustomDropdown
                            options={chartOptions}
                            value={selectedChart}
                            onChange={(value) => setSelectedChart(value)}
                            aria-label="Тип графика"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="analytics-loading">
                    <div className="analytics-spinner"></div>
                    <p>Зареждане на аналитиката...</p>
                </div>
            ) : error ? (
                <div className="analytics-error">
                    <h2>Грешка при зареждане на аналитиката</h2>
                    <p>Моля, опитайте отново по-късно.</p>
                    <p>Детайли: {error.message}</p>
                </div>
            ) : data && data.overview ? (
                <>
                    {/* Overview Cards */}
                    <div className="analytics-overview">
                        <motion.div
                            className="analytics-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="analytics-card-icon">👁️</div>
                            <div className="analytics-card-content">
                                <h3>Общо прегледи</h3>
                                <p className="analytics-card-number">{formatNumber(data.overview.totalViews)}</p>
                                <p className="analytics-card-subtitle">
                                    {formatNumber(data.overview.profileViews)} профил
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="analytics-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="analytics-card-icon">💰</div>
                            <div className="analytics-card-content">
                                <h3>Продажби</h3>
                                <p className="analytics-card-number">{formatNumber(data.overview.totalSales)}</p>
                                <p className="analytics-card-subtitle">
                                    {formatCurrency(data.overview.averageSalePrice)} средна цена
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="analytics-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="analytics-card-icon">📈</div>
                            <div className="analytics-card-content">
                                <h3>Приходи</h3>
                                <p className="analytics-card-number">{formatCurrency(data.overview.totalRevenue)}</p>
                                <p className="analytics-card-subtitle">
                                    {formatCurrency(data.overview.totalCommission)} комисионна
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="analytics-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="analytics-card-icon">🎯</div>
                            <div className="analytics-card-content">
                                <h3>Конверсия</h3>
                                <p className="analytics-card-number">{formatPercentage(data.overview.conversionRate)}</p>
                                <p className="analytics-card-subtitle">Прегледи → Продажби</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Chart */}
                    <motion.div
                        className="analytics-chart"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3>Графика на производителността</h3>
                        {chartData && (
                            <div className="chart-container">
                                <Chart
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "top" as const,
                                                labels: {
                                                    color: foregroundColor,
                                                    font: {
                                                        size: 14,
                                                        weight: "normal" as const,
                                                    },
                                                    padding: 20,
                                                    usePointStyle: true,
                                                    pointStyle: "circle" as const,
                                                },
                                            },
                                            tooltip: {
                                                backgroundColor: backgroundColor,
                                                titleColor: foregroundColor,
                                                bodyColor: foregroundColor,
                                                borderColor: primaryColor,
                                                borderWidth: 1,
                                                cornerRadius: 8,
                                                displayColors: true,
                                            },
                                        },
                                        scales: {
                                            y: {
                                                type: "linear" as const,
                                                display: true,
                                                position: "left" as const,
                                                ticks: {
                                                    color: foregroundColor,
                                                    font: {
                                                        size: 12,
                                                    },
                                                },
                                                grid: {
                                                    color: primaryColor10,
                                                },
                                                border: {
                                                    color: primaryColor20,
                                                },
                                            },
                                            y1: {
                                                type: "linear" as const,
                                                display: true,
                                                position: "right" as const,
                                                ticks: {
                                                    color: foregroundColor,
                                                    font: {
                                                        size: 12,
                                                    },
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                                border: {
                                                    color: primaryColor20,
                                                },
                                            },
                                            x: {
                                                ticks: {
                                                    color: foregroundColor,
                                                    font: {
                                                        size: 12,
                                                    },
                                                },
                                                grid: {
                                                    color: primaryColor10,
                                                },
                                                border: {
                                                    color: primaryColor20,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Top Paintings */}
                    <motion.div
                        className="analytics-top-paintings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="analytics-section-header">
                            <h3>Най-популярни картини</h3>
                            <div className="analytics-sort">
                                <CustomDropdown
                                    options={sortOptions}
                                    value={filters.sortBy}
                                    onChange={(value) => handleFilterChange("sortBy", value)}
                                    aria-label="Сортиране"
                                />
                            </div>
                        </div>

                        <div className="analytics-table">
                            <div className="analytics-table-header">
                                <div className="analytics-table-cell">Картина</div>
                                <div className="analytics-table-cell">Прегледи</div>
                                <div className="analytics-table-cell">Продажби</div>
                                <div className="analytics-table-cell">Приходи</div>
                            </div>

                            {data.topPaintings?.map((painting) => (
                                <div key={painting.id} className="analytics-table-row">
                                    <div className="analytics-table-cell">
                                        <div className="analytics-painting-info">
                                            {painting.images[0] && (
                                                <Image
                                                    src={painting.images[0]}
                                                    alt={painting.title}
                                                    width={40}
                                                    height={40}
                                                    className="analytics-painting-thumbnail"
                                                />
                                            )}
                                            <span className="analytics-painting-title">{painting.title}</span>
                                        </div>
                                    </div>
                                    <div className="analytics-table-cell">{formatNumber(painting.views)}</div>
                                    <div className="analytics-table-cell">{formatNumber(painting.sales)}</div>
                                    <div className="analytics-table-cell">{formatCurrency(painting.revenue)}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            ) : (
                <div className="analytics-empty">
                    <h3>Няма данни за аналитика</h3>
                    <p>Данните ще се появят след като имате прегледи или продажби.</p>
                </div>
            )}
        </div>
    );
}
