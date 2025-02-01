import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private dataArraySubject = new BehaviorSubject<any[]>([]);
  dataArray$ = this.dataArraySubject.asObservable();

  private dataStringSubject = new BehaviorSubject<string>('');
  dataString$ = this.dataStringSubject.asObservable();

  private dataAvatarUrlSubject = new BehaviorSubject<string>('');
  dataAvatarUrl$ = this.dataAvatarUrlSubject.asObservable();

  updateArray(newArray: any[]) {
    this.dataArraySubject.next(newArray);
  }
  updateString(newString: string) {
    this.dataStringSubject.next(newString);
  }

  updateAvatarUrl(avatar: string){
    let url = '';
    if(avatar.length > 0)
      url = avatar;
    this.dataAvatarUrlSubject.next(url);
  }
}
