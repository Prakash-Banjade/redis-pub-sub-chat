import { IsNotEmpty, IsString } from "class-validator";

export class CreateConversationDto {
    @IsString()
    @IsNotEmpty()
    conversationId: string
}