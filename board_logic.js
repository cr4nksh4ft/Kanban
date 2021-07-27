
function createId(){
  //Creates a unique id for task based on current date & time
  const date = new Date();
  const elements = [date.getFullYear().toString(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds()]
  ID = elements.reduce((acc,currVal)=>acc+currVal);
  return ID;
}

function actionHandler(e){
  //Determines nature of action and delegates accordingly
  op_context = (e.target.parentElement).parentElement;
  action = e.target.getAttribute('name');

  switch(action){
    case 'add': addHandler(op_context);
                break;
    case 'edit':targ = e.target;
                editHandler(op_context,targ);
                break;
    case 'change':targ = e.target;
                  changeHandler(op_context,targ);
                  break; 
    case 'delete':targ = e.target;
                  deleteHandler(targ);
                  break;
  }
}


function changeHandler(op_context,targ){
  //Transfers
  //Pending task->In progress task
  //In progress task->Completed task
  Tasks = JSON.parse(localStorage.getItem('Tasks'));
  context = op_context.id;
  ID = targ.parentElement.id;
  content = Tasks[`${context}`][`${ID}`];
  
  if(context === "pending_container"){
    Tasks["inprogress_container"][`${ID}`] = content;
  }
  else{
    Tasks["completed_container"][`${ID}`] = content;
  }
  delete Tasks[`${context}`][`${ID}`];
  localStorage.setItem("Tasks",JSON.stringify(Tasks));
  location.reload();
}


function animationend_handler(e){
  //Turns off null input reject animation
  console.log("Animation end detected");
  e.target.classList.remove('task');
}


function addHandler(op_context, task_value=null, task_id=null, autosave=false){
  //Adds task
  task = document.createElement('div')
  task.className = 'task_inp';
  task.id =  task_id||createId();
  task_data = document.createElement('textarea');
  task_data.value = task_value;
  task_data.addEventListener('animationend',animationend_handler);
  task_data.disabled = false;

  save_button = document.createElement('button');
  save_button.classList.add("actions","save_button");
  save_button.name = "edit";
  name1 = document.createTextNode("✔");

  delete_button = document.createElement('button');
  delete_button.classList.add("actions","delete_button");
  delete_button.name = "delete";
  name2 = document.createTextNode('🗑');

  save_button.appendChild(name1)
  delete_button.appendChild(name2)

  save_button.addEventListener('click',actionHandler);
  delete_button.addEventListener('click',actionHandler);
  
  task.appendChild(task_data)
  task.appendChild(save_button)
  task.appendChild(delete_button)
  
  if(op_context.id !== "completed_container"){

    status_change_button = document.createElement('button');
    status_change_button.classList.add("actions","change_button");
    status_change_button.name = "change";
    
    name3 = document.createTextNode('➡');
    status_change_button.appendChild(name3);
    status_change_button.addEventListener('click',actionHandler);
    //hides the button 
    status_change_button.style.display = 'none';

    task.appendChild(status_change_button);
  }
  op_context.appendChild(task);

  //Click the 'save' button if task is being loaded from localStorage. 
  if(autosave){
    btn = document.getElementById(`${task_id}`).childNodes[1];
    btn.click();
   }
}


function editHandler(op_context,targ){
  //Edits a task
  if(targ.innerHTML == "✏"){

    targ.parentElement.lastChild.style.display = 'none';
    paragraph = targ.previousElementSibling;
    text = paragraph.innerText;
    task_data = document.createElement('textarea');
    //show innerText as default in textarea
    task_data.value = `${text}`;
    task_data.addEventListener('animationend',animationend_handler);
    targ.innerHTML = "✔";
    targ.previousElementSibling.disabled = false;
    targ.parentElement.replaceChild(task_data, paragraph);
  }
  else{
    
    Tasks = JSON.parse(localStorage.getItem('Tasks'));
    curr_div = targ.parentElement;
    ID = curr_div.id;
    context = curr_div.parentElement.id;

    text_area = targ.previousElementSibling;
    inp = text_area.value;
    if(!inp){
      //Attach null input reject animation
      text_area.classList.add("task");
      return;
    }
    //makes change state button visible
    targ.parentElement.lastChild.style.display = 'unset';

    task_detail = document.createElement('p')
    task_detail.className = "task_detail";
    content = document.createTextNode(`${inp}`);
    task_detail.appendChild(content);
  
    targ.previousElementSibling.disabled = true;
    targ.parentElement.replaceChild(task_detail, targ.previousElementSibling);
    Tasks[`${context}`][`${ID}`] = inp;
    localStorage.setItem("Tasks",JSON.stringify(Tasks));
    targ.innerHTML = "✏";
  }
}


function deleteHandler(targ){
  //Deletes a task
  taskdiv = targ.parentElement;
  context = taskdiv.parentElement.id;
  ID = taskdiv.id;
  taskdiv.remove();
  Tasks = JSON.parse(localStorage.getItem('Tasks'));
  delete Tasks[`${context}`][`${ID}`];
  localStorage.setItem("Tasks",JSON.stringify(Tasks));
}


window.onload = function(){
  //Catches 'onload' and sets up things
  if(!localStorage.Tasks){
    //Create a nested object
    var Tasks = {
      pending_container:{
    
      },
      inprogress_container:{
        
      },
      completed_container:{

      }
    }
    localStorage.setItem("Tasks",JSON.stringify(Tasks));
  }
  else{
    //load stored tasks
    var Tasks = JSON.parse(localStorage.getItem('Tasks'));
    for(let container in Tasks){
      let task_context = document.getElementById(`${container}`);
      let curr_container = Tasks[`${container}`];
      for (let y in curr_container){
        let task_content = curr_container[`${y}`];
        addHandler(task_context,task_content,y.toString(),true);
      }
    }
  }
  //attach event listeners
  buttons = document.getElementsByClassName('actions')
  Array.from(buttons).forEach(button=>{
    button.addEventListener('click',actionHandler)
  })
}