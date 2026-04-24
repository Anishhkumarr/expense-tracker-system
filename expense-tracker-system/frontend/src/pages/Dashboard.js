import { useEffect, useState } from "react";
import "./Dashboard.css";
import Navbar from "../components/Navbar";
import { SummaryCards, TopExpensesSection } from "../components/Cards";
import Charts from "../components/Charts";
import { fetchDashboardData, getApiErrorMessage } from "../services/api";
import {
  buildCategoryMap,
  CATEGORY_COLORS,
  decorateExpenses,
  formatCurrency,
  formatShortDate,
  getAveragePerDay,
  getBadgeLabel,
} from "../utils/expenseUtils";
import { getCurrentUserId } from "../utils/auth";

function getDailySpending(expenses) {
  const totalsByDate = expenses.reduce((totals, expense) => {
    if (!expense.date) {
      return totals;
    }

    totals[expense.date] =
      (totals[expense.date] || 0) + Number(expense.amount || 0);

    return totals;
  }, {});

  return Object.entries(totalsByDate)
    .sort(([leftDate], [rightDate]) => new Date(leftDate) - new Date(rightDate))
    .slice(-7)
    .map(([date, total]) => ({
      date,
      label: formatShortDate(date),
      total,
    }));
}

function getTopCategory(categorySummary) {
  if (!categorySummary.length) {
    return null;
  }

  return [...categorySummary].sort(
    (leftCategory, rightCategory) => rightCategory.total - leftCategory.total
  )[0];
}

function Dashboard({ currentPath, onNavigate, authSession, onLogout }) {
  const userId = getCurrentUserId();
  const [dashboard, setDashboard] = useState({});
  const [categorySummary, setCategorySummary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const data = await fetchDashboardData(userId);

        if (!isMounted) {
          return;
        }

        setDashboard(data.dashboard || {});
        setCategorySummary(data.categorySummary || []);
        setExpenses(data.expenses || []);
        setCategories(data.categories || []);
        setTopExpenses(data.topExpenses || []);
        setError("");
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          getApiErrorMessage(
            requestError,
            "Could not load dashboard data."
          )
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const fallbackCategorySummary = Object.entries(
    dashboard.categoryBreakdown || {}
  ).map(([category, total]) => ({
    category,
    total,
  }));

  const resolvedCategorySummary = categorySummary.length
    ? categorySummary
    : fallbackCategorySummary;

  const categoryMap = buildCategoryMap(categories);
  const detailedExpenses = decorateExpenses(expenses, categoryMap);
  const dailySpending = getDailySpending(detailedExpenses);
  const averagePerDay = getAveragePerDay(dailySpending);
  const topCategory = getTopCategory(resolvedCategorySummary);
  const visibleExpenses = topExpenses.length
    ? topExpenses.map((expense) => ({
        ...expense,
        categoryName: expense.category,
      }))
    : [...detailedExpenses]
        .sort(
          (leftExpense, rightExpense) => rightExpense.amount - leftExpense.amount
        )
        .slice(0, 4);

  return (
    <div className="app-shell">
      <Navbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        authSession={authSession}
        onLogout={onLogout}
      />

      <main className="dashboard dashboard-page">
        {error ? <div className="status-banner">{error}</div> : null}

        <SummaryCards
          dashboard={dashboard}
          averagePerDay={averagePerDay}
          topCategory={topCategory}
          formatCurrency={formatCurrency}
        />

        <Charts
          isLoading={isLoading}
          categorySummary={resolvedCategorySummary}
          dailySpending={dailySpending}
          formatCurrency={formatCurrency}
          categoryColors={CATEGORY_COLORS}
        />

        <TopExpensesSection
          isLoading={isLoading}
          visibleExpenses={visibleExpenses}
          totalExpensesCount={detailedExpenses.length}
          formatCurrency={formatCurrency}
          formatShortDate={formatShortDate}
          getBadgeLabel={getBadgeLabel}
          categoryColors={CATEGORY_COLORS}
          onViewAllExpenses={() => onNavigate("/expenses")}
        />
      </main>
    </div>
  );
}

export default Dashboard;
