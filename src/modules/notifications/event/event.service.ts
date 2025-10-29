import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloadMap, EventType } from '../types/event';
// import { EventPayloadMap, EventType } from 'src/modules/interface/event';

@Injectable()
export class EventTypeService {
  constructor(private eventEmitter: EventEmitter2) {}

  // Type-safe emit method
  emit<T extends EventType>(event: T, payload: EventPayloadMap[T]): boolean {
    return this.eventEmitter.emit(event, payload);
  }
}
