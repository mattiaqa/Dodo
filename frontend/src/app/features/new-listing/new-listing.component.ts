import {Component, Output, EventEmitter} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-new-listing',
    imports: [
    ],
  templateUrl: './new-listing.component.html',
  styleUrl: './new-listing.component.scss'
})
export class NewListingComponent {
  @Output() closePopup = new EventEmitter();

  onClose() {
    this.closePopup.emit('close');
  }
}
