(function(global){

    const MODULE_NAME = "PieceOfCake"

    const umd = function(factory){
        if (typeof exports === 'object') {
            return module.exports = factory();
        }
        else if (typeof define === 'function' && define.amd) {
            return define([], factory);
        }
        else {
            return global[MODULE_NAME] = factory();
        }
    }


    function registerController(name) {
        return function(target) {
            controllerClasses[name] = target
        }
    }

    class Controller {
        constructor(el) {
            this.el = el

            if (this.constructor.fields) {
                Object.keys(this.constructor.fields).forEach(key => {
                    const capitalizedKey = key[0].toUpperCase() + key.slice(1)
                    const fieldDefinition = this.constructor.fields[key]

                    Object.defineProperty(this, `_on${capitalizedKey}Changed`, {
                        value: [],
                        eumerable: false,
                    })
                    
                    Object.defineProperty(this, `on${capitalizedKey}Changed`, {
                        value: function(callback) {
                            this[`_on${capitalizedKey}Changed`].push(callback)
                        }
                    })
                    
                    if (fieldDefinition.onChange) {
                        fieldDefinition.onChange.forEach(func => {
                            if (typeof func === "function") {
                                this[`_on${capitalizedKey}Changed`].push(func)
                            } else if (typeof func === "string") {
                                this[`_on${capitalizedKey}Changed`].push(this[func].bind(this))
                            }
                        })
                    }

                    Object.defineProperty(this, key, {
                        get() {
                            return fieldDefinition.get
                                ? fieldDefinition.get.call(this)
                                : this["_" + key] || fieldDefinition.defaultValue
                        },
                        set(v) {
                            this["_" + key] = v
                            this[`_on${capitalizedKey}Changed`].forEach(cb => cb(v))
                            return fieldDefinition.set
                                ? fieldDefinition.set.call(this, v)
                                : void 0
                        }
                    })
                })
            }

            if (this.constructor.elements) {
                Object.keys(this.constructor.elements).forEach(key => {
                    const id = this.constructor.elements[key]
                    this[key] = this.findByDataID(id)
                })
            }

            if (typeof this.init === "function") {
                this.init()
            }
        } 

        find(selector) {
            return this.el.querySelector(selector)
        }

        findAll(selector) {
            return this.el.querySelectorAll(selector)
        }

        findByDataID(id) {
            return this.find(`[data-id=${id}]`)
        }

        findParentController(name) {
            return findController(this.el.parentElement, name)
        }
    }

    const controllerClasses = {}

    const controllers = {}

    function init(root) {
        Array.prototype.forEach.call((root || document).querySelectorAll("[data-controller]"), el => {
            const name = el.dataset.controller
            initializeController(name, el)
        })
    }

    function clean() {
        for (const name in controllers) {
            const { controller, el } = controllers[name]
            if (!document.body.contains(el)) {
                delete controllers[name].controller
                delete controllers[name].el
                delete controllers[name]
            }
        }
    }

    // TODO:    create and expose an 'clean' function that find alls controllers whose dom nodes aren't mounted anymore
    //          and destroys the controller

    function findControllerEl(el, controllerName) {
        return el.dataset.controller === controllerName
            ? el
            : (el.parentElement ? findControllerEl(el.parentElement, controllerName) : null)
    }

    function findControllerName(el) {
        return el.dataset.controller
            ? el.dataset.controller
            : (el.parentElement ? findControllerName(el.parentElement) : null)
    }
    
    function findController(el, exactName) {
       const name = exactName || findControllerName(el)
       if (!controllers[name]) {
            const controllerEl = findControllerEl(el, name)
            initializeController(name, el)
       }
        return controllers[name].controller
    }

    function initializeController(nameWithHash, el) {
        const name = nameWithHash.split("#")[0]
        if (!!controllers[nameWithHash]) {
            if (controllers[nameWithHash].el !== el) {
                console.warn(`Tried to reinit ${nameWithHash} with a different DOM element`)
            }
            return
        } else {
            const controller = new controllerClasses[name](el)
            controllers[nameWithHash] = { controller, el }
            // TODO:    create a mutation observer here to listen to unmount ot controller EL
            //          and to destroy the bound controller instance
            // const observer = new MutationObserver(mutations => {
            //     for (const mut of mutations) {
            //         if (Array.from(mut.removedNodes).indexOf(el) !== -1) {
            //             controllers = controllers.filter(c => c !== controller)
            //         }
            //     }
            // }).observe(el.parentElement, { subtree: true, childList: true })
    }   
    }
    
    function listenToEvent(eventName) {
        return function(event) {
            let target = event.target
            const boundEl = document.body
            
            do {
                const result = handle(event, eventName, target)
                if (result.stopPropagationCalled) {
                    break
                } 
                target = target.parentElement
            } while (target && target !== boundEl);
            
            event.stopPropagation()
        }
    }
    
    function handle(event, eventName, target) {
        const result = {
            stopPropagationCalled: false
        }

        if (typeof target.getAttribute !== "function") {
            return result
        }
        
        const methodAttribute = target.getAttribute(eventName)
        
        if (methodAttribute) {
            const controllerName = methodAttribute.split(".").length === 2 ? methodAttribute.split(".")[0] : null
            const methodWithArgs = methodAttribute.split(".").length === 2 ? methodAttribute.split(".")[1] : methodAttribute.split(".")[0]
            const method = methodWithArgs.split("(")[0]
            const args = /\(.*\)/.test(methodWithArgs) ? methodWithArgs.slice(methodWithArgs.indexOf("(") + 1, methodWithArgs.lastIndexOf(")")).split(",").map(a => a.trim()) : []
            const controller = findController(target, controllerName)
            
            if (controller) {
                const eventArg = {
                    target,
                    stopPropagation() {
                        result.stopPropagationCalled = true
                    }
                }
                controller[method].apply(controller, args.concat(eventArg))
            }
        }
        return result
    }

    for (let attribute in document) {
        if (attribute.indexOf("on") === 0) {
            const type = attribute.slice(2).toLowerCase()
            const onType = attribute
            document.addEventListener(type, listenToEvent(onType), true)
        }
    }

    // const eventTypes = Object.keys(document) [
    //     "click", "input", "change"
    // ]

    // eventTypes.forEach(function(type) {
    //     const onType = `on${type[0].toUpperCase()}${type.slice(1)}`
    //     document.addEventListener(type, listenToEvent(onType), true)
    // })

    document.addEventListener("DOMContentLoaded", function(event) {
       init()
    })
    


    umd(function() {
        return {
            init,
            clean,
            Controller,
            controllerClasses,
            registerController
        }
    })

})(this)
    