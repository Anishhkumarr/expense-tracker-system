import "./Cards.css";

function SummaryCards({
  dashboard,
  averagePerDay,
  topCategory,
  formatCurrency,
}) {
  return (
    <section className="summary-grid">
      <article className="summary-card summary-card--primary">
        <p className="summary-card__label">Total Spent</p>
        <h2>{formatCurrency(dashboard.totalAmount)}</h2>
        <p className="summary-card__meta">
          {dashboard.totalCount || 0} transactions
        </p>
      </article>

      <article className="summary-card summary-card--success">
        <p className="summary-card__label">Average Spend</p>
        <h2>{formatCurrency(averagePerDay)}</h2>
        <p className="summary-card__meta">per active day</p>
      </article>

      <article className="summary-card summary-card--accent">
        <p className="summary-card__label">Top Category</p>
        <h2>{topCategory ? topCategory.category : "No data yet"}</h2>
        <p className="summary-card__meta">
          {topCategory ? formatCurrency(topCategory.total) : "Waiting for data"}
        </p>
      </article>
    </section>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function TopExpensesSection({
  isLoading,
  visibleExpenses,
  totalExpensesCount,
  formatCurrency,
  formatShortDate,
  getBadgeLabel,
  categoryColors,
  onViewAllExpenses,
}) {
  const shouldShowToggle = totalExpensesCount > 0;

  return (
    <section className="panel panel--expenses" id="top-expenses">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Overview</p>
          <h2>Top Expenses</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state loading-state--large">Loading expenses...</div>
      ) : visibleExpenses.length ? (
        <div className="expense-list">
          {visibleExpenses.map((expense, index) => (
            <article
              className="expense-row"
              key={`${expense.id || expense.title}-${index}`}
            >
                <div className="expense-row__main">
                  <div
                    className="expense-row__icon"
                    style={{
                      backgroundColor:
                        categoryColors[index % categoryColors.length],
                    }}
                  >
                    {getBadgeLabel(expense.categoryName)}
                  </div>

                  <div>
                    <h3>{expense.title || "Untitled expense"}</h3>
                    <p>
                      {expense.categoryName} . {formatShortDate(expense.date)}
                    </p>
                  </div>
                </div>

                <strong>{formatCurrency(expense.amount)}</strong>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No expenses to show"
          text="The list section will fill automatically when your backend returns expense records."
        />
      )}

      {shouldShowToggle && !isLoading ? (
        <button className="view-all-button" type="button" onClick={onViewAllExpenses}>
          View All Expenses
        </button>
      ) : null}
    </section>
  );
}

export { SummaryCards, TopExpensesSection, EmptyState };
