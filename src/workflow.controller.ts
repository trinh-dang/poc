/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Connection, WorkflowClient } from '@temporalio/client';
import { approvalWorkflow, approveSignal, rejectSignal } from './temporal/workflows';

const connection = new Connection({
  // // Connect to localhost with default ConnectionOptions.
  // // In production, pass options to the Connection constructor to configure TLS and other settings:
  // address: 'foo.bar.tmprl.cloud', // as provisioned
  // tls: {} // as provisioned
});

const client = new WorkflowClient(connection.service, {
  // namespace: 'default', // change if you have a different namespace
});

@Controller('workflow')
export class WorkflowController {
  private logger: Logger = new Logger(WorkflowController.name);

  @Post('/execute')
  async configure(@Body() workflowDsl: any) {
    this.logger.log({ workflowDsl }, 'workflowDsl');

    const handle = await client.start(approvalWorkflow, {
      args: [{ workflowDsl }], // type inference works! args: [name: string]
      taskQueue: 'sw-taskQueue',
      // in practice, use a meaningful business id, eg customerId or transactionId
      workflowId: `wf-${nanoid()}`,
    });
    return { workflowId: handle.workflowId, runId: handle.originalRunId };
  }

  @Post('/approve')
  async approve(@Body() { workflowId, runId }: { workflowId: string, runId: string }) {
    const handle = client.getHandle(workflowId, runId);
    await handle.signal(approveSignal);

    const { workflowExecutionInfo } = await handle.describe();
    return workflowExecutionInfo;
  }

  @Post('/reject')
  async reject(@Body() { workflowId, runId }: { workflowId: string, runId: string }) {
    const handle = client.getHandle(workflowId, runId);
    await handle.signal(rejectSignal);

    const { workflowExecutionInfo } = await handle.describe();
    return workflowExecutionInfo;
  }

  @Get('/:workflowId/:runId')
  async getWorkflow(@Param() { workflowId, runId }: { workflowId: string, runId: string }) {
    const handle = client.getHandle(workflowId, runId);
    const result = await handle.result();
    return result;
  }
}
