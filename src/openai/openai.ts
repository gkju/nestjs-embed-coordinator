/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Chat } from 'openai/resources';
import CreateChatCompletionRequestMessage = Chat.CreateChatCompletionRequestMessage;

export type OpenAiFunction =
  OpenAI.Chat.Completions.CompletionCreateParams.Function;

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
  ) => {
    const messages: CreateChatCompletionRequestMessage[] = [
      { role: 'user', content: prompt },
    ];
    const response = await this.openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo-0613',
      functions,
      function_call: 'auto',
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const argument = responseMessage.function_call.arguments;
      const functionResponse = callFunction(functionName, argument);
      messages.push(responseMessage);
      messages.push({
        role: 'function',
        name: functionName,
        content: functionResponse,
      });
      const second_response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0613',
        messages,
      });

      return second_response;
    }

    return response;
  };
}
