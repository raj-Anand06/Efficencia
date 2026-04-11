import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import useCodeforcesUser from './UseCodeforcesUser';
import $ from 'jquery';

function QsnFetcher({ placeholderTodos, setPlaceholderTodos, completedCount, updateCompletedCount }) {
  const [placeholderTitle, setPlaceholderTitle] = useState('');
  const [placeholderUserID, setPlaceholderUserID] = useState('');
  const [solvedLinks, setSolvedLinks] = useState(new Set());

  // Normalize Codeforces problem URLs
  const normalizeProblemURL = (url) => {
    const problemRegex = /https?:\/\/codeforces\.com\/(?:contest|problemset)\/(\d+)\/problem\/(\w+)/i;
    const match = (url || '').trim().match(problemRegex);
    if (match) {
      const [, contestId, problemIndex] = match;
      return `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`;
    }
    return null;
  };

  // Basic CF handle validation
  const isValidHandle = (raw) => {
    const handle = (raw || '').trim();
    if (!handle) return false;
    // reject lists/urls/spaces
    if (handle.includes(',') || handle.includes('/') || handle.includes('http') || handle.includes(' ')) return false;
    // CF handles: letters, digits, underscore, hyphen (adjust if needed)
    return /^[A-Za-z0-9_-]{1,32}$/.test(handle);
  };

  const handleAddTodo = () => {
    const normalizedURL = normalizeProblemURL(placeholderTitle);
    if (normalizedURL) {
      // avoid duplicates
      const exists = placeholderTodos.some((t) => t.title === normalizedURL);
      if (exists) {
        alert('This problem is already in your list.');
        return;
      }
      const newTodoItem = { id: Date.now(), title: normalizedURL, userID: placeholderUserID };
      const updatedTodos = [...placeholderTodos, newTodoItem];
      setPlaceholderTodos(updatedTodos);
      localStorage.setItem('placeholderTodos', JSON.stringify(updatedTodos));
      setPlaceholderTitle('');
    } else {
      alert('Invalid Codeforces problem URL.');
    }
  };

  const handleDeleteTodo = (id) => {
    const updatedTodos = placeholderTodos.filter((todo) => todo.id !== id);
    localStorage.setItem('placeholderTodos', JSON.stringify(updatedTodos));
    setPlaceholderTodos(updatedTodos);
  };

  const handleUserIDChange = (e) => {
    const value = e.target.value.trim();
    setPlaceholderUserID(value);
    localStorage.setItem('placeholderUserID', value);
  };

  const fetchSolvedProblems = (userID) => {
    const handle = (userID || '').trim();

    // guard against bad handles
    if (!isValidHandle(handle)) {
      // quietly clear solved links if handle looks invalid
      setSolvedLinks(new Set());
      return;
    }

    const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`;

    $.getJSON(url, (data) => {
      const solved = new Set();
      if (data && data.status === 'OK' && Array.isArray(data.result)) {
        for (let item of data.result) {
          if (item?.verdict === 'OK' && item?.problem?.contestId && item?.problem?.index) {
            const c = item.problem.contestId;
            const i = item.problem.index;
            const u1 = `https://codeforces.com/contest/${c}/problem/${i}`;
            const u2 = `https://codeforces.com/problemset/problem/${c}/${i}`;
            solved.add(u1);
            solved.add(u2);
          }
        }
      }
      setSolvedLinks(solved);
    }).fail((jqXHR) => {
      console.error('CF fetch failed:', jqXHR?.status, jqXHR?.responseText);
      // on failure, don’t spam further; just keep current set
    });
  };

  const changeUser = useCodeforcesUser(setPlaceholderUserID, fetchSolvedProblems);

  // Initial load from localStorage
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('placeholderTodos') || '[]');
    const savedUserID = (localStorage.getItem('placeholderUserID') || '').trim();

    if (Array.isArray(savedTodos)) {
      setPlaceholderTodos(savedTodos);
    }
    if (savedUserID) {
      setPlaceholderUserID(savedUserID);
      // fetch once on mount if we have a saved handle
      fetchSolvedProblems(savedUserID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch solved only when the HANDLE changes (debounced)
  useEffect(() => {
    if (!placeholderUserID) {
      setSolvedLinks(new Set());
      return;
    }
    const id = setTimeout(() => fetchSolvedProblems(placeholderUserID), 400);
    return () => clearTimeout(id);
    // IMPORTANT: do NOT include placeholderTodos here (prevents spam)
  }, [placeholderUserID]);

  // Recompute completed count when solvedLinks or todos change
  useEffect(() => {
    const count = placeholderTodos.filter((todo) => solvedLinks.has(todo.title)).length;
    updateCompletedCount(count);
  }, [solvedLinks, placeholderTodos, updateCompletedCount]);

  return (
    <div className="app-card ml-2 mt-2 w-full max-w-2xl overflow-y-auto rounded-[28px] p-6 shadow-lg max-h-[80vh] md:mt-4 md:ml-12 md:h-96">
      <input
        type="text"
        value={placeholderUserID}
        onChange={handleUserIDChange}
        placeholder="Your Codeforces ID"
        className="app-input mb-2 w-full rounded-xl p-2 md:mb-3 md:mr-4"
      />
      <button
        type="button"
        onClick={changeUser}
        className="app-button-secondary px-4 py-1.5 rounded-xl md:mb-3 md:mt-0"
      >
        Change User
      </button>

      <p className="dashboard-text text-xl font-bold">Paste Your Question Link</p>
      <div className="todo-input-item flex flex-col md:flex-row mt-4">
        <input
          type="text"
          value={placeholderTitle}
          onChange={(e) => setPlaceholderTitle(e.target.value)}
          placeholder="Your Question Link..."
          className="app-input mb-2 w-full rounded-xl p-2 md:mr-4"
        />
        <button
          type="button"
          onClick={handleAddTodo}
          className="app-button-primary px-4 py-1.5 rounded-xl md:mb-3 md:mt-0"
        >
          Add
        </button>
      </div>

      <div className="dashboard-muted mt-4">Completed Questions: {completedCount}</div>

      <div className="todo-list md:mt-6 mt-6 flex flex-col">
        {placeholderTodos.map((todo) => (
          <div
            className={`todo-list-item mb-4 flex items-center justify-between rounded-2xl p-4 shadow ${
              solvedLinks.has(todo.title)
                ? 'border border-emerald-400/30 bg-emerald-500/20'
                : 'border border-rose-400/30 bg-rose-500/20'
            }`}
            key={todo.id}
          >
            <h3 className="dashboard-text text-xl break-all">{todo.title}</h3>
            <AiOutlineDelete
              className="icon text-2xl cursor-pointer hover:text-red-500"
              onClick={() => handleDeleteTodo(todo.id)}
              title="Delete?"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default QsnFetcher;
