import { useEffect, useState } from "react";
import supabase from "../client";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch todos
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      alert(error.message);
    } else {
      setTodos(data);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo with sequential ID
  const addTodo = async () => {
    if (!task.trim()) return alert("Task cannot be empty!");

    // Fetch existing todos to find smallest missing ID
    const { data: existingTodos } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });

    let newId = 1;
    for (let i = 0; i < existingTodos.length; i++) {
      if (existingTodos[i].id !== i + 1) {
        newId = i + 1;
        break;
      }
      newId = existingTodos.length + 1;
    }

    const { error } = await supabase
      .from("todos")
      .insert([{ id: newId, task, status: "working" }]);

    if (error) alert(error.message);
    else {
      setTask("");
      fetchTodos();
    }
  };

  // Update todo
  const updateTodo = async (id) => {
    if (!task.trim()) return alert("Task cannot be empty!");
    const { error } = await supabase.from("todos").update({ task }).eq("id", id);
    if (error) alert(error.message);
    else {
      setTask("");
      setEditingId(null);
      fetchTodos();
    }
  };

  // Delete todo and reorder IDs
  const deleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) return alert(error.message);
    fetchTodos();

    // Reorder IDs after delete
    const { data: remainingTodos } = await supabase
      .from("todos")
      .select("*")
      .order("id", { ascending: true });

    for (let i = 0; i < remainingTodos.length; i++) {
      await supabase.from("todos").update({ id: i + 1 }).eq("id", remainingTodos[i].id);
    }

    fetchTodos();
  };

  // Move todo between working & done
  const moveTodo = async (id, currentStatus) => {
    const newStatus = currentStatus === "working" ? "done" : "working";
    const { error } = await supabase.from("todos").update({ status: newStatus }).eq("id", id);
    if (error) alert(error.message);
    else fetchTodos();
  };

  const workingTasks = todos.filter((t) => t.status === "working");
  const doneTasks = todos.filter((t) => t.status === "done");

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial, sans-serif" }}>
      <h1>✅ Todo List</h1>

      {/* Input Section */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter a task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              editingId ? updateTodo(editingId) : addTodo();
            }
          }}
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        {editingId ? (
          <button onClick={() => updateTodo(editingId)}>Update</button>
        ) : (
          <button onClick={addTodo}>Add</button>
        )}
      </div>

      {/* Working Tasks */}
      <h2>Currently Working</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {workingTasks.map((t) => (
          <li
            key={t.id}
            style={{
              margin: "10px auto",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "300px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff8e1",
            }}
          >
            <span>{t.task}</span>
            <div>
              <button onClick={() => moveTodo(t.id, t.status)}>✅ Done</button>
              <button onClick={() => { setEditingId(t.id); setTask(t.task); }}>✏️</button>
              <button onClick={() => deleteTodo(t.id)}>❌</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Done Tasks */}
      <h2>Done</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {doneTasks.map((t) => (
          <li
            key={t.id}
            style={{
              margin: "10px auto",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "300px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#e0ffe0",
            }}
          >
            <span>{t.task}</span>
            <div>
              <button onClick={() => moveTodo(t.id, t.status)}>🔄 Working</button>
              <button onClick={() => { setEditingId(t.id); setTask(t.task); }}>✏️</button>
              <button onClick={() => deleteTodo(t.id)}>❌</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
