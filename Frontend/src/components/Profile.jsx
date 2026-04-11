import React, { useEffect, useRef, useContext, useState } from "react";
import axios from "axios";
import {
  Chart,
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { EfficiencyContext } from "../context/EfficiencyContext";
import { useAuth } from "../context/AuthProvider.jsx";
import DashboardMetricCard from "./dashboard/DashboardMetricCard.jsx";
import DashboardSectionCard from "./dashboard/DashboardSectionCard.jsx";
import AppShell from "./layout/AppShell.jsx";
import { buildAuthConfig } from "../utils/auth.js";
import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

Chart.register(
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_FILTERS = ["Daily", "Weekly", "Monthly"];

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatLongDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getWeekStart(dateValue) {
  const date = new Date(dateValue);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function aggregateRecords(records, filter) {
  const safeRecords = Array.isArray(records) ? [...records] : [];
  safeRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (filter === "Daily") {
    return safeRecords.slice(-10).map((record) => ({
      label: formatShortDate(record.date),
      value: record.problemsSolved ?? 0,
      rawDate: record.date,
    }));
  }

  const grouped = new Map();

  for (const record of safeRecords) {
    const sourceDate = new Date(record.date);
    const keyDate =
      filter === "Weekly"
        ? getWeekStart(sourceDate)
        : new Date(sourceDate.getFullYear(), sourceDate.getMonth(), 1);

    const key = keyDate.toISOString();
    const current = grouped.get(key) || {
      label:
        filter === "Weekly"
          ? `Week of ${formatShortDate(keyDate)}`
          : keyDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      value: 0,
      rawDate: keyDate,
    };

    current.value += record.problemsSolved ?? 0;
    grouped.set(key, current);
  }

  return [...grouped.values()].slice(-8);
}

function calculateCurrentStreak(records) {
  const solvedDays = (records || [])
    .filter((record) => (record.problemsSolved ?? 0) > 0)
    .map((record) => {
      const date = new Date(record.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a);

  if (!solvedDays.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latestGap = (today.getTime() - solvedDays[0]) / (1000 * 60 * 60 * 24);
  if (latestGap > 1) return 0;

  let streak = 1;
  for (let index = 1; index < solvedDays.length; index += 1) {
    const previous = solvedDays[index - 1];
    const current = solvedDays[index];
    const dayGap = (previous - current) / (1000 * 60 * 60 * 24);

    if (dayGap === 1) {
      streak += 1;
    } else if (dayGap > 1) {
      break;
    }
  }

  return streak;
}

const Profile = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:1402";
  const [chartFilter, setChartFilter] = useState("Daily");
  const [taskSummary, setTaskSummary] = useState({
    pending: 0,
    completed: 0,
    total: 0,
  });
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizHistoryLoading, setQuizHistoryLoading] = useState(true);

  const {
    totalQuestions,
    totalEfficiency,
    questionsSolved,
    efficiencyHistory,
    dailyRecords,
    refreshStats
  } = useContext(EfficiencyContext);
  const { user, token } = useAuth();

  const averageEfficiency =
    efficiencyHistory.length > 0
      ? Math.round(
          efficiencyHistory.reduce((sum, entry) => sum + entry.efficiency, 0) /
            efficiencyHistory.length
      )
      : 0;

  const solvedBacklog = Math.max(totalQuestions - questionsSolved, 0);
  const currentStreak = calculateCurrentStreak(dailyRecords);
  const chartRecords = aggregateRecords(dailyRecords, chartFilter);
  const recentActivity = [...(dailyRecords || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const insights = [
    totalEfficiency >= averageEfficiency
      ? "Your current efficiency is holding above your longer-term average."
      : "You are slightly below your average pace. A short review session could help close the gap.",
    solvedBacklog > 0
      ? `${solvedBacklog} tracked questions remain in your backlog. Clearing even 2-3 this week would shift momentum.`
      : "Your tracked backlog is fully cleared. This is a great time to add fresh challenge problems.",
    taskSummary.pending > 0
      ? `${taskSummary.pending} pending tasks are still open in your local planner.`
      : "Your local task board is clear right now. Keep the dashboard fed with a few active goals.",
  ];

  const metricCards = [
    {
      title: "Today's Efficiency",
      value: `${totalEfficiency}%`,
      helperText:
        totalEfficiency >= averageEfficiency
          ? "Running stronger than your usual baseline."
          : "A little behind your average pace today.",
      icon: FiActivity,
      accentClass: "bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500",
    },
    {
      title: "Questions Solved",
      value: questionsSolved,
      helperText: `${totalQuestions || 0} tracked in total across your current backlog.`,
      icon: FiTarget,
      accentClass: "bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500",
    },
    {
      title: "Average Efficiency",
      value: `${averageEfficiency}%`,
      helperText: `${efficiencyHistory.length} tracked day${efficiencyHistory.length === 1 ? "" : "s"} contributing to your trend line.`,
      icon: FiTrendingUp,
      accentClass: "bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400",
    },
    {
      title: "Active Streak",
      value: `${currentStreak} day${currentStreak === 1 ? "" : "s"}`,
      helperText:
        currentStreak > 0
          ? "Consecutive days with at least one solved tracked problem."
          : "Solve one tracked problem today to begin a new streak.",
      icon: FiCalendar,
      accentClass: "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500",
    },
  ];

  // refresh on mount and window focus
  useEffect(() => {
    if (typeof refreshStats === "function") refreshStats();
    const onFocus = () => typeof refreshStats === "function" && refreshStats();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshStats]);

  useEffect(() => {
    const loadTaskSummary = () => {
      const pendingTasks = JSON.parse(localStorage.getItem("todolist") || "[]");
      const completedTasks = JSON.parse(localStorage.getItem("completedTodos") || "[]");

      setTaskSummary({
        pending: Array.isArray(pendingTasks) ? pendingTasks.length : 0,
        completed: Array.isArray(completedTasks) ? completedTasks.length : 0,
        total:
          (Array.isArray(pendingTasks) ? pendingTasks.length : 0) +
          (Array.isArray(completedTasks) ? completedTasks.length : 0),
      });
    };

    loadTaskSummary();
    window.addEventListener("focus", loadTaskSummary);
    return () => window.removeEventListener("focus", loadTaskSummary);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadQuizHistory = async () => {
      if (!token) {
        setQuizHistory([]);
        setQuizHistoryLoading(false);
        return;
      }

      try {
        setQuizHistoryLoading(true);
        const { data } = await axios.get(
          `${baseURL}/ai/study-quizzes?limit=4`,
          buildAuthConfig(token)
        );

        if (!cancelled) {
          setQuizHistory(Array.isArray(data?.quizzes) ? data.quizzes : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load quiz history:", error?.response?.data || error.message);
          setQuizHistory([]);
        }
      } finally {
        if (!cancelled) {
          setQuizHistoryLoading(false);
        }
      }
    };

    loadQuizHistory();
    window.addEventListener("focus", loadQuizHistory);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadQuizHistory);
    };
  }, [baseURL, token]);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const themeStyles = getComputedStyle(document.documentElement);
    const chartGrid = themeStyles.getPropertyValue("--app-chart-grid").trim();
    const chartTicks = themeStyles.getPropertyValue("--app-chart-ticks").trim();
    const chartLine = themeStyles.getPropertyValue("--app-chart-line").trim();
    const chartFill = themeStyles.getPropertyValue("--app-chart-fill").trim();
    const chartPointFill = themeStyles.getPropertyValue("--app-chart-point-fill").trim();
    const chartPointBorder = themeStyles.getPropertyValue("--app-chart-point-border").trim();
    const chartTooltipBg = themeStyles.getPropertyValue("--app-chart-tooltip-bg").trim();
    const chartTooltipBorder = themeStyles.getPropertyValue("--app-chart-tooltip-border").trim();
    const chartTooltipTitle = themeStyles.getPropertyValue("--app-chart-tooltip-title").trim();
    const chartTooltipBody = themeStyles.getPropertyValue("--app-chart-tooltip-body").trim();

    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, chartFill);
    gradient.addColorStop(1, "rgba(56, 189, 248, 0)");

    const labels = chartRecords.map((record) => record.label);
    const dataPoints = chartRecords.map((record) => record.value);

    const options = {
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: chartTicks, font: { size: 11 } },
          border: { color: chartGrid },
        },
        y: {
          grid: { color: chartGrid },
          ticks: { color: chartTicks, precision: 0, font: { size: 11 } },
          border: { display: false },
          suggestedMin: 0,
          suggestedMax: dataPoints.length ? Math.max(...dataPoints) + 1 : 5,
        },
      },
      responsive: true,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: true,
          align: "start",
          labels: {
            color: chartTicks,
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          backgroundColor: chartTooltipBg,
          borderColor: chartTooltipBorder,
          borderWidth: 1,
          titleColor: chartTooltipTitle,
          bodyColor: chartTooltipBody,
          padding: 12,
          displayColors: false,
        },
      },
    };

    const config = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${chartFilter} Problems Solved`,
            data: dataPoints,
            fill: true,
            backgroundColor: gradient,
            borderColor: chartLine,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: chartPointFill,
            pointBorderColor: chartPointBorder,
            pointBorderWidth: 2,
            tension: 0.35,
          },
        ],
      },
      options,
    };

    chartInstanceRef.current = new Chart(ctx, config);
    return () => chartInstanceRef.current?.destroy();
  }, [chartRecords, chartFilter]);

  return (
    <AppShell contentClassName="px-0 pb-12 pt-6 md:px-2">
      <div className="mx-auto max-w-7xl space-y-6">
          <section className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
            <div className="dashboard-surface-strong rounded-[32px] p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-500 dark:text-cyan-300/80">
                    Performance Dashboard
                  </p>
                  <h1 className="dashboard-text mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                    {user?.name ? `Welcome back, ${user.name}` : "Your progress at a glance"}
                  </h1>
                  <p className="dashboard-muted mt-3 max-w-xl text-sm leading-7">
                    Monitor your coding consistency, review efficiency trends, and keep your daily execution loop tighter with a more compact command center.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[290px]">
                  <div className="dashboard-soft-surface rounded-2xl px-4 py-3">
                    <p className="dashboard-subtle text-xs uppercase tracking-[0.25em]">Last Sync</p>
                    <p className="dashboard-text mt-2 text-sm font-medium">
                      {dailyRecords.length ? formatLongDate(dailyRecords[dailyRecords.length - 1].date) : "No activity yet"}
                    </p>
                  </div>
                  <div className="dashboard-soft-surface rounded-2xl px-4 py-3">
                    <p className="dashboard-subtle text-xs uppercase tracking-[0.25em]">Backlog Left</p>
                    <p className="dashboard-text mt-2 text-sm font-medium">{solvedBacklog} questions pending</p>
                  </div>
                </div>
              </div>
            </div>

            <DashboardSectionCard
              title="Quick Insights"
              subtitle="Auto-generated guidance from your current tracker state."
            >
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div
                    key={insight}
                    className="dashboard-soft-surface dashboard-muted rounded-2xl px-4 py-3 text-sm leading-6"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </DashboardSectionCard>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <DashboardMetricCard
                key={card.title}
                title={card.title}
                value={card.value}
                helperText={card.helperText}
                icon={card.icon}
                accentClass={card.accentClass}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <DashboardSectionCard
              title="Problem-Solving Trend"
              subtitle="A compact view of how consistently you are converting tracked practice into solves."
              action={
                <div className="dashboard-soft-surface inline-flex rounded-2xl p-1">
                  {CHART_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setChartFilter(filter)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                        chartFilter === filter
                          ? "bg-cyan-400/20 text-cyan-600 dark:text-cyan-200"
                          : "dashboard-subtle hover:text-[var(--dashboard-text)]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="h-[340px]">
                <canvas ref={chartRef} />
              </div>
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Task Summary"
              subtitle="Pulled from your current local planner until the dashboard is fully account-linked."
            >
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="dashboard-soft-surface rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="dashboard-subtle text-sm">Pending Tasks</p>
                    <FiClock className="dashboard-muted" />
                  </div>
                  <p className="dashboard-text mt-4 text-3xl font-semibold">{taskSummary.pending}</p>
                </div>
                <div className="dashboard-soft-surface rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="dashboard-subtle text-sm">Completed Tasks</p>
                    <FiCheckCircle className="dashboard-muted" />
                  </div>
                  <p className="dashboard-text mt-4 text-3xl font-semibold">{taskSummary.completed}</p>
                </div>
                <div className="dashboard-soft-surface rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="dashboard-subtle text-sm">Task Coverage</p>
                    <FiBarChart2 className="dashboard-muted" />
                  </div>
                  <p className="dashboard-text mt-4 text-3xl font-semibold">
                    {taskSummary.total > 0
                      ? `${Math.round((taskSummary.completed / taskSummary.total) * 100)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </DashboardSectionCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <DashboardSectionCard
              title="Recent Activity"
              subtitle="Latest solved-problem days from your tracked history."
            >
              <div className="space-y-3">
                {recentActivity.length ? (
                  recentActivity.map((record) => (
                    <div
                      key={record._id || record.date}
                      className="dashboard-soft-surface flex items-center justify-between rounded-2xl px-4 py-3"
                    >
                      <div>
                        <p className="dashboard-text text-sm font-medium">
                          Solved {record.problemsSolved ?? 0} problem{record.problemsSolved === 1 ? "" : "s"}
                        </p>
                        <p className="dashboard-subtle mt-1 text-xs uppercase tracking-[0.2em]">
                          {formatLongDate(record.date)}
                        </p>
                      </div>
                      <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-200">
                        {record.efficiency ?? 0}% efficiency
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-soft-surface dashboard-subtle rounded-2xl border-dashed px-4 py-8 text-center text-sm leading-6">
                    No recent activity yet. Start solving tracked problems and this feed will begin to populate automatically.
                  </div>
                )}
              </div>
            </DashboardSectionCard>

            <DashboardSectionCard
              title="Study Quiz History"
              subtitle="Recent AI-verified study attempts linked to your study tasks."
            >
              <div className="grid gap-3">
                {quizHistoryLoading ? (
                  <div className="dashboard-soft-surface dashboard-subtle rounded-2xl px-4 py-8 text-center text-sm">
                    Loading quiz history...
                  </div>
                ) : quizHistory.length ? (
                  quizHistory.map((quiz) => (
                    <div
                      key={quiz._id}
                      className="dashboard-soft-surface rounded-2xl px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="dashboard-subtle text-xs font-semibold uppercase tracking-[0.24em]">
                            {quiz.taskSnapshot?.title || "Study Task"}
                          </p>
                          <p className="dashboard-text mt-2 text-base font-semibold">
                            {quiz.topic}
                          </p>
                          <p className="dashboard-subtle mt-1 text-sm leading-6">
                            {formatLongDate(quiz.createdAt)}
                          </p>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            quiz.passed
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {quiz.scorePercent}% score
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="dashboard-soft-surface dashboard-subtle rounded-2xl px-4 py-8 text-center text-sm leading-6">
                      No study quiz history yet. Complete a study task through the new AI quiz flow and the dashboard will start tracking it here.
                    </div>
                    <div className="dashboard-soft-surface rounded-2xl px-4 py-4">
                      <p className="dashboard-subtle text-xs font-semibold uppercase tracking-[0.24em]">
                        Future AI Layer
                      </p>
                      <p className="dashboard-text mt-2 text-base font-semibold">
                        Topic coverage and revision recommendations
                      </p>
                      <p className="dashboard-subtle mt-1 text-sm leading-6">
                        The next step can group quiz history by topic and suggest what to revise next.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </DashboardSectionCard>
          </section>
      </div>
    </AppShell>
  );
};

export default Profile;
