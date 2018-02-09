declare module "piece-of-cake" {
    class Controller {
        static elements?: {[key: string]: string}
        
        static fields?: {
            [key: string]: {
                defaultValue?: any
                onChange?: Array<string | Function>
                get?(): any
                set?(value: any): any
            }
        }

        init?(): any

        find(selector: string): Element | null

        find(selector: string): NodeList | null

        findByDataID(id: string): Element | null
    }
    
    const PieceOfCake: {
        controllerClasses: any[],
        registerController: ClassDecorator,
        Controller: Controller,
        init(root?: Element): any,
        clean(): any
    }
    
    export = PieceOfCake
}