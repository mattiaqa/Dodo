import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { ChatService } from '../../../../services/chat.service';
import { FormsModule } from '@angular/forms';
import {StorageService} from '../../../../storage/storage.service';

@Component({
  selector: 'app-chat-content',
  imports: [
    NgIf,
    NgForOf,
    FormsModule,
    NgClass,
    DatePipe
  ],
  templateUrl: './chat-content.component.html',
  standalone: true,
  styleUrls: ['./chat-content.component.scss']
})
export class ChatContentComponent implements OnInit, OnChanges {
  @Input() selectedChat: any;
  messages: any[] = [];
  newMessage: string = '';
  currentUser: string = '';
  auctionId: string = '';
  chatId: string = '';

  constructor(private chatService: ChatService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.chatService.getChatContent(this.chatId).subscribe(messages => {
        this.messages = messages.messages;
      });

    this.currentUser = this.storageService.getUser().name
  }

  ngOnChanges(): void {
    if (this.selectedChat) {
      this.chatService.getChatContent(this.selectedChat.chatId).subscribe(messages => {
        this.messages = messages.messages;
      });
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const newMsg = {
        sender: {
          name: this.currentUser
        },
        createdAt: new Date(),
        content: this.newMessage.trim(),
      };

      this.messages.push(newMsg);

      this.newMessage = '';

      this.chatService.sendMessage(this.selectedChat.chatId, newMsg.content).subscribe();
    }
  }
}
