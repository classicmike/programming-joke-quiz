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

    todo.ToDoItem.prototype.toggleStatus = function() {
        if (this.status === todo.ToDoItem.STATUS_NOT_COMPLETE){
            this.status = todo.ToDoItem.STATUS_COMPLETE;
        } else {
            this.status = todo.ToDoItem.STATUS_NOT_COMPLETE;
        }
    }

    todo.ToDoItem.id = 0;

    todo.ToDoItem.STATUS_NOT_COMPLETE =  0;
    todo.ToDoItem.STATUS_COMPLETE = 1;
    todo.ToDoItem.ID_DATA_ATTRIBUTE = 'todoid';
    todo.ToDoItem.TODOLIST_LOCAL_STORAGE_KEY = 'todo-list';

    /***--------- TODO ITEM MODEL ------------ ***/

    /***--------- TODO LIST MODEL ------------ ***/

    todo.ToDoList = function(){
        this.items = this.retreiveFromLocalStorage() || [];
    };


    todo.ToDoList.prototype.addItem = function(toDoItem){
        this.items.push(toDoItem);
        this.saveToLocalStorage();
    };

    todo.ToDoList.prototype.toggleItemStatus = function(id) {
        var item = this.items[id];
        item.toggleStatus();
        this.saveToLocalStorage();
    };

    todo.ToDoList.prototype.saveToLocalStorage = function(){
        if (typeof localStorage === 'undefined') {
            return;
        }

        localStorage.setItem(todo.ToDoItem.LOCAL_STORAGE_KEY,
                             JSON.stringify(this.items));
    };


    todo.ToDoList.prototype.retreiveFromLocalStorage = function(){
        var storedItems = localStorage.getItem(todo.ToDoItem.LOCAL_STORAGE_KEY);
        if (!storedItems) {
            return null;
        }

        storedItems = JSON.parse(storedItems);

        var items = [];
        for(var i = 0; i < storedItems.length; i++){
            var item = storedItems[i];
            items.push(new todo.ToDoItem(item.name, item.status));
        }

        return items;
    };
    todo.ToDoItem.LOCAL_STORAGE_KEY = 'todo-list';

    /***--------- TODO LIST MODEL ------------ ***/


    /***--------- TODO LIST CONTROLLER ------------ ***/

    todo.ToDoListController = function(){
        this.list = new todo.ToDoList();
    };


    todo.ToDoListController.prototype.addItem = function(name){
        var item = new todo.ToDoItem(name);
        this.list.addItem(item);
        return item;
    };

    todo.ToDoListController.prototype.updateTaskStatus = function(id){
        this.list.toggleItemStatus(id);
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

            if (name.trim() == "") {
                return;
            }

            var toDoItem = this.controller.addItem(name);

            this.renderToDoItem(toDoItem);

            $input.val('').blur();
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
