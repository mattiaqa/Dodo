import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ChatService} from '../../../../services/chat.service';
import {NgClass, NgForOf} from '@angular/common';
import {StorageService} from '../../../../storage/storage.service';

@Component({
  selector: 'app-chat-list',
  imports: [
    NgForOf,
    NgClass
  ],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent implements OnInit {
  @Output() chatSelect = new EventEmitter<any>();
  chats: any[] = [];
  avatar: string = '';
  selectedChat: any;

  constructor(private chatService: ChatService, private storageService: StorageService) {
  }

  ngOnInit() {
    this.chatService.getUserChat().subscribe(chats => {
        this.chats = chats;
      }
    )
    this.avatar = "http://localhost:1338/api/download/avatar/" + this.storageService.getUser().avatar;
  }

  onChatSelect(chat: any): void {
    this.chatSelect.emit(chat);
    this.selectedChat = chat.chatId;
  }
}
