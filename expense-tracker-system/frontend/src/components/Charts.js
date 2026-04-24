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
import { EmptyState } from "./Cards";
import "./Charts.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Charts({
  isLoading,
  categorySummary,
  dailySpending,
  formatCurrency,
  categoryColors,
}) {
  const pieData = {
    labels: categorySummary.map((entry) => entry.category),
    datasets: [
      {
        data: categorySummary.map((entry) => entry.total),
        backgroundColor: categorySummary.map(
          (_, index) => categoryColors[index % categoryColors.length]
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

  const barData = {
    labels: dailySpending.map((entry) => entry.label),
    datasets: [
      {
        label: "Daily spending",
        data: dailySpending.map((entry) => entry.total),
        backgroundColor: "#52c9c2",
        borderRadius: 14,
        maxBarThickness: 56,
      },
    ],
  };

  const barOptions = {
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

  return (
    <section className="chart-grid">
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Analytics</p>
            <h2>Spending by Category</h2>
          </div>
          <span className="panel-meta">{categorySummary.length} categories</span>
        </div>

        <div className="category-layout">
          <div className="chart-area chart-area--pie">
            {isLoading ? (
              <div className="loading-state">Loading chart...</div>
            ) : categorySummary.length ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <EmptyState
                title="No category data"
                text="Add expenses in the backend database to populate this chart."
              />
            )}
          </div>

          <div className="category-legend">
            {categorySummary.map((entry, index) => (
              <div className="legend-row" key={entry.category}>
                <span
                  className="legend-dot"
                  style={{
                    backgroundColor:
                      categoryColors[index % categoryColors.length],
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
            <h2>Daily Spending</h2>
          </div>
          <span className="panel-meta">Last 7 spending days</span>
        </div>

        <div className="chart-area">
          {isLoading ? (
            <div className="loading-state">Loading chart...</div>
          ) : dailySpending.length ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <EmptyState
              title="No spending activity"
              text="The daily chart will appear as soon as the expenses endpoint returns dated records."
            />
          )}
        </div>
      </article>
    </section>
  );
}

export default Charts;
