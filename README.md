# PieceOfCake

*JavaScript like it should be*

## Install

`npm install piece-of-cake`

or just include a script tag, like

`<script src="https://unpkg.com/piece-of-cacke"></script>`

1. Define your html like ever:

```html
<body>
    <input placeholder="what to to next?"/>
    <button onclick="addTodo" disabled>Add</button>
    <ul><!-- todo entries shall go here --></ul>

    <script>
        // functions like 'addTodo' and 'onChangeFilter' go here
    </script>
</body>
```

2. Extract your event handling functions into there own scope, where they belong:

```js
class MyControllerClass {

     addTodo() {
        const input = document.getElementsByTagName("input")[0]
        const list = document.getElementsByTagName("ul")[0]
        const value = input.value        
        const li = document.createElement("li")
        li.innerText = value
        list.apendChild(li)        
    }
    
}
```

3. Extend the PieceOfCake Controller to get access to some useful helper methods (this is optional)

```js
class MyControllerClass extends PieceOfCake.Controller {
    //...
}
```


4. Simplify bindings to dom elements you need to access in your event handlers

```html
    <input placeholder="what to to next?"/>
    <button onclick="addTodo" disabled>Add</button>
    <ul data-id="todolist">
        <!-- use a standard data tag here. Nothing special. No Side-effects -->
    </ul>
```

```js
class MyControllerClass extends {

    get input() {
        return this.find("input")
    }

    get list() {
        return this.findByDataID("todolist")
    }

    addTodo() {
       // ...
    }
    
}
```

5. Store your state in its own field, where it belongs:

```js
class MyControllerClass extends {

    get todos() {
        return this._todos || [] // 'this._todos' is a kind of backing field. Nothing special. Just JavaScript
    }

    set todos(value) {
        this._todos = value
    }

    addTodo() {
       // ...
       this.todos = [this.todos, text]
       // ... update todo <ul>
    }
    
}
```

6. Connect your rendering logic to methods that update your state to keep your controller clean

```js
class MyControllerClass extends {

    set todos(value) {
        this._todos = value
        this._renderTodos()
    }

    addTodo() {
       this.todos = [this.todos, text]
    }

    _renderTodos() {
        this.list.innerHTML = ""
        this.todos.forEach(text => {
            const li = document.createElement("li")
            li.innerText(text)
            this.list.appendChild(li)
        })
    }
    
}
```

7. Make your controller class visible to the library and connect it to a specific sub-tree of your dom it should control

```js
PieceOfCake.controllerClasses.push(MyControllerClass)
```

```html
    <body data-controller="MyControllerClass">
        <!-- Nothing special with the data-attribute. But you must call it 'conrtoller', otherweise the library won't find it-- >
    </body>
```

8. Use optional field and element binding shorthands in your controller

```js
class MyControllerClass extends {
    static elements = {
        input: "input",     // this will bind 'this.input' to an element w/ data-id="input"
        list: "todolist"
    }

    static fields = {
        todos: {                    // this will create a getter and setter for the field 'todos'
            defaultValue: [],       // it creates a backing field w/ default Value []
            set(value) {            // define custom behavour after the backing field was updated here
                this._renderTodos
            }
        }
    }
}
```

## Example

Just look at the [src/app.js](basic) and [src/multiple.js](advanced) to get an idea of how things work.