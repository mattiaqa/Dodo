import {Component, OnInit} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../../services/user.service';
import {ToastService} from '../../../services/toast.service';
import {StatisticService} from '../../../services/statistic.service';
import { config } from '../../../config/default'
import { ToastComponent } from '../../../layout/toast/toast.component';

@Component({
  selector: 'app-admin',
  imports: [
    NgForOf,
    DatePipe,
    FaIconComponent,
    FormsModule,
    NgIf,
    ToastComponent,
  ],
  templateUrl: './admin.component.html',
  standalone: true,
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  chart1: any;
  chart2: any;
  filteredUsers: any;
  searchTerm = '';
  users: any;
  statistics: any = {};
  totalAuctions: number = 0;
  hostname: string = '';
  showConfirmModal = false;
  confirmationTitle = '';
  confirmationMessage = '';
  currentAction: 'delete' | 'ban' | 'upgrade' | null = null;
  selectedUser: any = null;

  constructor(
    private userService: UserService,
    private statisticService: StatisticService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.hostname = config.hostname;

    this.statisticService.getAllStatistics().subscribe(data => {
      this.statistics = data;
      this.statisticService.getTotalAuctions().subscribe(data => {
        this.totalAuctions = data.total;

        Chart.register(...registerables);
        this.createChart(
          'chart1',
          ['Successfully Closed', 'Unsuccessfully Closed'],
          [this.statistics.successfullyClosed,
            this.statistics.unsuccessfullyClosed]);
        this.createChart(
          'chart2',
          ['Auctions Removed',
            'Auctions Edited',
            'Others'],
          [this.statistics.auctionsRemoved,
            this.statistics.auctionsEdited,
            (this.totalAuctions - this.statistics.auctionsRemoved - this.statistics.auctionsEdited),]);

        this.chart1.update();
        this.chart2.update();
      })
    });


    this.userService.getAllActiveUser().subscribe(users => {
        this.users = users;
      }
    )
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      //this.filteredUsers = [];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter((user: { email: string }) =>
      user.email.toLowerCase().includes(searchTermLower)
    );
  }

  createChart(chartId: string, labels: string[], data: number[]): void {
    new Chart(chartId, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#D7AE95',
            '#d8ccc4',
            'rgba(215,174,149,0.6)'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  banUser(user: any) {
    this.userService.banUser(user._id).subscribe({
      next: (data) => {
        user.isBanned = true;
        this.toastService.showToast({
          message: 'User Banned Successfully',
          type: 'success',
          duration: 8000
        });
      },
      error: () => {
        this.toastService.showToast({
          message: 'Error Banning user',
          type: 'error',
          duration: 8000
        });
      }
    });
  }

  deleteUser(userId: string) {
    this.userService.deleteUser(userId).subscribe({
      next: (data) => {
        this.toastService.showToast({
          message: 'User Deleted Successfully',
          type: 'success',
          duration: 5000
        });

        this.filteredUsers = this.filteredUsers.filter((user: { _id: string; }) => user._id !== userId);
      },
      error: () => {
        this.toastService.showToast({
          message: 'Error deleting user',
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  upgradeToModerator(email: string) {
    this.userService.upgradeToModerator(email).subscribe({
      next: (data) => {
        this.toastService.showToast({
          message: 'Invite sent via email to the selected user',
          type: 'success'
        });
      },
      error: (error) => {
        this.toastService.showToast({
          message: error.error.message,
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  openConfirmModal(action: 'delete' | 'ban' | 'upgrade', user: any) {
    this.selectedUser = user;
    this.currentAction = action;

    switch(action) {
      case 'delete':
        this.confirmationTitle = 'Delete User';
        this.confirmationMessage = `Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`;
        break;
      case 'ban':
        this.confirmationTitle = user.isBanned ? 'Unban User' : 'Ban User';
        this.confirmationMessage = `Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.email}?`;
        break;
      case 'upgrade':
        this.confirmationTitle = 'Upgrade to Moderator';
        this.confirmationMessage = `Are you sure you want to make ${user.email} a moderator?`;
        break;
    }

    this.showConfirmModal = true;
  }

  cancelAction() {
    this.showConfirmModal = false;
    this.selectedUser = null;
    this.currentAction = null;
  }

  confirmAction() {
    if (!this.selectedUser || !this.currentAction) return;

    switch(this.currentAction) {
      case 'delete':
        this.deleteUser(this.selectedUser._id);
        break;
      case 'ban':
        this.banUser(this.selectedUser);
        break;
      case 'upgrade':
        this.upgradeToModerator(this.selectedUser.email);
        break;
    }

    this.cancelAction();
  }
}
