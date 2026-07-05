// --- API URL ---
const API_URL = '/api/todos';

// --- DOM Elements ---
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

let todos = [];

// --- Load tasks ---
document.addEventListener('DOMContentLoaded', fetchTodos);
todoForm.addEventListener('submit', addTodo);

// Fetch tasks from API
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

// Add a new task
async function addTodo(e) {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;

    const payload = {
        title: title,
        completed: false
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const newTodo = await response.json();
        todos.push(newTodo);
        todoInput.value = '';
        renderTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

// Toggle completion status
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const payload = {
        ...todo,
        completed: !todo.completed
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const updated = await response.json();
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updated;
        }
        renderTodos();
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

// Delete a task
async function deleteTodo(id) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

// Render tasks list in DOM
function renderTodos() {
    todoList.innerHTML = '';
    
    // Sort uncompleted first
    todos.sort((a, b) => a.completed - b.completed);

    todos.forEach(todo => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div class="todo-item-left">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span class="${todo.completed ? 'completed-text' : ''}">${escapeHTML(todo.title)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Bind toggle and delete globally for onclick handlers
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
