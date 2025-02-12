import { Component, OnDestroy, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {NgClass, NgForOf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [
    NgClass,
    NgForOf,
    FaIconComponent
  ],
  standalone: true,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(20px)'}),
        animate('500ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({opacity: 0, transform: 'translateY(20px)'}))
      ])
    ])
  ]
})

export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  
  ngOnInit(): void {
    
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        this.toasts.shift();
      }, toast.duration || 3000);
    });
  }
  
  getIcon(type: string): [string, string] {
    return this.iconMap[type] || ['fas', 'circle-exclamation'];
  }

  private readonly iconMap: { [key: string]: [string, string] } = {
    'success': ['fas', 'circle-check'],
    'error': ['fas', 'circle-xmark'],
    'info': ['fas', 'circle-info']
  };
}
