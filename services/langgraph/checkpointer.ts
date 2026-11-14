import { MemorySaver } from '@langchain/langgraph';
import type { RunnableConfig } from '@langchain/core/runnables';
import type { Checkpoint, CheckpointMetadata, CheckpointTuple } from '@langchain/langgraph';
import { prisma } from '@/lib/prisma';

/**
 * PostgreSQL-backed durable checkpointer for LangGraph.
 * Connects to Neon PostgreSQL using PostgresSaver from @langchain/langgraph-checkpoint-postgres,
 * with memoized singleton initialization and seamless in-memory fallback to MemorySaver.
 */
export class PostgresCheckpointSaver extends MemorySaver {
  private pgSaver: any = null;
  private initPromise: Promise<void> | null = null;
  private isPostgresAvailable = false;

  constructor() {
    super();
  }

  private async initPostgres(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const rawConnStr = process.env.LANGGRAPH_CHECKPOINT_DATABASE_URL || process.env.DATABASE_URL;
      if (!rawConnStr || !rawConnStr.trim()) {
        this.isPostgresAvailable = false;
        return;
      }

      const connStr = (() => {
        if (rawConnStr.includes('neon.tech')) {
          try {
            const url = new URL(rawConnStr);
            if (!url.port) url.port = '443';
            if (!url.searchParams.has('sslmode')) {
              url.searchParams.set('sslmode', 'verify-full');
            }
            return url.toString();
          } catch {
            return rawConnStr;
          }
        }
        return rawConnStr;
      })();

      try {
        const { PostgresSaver } = await import('@langchain/langgraph-checkpoint-postgres');
        const saver = await PostgresSaver.fromConnString(connStr);
        await saver.setup();
        this.pgSaver = saver;
        this.isPostgresAvailable = true;
        console.log('[Checkpointer] PostgresSaver successfully connected to PostgreSQL.');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('[Checkpointer] PostgresSaver init fallback (using MemorySaver):', message);
        this.isPostgresAvailable = false;
      }
    })();

    return this.initPromise;
  }

  public override async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    await this.initPostgres();

    const returnConfig = await super.put(config, checkpoint, metadata);

    if (this.pgSaver && this.isPostgresAvailable) {
      try {
        await this.pgSaver.put(config, checkpoint, metadata);
      } catch (err) {
        console.warn('[Checkpointer] PostgresSaver put warning:', err);
      }
    }

    const threadId = config.configurable?.thread_id;
    if (threadId && process.env.DATABASE_URL) {
      try {
        await prisma.workflowExecution.updateMany({
          where: { graphThreadId: threadId },
          data: {
            updatedAt: new Date(),
            errorMessage: null,
          },
        });
      } catch {
        // Ignore transient DB update failure
      }
    }

    return returnConfig;
  }

  public override async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    await this.initPostgres();

    if (this.pgSaver && this.isPostgresAvailable) {
      try {
        const tuple = await this.pgSaver.getTuple(config);
        if (tuple) return tuple;
      } catch (err) {
        console.warn('[Checkpointer] PostgresSaver getTuple warning:', err);
      }
    }

    return super.getTuple(config);
  }

  public override async *list(config: RunnableConfig, options?: any): AsyncGenerator<CheckpointTuple> {
    await this.initPostgres();

    if (this.pgSaver && this.isPostgresAvailable) {
      try {
        yield* this.pgSaver.list(config, options);
        return;
      } catch (err) {
        console.warn('[Checkpointer] PostgresSaver list warning:', err);
      }
    }

    yield* super.list(config, options);
  }

  public override async putWrites(config: RunnableConfig, writes: any[], taskId: string): Promise<void> {
    await this.initPostgres();

    await super.putWrites(config, writes, taskId);

    if (this.pgSaver && this.isPostgresAvailable) {
      try {
        await this.pgSaver.putWrites(config, writes, taskId);
      } catch (err) {
        console.warn('[Checkpointer] PostgresSaver putWrites warning:', err);
      }
    }
  }
}

export const workflowCheckpointer = new PostgresCheckpointSaver();
