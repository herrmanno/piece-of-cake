/**
 * Handles 'aplication wide' state
 */
@PieceOfCake.registerController("TodoController")
class extends PieceOfCake.Controller {

    static fields = {
        filter: { defaultValue: "all" },
        todos: { defaultValue: [] },
    }

    addTodo(value) {
        const todo = {
            text: value,
            done: false
        }
        this.todos = [...this.todos, todo]
    }

    toggle(idx) {
        this.todos = this.todos.map((todo, i) => ({...todo, done: +idx === i ? !todo.done : todo.done}))
    }

    onChangeFilter(type) {
        this.filter = type
    }
}

/**
 * Manages the input and the add button
 */
@PieceOfCake.registerController("TodoInputController")
class extends PieceOfCake.Controller {
    
    static elements = {
        input: "input",
        button: "add-button",
    }

    static fields = {
        value: {
            set(value) {
                this.input.value = value
                this.button.disabled = !value
            }
        }
    }

    onChangeValue(e) {
        this.value = e.target.value
    }

    onAddTodo(e) {
        this.findParentController("TodoController").addTodo(this.input.value)
        this.value = ""
    }
}

/**
 * Manages the List of todos
 */
@PieceOfCake.registerController("TodoListController")
class extends PieceOfCake.Controller {
    
    static elements = {
        todoList: "todolist",
    }

    constructor(el) {
        super(el)
        this.findParentController("TodoController").onTodosChanged(this._renderTodos.bind(this))
        this.findParentController("TodoController").onFilterChanged(this._renderTodos.bind(this))
    }

    _renderTodos() {
        const {
            todos,
            filter,
        } = this.findParentController("TodoController")
        const list = this.todoList
        
        list.innerHTML = ""
        todos.filter(todo => {
            return filter === "all" || (todo.done == (filter == "done"))
        })
        .forEach((todo, idx) => {
            const todoEl = document.createElement("li")
            todoEl.innerText = todo.text
            todoEl.style.textDecoration = todo.done ? "line-through" : null
            todoEl.setAttribute("onClick", `TodoController.toggle(${idx})`)
            list.appendChild(todoEl)
        })
    }
}

/**
 * Manages the filter buttons
 */
@PieceOfCake.registerController("TodoFilterController")
class extends PieceOfCake.Controller {
    
    get filterButtons() {
        return ["all", "done", "notdone"].map(type => this.findByDataID(`${type}-button`))
    }


    constructor(el) {
        super(el)
        this.findParentController("TodoController").onFilterChanged(this._updateFilterButtonStates.bind(this))
    }

     _updateFilterButtonStates() {
        const { filter } = this.findParentController("TodoController")
        this.filterButtons.forEach(button => {
            button.disabled = button.dataset.id.indexOf(filter) === 0
        })
    }

}