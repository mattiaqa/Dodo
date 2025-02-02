import {Component, Output, EventEmitter, NgModule} from '@angular/core';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({

  selector: 'app-new-listing',
  //standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './new-listing.component.html',
  styleUrls: ['./new-listing.component.scss'],
  standalone: true
})
export class NewListingComponent {
  auctionForm: FormGroup; // Form principale

  showSearchBook = false;
  searchCompleted = false;
  localSearchResults: any[] = [];
  onlineSearchResults: any[] = [];
  selectedBook: string | null = null;

  images: File[] = [];    // Array di file caricati

  constructor(private fb: FormBuilder, private bookService: BookService, private router: Router, private route: ActivatedRoute ) {
    this.auctionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      expireDate: ['', Validators.required],
      startingPrice: [0, [Validators.required, Validators.min(0)]],
      reservePrice: [null, [Validators.min(0)]],
      book: [null],
      images: [null] // Placeholder per immagini
    });

    this.auctionForm.addControl(
      'bookSearch',
      this.fb.group({
        title: ['', [Validators.minLength(3)]],
        author: [''],
        publisher: [''],
        ISBN: [''],
      })
    );

    this.auctionForm.get('bookSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((searchCriteria) =>
          forkJoin({
            localResults: this.bookService.searchBook(searchCriteria),
            onlineResults: this.bookService.searchBookOnline(searchCriteria)
          })
        )
      )
      .subscribe(({ localResults, onlineResults }) => {
        this.localSearchResults = localResults.results;
        this.onlineSearchResults = onlineResults.results;
        this.searchCompleted = true;
        console.log(this.localSearchResults, this.onlineSearchResults);
      });
  }

  get bookSearchGroup(): FormGroup {
    return this.auctionForm.get('bookSearch') as FormGroup;
  }

  selectBook(book: any) {
    const res = this.bookService.serializeBook(book).subscribe({
      next: (response) => {
          console.log('Risposta dal backend:', response);
          sessionStorage.setItem('selectedBook', response.token);
          sessionStorage.setItem('selectedBookTitle', response.title);
          this.router.navigate(['auctionData'], { relativeTo: this.route });
      },
      error: (err) => {
          console.error('Errore:', err);
      }
  });
  }

  continueWithoutMatch(){
    sessionStorage.removeItem('selectedBook'),
    sessionStorage.removeItem('selectedBookTitle');
    this.router.navigate(['auctionData'], { relativeTo: this.route });
  }
}
