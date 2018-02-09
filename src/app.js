@PieceOfCake.registerController("TodoController") // shorthand for PieceOfCake.controllerClasses.push(MyControllerClass)
class MyControllerClass extends PieceOfCake.Controller {
    
    /************************
            elements
    *************************/

    // shorthand notation for elements that have an data-id attribute
    static elements = {
        input: "input",
        button: "add-button", // access the element  <button data-id=add-button .../> by this.button
        todoList: "todolist",
    }

    get filterButtons() {
        return ["all", "done", "notdone"].map(type => this.findByDataID(`${type}-button`))
    }


    /************************
            fields
    *************************/

    // shorthand syntax for a getter / setter combination w/ backing field and default value
    static fields = {
        filter: {
            defaultValue: "all",
            // get() {}
            set(v) {
                this._updateFilterButtonStates()
                this._renderTodos()
            }
        },
        todos: {
            defaultValue: [],
            set() {
                this._renderTodos()
            }
        }
    }

    get value() {
        return this.input.value
    }

    set value(value) {
        this.input.value = value
        this.button.disabled = !value
    }

    /************************
            handlers
    *************************/

    addTodo() {
        const todo = {
            text: this.input.value,
            done: false
        }
        this.todos = this.todos.concat(todo)
        this.value = ""
    }

    onChangeValue(e) {
        this.value = e.target.value
    }

    toggle(idx) {
        this.todos = this.todos.map((todo, i) => ({...todo, done: +idx === i ? !todo.done : todo.done}))
    }

    onChangeFilter(type) {
        this.filter = type
    }


     /************************
            rendering
     *************************/

     _updateFilterButtonStates() {
        this.filterButtons.forEach(button => {
            button.disabled = button.dataset.id.indexOf(this.filter) === 0
        })
    }

    _renderTodos() {
        const list = this.todoList
        list.innerHTML = ""
        this._todos
        .filter(todo => {
            return this.filter === "all" || (todo.done == (this.filter == "done"))
        })
        .forEach((todo, idx) => {
            const todoEl = document.createElement("li")
            todoEl.innerText = todo.text
            todoEl.style.textDecoration = todo.done ? "line-through" : null
            todoEl.setAttribute("onClick", `toggle(${idx})`)
            
            list.appendChild(todoEl)
        })
    }

}
