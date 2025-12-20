export type DomainEvent<TPayload extends Record<string, any>> = {
    name: string;
    occurredAt: Date;
    payload: TPayload;
  };
  