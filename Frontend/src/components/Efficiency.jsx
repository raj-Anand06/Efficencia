import React, { useState, useEffect, useContext } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';
import QsnFetcher from './QsnFetcher';
import EfficiencyCalculation from './EfficiencyCalculation';
import Navbar from './Navbar';
import { EfficiencyContext } from '../context/EfficiencyContext';

function Efficiency() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState({ title: '', description: '' });
  const [placeholderTodos, setPlaceholderTodos] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);

  const { setTotalEfficiency } = useContext(EfficiencyContext);

  const handleAddTodo = (title, description) => {
    const newTodoItem = { title, description };
    const updatedTodoArr = [...allTodos, newTodoItem];
    setTodos(updatedTodoArr);
    localStorage.setItem('todolist', JSON.stringify(updatedTodoArr));
  };

  const handleMainAddTodo = () => {
    handleAddTodo(newTitle, newDescription);
    setNewTitle('');
    setNewDescription('');
  };

  const handleDeleteTodo = index => {
    const reducedTodo = allTodos.filter((_, i) => i !== index);
    localStorage.setItem('todolist', JSON.stringify(reducedTodo));
    setTodos(reducedTodo);
  };

  const handleComplete = index => {
    const now = new Date();
    const completedOn = now.toLocaleString();
    const filteredItem = { ...allTodos[index], completedOn };
    const updatedCompletedArr = [...completedTodos, filteredItem];
    setCompletedTodos(updatedCompletedArr);
    handleDeleteTodo(index);
    localStorage.setItem('completedTodos', JSON.stringify(updatedCompletedArr));
    updateCompletedTasksCount(updatedCompletedArr.length);
  };

  const handleDeleteCompletedTodo = index => {
    const reducedTodo = completedTodos.filter((_, i) => i !== index);
    localStorage.setItem('completedTodos', JSON.stringify(reducedTodo));
    setCompletedTodos(reducedTodo);
    updateCompletedTasksCount(reducedTodo.length);
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

  const handleUpdateToDo = () => {
    const updatedTodos = allTodos.map((item, index) =>
      index === currentEdit ? currentEditedItem : item
    );
    setTodos(updatedTodos);
    setCurrentEdit(null);
    localStorage.setItem('todolist', JSON.stringify(updatedTodos));
  };

  const handleCancelEdit = () => {
    setCurrentEdit(null);
    setCurrentEditedItem({ title: '', description: '' });
  };

  useEffect(() => {
    const savedTodo = JSON.parse(localStorage.getItem('todolist'));
    const savedCompletedTodo = JSON.parse(localStorage.getItem('completedTodos'));
    const savedCompletedCount = localStorage.getItem('completedTasksCount');
    if (savedTodo) setTodos(savedTodo);
    if (savedCompletedTodo) setCompletedTodos(savedCompletedTodo);
    if (savedCompletedCount) {
      console.log(`Number of completed tasks: ${savedCompletedCount}`);
    }
  }, []);

  const updateCompletedTasksCount = (count) => {
    localStorage.setItem('completedTasksCount', count);
    console.log(`Number of completed tasks: ${count}`);
  };

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
    const overallEfficiency = ((parseFloat(taskEfficiency) + parseFloat(questionEfficiency)) / 2).toFixed(2);
    setTotalEfficiency(overallEfficiency);
  }, [allTodos, completedTodos, placeholderTodos, completedCount, setTotalEfficiency]);

  return (
    <>
      <Navbar />
      <h1 className="text-4xl mr-3 mt-4 font-serif md:ml-96 ml-2 md:translate-x-5 font-bold">
        Visualize, Organize, Actualize: List it & Do it!
      </h1>
      <div className='flex flex-col items-center'>
        <div className='flex md:flex-row flex-col w-full justify-around items-stretch'>
          <div className="todo-wrapper bg-gray-800 border border-gray-600 p-6 rounded-lg shadow-lg mt-2 md:mt-4 md:h-96 w-full max-w-2xl overflow-y-auto max-h-[80vh]">
            <div className="todo-input flex flex-col md:flex-row md:items-center md:justify-center border-b border-gray-600 pb-6 mb-6">
              <div className="todo-input-item flex flex-col mb-4 md:mb-0 md:mr-4">
                <label className="font-bold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="What's the task title?"
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="todo-input-item flex flex-col mb-4 md:mb-0 md:mr-4">
                <label className="font-bold text-white mb-2">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="What's the task description?"
                  className="p-2 border rounded w-full"
                />
              </div>
              <div className="todo-input-item flex flex-col">
                <button
                  type="button"
                  onClick={handleMainAddTodo}
                  className="primaryBtn md:mt-8 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="btn-area flex justify-center mb-6">
              <button
                className={`secondaryBtn ${!isCompleteScreen ? 'bg-blue-500' : 'bg-gray-700'} text-white px-4 py-2 rounded mr-4 hover:bg-blue-400`}
                onClick={() => setIsCompleteScreen(false)}
              >
                Go On
              </button>
              <button
                className={`secondaryBtn ${isCompleteScreen ? 'bg-blue-500' : 'bg-gray-700'} text-white px-4 py-2 rounded hover:bg-blue-400`}
                onClick={() => setIsCompleteScreen(true)}
              >
                Completed
              </button>
            </div>

            <div className="todo-list flex flex-col">
              {!isCompleteScreen &&
                allTodos.map((item, index) => {
                  if (currentEdit === index) {
                    return (
                      <div className="edit__wrapper bg-gray-800 p-4 mb-4 rounded shadow" key={index}>
                        <input
                          placeholder="Updated Title"
                          onChange={(e) => handleUpdateTitle(e.target.value)}
                          value={currentEditedItem.title}
                          className="p-2 border rounded w-full mb-2"
                        />
                        <input
                          placeholder="Updated Description"
                          onChange={(e) => handleUpdateDescription(e.target.value)}
                          value={currentEditedItem.description}
                          className="p-2 border rounded w-full mb-2"
                        />
                        <div className="flex justify-end">
                          <button className="primaryBtn bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={handleUpdateToDo}>Update</button>
                          <button className="primaryBtn bg-red-500 text-white px-4 py-2 rounded" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className="todo-list-item bg-gray-800 p-4 mb-4 rounded shadow flex justify-between items-center"
                      key={index}
                    >
                      <div>
                        <h3 className="text-xl text-white">{item.title}</h3>
                        <p className="text-gray-300">{item.description}</p>
                      </div>
                      <div className="flex items-center">
                        <AiOutlineEdit
                          className="icon text-2xl cursor-pointer hover:text-blue-500 mr-4"
                          onClick={() => handleEdit(index, item)}
                          title="Edit?"
                        />
                        <BsCheckLg
                          className="icon text-2xl cursor-pointer hover:text-green-500 mr-4"
                          onClick={() => handleComplete(index)}
                          title="Complete?"
                        />
                        <AiOutlineDelete
                          className="icon text-2xl cursor-pointer hover:text-red-500"
                          onClick={() => handleDeleteTodo(index)}
                          title="Delete?"
                        />
                      </div>
                    </div>
                  );
                })}
              {isCompleteScreen &&
                completedTodos.map((item, index) => (
                  <div
                    className="todo-list-item bg-gray-800 p-4 mb-4 rounded shadow flex justify-between items-center"
                    key={index}
                  >
                    <div>
                      <h3 className="text-xl text-white">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                      <p className="text-gray-500 text-sm">
                        Completed on: {item.completedOn}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <AiOutlineDelete
                        className="icon text-2xl cursor-pointer hover:text-red-500"
                        onClick={() => handleDeleteCompletedTodo(index)}
                        title="Delete?"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <QsnFetcher
            placeholderTodos={placeholderTodos}
            setPlaceholderTodos={setPlaceholderTodos}
            completedCount={completedCount}
            updateCompletedCount={setCompletedCount}
          />
        </div>
        <button 
          className="primaryBtn bg-green-500 text-white px-4 py-2 rounded mt-4 hover:bg-green-400"
          onClick={() => setShowEfficiencyModal(true)}
        >
          Show Efficiency
        </button>
        {showEfficiencyModal && (
          <EfficiencyCalculation
            taskEfficiency={calculateTaskEfficiency()}
            questionEfficiency={calculateQuestionEfficiency()}
            onClose={() => setShowEfficiencyModal(false)}
          />
        )}
      </div>
    </>
  );
}

export default Efficiency;
