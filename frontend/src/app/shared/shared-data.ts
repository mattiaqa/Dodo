import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private dataArraySubject = new BehaviorSubject<any[]>([]);
  dataArray$ = this.dataArraySubject.asObservable();

  updateArray(newArray: any[]) {
    this.dataArraySubject.next(newArray);
  }
}
