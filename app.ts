/**
 * Simple Pub-Sub Design Pattern
 *
 * Code by ARSANANDHA.XYZ
 *
 * references tutorial and guideline from : https://www.youtube.com/watch?v=f3Cn0CGytSQ
 * references tutorial and guideline from : https://dev.to/jucian0/pub-sub-pattern-a-brief-explanation-21ed
 *
 * :bow-down: :bow-down: :bow-down:
 */

// interfaces
interface IEvent {
  type(): string;
  machineId(): string;
}

interface ISubscriber {
  handle(event: IEvent): void;
}

interface IPublishSubscribeService {
  // change signature to array for support firing low stock & stock status events
  publish (event: IEvent[]): void;
  subscribe (type: string, handler: ISubscriber): void;
  // unsubscribe by use type for unsubscribe whole type
  unsubscribe (type: string): void;
}

class PubSubService implements IPublishSubscribeService {
  // add subscribers as Array<IEvent>
  private subscribers: Array<IEvent>;

  constructor() {
    // initialize subscribers as new Array<IEvent>
    this.subscribers = new Array<IEvent>();
  }

  publish(event: IEvent[]) {
    // iterate event from arg(event) for push events into subscribers array
    event.forEach((evt: IEvent) => {
      this.subscribers.push(evt);
    })
  }

  subscribe(type: string, handler: ISubscriber): void {
    // iterate each subscriber and comparison for same type event to correct true function for proper function calling
    this.subscribers.forEach((event: IEvent) => {
      if (event.type() == type) {
        handler.handle(event);
      }
    })
  }

  unsubscribe(type: string): void {
    // use args(type) for unsubscribe events by use filter to filtering array not in args(type) into subscribers
    this.subscribers = this.subscribers.filter((data: IEvent) => data.type() != type)
  }
}

class LowStockWarningEvent implements IEvent {
  // same as another IEvent Interface for proper calling and implementation
  constructor(private readonly _quantity: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  // checkStock() by if less than 3 will return true;
  lowStock(): boolean {
    return this._quantity < 3;
  }

  type(): string {
    return 'check';
  }
}

class StockLevelOkEvent implements IEvent {
  // same as another IEvent Interface for proper calling and implementation
  constructor(private readonly _quantity: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  // checkStock() by if less than 3 will return true;
  checkStock(): boolean {
    return this._quantity >= 3;
  }

  type(): string {
    return 'check';
  }
}


// implementations
class MachineSaleEvent implements IEvent {
  constructor(private readonly _sold: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  getSoldQuantity(): number {
    return this._sold;
  }

  type(): string {
    return 'sale';
  }
}

class MachineRefillEvent implements IEvent {
  constructor(private readonly _refill: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  // implements getRefillQuantity same as "getSoldQuantity()"
  getRefillQuantity(): number {
    return this._refill;
  }

  // add "refill" string same as "sold"
  type(): string {
    return "refill";
  }
}

class MachineSaleSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor (machines: Machine[]) {
    this.machines = machines;
  }

  // add console.log() for visualize process and data
  handle(event: MachineSaleEvent): void {
    this.machines[2].stockLevel -= event.getSoldQuantity();
    console.log(`Sold at Machine ${event.machineId()} to ${this.machines[2].stockLevel} by ${event.getSoldQuantity()}`);
  }
}

class MachineRefillSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor (machines: Machine[]) {
    this.machines = machines;
  }

  // add console.log() for visualize process and data
  handle(event: MachineRefillEvent): void {
    this.machines[2].stockLevel += event.getRefillQuantity();
    console.log(`Refill at Machine ${event.machineId()} from ${event.getRefillQuantity()} to ${this.machines[2].stockLevel}`);
  }
}

// StockWarningSubscriber for Subscribe a Sales / Refill Event for Observe Stocks and Warning via console.log()
class StockWarningSubscriber implements ISubscriber {
  public machines: Machine[];

  // check both stock,warning use object to store
  protected fired: {
    stock: boolean;
    warning: boolean;
  };

  constructor (machines: Machine[]) {
    this.machines = machines;
    this.fired = {
      stock: false,
      warning: false,
    };
  }

  // handle(event: StockLevelOkEvent or LowStockWarningEvent) for decision between incoming events for different warning and different one time firing notification
  handle(event: StockLevelOkEvent | LowStockWarningEvent): void {
    if (event instanceof LowStockWarningEvent && event.lowStock() && !this.fired.warning) {
      console.log(`Now Stock of ${event.machineId()} is Low !`);
      this.fired.warning = true;
    }
    if (event instanceof StockLevelOkEvent && event.checkStock() && !this.fired.stock){
      console.log(`Now Stock of ${event.machineId()} is OK !`);
      this.fired.stock = true;
    }
  }
}


// objects
class Machine {
  public stockLevel = 10;
  public id: string;

  constructor (id: string) {
    this.id = id;
  }
}


// helpers
const randomMachine = (): string => {
  const random = Math.random() * 3;
  if (random < 1) {
    return '001';
  } else if (random < 2) {
    return '002';
  }
  return '003';

}

const eventGenerator = (): IEvent[] => {
  const random = Math.random();
  let rd = randomMachine();
  if (random < 0.5) {
    const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    // add StockLevelOkEvent and LowStockWarningEvent for Add Both of (StockLevelOk/LowStockWarning) Events for Observation
    return [new MachineSaleEvent(saleQty, rd), new StockLevelOkEvent(saleQty, rd), new LowStockWarningEvent(saleQty, rd)];
  } 
  const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
  // add StockLevelOkEvent and LowStockWarningEvent for Add Both of (StockLevelOk/LowStockWarning) Events for Observation
  return [new MachineRefillEvent(refillQty, rd), new StockLevelOkEvent(refillQty, rd), new LowStockWarningEvent(refillQty, rd)];
}


// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [ new Machine('001'), new Machine('002'), new Machine('003') ];

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machines);
  // add MachineRefillSubscriber for Add Machine Refill
  const refillSubscriber = new MachineRefillSubscriber(machines);
  // add StockWarningSubscriber for Add Stock Warning
  const stockCheckerSubscriber = new StockWarningSubscriber(machines);

  // create the PubSub service
  const pubSubService: PubSubService = new PubSubService(); // implement and fix this

  // create 5 random events
  const events = [1,2,3,4,5].map(i => eventGenerator());

  // publish the events
  events.map((data) => {
    pubSubService.publish(data);
  });

  // Subscribe Sales Event
  pubSubService.subscribe('sale',saleSubscriber);
  // Subscribe Check Event
  pubSubService.subscribe('check', stockCheckerSubscriber);
  // Unsubscribe Sales Event
  pubSubService.unsubscribe('sale');
  // Subscribe Refill Event
  pubSubService.subscribe('refill',refillSubscriber);
  // Unsubscribe Refill Event
  pubSubService.unsubscribe('refill');
  // Unsubscribe Check Event
  pubSubService.unsubscribe('check');
})();
