import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text' })
    text: string;

    @Column({ type: 'text', nullable: true })
    conversationId: string;

    @CreateDateColumn()
    createdAt: string;

}