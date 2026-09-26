import { store } from '../mock/store.js';

export let FAIL_NEXT = false;

export async function mockCall(resolver, { delay = 400 } = {}) {
  const waitMs = typeof delay === 'number' ? delay : 400;
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  if (FAIL_NEXT) {
    FAIL_NEXT = false;
    throw new Error('Mock client error: FAIL_NEXT triggered');
  }

  const raw = typeof resolver === 'function' ? resolver(store) : store;
  if (raw === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(raw));
}
