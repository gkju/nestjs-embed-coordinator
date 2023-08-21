/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Chat } from 'openai/resources';
import CreateChatCompletionRequestMessage = Chat.CreateChatCompletionRequestMessage;
import { ChatCompletion } from 'openai/resources/chat';

export type OpenAiFunction =
  OpenAI.Chat.Completions.CompletionCreateParams.Function;

function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface OpenAiResponse {
  response: ChatCompletion;
  conversationId: string;
}

const messageStore: Map<string, CreateChatCompletionRequestMessage[]> = new Map<
  string,
  CreateChatCompletionRequestMessage[]
>();

@Injectable()
export class Openai {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
    });
  }

  public callOpenAi = async (
    prompt: string,
    functions: OpenAI.Chat.Completions.CompletionCreateParams.Function[],
    callFunction: (name: string, argument: string) => any,
    conversationId: string | undefined = undefined,
  ): Promise<OpenAiResponse> => {
    if (!conversationId || !messageStore.has(conversationId)) {
      conversationId = generateUUID();
    }

    const messages: CreateChatCompletionRequestMessage[] =
      messageStore.get(conversationId) ?? [];
    messages.push({ role: 'user', content: prompt });
    const response = await this.openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo-0613',
      functions,
      function_call: 'auto',
    });

    console.log(
      'The messages are ',
      messages.map((m) => m.role + ' ' + m.content),
    );

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);
    const toReturn = {
      response,
      conversationId,
    };

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const argument = responseMessage.function_call.arguments;
      const functionResponse = callFunction(functionName, argument);

      messages.push({
        role: 'function',
        name: functionName,
        content: functionResponse,
      });
      const second_response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0613',
        messages,
      });

      console.log(
        'adding response from server',
        second_response.choices[0].message,
      );

      messages.push(second_response.choices[0].message);

      toReturn.response = second_response;
    }

    messageStore.set(conversationId, messages);

    return toReturn;
  };
}
