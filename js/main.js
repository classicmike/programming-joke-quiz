(function($){
    var todo = {};

    // Joe's approach to object orientation with MVC

    /*** --------- TODO MODEL ------------ ***/

    todo.ToDoItem = function(name, status){
        this.status = status || todo.ToDoItem.STATUS_NOT_COMPLETE;
        this.name = name;
        this.id = todo.ToDoItem.id;
        todo.ToDoItem.id++;
    };

    todo.ToDoItem.id = 0;

    todo.ToDoItem.STATUS_NOT_COMPLETE =  0;
    todo.ToDoItem.STATUS_COMPLETE = 1;
    todo.ToDoItem.ID_DATA_ATTRIBUTE = 'todoid';
    todo.ToDoItem.TODOLIST_LOCAL_STORAGE_KEY = 'todo-list';

    /***--------- TODO ITEM MODEL ------------ ***/

    /***--------- TODO LIST MODEL ------------ ***/

    todo.ToDoList = function(){
        this.items = this.getAll();
    };


    todo.ToDoList.prototype.saveAll = function(){
        if(typeof localStorage !== 'undefined'){
            localStorage.setItem(todo.ToDoItem.TODOLIST_LOCAL_STORAGE_KEY, JSON.stringify(this.items));
        }
    };

    todo.ToDoList.prototype.addItem = function(toDoItem){
      this.items.push(toDoItem);
    };

    todo.ToDoList.prototype.getAll = function(){
        if(localStorage.getItem(todo.ToDoItem.TODOLIST_LOCAL_STORAGE_KEY) === null){
            return [];
        } else {

            var todoItems = [];
            var localStorageTodoItems = JSON.parse(localStorage.getItem(todo.ToDoItem.TODOLIST_LOCAL_STORAGE_KEY));

            for(var i = 0; i < localStorageTodoItems.length; i++){
                todoItems.push(new todo.ToDoItem(localStorageTodoItems[i].name, localStorageTodoItems[i].status));
            }

            return todoItems;
        }
    };

    /***--------- TODO LIST MODEL ------------ ***/


    /***--------- TODO LIST CONTROLLER ------------ ***/

    todo.ToDoListController = function(){
        this.list = new todo.ToDoList();
    };


    todo.ToDoListController.prototype.updateTodoItemsInStorage = function(){
        this.list.saveAll(this.list);
    };


    todo.ToDoListController.prototype.addItem = function(name){
        var item = new todo.ToDoItem(name);
        this.list.addItem(item);

        this.updateTodoItemsInStorage();

        return item;
    };

    todo.ToDoListController.prototype.updateTaskStatus = function(id){
        var todoItem = this.list.items[id];

        //check the to do item
        if(todoItem.status === todo.ToDoItem.STATUS_NOT_COMPLETE){
            todoItem.status = todo.ToDoItem.STATUS_COMPLETE;
        } else {
            todoItem.status = todo.ToDoItem.STATUS_NOT_COMPLETE;
        }

        this.updateTodoItemsInStorage();
    }

    /***--------- TODO LIST CONTROLLER ------------ ***/

    /***--------- TODO LIST VIEW ------------ ***/

    todo.ToDoListView = function(controller){
        this.happyListsTopSelector = $('#' + todo.ToDoListView.HAPPY_LIST_ITEMS_ID);
        this.happyListCreateSelector = this.happyListsTopSelector.find('#' + todo.ToDoListView.HAPPY_LIST_CREATE_ID);
        this.controller = controller || null;
        this.setEvents();
        this.displayToDoList();
    };

    todo.ToDoListView.prototype.renderToDoItem = function(toDoItem){

        var checkedAttribute = toDoItem.status === 1 ? ' checked="checked"': '';

        var $html = $('<div class="list-group-item happy-list-item">' +
            '<div class="checkbox checkbox-circle">' +
                '<input type="checkbox" id="happy-list-item-check-' + toDoItem.id + '" data-todoid="' + toDoItem.id + '"' + checkedAttribute + '>' +
                    '<label for="happy-list-item-check-' + toDoItem.id + '" class="h4 list-group-item-heading happy-list-item-heading">' +
                    toDoItem.name +
                    '</label>' +
                '</div>' +
            '</div>');

        $html.insertBefore(this.happyListCreateSelector);
    };

    todo.ToDoListView.prototype.scrollToCreateSelector = function(){
        this.scrollToPosition(this.happyListCreateSelector.offset().top);
        this.happyListCreateSelector.find('input[type="text"]').val('').focus();
    };

    todo.ToDoListView.prototype.scrollToPosition = function(position){
        $('html,body').animate({'scrollTop': position}, 'slow', 'swing');
    };

    todo.ToDoListView.prototype.setEvents = function(){
        $('body')
            .on('change', '.happy-list-item input[type="checkbox"]', this.onCheckboxChange.bind(this))
            .on('keyup', '.happy-list-item input[type="text"]', this.onTaskInputKeyUp.bind(this))
            .on('click', '.add-happy-list-item', this.addHappyListItemClick.bind(this));
    };

    todo.ToDoListView.prototype.onCheckboxChange = function(event){
        var $checkbox = $(event.target);
        this.controller.updateTaskStatus(parseInt($checkbox.data(todo.ToDoItem.ID_DATA_ATTRIBUTE)));
    };

    todo.ToDoListView.prototype.displayToDoList = function(){
        for(var i = 0; i < this.controller.list.items.length; i++){
            var item = this.controller.list.items[i];
            this.renderToDoItem(item);
        }
    };


    todo.ToDoListView.prototype.onTaskInputKeyUp = function(event){
        var $input = $(event.target);

        if(event.which === todo.ToDoListView.ENTER_KEY_CODE){
            var name = $input.val();

            if(typeof name !== 'undefined' && typeof name === 'string' && name.replace(/ /g, '').length){
                var toDoItem = this.controller.addItem(name);

                this.renderToDoItem(toDoItem);

                $input.val('').blur();
            }

        }

    };

    todo.ToDoListView.prototype.addHappyListItemClick = function(event){
        event.preventDefault();
        this.scrollToCreateSelector();
    };

    todo.ToDoListView.ENTER_KEY_CODE = 13;
    todo.ToDoListView.HAPPY_LIST_CREATE_ID = 'happy-list-create';
    todo.ToDoListView.HAPPY_LIST_ITEMS_ID = 'happy-list-items';

    /***--------- TODO LIST VIEW ------------ ***/

    


    $(document).ready(function(){
        //
        var toDoController = new todo.ToDoListController();
        var toDoListView = new todo.ToDoListView(toDoController);

    });

})(jQuery)

//set events to the view