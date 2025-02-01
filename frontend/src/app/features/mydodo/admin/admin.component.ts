import {Component, OnInit} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../../services/user.service';
import {ToastService} from '../../../services/toast.service';
import {StatisticService} from '../../../services/statistic.service';
import {ToastComponent} from '../../../layout/toast/toast.component';

@Component({
  selector: 'app-admin',
  imports: [
    NgForOf,
    DatePipe,
    FaIconComponent,
    FormsModule,
    NgIf,
    ToastComponent
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

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private statisticService: StatisticService
  ) {
  }

  ngOnInit(): void {
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
        this.filteredUsers = users;
      }
    )
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter((user: { name: string }) =>
      user.name.toLowerCase().includes(searchTermLower)
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
    this.userService.banUser(user._id).subscribe(
      data => {
        user.isBanned = true;
        this.toastService.showToast({
          message: 'User Banned Successfully',
          type: 'success',
          duration: 8000
        });
      },
      error => {
        this.toastService.showToast({
          message: 'Error Banning user',
          type: 'error',
          duration: 8000
        });
      }
    );
  }

  deleteUser(userId: string) {
    this.userService.deleteUser(userId).subscribe(
      data => {
        this.toastService.showToast({
          message: 'User Deleted Successfully',
          type: 'success',
          duration: 8000
        });

        this.filteredUsers = this.filteredUsers.filter((user: { _id: string; }) => user._id !== userId);
      },
      error => {
        this.toastService.showToast({
          message: 'Error deleting user',
          type: 'error',
          duration: 8000
        });
      }
    );
  }

  upgradeToModerator(email: string) {
    this.userService.upgradeToModerator(email).subscribe(
      data => {
        this.toastService.showToast({
          message: 'User Invited Successfully',
          type: 'success',
          duration: 8000
        });
      },
      error => {
        this.toastService.showToast({
          message: 'Error upgrading user to moderator',
          type: 'error',
          duration: 8000
        });
      }
    );
  }
}
