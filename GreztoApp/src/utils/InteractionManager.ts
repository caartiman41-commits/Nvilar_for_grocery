/**
 * InteractionManager for Modern React Native (0.87+)
 * Provides the classic runAfterInteractions API using requestIdleCallback / requestAnimationFrame
 * to defer heavy rendering tasks until native screen transitions complete.
 */

export interface InteractionTask {
  cancel: () => void;
}

export const InteractionManager = {
  runAfterInteractions: (task: () => void, timeoutMs: number = 240): InteractionTask => {
    let cancelled = false;

    // Use requestIdleCallback if supported by the Hermes JS engine, otherwise fallback to timer
    const g = globalThis as any;
    const hasIdle = typeof g.requestIdleCallback === 'function';

    const handle = hasIdle
      ? g.requestIdleCallback(
          () => {
            if (!cancelled) {
              task();
            }
          },
          { timeout: timeoutMs }
        )
      : setTimeout(() => {
          if (!cancelled) {
            task();
          }
        }, timeoutMs);

    return {
      cancel: () => {
        cancelled = true;
        if (hasIdle && typeof g.cancelIdleCallback === 'function') {
          try {
            g.cancelIdleCallback(handle);
          } catch {
            clearTimeout(handle);
          }
        } else {
          clearTimeout(handle as any);
        }
      },
    };
  },
};

export default InteractionManager;
