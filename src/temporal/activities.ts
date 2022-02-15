/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Logger } from '@nestjs/common';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function approveStatement(): Promise<boolean> {
  new Logger(approveStatement.name).log('Approve Statement');

  // simulate 500 ms "work"
  await delay(500);

  return true;
}

export async function rejectStatement(): Promise<boolean> {
  new Logger(rejectStatement.name).log('Reject Statement');

  // simulate 500 ms "work"
  await delay(500);

  return false;
}
