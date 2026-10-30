// src/types/async.d.ts
declare module 'async/queue' {
  import { type AsyncQueue } from 'async';

  const queue: AsyncQueue;

  export default queue;
}

declare module 'async/queue.js' {
  import { type AsyncQueue } from 'async';

  const queue: AsyncQueue;

  export default queue;
}
