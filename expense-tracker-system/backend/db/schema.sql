-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES (GLOBAL)
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- EXPENSES
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL,
    time TIME,
    description VARCHAR(255),
    title VARCHAR(255),
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- BUDGET
CREATE TABLE budget (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    month DATE NOT NULL,
    monthly_limit DOUBLE PRECISION NOT NULL,
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- INDEXES
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_budget_user ON budget(user_id);


--Insertion of sample data
INSERT INTO users (name, email, password) VALUES
('Anish Kumar', 'anish@example.com', 'password123'),
('Rahul Sharma', 'rahul@example.com', 'password123');

INSERT INTO categories (name) VALUES
('Food'),
('Transport'),
('Shopping'),
('Entertainment'),
('Bills'),
('Health'),
('Subscriptions'),
('Gym');

INSERT INTO expenses (amount, date, time, description, title, user_id, category_id) VALUES
(200, '2026-04-01', '08:30:00', 'Breakfast at hotel', 'Breakfast', 1, 1),
(500, '2026-04-02', '10:00:00', 'Uber ride', 'Travel', 1, 2),
(1500, '2026-04-03', '19:00:00', 'Clothes shopping', 'Shopping', 1, 3),
(300, '2026-04-04', '20:00:00', 'Movie night', 'Entertainment', 2, 4),
(1200, '2026-04-05', '09:00:00', 'Electricity bill', 'Bills', 2, 5);

INSERT INTO budget (category_id, month, monthly_limit, user_id) VALUES
(1, '2026-04-01', 3000, 1),
(2, '2026-04-01', 2000, 1),
(3, '2026-04-01', 5000, 1),
(4, '2026-04-01', 1500, 2),
(5, '2026-04-01', 4000, 2);

