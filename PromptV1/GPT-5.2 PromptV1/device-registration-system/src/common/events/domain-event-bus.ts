import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { DomainEvent } from './domain-event';

/**
 * 요구사항의 "이벤트 알림(추상)"을 만족하기 위한 in-process 이벤트 버스.
 * 추후 Kafka/RabbitMQ/Outbox로 교체 가능하도록 최소 인터페이스로 구현.
 */
@Injectable()
export class DomainEventBus {
  private readonly emitter = new EventEmitter();

  publish<T extends Record<string, any>>(event: DomainEvent<T>): void {
    this.emitter.emit(event.name, event);
  }

  on<T extends Record<string, any>>(name: string, handler: (event: DomainEvent<T>) => void): void {
    this.emitter.on(name, handler);
  }
}
