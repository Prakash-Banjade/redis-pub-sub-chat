import { IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @Length(1, 1000, { message: 'The message must be between 1 and 1000 characters' })
    message: string;

    @IsString()
    @IsOptional()
    @MaxLength(100, { message: 'The roomId must be less than 100 characters' })
    roomId?: string;
}