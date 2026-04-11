// E:/efficenc/Efficencia/Frontend/src/components/Efficiency.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';
import QsnFetcher from './QsnFetcher';
import EfficiencyCalculation from './EfficiencyCalculation';
import StudyTaskQuizModal from './StudyTaskQuizModal.jsx';
import { EfficiencyContext } from '../context/EfficiencyContext.jsx';
import AppShell from './layout/AppShell.jsx';

function createTodoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `todo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeTodoItem(item = {}) {
  return {
    id: item.id || createTodoId(),
    title: typeof item.title === 'string' ? item.title : '',
    description: typeof item.description === 'string' ? item.description : '',
    isStudyTask: Boolean(item.isStudyTask),
    completedOn: item.completedOn || null,
    quizVerification: item.quizVerification || null,
  };
}

function Efficiency() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsStudyTask, setNewIsStudyTask] = useState(false);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState({
    id: '',
    title: '',
    description: '',
    isStudyTask: false,
  });
  const [quizTask, setQuizTask] = useState(null);

  // Codeforces/placeholder questions
  const [placeholderTodos, setPlaceholderTodos] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  // Efficiency modal & aggregate efficiency
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);
  const [totalEfficiency, setTotalEfficiency] = useState(0);

  const { addQuestionSolved } = useContext(EfficiencyContext);

  // --- CRUD for main task list ---

  const persistTodos = (todos) => {
    setTodos(todos);
    localStorage.setItem('todolist', JSON.stringify(todos));
  };

  const persistCompletedTodos = (todos) => {
    setCompletedTodos(todos);
    localStorage.setItem('completedTodos', JSON.stringify(todos));
    updateCompletedTasksCount(todos.length);
  };

  const handleAddTodo = (title, description, isStudyTask = false) => {
    const newTodoItem = normalizeTodoItem({
      id: createTodoId(),
      title,
      description,
      isStudyTask,
    });
    const updatedTodoArr = [...allTodos, newTodoItem];
    persistTodos(updatedTodoArr);
  };

  const handleMainAddTodo = () => {
    handleAddTodo(newTitle, newDescription, newIsStudyTask);
    setNewTitle('');
    setNewDescription('');
    setNewIsStudyTask(false);
  };

  const handleDeleteTodo = (todoId) => {
    const reducedTodo = allTodos.filter((item) => item.id !== todoId);
    persistTodos(reducedTodo);
  };

  const completeTodoItem = (todoItem, quizVerification = null) => {
    const now = new Date();
    const completedOn = now.toLocaleString();
    const filteredItem = {
      ...todoItem,
      completedOn,
      quizVerification,
    };
    const updatedCompletedArr = [...completedTodos, filteredItem];
    persistCompletedTodos(updatedCompletedArr);
    handleDeleteTodo(todoItem.id);
  };

  const handleComplete = (todoItem) => {
    if (todoItem.isStudyTask) {
      setQuizTask(todoItem);
      return;
    }

    completeTodoItem(todoItem);
  };

  const handleDeleteCompletedTodo = (todoId) => {
    const reducedTodo = completedTodos.filter((item) => item.id !== todoId);
    persistCompletedTodos(reducedTodo);
  };

  const handleEdit = (ind, item) => {
    setCurrentEdit(ind);
    setCurrentEditedItem(item);
  };

  const handleUpdateTitle = (value) => {
    setCurrentEditedItem((prev) => ({ ...prev, title: value }));
  };

  const handleUpdateDescription = (value) => {
    setCurrentEditedItem((prev) => ({ ...prev, description: value }));
  };

  const handleUpdateStudyFlag = (value) => {
    setCurrentEditedItem((prev) => ({ ...prev, isStudyTask: value }));
  };

  const handleUpdateToDo = () => {
    const updatedTodos = allTodos.map((item, index) =>
      index === currentEdit ? normalizeTodoItem(currentEditedItem) : item
    );
    persistTodos(updatedTodos);
    setCurrentEdit(null);
  };

  const handleCancelEdit = () => {
    setCurrentEdit(null);
    setCurrentEditedItem({ id: '', title: '', description: '', isStudyTask: false });
  };

  // --- Persistence ---

  useEffect(() => {
    const savedTodo = JSON.parse(localStorage.getItem('todolist') || '[]');
    const savedCompletedTodo = JSON.parse(localStorage.getItem('completedTodos') || '[]');
    const savedCompletedCount = localStorage.getItem('completedTasksCount');

    if (Array.isArray(savedTodo)) {
      const normalizedTodos = savedTodo.map((item) => normalizeTodoItem(item));
      setTodos(normalizedTodos);
      localStorage.setItem('todolist', JSON.stringify(normalizedTodos));
    }

    if (Array.isArray(savedCompletedTodo)) {
      const normalizedCompletedTodos = savedCompletedTodo.map((item) =>
        normalizeTodoItem(item)
      );
      setCompletedTodos(normalizedCompletedTodos);
      localStorage.setItem('completedTodos', JSON.stringify(normalizedCompletedTodos));
    }

    if (savedCompletedCount) {
      console.log(`Number of completed tasks: ${savedCompletedCount}`);
    }
  }, []);

  const updateCompletedTasksCount = (count) => {
    localStorage.setItem('completedTasksCount', String(count));
    console.log(`Number of completed tasks: ${count}`);
  };

  // --- Efficiency calculations ---

  const calculateTaskEfficiency = () => {
    const totalTasks = allTodos.length + completedTodos.length;
    const totalCompletedTasks = completedTodos.length;
    const efficiency = totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0;
    return efficiency.toFixed(2);
  };

  const calculateQuestionEfficiency = () => {
    const totalQuestions = placeholderTodos.length;
    const totalCompletedQuestions = completedCount;
    const efficiency = totalQuestions > 0 ? (totalCompletedQuestions / totalQuestions) * 100 : 0;
    return efficiency.toFixed(2);
  };

  useEffect(() => {
    const taskEfficiency = calculateTaskEfficiency();
    const questionEfficiency = calculateQuestionEfficiency();
    const overallEfficiency = (
      (parseFloat(taskEfficiency) + parseFloat(questionEfficiency)) / 2
    ).toFixed(2);
    setTotalEfficiency(overallEfficiency);
  }, [allTodos, completedTodos, placeholderTodos, completedCount]);

  const handleStudyTaskVerified = (quizResult) => {
    if (!quizTask) return;

    completeTodoItem(quizTask, {
      quizId: quizResult._id,
      topic: quizResult.topic,
      scorePercent: quizResult.scorePercent,
      passed: quizResult.passed,
    });
    setQuizTask(null);
  };

  // --- Render ---

  return (
    <AppShell contentClassName="pt-8">
      <div className="space-y-8">
        <div className="app-card-strong rounded-[32px] p-6 md:p-8">
          <p className="app-subtle-copy text-xs font-semibold uppercase tracking-[0.3em]">
            Execution Board
          </p>
          <h1 className="app-heading mt-3 font-serif text-3xl font-bold md:text-5xl">
            Visualize, Organize, Actualize: List it and Do it
          </h1>
          <p className="app-copy mt-3 max-w-3xl text-sm leading-7 md:text-base">
            Keep your tasks, solved questions, and efficiency score in one
            uniform workspace without leaving the flow of your day.
          </p>
        </div>

        <div className="flex flex-col items-center">
        <div className="flex md:flex-row flex-col w-full justify-around items-stretch">

          {/* Left: Task/Todo panel */}
          <div className="todo-wrapper app-card w-full max-w-2xl overflow-y-auto rounded-[28px] p-6 shadow-lg max-h-[80vh] md:mt-4 md:h-96">
            {/* Input area */}
            <div className="todo-input mb-6 flex flex-col border-b border-[var(--dashboard-border)] pb-6 md:flex-row md:items-center md:justify-center">
              <div className="todo-input-item flex flex-col mb-4 md:mb-0 md:mr-4">
                <label className="dashboard-text mb-2 font-bold">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's the task title?"
                  className="app-input w-full rounded-xl p-2"
                />
              </div>

              <div className="todo-input-item flex flex-col mb-4 md:mb-0 md:mr-4">
                <label className="dashboard-text mb-2 font-bold">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What's the task description?"
                  className="app-input w-full rounded-xl p-2"
                />
              </div>

              <label className="dashboard-muted mb-4 flex items-center gap-3 text-sm font-medium md:mb-0 md:mr-4 md:mt-8">
                <input
                  type="checkbox"
                  checked={newIsStudyTask}
                  onChange={(event) => setNewIsStudyTask(event.target.checked)}
                />
                Study task
              </label>

              <div className="todo-input-item flex flex-col">
                <button
                  type="button"
                  onClick={handleMainAddTodo}
                  className="app-button-primary md:mt-8 rounded-xl px-4 py-2"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Toggle buttons */}
            <div className="btn-area flex justify-center mb-6">
              <button
                className={`rounded-xl px-4 py-2 ${!isCompleteScreen ? 'app-button-primary' : 'app-button-secondary'} mr-4`}
                onClick={() => setIsCompleteScreen(false)}
              >
                Go On
              </button>
              <button
                className={`rounded-xl px-4 py-2 ${isCompleteScreen ? 'app-button-primary' : 'app-button-secondary'}`}
                onClick={() => setIsCompleteScreen(true)}
              >
                Completed
              </button>
            </div>

            {/* Lists */}
            <div className="todo-list flex flex-col">
              {!isCompleteScreen &&
                allTodos.map((item, index) => {
                  if (currentEdit === index) {
                    return (
                      <div className="edit__wrapper app-soft-card mb-4 rounded-2xl p-4 shadow" key={index}>
                        <input
                          placeholder="Updated Title"
                          onChange={(e) => handleUpdateTitle(e.target.value)}
                          value={currentEditedItem.title}
                          className="app-input mb-2 w-full rounded-xl p-2"
                        />
                        <input
                          placeholder="Updated Description"
                          onChange={(e) => handleUpdateDescription(e.target.value)}
                          value={currentEditedItem.description}
                          className="app-input mb-2 w-full rounded-xl p-2"
                        />
                        <label className="dashboard-muted mb-4 flex items-center gap-3 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={currentEditedItem.isStudyTask}
                            onChange={(event) => handleUpdateStudyFlag(event.target.checked)}
                          />
                          Require study quiz before completion
                        </label>
                        <div className="flex justify-end">
                          <button
                            className="app-button-primary mr-2 rounded-xl px-4 py-2"
                            onClick={handleUpdateToDo}
                          >
                            Update
                          </button>
                          <button
                            className="app-button-secondary rounded-xl px-4 py-2"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className="todo-list-item app-soft-card mb-4 flex items-center justify-between rounded-2xl p-4 shadow"
                      key={item.id}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="dashboard-text text-xl">{item.title}</h3>
                          {item.isStudyTask ? (
                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-200">
                              Study task
                            </span>
                          ) : null}
                        </div>
                        <p className="dashboard-muted">{item.description}</p>
                      </div>
                      <div className="flex items-center">
                        <AiOutlineEdit
                          className="icon text-2xl cursor-pointer hover:text-blue-500 mr-4"
                          onClick={() => handleEdit(index, item)}
                          title="Edit?"
                        />
                        <BsCheckLg
                          className="icon text-2xl cursor-pointer hover:text-green-500 mr-4"
                          onClick={() => handleComplete(item)}
                          title="Complete?"
                        />
                        <AiOutlineDelete
                          className="icon text-2xl cursor-pointer hover:text-red-500"
                          onClick={() => handleDeleteTodo(item.id)}
                          title="Delete?"
                        />
                      </div>
                    </div>
                  );
                })}

              {isCompleteScreen &&
                completedTodos.map((item, index) => (
                  <div
                    className="todo-list-item app-soft-card mb-4 flex items-center justify-between rounded-2xl p-4 shadow"
                    key={item.id || index}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="dashboard-text text-xl">{item.title}</h3>
                        {item.isStudyTask ? (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-200">
                            Study task
                          </span>
                        ) : null}
                      </div>
                      <p className="dashboard-muted">{item.description}</p>
                      <p className="dashboard-subtle text-sm">
                        Completed on: {item.completedOn}
                      </p>
                      {item.quizVerification ? (
                        <p className="dashboard-subtle mt-1 text-sm">
                          Quiz score: {item.quizVerification.scorePercent}% on {item.quizVerification.topic}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center">
                      <AiOutlineDelete
                        className="icon text-2xl cursor-pointer hover:text-red-500"
                        onClick={() => handleDeleteCompletedTodo(item.id)}
                        title="Delete?"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right: Codeforces QsnFetcher panel */}
          <QsnFetcher
            placeholderTodos={placeholderTodos}
            setPlaceholderTodos={setPlaceholderTodos}
            completedCount={completedCount}
            updateCompletedCount={(newCount) => {
              setCompletedCount((prev) => {
                // only count it as “solved” when the number goes up
                if (newCount > prev) {
                  addQuestionSolved();
                }
                return newCount;
              });
            }}
          />
        </div>

        {/* Efficiency Modal Trigger */}
        <button
          className="app-button-primary mt-4 rounded-xl px-4 py-2"
          onClick={() => setShowEfficiencyModal(true)}
        >
          Show Efficiency
        </button>

        {/* Efficiency Modal */}
        {showEfficiencyModal && (
          <EfficiencyCalculation
            taskEfficiency={calculateTaskEfficiency()}
            questionEfficiency={calculateQuestionEfficiency()}
            onClose={() => setShowEfficiencyModal(false)}
          />
        )}
        <StudyTaskQuizModal
          open={Boolean(quizTask)}
          task={quizTask}
          onClose={() => setQuizTask(null)}
          onTaskVerified={handleStudyTaskVerified}
        />
        </div>
      </div>
    </AppShell>
  );
}

export default Efficiency;
