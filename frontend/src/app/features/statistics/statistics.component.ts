import { Component } from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-statistics',
  imports: [
    NavbarComponent,
    FooterComponent,
    BaseChartDirective
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
  chartData = [
    { data: [10, 20, 15, 25, 30, 45, 60], label: 'Aste Partecipate' },
    { data: [5, 10, 8, 12, 15, 20, 25], label: 'Aste Vinte' },
  ];

  chartLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
}
