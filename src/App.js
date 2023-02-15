import './App.css';

import { useState, useEffect } from 'react';
import { BsTrash, BsBookmarkCheck, BsBookmarkCheckFill } from "react-icons/bs"

const API = "http://localhost:5000";

const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("todos", serializedState);
  } catch (err) {
    console.log(err);
  }
};

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("todos");
    if (serializedState === null) return [];
    return JSON.parse(serializedState);
  } catch (err) {
    console.log(err);
    return [];
  }
};

function App() {

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const loadData = async () => {

      setLoading(true)

      const res = await fetch(API + "/todos")
        .then((res) => res.json())
        .then((data) => data)

      setLoading(false)

      setTodos(res)
      setTodos(loadStateFromLocalStorage());
    };

    loadData()

  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const todo = {
      id: Math.random(),
      title,
      time,
      done: false
    };

    await fetch(API + "/todos", {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json",
      },
    })

    setTodos((prevState) => [...prevState, todo])

    setTitle("")
    setTime(0)
  };

  const handleDelete = async (id) => {
    await fetch(API + "/todos/" + id, {
      method: "DELETE",
    });

    setTodos((prevState) => prevState.filter((todo) => todo.id !== id))
  }

  const handleEdit = async (todo) => {

    todo.done = !todo.done
  
    if (todo.done) {
      todo.time = 0;
    }

    const data = await fetch(API + "/todos/" + todo.id, {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json",
      }
    });

    setTodos((prevState) =>
      prevState.map((t) => (t.id === data.id) ? (t = data) : t))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTasks = todos.map((task) => {
        if (task.time > 0) {
          return { ...task, time: task.time - 1 };
        } else {
          return task;
        }
      });
      setTodos(newTasks);
      saveStateToLocalStorage(newTasks)
    }, 1000);
    return () => clearTimeout(timer);
  }, [todos]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="App">
      <div className="todo-header">
        <h1>To-Do List</h1>
      </div>

      <div className="form-todo">
        <h2>Insert your next task:</h2>
        <form onSubmit={handleSubmit}>

          <div className="form-control">
            <input type="text" name="title" placeholder='Add a new task' onChange={(e) => setTitle(e.target.value)} value={title || ""} required />
          </div>

          <div className="form-control">
            <input type="text" name="time" placeholder='Duration (in seconds)' onChange={(e) => setTime(parseInt(e.target.value))} value={time || ""} required />
          </div>

          <input type="submit" value="Create Task" />
        </form>
      </div>

      <div className="list-todo">
        <h2>to-do list:</h2>
        {todos.length === 0 && <p>there are no tasks</p>}
        {todos.map((todo) => (

          <div className="todo" key={todo.id}>
            <h3 className={todo.done ? "todo-done" : ""}>{todo.title}</h3>
            <p>Duration: {formatTime(todo.time)}h</p>
            <div className="actions">
              <span onClick={() => handleEdit(todo)}>
                {!todo.done ? <BsBookmarkCheck /> : <BsBookmarkCheckFill />}
              </span>
              <BsTrash onClick={() => handleDelete(todo.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App;
