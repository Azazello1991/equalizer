// Замініть цей файл на власний з попереднього ДЗ
const
   form = document.querySelector('.form'),
   textArea = document.querySelector('.form-field'),
   inputDate = document.querySelector('.form-field--date'),
   inputTime = document.querySelector('.form-field--time'),
   formFildMessag = document.querySelector('.form-error'),
   tasksList = document.querySelector('.task-list'),
   wrapper = document.querySelector('.wrapper'),
   notifications = document.querySelector('.notifications'),
   areaMessag = document.querySelectorAll('.form-error-msg'),
   fieldsForm = document.querySelectorAll('.form-field'),
   checkBoxes = document.querySelectorAll('.category-checkbox'),
   formElements = form.elements,
   sorting = document.querySelector('.sorting'),
   sortingCount = document.querySelector('.sorting__count');
let taskId = '';

const nowDate = Date.now();
const tasksArr = [];
let sortihgArr = [];

const messages = {
   requiredError: 'Це поле не може бути порожнім',
   textError: 'Довжина тексту не може бути більшою за 100 символів і меншою за 3 символи.',
   dateErrorMore: 'Дата має бути хоча б трохи більша за поточну',
   dateErrorLess: 'Не плануй так далеко, не далі року',
   timeErrorForDate: 'Спочатку правильно заповніть поле з датою',
   timeError: 'Час має бути хоча б на 30 хв більший за поточний',
};

const notifMessages = {
   addTask: 'Додано нове завдання',
   doneTask: 'Завдання виконано',
   removeTask: 'Завдання видалено',
   editTask: 'Завдання змінено',
   archiveRemove: 'Завдання вилучено з архіву',
   archiveAdd: 'Завдання додано до архіву',
};



//================================= Події ======================================= //

// Делегуємо click:
wrapper.addEventListener('click', (e) => {
   const target = e.target;

   if (target.classList.contains('task__btn--remove')) {
      delTask(target);
      setTimeout(delNotifications, 3000);
      showCounter();
      filter();

   } else if (target.classList.contains('task__btn--edit')) {
      showFormEdit(target);
      disabledEditBtns()

   } else if (target.classList.contains('js_save-changes')) {
      if (target.closest('.add-task').querySelector('.add-task__group').classList.contains('success')) {
         saveChanges(target);
         addTask(JSON.parse(localStorage['tasks']));   
         enabledEditBtns();
         filter()
         showNotifi('edit-task', notifMessages.editTask);
         setTimeout(delNotifications, 3000);
      }

   } else if (target.classList.contains('js_reject-changes')) {
      tasksList.innerHTML = '';
      addTask(JSON.parse(localStorage['tasks'])); 
      enabledEditBtns();

   } else if (target.classList.contains('task__btn--archive')) {
      addTaskToArchive(target);
      setTimeout(delNotifications, 3000);
      filter();
   }
});


// Делегуємо change на фільтер:
sorting.addEventListener('change', (e) => {
   const target = e.target;
   criateObjForFilter();
   filter();
});


// Вішаємо подію focus:
for (let i = 0; i < formElements.length; i++){
   // Якщо це check-box - пропускаємо:
   if (formElements[i].type === 'radio' || formElements[i].type === 'submit') {
      continue;
   };
   
   formElements[i].addEventListener('focus', (e) => {
      const target = e.target;
      // При focus додаємо клас error:
      if (formElements[i].value === '') {
         addArror(target);
         messageErr(target, messages.requiredError);
      }
   });
};


// Вішаємо подію input на taskText:
form.taskText.addEventListener('input', (e) => {
   const target = e.target;

   // Валідуємо textarea за патерном:
   if (target.name === `taskText`) {
      checkText(target);        
   }
});


// Вішаємо подію input на ел.form:
for (let i = 0; i < formElements.length; i++){

   if (formElements[i].name === 'taskDate' || formElements[i].name === 'taskTime') {

      formElements[i].addEventListener('input', (e) => {
         const target = e.target;

         // Валідуємо date :
         if (target.name === `taskDate`) {
            checkDate(target);
         } else if (target.name === `taskTime`) {
            checkTime(target)
         }
      });
   };
};


// Вішаємо подію submit на btn 'Додати завдання':
form.addEventListener('submit', (e) => {
   e.preventDefault();
   getDataForTask();
   showFilter()
   filter()
   setTimeout(delNotifications, 3000,);
});



tasksList.addEventListener('change', (e) => {
   const target = e.target;

   if (target.classList.contains('checkbox-input')) {
      showStatusTask(target, 'done');
      setTimeout(delNotifications, 3000,);
      filter();
   }
});


tasksList.addEventListener('input', (e) => {
   const target = e.target;
   if (target.classList.contains('form-field')) {
      checkText(target);
   }
});



// ===================================== Функції до 18-го д.з. ============================================//
// Функція, що додає фільтер:
function showFilter() {
   addFilterOptions();
   if (localStorage.tasks) {
      const arrLocalLength = JSON.parse(localStorage['tasks']).length
   
      if (arrLocalLength > 2) {
         sorting.classList.remove('hide')
      } else {
         sorting.classList.add('hide')
      }
   }
};


// Функція, що додає форму для редагування завдання:
function showFormEdit(target) {
   const content = target.closest('.task__head').querySelector('.task__name').textContent;
   taskId = target.closest('.task__head').querySelector('.checkbox-input').getAttribute('id');

   target.closest('.task').innerHTML = `
   <form class="form form--edit" name="editTask">
    <div class="add-task">
        <div class="add-task__group success">
            <textarea class="form-field" id="task-text" name="taskText">${content}</textarea>
            <div class="form-error-msg"></div>
        </div>
        <div class="d-flex j-end g-10">
            <button class="btn btn--sm btn--gray js_reject-changes" type="button">Відхилити</button>
            <button class="btn btn--sm btn--green js_save-changes" type="button">OK</button>
        </div>
      </div>
   </form>`;
};


// Функція, що зберігає зміни в task:
function saveChanges(target) {
   const taskGroup = target.closest('.add-task').querySelector('.add-task__group');

   if (taskGroup.classList.contains('success')) {
      const taskText = target.closest('.add-task').querySelector('.form-field').value
      const arrLocal = JSON.parse(localStorage['tasks']);
      const tasksItem = arrLocal.find(item => `task[${item.id}]` === taskId);

      tasksItem.task = taskText;
      localStorage.setItem('tasks', JSON.stringify(arrLocal));
      tasksList.innerHTML = '';
   };
};


// Функція що блокує кнопки редагування task:
function disabledEditBtns() {
   const editBtns = document.querySelectorAll('.task__btn--edit');
   editBtns.forEach((item) => item.setAttribute('disabled', ''));
};


// Функція що розблоковує кнопки редагування task:
function enabledEditBtns() {
   const editBtns = document.querySelectorAll('.task__btn--edit');
   editBtns.forEach((item) => item.removeAttribute('disabled'));
};


// Функція, що додає та видаляє завдання в архів:
function addTaskToArchive(target){
   const arrLocal = JSON.parse(localStorage['tasks']);
   const targetId = target.closest('.task').querySelector('.checkbox-input').getAttribute('id');
   const tasksItem = arrLocal.find(item => `task[${item.id}]` === targetId);

   if (target.closest('.task').classList.contains('archive')) {
      tasksItem.inArchive = false;
      localStorage.setItem('tasks', JSON.stringify(arrLocal));
      tasksList.innerHTML = '';
      addTask(JSON.parse(localStorage['tasks']));
      
   } else {
      tasksItem.inArchive = true;
      localStorage.setItem('tasks', JSON.stringify(arrLocal));
      tasksList.innerHTML = '';
      addTask(JSON.parse(localStorage['tasks']));
      showNotifi(`archive-task`, notifMessages.archiveAdd);
   }
};


// Функція, що збирає параметри для фільтру:
function criateObjForFilter() {
   const filterObj = {};

   const statusBtnsList = document.querySelector('.status-sorting');
   const statusBtns = statusBtnsList.querySelectorAll('.sort-radio__input');
   const statusArr = [...statusBtns].find(item => item.checked === true);
   filterObj.status = `${statusArr.value}`;

   const categoryBtnsList = document.querySelector('.category-sorting');
   const categoryBtns = categoryBtnsList.querySelectorAll('.sort-radio__input');
   const categoryArr = [...categoryBtns].find(item => item.checked === true);
   categoryArr === undefined ? filterObj.category = 'all' : filterObj.category = `${categoryArr.value}`;

   const timeBtnsList = document.querySelector('.time-sorting');
   const timeBtns = timeBtnsList.querySelectorAll('.sort-radio__input');
   const timeArr = [...timeBtns].find(item => item.checked === true);
   timeArr === undefined ? filterObj.time = 'all' : filterObj.time = `${timeArr.value}`;
   localStorage.setItem('filterObj', JSON.stringify(filterObj));

   return filterObj;
};


// Функція, що фільтруе за масивом:
function filter() {
   if (localStorage['tasks'] && localStorage['filterObj']) {
      const arrLocal = JSON.parse(localStorage['tasks']);
      const objLocale = JSON.parse(localStorage['filterObj']);
      let arrTasks = [];
   
      // Фильтруємо за статусом:
      if (objLocale.status === 'undone') {
         const resultStatus = [...arrLocal].filter(item => item.status === 'new');
         arrTasks = [...resultStatus];
      } else if (objLocale.status === 'done') {
         const resultStatus = [...arrLocal].filter(item => item.status === 'done');
         arrTasks = [...resultStatus];
      } else if (objLocale.status === 'archive') {
         const resultStatus = [...arrLocal].filter(item => item.inArchive === true);
         arrTasks = [...resultStatus];
      } else if (objLocale.status === 'all') {
         arrTasks = [...arrLocal]
      };
   
      // Фильтруємо за категориєю:
      if (objLocale.category === 'urgent') {
         const resultCategory = [...arrTasks].filter(item => item.value === 'urgent');
         arrTasks = [...resultCategory];
      } else if (objLocale.category === 'study') {
         const resultCategory = [...arrTasks].filter(item => item.value === 'study');
         arrTasks = [...resultCategory];
      } else if (objLocale.category === 'work') {
         const resultCategory = [...arrTasks].filter(item => item.value === 'work');
         arrTasks = [...resultCategory];
      } else if (objLocale.category === 'hobby') {
         const resultCategory = [...arrTasks].filter(item => item.value === 'hobby');
         arrTasks = [...resultCategory];
      } else if (objLocale.category === 'all') {
         arrTasks = [...arrTasks]
      };
   
      // Фильтруємо за часом:
      if (objLocale.time === 'new') {
         const resultTime = [...arrTasks].filter(item => Date.parse(item.date) > Date.parse(new Date()));
         arrTasks = [...resultTime];
   
      } else if (objLocale.time === 'expired') {
         const resultTime = [...arrTasks].filter(item => Date.parse(item.date) < Date.parse(new Date()));
         arrTasks = [...resultTime];
   
      } else if (objLocale.time === 'oneWeek') {
         const resultWeek = [];
         for (let i = 0; i < arrTasks.length; i++){
            if ((Date.parse(arrTasks[i].date) - Date.parse(new Date())) / 86400000 <= 7 && (Date.parse(arrTasks[i].date) - Date.parse(new Date())) / 86400000 > 0) {
               resultWeek.push(arrTasks[i]);
            };
         };
         arrTasks = resultWeek;
   
      } else if (objLocale.time === 'oneMonth') {
         const resultMonth = [];
         for (let i = 0; i < arrTasks.length; i++){
            if ((Date.parse(arrTasks[i].date) - Date.parse(new Date())) / 86400000 <= 30 && (Date.parse(arrTasks[i].date) - Date.parse(new Date())) / 86400000 > 0) {
               resultMonth.push(arrTasks[i]);
            };
         };
         arrTasks = resultMonth;
   
      } else if (objLocale.time === 'closest') {
         const resultClosest = [...arrTasks].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) )
         arrTasks = [...resultClosest];
   
      } else if (objLocale.time === 'distance') {
         const resultDistance = [...arrTasks].sort((a, b) => Date.parse(a.date) - Date.parse(b.date) )
         arrTasks = [...resultDistance];
   
      } else if (objLocale.time === 'all') {
         arrTasks = [...arrTasks]
      }
   
      tasksList.innerHTML = '';
      addTask(arrTasks);
      showCounter();
   
      return arrTasks;
      
   }
};

// Функція, що відтворює збережені параметри фільтру при запуску сторінки:
function addFilterOptions() {
   if (localStorage.filterObj) {
      const objLocal = JSON.parse(localStorage['filterObj']);

      const statusBtnsList = document.querySelector('.status-sorting');
      const statusBtns = statusBtnsList.querySelectorAll('.sort-radio__input');
      const statusArr = [...statusBtns].find(item => item.value === `${objLocal.status}`);
      statusArr.checked = true;
   
      const categoryBtnsList = document.querySelector('.category-sorting');
      const categoryBtns = categoryBtnsList.querySelectorAll('.sort-radio__input');
      const categotyArr = [...categoryBtns].find(item => item.value === `${objLocal.category}`);
      categotyArr.checked = true;
   
      const timeBtnsList = document.querySelector('.time-sorting');
      const timeBtns = timeBtnsList.querySelectorAll('.sort-radio__input');
      const timeArr = [...timeBtns].find(item => item.value === `${objLocal.time}`);
      timeArr.checked = true;
   }
}


// Фукнція-калькулятор:
function showCounter() {
   const lengthListTasks = tasksList.querySelectorAll('.task-list__item').length;
   sortingCount.textContent = `${lengthListTasks}`;
}


// -----------------------------------------------------------------------------------------------//
// Функція, що вілслідковує deadline:
function trackDeadline() {
   const arrLocal = JSON.parse(localStorage['tasks']);
   const tasks = tasksList.querySelectorAll('tasks-list__item')
   const newArr = [];
   if (localStorage.tasks && localStorage.tasks.length > 0) {
      for (let i = 0; i < arrLocal.length; i++) {
         if (Date.parse(arrLocal[i].date) < nowDate && !(arrLocal[i].status === 'done'))  {
            arrLocal[i].status = 'expired';
         };
         newArr.push(arrLocal[i]);
      };
      localStorage.setItem("tasks", JSON.stringify(newArr));
      tasks.innerHTML = '';
      filter();
   };
};
setInterval(trackDeadline, 60000);


// Функція, що видаляє нотифікації:
function delNotifications() {
   notifications.innerHTML = '';
};


// Функція, що показує статус task:
function showStatusTask(target, status) {
   const targetId = target.getAttribute('id');
   const arrLocal = JSON.parse(localStorage['tasks']);

   if (target.checked === true) {
      target.closest('.task').classList.add(status);
      showNotifi(`done-task`, notifMessages.doneTask);

      for (let i = 0; i < arrLocal.length; i++) {
         if (`task[${arrLocal[i].id}]` === targetId) {
            arrLocal[i].status = 'done';
            localStorage.setItem("tasks", JSON.stringify(arrLocal));
         };
      };

   } else {
      target.closest('.task').classList.remove(status);

      for (let i = 0; i < arrLocal.length; i++) {
         if (`task[${arrLocal[i].id}]` === targetId) {
            arrLocal[i].status = 'new';
            localStorage.setItem("tasks", JSON.stringify(arrLocal));
         };
      };
   };
};


// Функція, що додає нотифікацією(повідомлення):
function showNotifi(type, notifMessages) {
   const notif =
      `<div class="notification ${type}">
         <div class="notification__text">${notifMessages}</div>
      </div>`;
   
   notifications.insertAdjacentHTML(`afterBegin`, notif);
};


// Функція, що видаляє task зі списку:
function delTask(target) {
   const idRemTask = target.parentElement.previousElementSibling.firstElementChild.getAttribute("id");
   const arrTasks = JSON.parse(localStorage['tasks']);
   const newArrTask = [];
   
   for (let i = 0; i < arrTasks.length; i++){
      if (idRemTask === `task[${arrTasks[i].id}]`) {
         continue
      };
      newArrTask.push(arrTasks[i]);
   };

   localStorage.setItem("tasks", JSON.stringify(newArrTask));
   target.closest('.task-list__item').remove();
   showNotifi(`remove-task`, notifMessages.removeTask);
   showFilter();
};


// Функція, що додає task до localStorage:
function addTaskToStorege(arrForAdd) {
   if (localStorage.tasks && localStorage.tasks.length > 0) {
      arrLocal = JSON.parse(localStorage['tasks']);
      const tasksOfStorege = [...arrLocal, ...arrForAdd];
      localStorage.setItem("tasks", JSON.stringify(tasksOfStorege));

   } else {
      localStorage.setItem("tasks", JSON.stringify(arrForAdd));
   };
};


// Функція, що виводить залишок часу завдання в повідомлення:
function showDeadLine(deadLine) {
   const restOfTime = Date.parse(deadLine) - nowDate;
   
   if (Math.floor(restOfTime / (30 * 24 * 3600 * 1000)) >= 1) {
      return `Лишилося ${Math.floor(restOfTime / (30 * 24 * 3600 * 1000))} міс.`;
   } else if (Math.floor(restOfTime / (24 * 3600 * 1000)) < 30 && Math.floor(restOfTime / (24 * 3600 * 1000)) >= 1) {
      return `Лишилося ${Math.floor(restOfTime / (24 * 3600 * 1000))} дн.`;
   } else if (Math.floor(restOfTime / (24 * 3600 * 1000)) < 1 && Math.floor(restOfTime / (3600 * 1000)) > 1) {
      return `Лишилося ${Math.floor(restOfTime / (3600 * 1000))} год.`;
   } else if (Math.floor(restOfTime / (3600 * 1000)) < 1) {
      return `Лишилося ${Math.floor(restOfTime / (60 * 1000))} хв.`;
   } else if (restOfTime < 0) {
      return `Задачу протерміновано`;
   };
};


// Функція, що додає task до списку завдань:
function addTask(arr) {
   for (let i = 0; i < arr.length; i++){
      let res = '';
      res = arr[i].inArchive === true ? res = 'archive' : res = '';

      tasksList.insertAdjacentHTML(`afterBegin`,
            `<li class="task-list__item">
               <div class="task ${arr[i].value} ${arr[i].status} ${res}">
                  <div class="task__head">
                     <div class="task__check">
                        <input
                           class="sr-only checkbox-input"
                           type="checkbox"
                           name="task[${arr[i].id}]"
                           id="task[${arr[i].id}]"
                        >
                        <label for="task[${arr[i].id}]" class="task__checkbox checkbox"></label>
                        <div class="task__name">${arr[i].task}</div>
                     </div>
                     <div class="task__actions">
                        <button class="btn btn--icon btn--orange task__btn task__btn--edit" type="button" title="Редагувати"></button>
                        <button class="btn btn--icon btn--red task__btn task__btn--remove " type="button" title="Видалити"></button>
                     </div>
                  </div>
                  <div class="task__info">
                     <div class="task__category" title="${arr[i].title}"></div>
                     <div class="task__date">${showDeadLine(arr[i].date)}</div>
                  </div>
                  <button class="btn btn--icon btn--gray task__btn task__btn--archive" type="button" title="Архівувати/Вилучити"></button>
               </div>
            </li>`);
      
      if (arr[i].status === 'done') {
         const checkboxes = document.querySelectorAll('.checkbox-input');
         checkboxes[0].setAttribute('checked', '');
      };
      showFilter();
      showCounter();
      criateObjForFilter()
   };
};

// Функція, що генерує id:
function generId() {
   const idResult = Math.ceil(Math.random() * 100) + Math.ceil(Math.random() * 200);
   
   return idResult;
};


// Функція, що збирає дані для new task:
function getDataForTask() {
   const newId = generId();
   const arrData = [{}];

   // Перевіряємо чи всі  поля правильно заповнені:
   if (!(fieldsForm[0].parentElement.classList.contains('success')) ||
      !(fieldsForm[1].parentElement.classList.contains('success')) ||
      !(fieldsForm[2].parentElement.classList.contains('success'))) {
      
      for (let i = 0; i < fieldsForm.length; i++){
         if (!(fieldsForm[i].parentElement.classList.contains('success'))) {
            addArror(fieldsForm[i]);
            messageErr(fieldsForm[i], messages.requiredError);
            formFildMessag.classList.add('show');
         };
      };

   } else {
      arrData[0].id = `${newId}`;
      arrData[0].task = form.taskText.value;
      arrData[0].status = 'new';
      arrData[0].date = `${form.taskDate.value}T${form.taskTime.value}`;

      for (let i = 0; i < checkBoxes.length; i++){
         if (checkBoxes[i].checked === true) {
            arrData[0].value = `${checkBoxes[i].value}`;
            arrData[0].title = checkBoxes[i].nextElementSibling.textContent;
         };
      };

      for (let i = 0; i < fieldsForm.length; i++){
         fieldsForm[i].parentElement.classList.remove('success');
      };

      tasksArr.unshift(arrData[0]);
      addTask(arrData);
      showNotifi(`add-task`, notifMessages.addTask);
      addTaskToStorege(arrData);
      form.reset();
      console.log('true')
   };
};


// Функція що перевіряе текст задачі:
function checkText(target) {
   if (target.value === '') {
      addArror(target);
      messageErr(target, messages.requiredError);

   } else if (3 > target.value.length || target.value.length > 100) {
      addArror(target);
      messageErr(target, messages.textError);

   } else {
      removeArror(target);
      formFildMessag.classList.remove('show');
   };
};


// Функція, що перевіряе дату:
function checkDate(target) {
   const today = Date.now(0);
   const valueMlsec = Date.parse(target.value);
   const dateDiff = valueMlsec - today;
   const daysDiff = dateDiff / (24 * 3600 * 1000);
   const oneYear = 365 * 24 * 3600 * 1000;

   if (daysDiff <= -1) {
      messageErr(target, messages.dateErrorMore);
      addArror(target);
   } 
   else if (valueMlsec > (today + oneYear)) {
      messageErr(target, messages.dateErrorLess);
      addArror(target);
   } else if (target.value === '') {
      addArror(target);
      messageErr(target, messages.requiredError);
   } else {
      removeArror(target);
      form.taskTime.nextElementSibling.textContent = '';
      // Якщо ПОМІНЯЛИ дату, а час зостався saccess, перевіримо дату знову(не працюватиме без дати):
      checkTime(form.taskTime);
      formFildMessag.classList.remove('show');
   };
};


// Функція, що перевіряе час:
function checkTime(target) {
   const today = Date.now(0);
   if (form.taskDate.parentElement.classList.contains('success')) {
      const timePoint = Date.parse(`${form.taskDate.value}T${target.value}`);
      if (timePoint < (today + 1800000)) {
         addArror(target);
         messageErr(target, messages.timeError);
      } else if (target.value === '') {
         addArror(target);
         messageErr(target, messages.requiredError);
      } else {
         removeArror(target);
         formFildMessag.classList.remove('show');
      }
   } else {
      messageErr(target, messages.timeErrorForDate);
   };
};

// Функція, що додає повідомлення про помилку:
function messageErr(target, message) {
   target.nextElementSibling.textContent = message;
};

// Функція, що додає стилі помилки:
function addArror(target) {
   target.parentElement.classList.add('error');
   target.parentElement.classList.remove('success');
};

// Функція, що видаляє стилі та повідомлення помилки:
function removeArror(target) {
   target.parentElement.classList.remove('error');
   target.parentElement.classList.add('success');
   target.nextElementSibling.textContent = '';
};

// Якщо в localStorage є збережені дані task - відтворюємо їх при запуску браузера:
if (localStorage.tasks && localStorage.tasks.length > 0) {
   showFilter()
   filter();
};







