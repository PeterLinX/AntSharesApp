type EventHandler<T> = (sender: Object, args: T) => void;

class __event<T>
{
    private handlers = new Array<EventHandler<T>>();

    constructor(private sender: Object) { }

    public addEventListener(handler: EventHandler<T>): void
    {
        this.handlers.push(handler);
    }

    public dispatchEvent(args: T): void
    {
        for (let i = 0; i < this.handlers.length; i++)
            this.handlers[i](this.sender, args);
    }

    public removeEventListener(handler: EventHandler<T>): void
    {
        for (let i = 0; i < this.handlers.length; i++)
            if (this.handlers[i] === handler)
            {
                this.handlers.splice(i, 1);
                return;
            }
    }
}
