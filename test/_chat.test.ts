import { getPromptModelsFromSlackEmoji } from '../api/_chat';
import { PromptModels } from "../api/_ai";

describe('getPromptModelsFromSlackEmoji', () => {
    it('should return PromptModels.Code when the message contains ":avocado:"', () => {
        const messageText = 'I want to write some code using the :avocado: model.';
        const result = getPromptModelsFromSlackEmoji(messageText);
        expect(result).toBe(PromptModels.Code);
    });

    it('should return PromptModels.Image when the message contains ":camera:"', () => {
        const messageText = 'Can you take a picture with the :camera:?';
        const result = getPromptModelsFromSlackEmoji(messageText);
        expect(result).toBe(PromptModels.Image);
    });

    it('should return PromptModels.Chat when the message does not contain a supported emoji', () => {
        const messageText = 'Hello, how are you?';
        const result = getPromptModelsFromSlackEmoji(messageText);
        expect(result).toBe(PromptModels.Chat);
    });

    it('should return PromptModels.Chat when the message is undefined', () => {
        const messageText = undefined;
        const result = getPromptModelsFromSlackEmoji(messageText);
        expect(result).toBe(PromptModels.Chat);
    });
});
