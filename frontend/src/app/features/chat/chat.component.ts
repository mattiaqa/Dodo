import {Component} from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatContentComponent } from './components/chat-content/chat-content.component';

@Component({
  selector: 'app-chat',
  imports: [
    NavbarComponent,
    FooterComponent,
    ChatListComponent,
    ChatContentComponent
  ],
  templateUrl: './chat.component.html',
  standalone: true,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  selectedChat: any = null;

  onChatSelect(chat: any): void {
    this.selectedChat = chat;
  }
}
