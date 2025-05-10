const API_URL = 'http://localhost:3000/tasks';

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'todas';
let isEditing = false;

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

// Configura os event listeners
function setupEventListeners() {
    // Formulário de tarefas
    taskForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', cancelEdit);
    
    // Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateFilterButtons();
            renderTasks();
        });
    });
}

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        tasksContainer.innerHTML = `
            <div class="error-message">
                Erro ao carregar tarefas. Verifique se a API está rodando.
            </div>
        `;
    }
}

function renderTasks() {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-message">
                Nenhuma tarefa encontrada. Crie uma nova tarefa!
            </div>
        `;
        return;
    }
    
    // Filtra as tarefas conforme o filtro selecionado
    const filteredTasks = currentFilter === 'todas' 
        ? tasks 
        : tasks.filter(task => task.tipo === currentFilter);
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-message">
                Nenhuma tarefa ${currentFilter === 'Pessoal' ? 'pessoal' : 'profissional'} encontrada.
            </div>
        `;
        return;
    }
    
    tasksContainer.innerHTML = filteredTasks.map(task => {
        const date = new Date(task.dataHora);
        const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="task-card ${task.tipo}" data-id="${task.id}">
                <h3 class="task-title">${task.titulo}</h3>
                ${task.descricao ? `<p class="task-desc">${task.descricao}</p>` : ''}
                <div class="task-info">
                    <span class="task-date">${formattedDate}</span>
                    <span class="task-type ${task.tipo}">${task.tipo}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="startEditTask('${task.id}')">Editar</button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateFilterButtons() {
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const taskData = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        tipo: document.getElementById('tipo').value,
        userId: 1
    };
    
    try {
        if (isEditing) {
            await updateTask(taskId, taskData);
        } else {
            await createTask(taskData);
        }
        
        resetForm();
        loadTasks();
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        alert('Ocorreu um erro ao salvar a tarefa. Verifique o console para mais detalhes.');
    }
}

async function createTask(taskData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return response.json();
}

async function startEditTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const task = await response.json();
        
        document.getElementById('task-id').value = task.id;
        document.getElementById('titulo').value = task.titulo;
        document.getElementById('descricao').value = task.descricao || '';
        document.getElementById('tipo').value = task.tipo;
        
        formTitle.textContent = 'Editar Tarefa';
        cancelEditBtn.style.display = 'block';
        isEditing = true;
        
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Erro ao carregar tarefa para edição:', error);
        alert('Ocorreu um erro ao carregar a tarefa para edição.');
    }
}

// Atualiza uma tarefa existente
async function updateTask(taskId, taskData) {
    const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return response.json();
}

// Deleta uma tarefa
async function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        // Recarrega as tarefas após excluir
        loadTasks();
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        alert('Ocorreu um erro ao excluir a tarefa.');
    }
}

// Cancela a edição de uma tarefa
function cancelEdit() {
    resetForm();
}

// Reseta o formulário para o estado inicial
function resetForm() {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    formTitle.textContent = 'Nova Tarefa';
    cancelEditBtn.style.display = 'none';
    isEditing = false;
}