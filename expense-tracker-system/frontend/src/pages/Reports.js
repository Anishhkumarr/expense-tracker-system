import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import "../components/Cards.css";
import "../components/Charts.css";
import "./Reports.css";
import Navbar from "../components/Navbar";
import { fetchReportsData, getApiErrorMessage } from "../services/api";
import { formatCurrency } from "../utils/expenseUtils";
import { getCurrentUserId } from "../utils/auth";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const PIE_COLORS = ["#1ec7c3", "#ff6670", "#ffe169", "#4f7cff", "#73d783"];

function getDefaultMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthOptions() {
  const today = new Date();

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);

    return { value, label };
  });
}

function Reports({ currentPath, onNavigate, authSession, onLogout }) {
  const userId = getCurrentUserId();
  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());
  const [summary, setSummary] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const monthOptions = useMemo(() => getMonthOptions(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        setIsLoading(true);
        const data = await fetchReportsData(userId, selectedMonth);

        if (!isMounted) {
          return;
        }

        setSummary(data.summary || {});
        setCategoryData(data.categoryData || []);
        setTrendData(data.trendData || []);
        setError("");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          getApiErrorMessage(requestError, "Could not load reports.")
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth, userId]);

  const pieData = {
    labels: categoryData.map((entry) => entry.category),
    datasets: [
      {
        data: categoryData.map((entry) => entry.total),
        backgroundColor: categoryData.map(
          (_, index) => PIE_COLORS[index % PIE_COLORS.length]
        ),
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => context.label,
        },
      },
    },
  };

  const trendChartData = {
    labels: trendData.map((entry) => entry.month),
    datasets: [
      {
        label: "Monthly trend",
        data: trendData.map((entry) => entry.total),
        backgroundColor: "#ff6670",
        borderRadius: 14,
        maxBarThickness: 70,
      },
    ],
  };

  const trendOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Amount: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  const strongestCategory = categoryData.length
    ? [...categoryData].sort(
        (leftCategory, rightCategory) =>
          rightCategory.percentage - leftCategory.percentage
      )[0].category
    : "";

  return (
    <div className="app-shell">
      <Navbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        authSession={authSession}
        onLogout={onLogout}
      />

      <main className="dashboard reports-page">
        {error ? <div className="status-banner">{error}</div> : null}

        <section className="reports-header">
          <div>
            <h2 className="reports-title">Reports &amp; Analytics</h2>
          </div>

          <label className="reports-month-picker">
            <span>Select Month:</span>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="reports-summary-grid">
          <article className="summary-card summary-card--primary">
            <p className="summary-card__label">Total Spending</p>
            <h2>{formatCurrency(summary.totalSpending)}</h2>
            <p className="summary-card__meta">
              {summary.transactionCount || 0} transactions
            </p>
          </article>

          <article className="summary-card summary-card--success">
            <p className="summary-card__label">Average Transaction</p>
            <h2>{formatCurrency(summary.average)}</h2>
            <p className="summary-card__meta">per expense</p>
          </article>

          <article className="summary-card summary-card--success">
            <p className="summary-card__label">Highest Expense</p>
            <h2>{formatCurrency(summary.highest)}</h2>
            <p className="summary-card__meta">single transaction</p>
          </article>

          <article className="summary-card">
            <p className="summary-card__label">Categories Used</p>
            <h2>{summary.categoryCount || 0}</h2>
            <p className="summary-card__meta">active categories</p>
          </article>
        </section>

        <section className="chart-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Analytics</p>
                <h2>Spending by Category</h2>
              </div>
              <span className="panel-meta">{categoryData.length} categories</span>
            </div>

            <div className="category-layout">
              <div className="chart-area chart-area--pie">
                {isLoading ? (
                  <div className="loading-state">Loading chart...</div>
                ) : categoryData.length ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <div className="empty-state">
                    <h3>No category data</h3>
                    <p>Choose another month or add expenses for this month.</p>
                  </div>
                )}
              </div>

              <div className="category-legend">
                {categoryData.map((entry, index) => (
                  <div className="legend-row" key={entry.category}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <div>
                      <p>{entry.category}</p>
                      <span>{formatCurrency(entry.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Trend</p>
                <h2>Last 6 Months Trend</h2>
              </div>
              <span className="panel-meta">Last 6 months</span>
            </div>

            <div className="chart-area reports-chart-area">
              {isLoading ? (
                <div className="loading-state">Loading trend...</div>
              ) : trendData.length ? (
                <Bar data={trendChartData} options={trendOptions} />
              ) : (
                <div className="empty-state">
                  <h3>No trend data</h3>
                  <p>The trend chart will appear once monthly records exist.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Category Details</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state loading-state--large">
              Loading category details...
            </div>
          ) : categoryData.length ? (
            <div className="report-table">
              <div className="report-table__head">
                <span>Category</span>
                <span>Amount</span>
                <span>Percentage</span>
                <span>Visual</span>
              </div>

              {categoryData.map((entry, index) => {
                const isTopRow = entry.category === strongestCategory;

                return (
                  <div
                    className={`report-table__row ${
                      isTopRow ? "report-table__row--active" : ""
                    }`}
                    key={entry.category}
                  >
                    <span className="report-table__cell report-table__cell--category">
                      {entry.category}
                      {isTopRow ? (
                        <small className="report-table__badge">Top category</small>
                      ) : null}
                    </span>
                    <span className="report-table__cell report-table__cell--amount">
                      {formatCurrency(entry.total)}
                    </span>
                    <span className="report-table__cell report-table__cell--percentage">
                      {entry.percentage.toFixed(1)}%
                    </span>
                    <span className="report-progress">
                      <span
                        className="report-progress__bar"
                        style={{
                          width: `${Math.min(entry.percentage, 100)}%`,
                          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No category details</h3>
              <p>Pick a month with activity to view the breakdown table.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Reports;
