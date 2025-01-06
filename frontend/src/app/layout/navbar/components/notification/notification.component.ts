import {Component, OnInit} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NotificationService} from '../../../../services/notification.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [
    FaIconComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];

  constructor(private notificationService: NotificationService){}

  ngOnInit() {
    this.notificationService.getUserNotifications().subscribe(notifications => {
        this.notifications = notifications;
      }
    )
  }

  deleteNotification(notification: any) {
    this.notificationService.readNotification(notification._id).subscribe(notification => {
      window.location.reload();
    });
  }
}
