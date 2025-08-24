import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { createDataStream, generateId } from 'ai';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS, type FileMap } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/common/prompts/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';
import type { IProviderSetting } from '~/types/model';
import { createScopedLogger } from '~/utils/logger';
import { getFilePaths, selectContext } from '~/lib/.server/llm/select-context';
import type { ContextAnnotation, ProgressAnnotation } from '~/types/context';
import { WORK_DIR } from '~/utils/constants';
import { createSummary } from '~/lib/.server/llm/create-summary';
import { extractPropertiesFromMessage } from '~/lib/.server/llm/utils';
import type { DesignScheme } from '~/types/design-scheme';
import { MCPService } from '~/lib/services/mcpService';

// 🎨 SCOUT QUALITY INTELLIGENCE SYSTEM - Revolutionary token efficiency + artist mentality
import { QualityAwareQueryAnalyzer } from '~/lib/intelligence/QualityAwareQueryAnalyzer';
import { IntelligentContextRetrieval } from '~/lib/intelligence/IntelligentContextRetrieval';
import { QualityAwareContextManager } from '~/lib/intelligence/QualityAwareContextManager';
import { TokenManager } from '~/lib/intelligence/TokenManager';
import { qualityCurator } from '~/lib/quality/QualityCurationManager';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

const logger = createScopedLogger('api.chat');

// 🚀 Initialize Scout Quality Intelligence System
const queryAnalyzer = new QualityAwareQueryAnalyzer();
const contextRetrieval = new IntelligentContextRetrieval();
const contextManager = new QualityAwareContextManager();
const tokenManager = new TokenManager();

// Initialize quality curation system
qualityCurator.initialize().catch(error => {
  console.warn('⚠️ Quality curation initialization failed:', error);
});

// Helper function to get cached responses for fallback strategies
function getCachedResponse(analysis: any, userQuery: string): string | null {
  if (!analysis.fallback_strategy) return null;
  
  const strategy = analysis.fallback_strategy.strategy;
  
  switch (strategy) {
    case 'pure_greeting':
      return "Hello! I'm Steve, your intelligent coding assistant. I'm here to help you build amazing things. What would you like to create today? 🚀";
    
    case 'gratitude':
      return "You're very welcome! I'm always happy to help. Feel free to ask me anything else you'd like to work on together! 😊";
    
    case 'status_check':
      return "I'm doing great and ready to help! My Scout Intelligence system is running optimally and I'm here to assist you with any coding tasks. What can we build together?";
    
    case 'debug_request':
      return "I'd be happy to help you debug that error! To provide the best assistance, could you please share the specific error message and the relevant code? The more details you can provide, the better I can help you solve it. 🔧";
    
    case 'simple_creation':
      return "I'd love to help you create that! To get started, could you tell me a bit more about what you have in mind? For example, what technology stack would you prefer, or do you have any specific requirements? 🎨";
    
    case 'progressive_discovery':
      return "That sounds interesting! To give you the most helpful response, could you provide a bit more context about what you're trying to accomplish? I want to make sure I understand your needs correctly. 🤔";
    
    default:
      return null;
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  const items = cookieHeader.split(';').map((cookie) => cookie.trim());

  items.forEach((item) => {
    const [name, ...rest] = item.split('=');

    if (name && rest) {
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join('=').trim());
      cookies[decodedName] = decodedValue;
    }
  });

  return cookies;
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  const { messages, files, promptId, contextOptimization, supabase, chatMode, designScheme, maxLLMSteps } =
    await request.json<{
      messages: Messages;
      files: any;
      promptId?: string;
      contextOptimization: boolean;
      chatMode: 'discuss' | 'build';
      designScheme?: DesignScheme;
      supabase?: {
        isConnected: boolean;
        hasSelectedProject: boolean;
        credentials?: {
          anonKey?: string;
          supabaseUrl?: string;
        };
      };
      maxLLMSteps: number;
    }>();

  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = JSON.parse(parseCookies(cookieHeader || '').apiKeys || '{}');
  const providerSettings: Record<string, IProviderSetting> = JSON.parse(
    parseCookies(cookieHeader || '').providers || '{}',
  );

  const stream = new SwitchableStream();

  const cumulativeUsage = {
    completionTokens: 0,
    promptTokens: 0,
    totalTokens: 0,
  };
  const encoder: TextEncoder = new TextEncoder();
  let lastChunk: any = null;
  let progressCounter: number = 1;

  try {
    const mcpService = MCPService.getInstance();
    const totalMessageContent = messages.reduce((acc, message) => acc + message.content, '');
    logger.debug(`Total message length: ${totalMessageContent.split(' ').length}, words`);

    const dataStream = createDataStream({
      async execute(dataStream) {
        // 🧠 SCOUT INTELLIGENCE PROCESSING - Replace token-wasting context with smart analysis
        const currentUserMessage = messages[messages.length - 1];
        const sessionId = generateId(); // TODO: Use actual session ID from request
        
        logger.info('🚀 Scout Intelligence: Starting query analysis...');
        
        // Step 1: Analyze query using Scout's multi-pass approach
        const analysis = await queryAnalyzer.analyzeQuery(
          currentUserMessage.content,
          messages.slice(0, -1) // Previous conversation context
        );
        
        logger.info(`📊 Query classified as: ${analysis.query_type} (confidence: ${analysis.confidence_score.toFixed(2)})`);
        
        // Step 2: Check for cached fallback responses (fastest path)
        if (analysis.fallback_strategy) {
          logger.info(`🎯 Using cached response: ${analysis.fallback_strategy.strategy} (${analysis.fallback_strategy.estimated_tokens} tokens)`);
          
          // Track massive token savings
          const tokenDisplay = tokenManager.trackSavings(
            sessionId,
            analysis.query_type,
            analysis.fallback_strategy.estimated_tokens
          );
          
          // Notify UI of intelligence processing
          dataStream.writeMessageAnnotation({
            type: 'intelligence',
            data: {
              steps: [
                { id: '1', action: 'analyze', status: 'complete' },
                { id: '2', action: 'fallback', status: 'complete', tokens: analysis.fallback_strategy.estimated_tokens }
              ],
              isVisible: true
            }
          });
          
          // Return cached response directly (bypassing entire context building)
          const cachedResponse = getCachedResponse(analysis, currentUserMessage.content);
          if (cachedResponse) {
            // Write cached response to stream - using writeData for text
            dataStream.writeData({
              type: 'text',
              content: cachedResponse
            });
            
            // Write token usage annotation
            dataStream.writeMessageAnnotation({
              type: 'tokenUsage',
              data: {
                queryType: analysis.query_type,
                tokensUsed: analysis.fallback_strategy.estimated_tokens,
                tokensSaved: tokenDisplay.tokens_saved,
                efficiencyGain: tokenDisplay.efficiency_gain,
                source: 'cached_response'
              }
            });
            
            return;
          }
        }
        
        // Step 3: Intelligent context retrieval (only if needed)
        logger.info('🔍 Scout Intelligence: Finding relevant context...');
        
        dataStream.writeMessageAnnotation({
          type: 'intelligence',
          data: {
            steps: [
              { id: '1', action: 'analyze', status: 'complete' },
              { id: '2', action: 'context', status: 'processing' }
            ],
            isVisible: true
          }
        });
        
        const relevantContext = await contextRetrieval.findRelevantContext(
          currentUserMessage.content,
          // Convert AI SDK messages to IntelligentContextRetrieval format
          messages.slice(0, -1).map(msg => ({
            content: msg.content,
            timestamp: new Date(), // Use current time as fallback
            id: msg.id,
            role: msg.role as 'user' | 'assistant'
          })),
          {} // options
        );
        
        // Step 4: Dynamic context window with smart fallbacks
        logger.info('🎯 Scout Intelligence: Building optimized context window...');
        
        dataStream.writeMessageAnnotation({
          type: 'intelligence',
          data: {
            steps: [
              { id: '1', action: 'analyze', status: 'complete' },
              { id: '2', action: 'context', status: 'complete' },
              { id: '3', action: 'optimize', status: 'processing' }
            ],
            isVisible: true
          }
        });
        
        const contextWindow = await contextManager.buildContextWindow(
          analysis,
          relevantContext,
          currentUserMessage.content,
          sessionId // Use the session ID
        );
        
        // Track intelligent context usage
        const contextUsage = tokenManager.analyzeUsage(
          'system_prompt', // TODO: Pass actual system prompt
          currentUserMessage.content,
          {
            history: contextWindow.components.find(c => c.type === 'relevant_history')?.content,
            technical: contextWindow.components.find(c => c.type === 'technical_context')?.content,
            files: contextWindow.components.find(c => c.type === 'file_context')?.content
          }
        );
        
        // ✨ QUALITY INTELLIGENCE: Track quality guidance usage
        const qualityWindow = contextWindow as any; // Type assertion for quality fields
        if (qualityWindow.contains_quality_guidance) {
          logger.info(`✨ Quality guidance: +${qualityWindow.quality_token_count} tokens`);
          
          // Write quality guidance annotation for frontend
          dataStream.writeMessageAnnotation({
            type: 'tokenUsage',
            data: {
              queryType: analysis.query_type,
              tokensUsed: contextWindow.token_count,
              qualityTokens: qualityWindow.quality_token_count,
              baseTokens: contextWindow.token_count - qualityWindow.quality_token_count,
              source: 'quality_guidance',
              hasQualityGuidance: true
            }
          });
        } else {
          // Track when quality guidance was not needed
          dataStream.writeMessageAnnotation({
            type: 'tokenUsage', 
            data: {
              queryType: analysis.query_type,
              tokensUsed: contextWindow.token_count,
              qualityTokens: 0,
              baseTokens: contextWindow.token_count,
              source: 'scout_intelligence_only',
              hasQualityGuidance: false
            }
          });
        }
        
        logger.info(`💡 Scout context: ${contextWindow.token_count} tokens (${contextWindow.current_level} level)`);
        
        const useIntelligentContext = contextWindow.token_count > 0 && !contextWindow.fallback_strategy;
        
        // Final notification step
        dataStream.writeMessageAnnotation({
          type: 'intelligence',
          data: {
            steps: [
              { id: '1', action: 'analyze', status: 'complete' },
              { id: '2', action: 'context', status: 'complete' },
              { id: '3', action: 'optimize', status: 'complete', tokens: contextWindow.token_count },
              { id: '4', action: 'complete', status: 'complete' }
            ],
            isVisible: true
          }
        });
        const filePaths = getFilePaths(files || {});
        let filteredFiles: FileMap | undefined = undefined;
        let summary: string | undefined = undefined;
        let messageSliceId = 0;

        const processedMessages = await mcpService.processToolInvocations(messages, dataStream);

        if (processedMessages.length > 3) {
          messageSliceId = processedMessages.length - 3;
        }

        // 🧠 SCOUT INTELLIGENCE: Skip old context building if using intelligent context
        if (useIntelligentContext && !contextWindow.fallback_strategy) {
          logger.info('🚀 Using Scout intelligent context - skipping old file analysis');
          
          // Use our optimized context instead of old system
          filteredFiles = undefined; // Don't load all files
          summary = contextWindow.components.find(c => c.type === 'relevant_history')?.content;
          
        } else if (filePaths.length > 0 && contextOptimization) {
          logger.debug('Generating Chat Summary');
          dataStream.writeData({
            type: 'progress',
            label: 'summary',
            status: 'in-progress',
            order: progressCounter++,
            message: 'Analysing Request',
          } satisfies ProgressAnnotation);

          // Create a summary of the chat
          console.log(`Messages count: ${processedMessages.length}`);

          summary = await createSummary({
            messages: [...processedMessages],
            env: context.cloudflare?.env,
            apiKeys,
            providerSettings,
            promptId,
            contextOptimization,
            onFinish(resp) {
              if (resp.usage) {
                logger.debug('createSummary token usage', JSON.stringify(resp.usage));
                cumulativeUsage.completionTokens += resp.usage.completionTokens || 0;
                cumulativeUsage.promptTokens += resp.usage.promptTokens || 0;
                cumulativeUsage.totalTokens += resp.usage.totalTokens || 0;
              }
            },
          });
          dataStream.writeData({
            type: 'progress',
            label: 'summary',
            status: 'complete',
            order: progressCounter++,
            message: 'Analysis Complete',
          } satisfies ProgressAnnotation);

          dataStream.writeMessageAnnotation({
            type: 'chatSummary',
            summary,
            chatId: processedMessages.slice(-1)?.[0]?.id,
          } as ContextAnnotation);

          // Update context buffer
          logger.debug('Updating Context Buffer');
          dataStream.writeData({
            type: 'progress',
            label: 'context',
            status: 'in-progress',
            order: progressCounter++,
            message: 'Determining Files to Read',
          } satisfies ProgressAnnotation);

          // Select context files
          console.log(`Messages count: ${processedMessages.length}`);
          filteredFiles = await selectContext({
            messages: [...processedMessages],
            env: context.cloudflare?.env,
            apiKeys,
            files,
            providerSettings,
            promptId,
            contextOptimization,
            summary,
            onFinish(resp) {
              if (resp.usage) {
                logger.debug('selectContext token usage', JSON.stringify(resp.usage));
                cumulativeUsage.completionTokens += resp.usage.completionTokens || 0;
                cumulativeUsage.promptTokens += resp.usage.promptTokens || 0;
                cumulativeUsage.totalTokens += resp.usage.totalTokens || 0;
              }
            },
          });

          if (filteredFiles) {
            logger.debug(`files in context : ${JSON.stringify(Object.keys(filteredFiles))}`);
          }

          dataStream.writeMessageAnnotation({
            type: 'codeContext',
            files: Object.keys(filteredFiles).map((key) => {
              let path = key;

              if (path.startsWith(WORK_DIR)) {
                path = path.replace(WORK_DIR, '');
              }

              return path;
            }),
          } as ContextAnnotation);

          dataStream.writeData({
            type: 'progress',
            label: 'context',
            status: 'complete',
            order: progressCounter++,
            message: 'Code Files Selected',
          } satisfies ProgressAnnotation);

          // logger.debug('Code Files Selected');
        } // End of old context building

        const options: StreamingOptions = {
          supabaseConnection: supabase,
          toolChoice: 'auto',
          tools: mcpService.toolsWithoutExecute,
          maxSteps: maxLLMSteps,
          onStepFinish: ({ toolCalls }) => {
            // add tool call annotations for frontend processing
            toolCalls.forEach((toolCall) => {
              mcpService.processToolCall(toolCall, dataStream);
            });
          },
          onFinish: async ({ text: content, finishReason, usage }) => {
            logger.debug('usage', JSON.stringify(usage));

            if (usage) {
              cumulativeUsage.completionTokens += usage.completionTokens || 0;
              cumulativeUsage.promptTokens += usage.promptTokens || 0;
              cumulativeUsage.totalTokens += usage.totalTokens || 0;
            }

            if (finishReason !== 'length') {
              dataStream.writeMessageAnnotation({
                type: 'usage',
                value: {
                  completionTokens: cumulativeUsage.completionTokens,
                  promptTokens: cumulativeUsage.promptTokens,
                  totalTokens: cumulativeUsage.totalTokens,
                },
              });
              dataStream.writeData({
                type: 'progress',
                label: 'response',
                status: 'complete',
                order: progressCounter++,
                message: 'Response Generated',
              } satisfies ProgressAnnotation);
              await new Promise((resolve) => setTimeout(resolve, 0));

              // stream.close();
              return;
            }

            if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
              throw Error('Cannot continue message: Maximum segments reached');
            }

            const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

            logger.info(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

            const lastUserMessage = processedMessages.filter((x) => x.role == 'user').slice(-1)[0];
            const { model, provider } = extractPropertiesFromMessage(lastUserMessage);
            processedMessages.push({ id: generateId(), role: 'assistant', content });
            processedMessages.push({
              id: generateId(),
              role: 'user',
              content: `[Model: ${model}]\n\n[Provider: ${provider}]\n\n${CONTINUE_PROMPT}`,
            });

            const result = await streamText({
              messages: [...processedMessages],
              env: context.cloudflare?.env,
              options,
              apiKeys,
              files,
              providerSettings,
              promptId,
              contextOptimization,
              contextFiles: filteredFiles,
              chatMode,
              designScheme,
              summary,
              messageSliceId,
            });

            result.mergeIntoDataStream(dataStream);

            (async () => {
              for await (const part of result.fullStream) {
                if (part.type === 'error') {
                  const error: any = part.error;
                  logger.error(`${error}`);

                  return;
                }
              }
            })();

            return;
          },
        };

        dataStream.writeData({
          type: 'progress',
          label: 'response',
          status: 'in-progress',
          order: progressCounter++,
          message: 'Generating Response',
        } satisfies ProgressAnnotation);

        const result = await streamText({
          messages: [...processedMessages],
          env: context.cloudflare?.env,
          options,
          apiKeys,
          files,
          providerSettings,
          promptId,
          contextOptimization,
          contextFiles: filteredFiles,
          chatMode,
          designScheme,
          summary,
          messageSliceId,
        });

        (async () => {
          for await (const part of result.fullStream) {
            if (part.type === 'error') {
              const error: any = part.error;
              logger.error(`${error}`);

              return;
            }
          }
        })();
        result.mergeIntoDataStream(dataStream);
      },
      onError: (error: any) => `Custom error: ${error.message}`,
    }).pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          if (!lastChunk) {
            lastChunk = ' ';
          }

          if (typeof chunk === 'string') {
            if (chunk.startsWith('g') && !lastChunk.startsWith('g')) {
              controller.enqueue(encoder.encode(`0: "<div class=\\"__boltThought__\\">"\n`));
            }

            if (lastChunk.startsWith('g') && !chunk.startsWith('g')) {
              controller.enqueue(encoder.encode(`0: "</div>\\n"\n`));
            }
          }

          lastChunk = chunk;

          let transformedChunk = chunk;

          if (typeof chunk === 'string' && chunk.startsWith('g')) {
            let content = chunk.split(':').slice(1).join(':');

            if (content.endsWith('\n')) {
              content = content.slice(0, content.length - 1);
            }

            transformedChunk = `0:${content}\n`;
          }

          // Convert the string stream to a byte stream
          const str = typeof transformedChunk === 'string' ? transformedChunk : JSON.stringify(transformedChunk);
          controller.enqueue(encoder.encode(str));
        },
      }),
    );

    return new Response(dataStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        'Text-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    logger.error(error);

    const errorResponse = {
      error: true,
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      isRetryable: error.isRetryable !== false, // Default to retryable unless explicitly false
      provider: error.provider || 'unknown',
    };

    if (error.message?.includes('API key')) {
      return new Response(
        JSON.stringify({
          ...errorResponse,
          message: 'Invalid or missing API key',
          statusCode: 401,
          isRetryable: false,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
          statusText: 'Unauthorized',
        },
      );
    }

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.statusCode,
      headers: { 'Content-Type': 'application/json' },
      statusText: 'Error',
    });
  }
}

/**
 * 🎯 Helper Functions for Scout Intelligence System
 */

/**
 * Create a stream response for cached answers
 */
function createCachedResponseStream(response: string, tokenDisplay: any, dataStream: any): Response {
  const encoder = new TextEncoder();
  
  // Create a simple stream that returns the cached response
  const stream = new ReadableStream({
    start(controller) {
      try {
        // Write the response
        controller.enqueue(encoder.encode(`0:"${response.replace(/"/g, '\\"')}\n"`));
        
        // Write token usage annotation
        const annotation = JSON.stringify({
          type: 'tokenUsage',
          data: {
            queryType: tokenDisplay.query_type,
            tokensUsed: tokenDisplay.tokens_used,
            tokensSaved: tokenDisplay.tokens_saved,
            efficiencyGain: tokenDisplay.efficiency_gain,
            source: 'cached_response'
          }
        });
        controller.enqueue(encoder.encode(`2:[{"tokenUsage":${annotation}}]\n`));
        
        // Signal completion
        controller.enqueue(encoder.encode('d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":' + 
          Math.ceil(response.length / 4) + ',"totalTokens":' + Math.ceil(response.length / 4) + '}}\n'));
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
  
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Text-Encoding': 'chunked',
    },
  });
}
