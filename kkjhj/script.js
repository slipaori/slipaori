document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light-theme';
        body.className = savedTheme; 
    }
    function toggleTheme() {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
        }
    }
    loadTheme();
    themeToggleBtn.addEventListener('click', toggleTheme);
    const statuses = [
        { value: "Новые", text: "Новые", color: "#4ba1ed" },
        { value: "На_одобрении", text: "На одобрении", color: "#ffc619" },
        { value: "В_разработке", text: "В разработке", color: "#f36818" },
        { value: "Тестирование", text: "Тестирование", color: "#9e1de3" },
        { value: "Выполнено", text: "Выполнено", color: "#28a745" }
    ];
    const statusOrderMap = new Map(statuses.map((status, index) => [status.value, index]));
    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(listItem => {
            const taskText = listItem.querySelector('span.task-text').textContent;
            const taskStatus = listItem.getAttribute('data-status');
            tasks.push({ text: taskText, status: taskStatus });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                createTaskElement(task.text, task.status);
            });
            sortTasks(); 
        }
    }
    function createTaskElement(taskText, initialStatus) {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-status', initialStatus);
        listItem.classList.add(`status-${initialStatus.replace(/\s/g, '_')}`);
        const taskContent = document.createElement('div');
        taskContent.classList.add('task-content');
        const taskSpan = document.createElement('span');
        taskSpan.classList.add('task-text');
        taskSpan.textContent = taskText;
        taskSpan.addEventListener('click', () => makeEditable(taskSpan));
        const statusSelect = createStatusSelect(initialStatus);
        taskContent.appendChild(taskSpan);
        taskContent.appendChild(statusSelect);
        listItem.appendChild(taskContent);
        const taskButtons = document.createElement('div');
        taskButtons.classList.add('task-buttons');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', deleteTask);
        taskButtons.appendChild(deleteBtn);
        listItem.appendChild(taskButtons);
        taskList.appendChild(listItem);
    }
    function createStatusSelect(initialStatus = "Новые") {
        const select = document.createElement('select');
        select.classList.add('task-status');
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.value;
            option.textContent = status.text;
            const statusObj = statuses.find(s => s.value === status.value);
            if (statusObj) {
                option.style.color = statusObj.color;
            }
            select.appendChild(option);
        });
        select.value = initialStatus; 
        select.addEventListener('change', handleStatusChange);
        const initialStatusObj = statuses.find(s => s.value === initialStatus);
        if (initialStatusObj) {
            select.style.borderColor = initialStatusObj.color;
            select.style.color = initialStatusObj.color;
        }
        return select;
    }
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Пожалуйста, введите текст задачи!');
            return;
        }
        createTaskElement(taskText, "Новые"); 
        saveTasks(); 
        sortTasks(); 

        taskInput.value = ''; 
        taskInput.focus(); 
    }
    function handleStatusChange(event) {
        const selectElement = event.target;
        const newStatus = selectElement.value;
        const listItem = selectElement.closest('li'); 
        statuses.forEach(status => {
            listItem.classList.remove(`status-${status.value.replace(/\s/g, '_')}`);
        });
        listItem.classList.add(`status-${newStatus.replace(/\s/g, '_')}`);
        listItem.setAttribute('data-status', newStatus);
        const newStatusObj = statuses.find(s => s.value === newStatus);
        if (newStatusObj) {
            selectElement.style.borderColor = newStatusObj.color;
            selectElement.style.color = newStatusObj.color;
        }
        saveTasks(); 
        sortTasks(); 
    }
    function makeEditable(taskSpan) {
        if (taskSpan.querySelector('input.edit-input')) {
            return;
        }
        const currentText = taskSpan.textContent;
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = currentText;
        inputField.classList.add('edit-input');
        taskSpan.replaceWith(inputField); 
        inputField.focus(); 
        inputField.addEventListener('blur', () => saveEdit(inputField));
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit(inputField);
            }
        });
    }
    function saveEdit(inputField) {
        const newText = inputField.value.trim();
        const taskSpan = document.createElement('span');
        taskSpan.classList.add('task-text');
        taskSpan.textContent = newText || "Пустая задача"; 
        taskSpan.addEventListener('click', () => makeEditable(taskSpan));
        inputField.replaceWith(taskSpan); 
        saveTasks(); 
    }
    function deleteTask(event) {
        const listItem = event.target.closest('li'); 
        listItem.remove(); 
        saveTasks(); 
    }
    function sortTasks() {
        const items = Array.from(taskList.children); 
        items.sort((a, b) => {
            const statusA = a.getAttribute('data-status');
            const statusB = b.getAttribute('data-status');
            const indexA = statusOrderMap.get(statusA);
            const indexB = statusOrderMap.get(statusB);
            if (indexA !== undefined && indexB !== undefined) {
                return indexA - indexB;
            }
            return 0;
        });
        taskList.innerHTML = '';
        items.forEach(item => taskList.appendChild(item));
    }
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    loadTasks();
});