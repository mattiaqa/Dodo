import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import {NotificationService} from '../../../../services/notification.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [
    FaIconComponent,
    NgForOf,
    NgIf
  ],
  standalone: true,
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('300ms ease-in', style({opacity: 0, transform: 'translateX(-100%)'}))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getUserNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  deleteNotification(notification: any) {
    this.notificationService.readNotification(notification._id).subscribe(() => {
        this.notifications = this.notifications.filter(n => n._id !== notification._id);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
