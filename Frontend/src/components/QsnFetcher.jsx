import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import UseCodeforcesUser from './UseCodeforcesUser';
import $ from 'jquery';

function QsnFetcher({ placeholderTodos, setPlaceholderTodos, completedCount, updateCompletedCount }) {
  const [placeholderTitle, setPlaceholderTitle] = useState('');
  const [placeholderUserID, setPlaceholderUserID] = useState('');
  const [solvedLinks, setSolvedLinks] = useState(new Set());

  const handleAddTodo = () => {
    const newTodoItem = { id: Date.now(), title: placeholderTitle, userID: placeholderUserID };
    const updatedTodos = [...placeholderTodos, newTodoItem];
    setPlaceholderTodos(updatedTodos);
    localStorage.setItem('placeholderTodos', JSON.stringify(updatedTodos));
    setPlaceholderTitle('');
  };

  const handleDeleteTodo = (id) => {
    const updatedTodos = placeholderTodos.filter((todo) => todo.id !== id);
    localStorage.setItem('placeholderTodos', JSON.stringify(updatedTodos));
    setPlaceholderTodos(updatedTodos);
  };

  const handleUserIDChange = (e) => {
    const value = e.target.value;
    setPlaceholderUserID(value);
    localStorage.setItem('placeholderUserID', value);
  };

  const fetchSolvedProblems = (userID) => {
    const url = `https://codeforces.com/api/user.status?handle=${userID}`;
    $.getJSON(url, (data) => {
      const solved = new Set();
      for (let item of data.result) {
        if (item.verdict === "OK") {
          solved.add(`https://codeforces.com/problemset/problem/${item.problem.contestId}/${item.problem.index}`);
        }
      }
      setSolvedLinks(solved);
    });
  };

  const changeUser = UseCodeforcesUser(setPlaceholderUserID, fetchSolvedProblems);

  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('placeholderTodos'));
    const savedUserID = localStorage.getItem('placeholderUserID');
    if (Array.isArray(savedTodos)) {
      setPlaceholderTodos(savedTodos);
    }
    if (savedUserID) {
      setPlaceholderUserID(savedUserID);
      fetchSolvedProblems(savedUserID);
    }
  }, []);

  useEffect(() => {
    if (placeholderUserID) {
      fetchSolvedProblems(placeholderUserID);
    }
  }, [placeholderUserID, placeholderTodos]);

  useEffect(() => {
    const count = placeholderTodos.filter((todo) => solvedLinks.has(todo.title)).length;
    updateCompletedCount(count);
  }, [solvedLinks, placeholderTodos, updateCompletedCount]);

  return (
    <div className="bg-gray-800 border ml-2 mt-2 md:mt-4 md:ml-12 border-gray-600 p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto md:h-96 max-h-[80vh]">
      <div className="bg-gray-800 border border-gray-600 p-6 rounded-lg shadow-lg">
        <input
          type="text"
          value={placeholderUserID}
          onChange={handleUserIDChange}
          placeholder="Your Codeforces id"
          className="p-2 border md:mb-3 rounded w-full mb-2 md:mr-4"
        />
        <button
          type="button"
          onClick={changeUser}
          className="primaryBtn bg-blue-500 md:mb-3 md:mt-0 text-white px-4 py-1.5 rounded hover:bg-blue-400"
        >
          Change User
        </button>
        <p className="text-white text-xl font-bold">Paste Your Question Link</p>
        <div className="todo-input-item flex flex-col md:flex-row mt-4">
          <input
            type="text"
            value={placeholderTitle}
            onChange={(e) => setPlaceholderTitle(e.target.value)}
            placeholder="Your Question Link..."
            className="p-2 border rounded w-full mb-2 md:mr-4"
          />
          <button
            type="button"
            onClick={handleAddTodo}
            className="primaryBtn bg-green-500 md:mb-3 md:mt-0 text-white px-4 py-1.5 rounded hover:bg-green-400"
          >
            Add
          </button>
        </div>
        <div className="text-white mt-4">Completed Questions: {completedCount}</div>
        <div className="todo-list md:mt-6 mt-6 flex flex-col">
          {placeholderTodos.map((todo) => (
            <div
              className={`todo-list-item p-4 mb-4 rounded shadow flex justify-between items-center ${
                solvedLinks.has(todo.title) ? 'bg-green-700' : 'bg-red-700'
              }`}
              key={todo.id}
            >
              <div>
                <h3 className="text-xl text-white">{todo.title}</h3>
              </div>
              <div>
                <AiOutlineDelete
                  className="icon text-2xl cursor-pointer hover:text-red-500"
                  onClick={() => handleDeleteTodo(todo.id)}
                  title="Delete?"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QsnFetcher;
