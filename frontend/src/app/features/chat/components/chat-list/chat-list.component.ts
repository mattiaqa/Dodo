import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ChatService} from '../../../../services/chat.service';
import {NgClass, NgForOf} from '@angular/common';
import {StorageService} from '../../../../storage/storage.service';
import {ActivatedRoute} from '@angular/router';
import {AuctionService} from '../../../../services/auction.service';

@Component({
  selector: 'app-chat-list',
  imports: [
    NgForOf,
    NgClass
  ],
  templateUrl: './chat-list.component.html',
  standalone: true,
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent implements OnInit {
  @Output() chatSelect = new EventEmitter<any>();
  chats: any[] = [];
  selectedChat: any;
  chatId: string = '';

  constructor(private chatService: ChatService, private route: ActivatedRoute, private auctionService: AuctionService,) {
  }

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';

    this.chatService.getUserChat().subscribe(chats => {
        this.chats = chats;

        this.chats.forEach(chat => {
          if(chat.chatId === this.chatId) {
            this.selectedChat = chat.chatId;
            this.chatSelect.emit(chat);
          }
        })
      }
    )
  }

  onChatSelect(chat: any): void {
    this.chatSelect.emit(chat);
    this.selectedChat = chat.chatId;
  }
}
