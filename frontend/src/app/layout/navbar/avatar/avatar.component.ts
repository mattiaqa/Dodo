import { Component, InputSignal, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  imageUrl: InputSignal<string | undefined> = input<string>();
  avatarSize: InputSignal<"avatar-sm" | "avatar-xl" | undefined> = input<"avatar-sm" | "avatar-xl">();
}
