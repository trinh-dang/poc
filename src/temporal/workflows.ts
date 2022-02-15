/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { proxyActivities, defineSignal, setHandler, sleep } from '@temporalio/workflow';
import { SignalDefinition } from '@temporalio/common';
import type * as activities from './activities';
import { ApplicationFailure } from '@temporalio/workflow';
import { Specification } from '@severlessworkflow/sdk-typescript';
import * as _ from 'lodash';

export const approveSignal: SignalDefinition = defineSignal('approve');
export const rejectSignal: SignalDefinition = defineSignal('reject');

const { approveStatement, rejectStatement } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

const getFirstByName = (states: Specification.States, name: string) =>
  _.chain(states)
    .filter((x) => x.name === name)
    .first()
    .value();

const getFirstByCondition = (states: any[], condition: string) =>
  _.chain(states)
    .filter((x) => x.condition === condition)
    .first()
    .value();

const getActivity = (state: string) => {
  switch (state) {
    case 'ApproveStatement':
      return approveStatement;
    case 'RejectStatement':
      return rejectStatement;
    default:
      throw ApplicationFailure.nonRetryable(`${state} not supported`);
  }
};

export async function approvalWorkflow(args: { workflowDsl: Specification.Workflow }) {
  const { start, states } = args.workflowDsl;

  let current: any = getFirstByName(states, start!.toString());
  let end = false;
  let result;

  while (!end) {
    console.log('current', current.name);

    if (current.type === 'event') {
      current = getFirstByName(states, current.transition);
      continue;
    }

    if (current.type === 'switch') {
      const isApproved = await new Promise((resolve, reject) => {
        setHandler(approveSignal, () => resolve(true));
        setHandler(rejectSignal, () => resolve(false));
        sleep('60 minutes').then(() => resolve(false), reject);
      });

      const conditions = _.get(current, 'dataConditions');
      const approved = getFirstByCondition(conditions, 'approved');
      const rejected = getFirstByCondition(conditions, 'rejected');

      current = getFirstByName(states, isApproved ? approved.transition : rejected.transition);
      continue;
    }

    if (current.type === 'operation') {
      const activity = getActivity(current.name);
      result = await activity();

      if (!current.end) {
        current = getFirstByName(states, current.transition.toString());
        continue;
      }

      end = true;
      continue;
    }
  }

  if (result === undefined) {
    throw ApplicationFailure.nonRetryable(`no result outcome`);
  }

  return result;
}
