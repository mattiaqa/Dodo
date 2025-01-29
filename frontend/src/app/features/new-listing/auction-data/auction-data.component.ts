import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuctionService } from '../../../services/auction.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auction-data',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule
    ],
  templateUrl: './auction-data.component.html',
  styleUrls: ['./auction-data.component.scss']
})
export class CreateAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  selectedBookTitle: string = '';
  expireDate: string = '';
  isReserveEnabled = false;
  imagePreviews: string[] = [];
  selectedImages: File[] = []; 

  constructor(private fb: FormBuilder, private auctionService: AuctionService, private router: Router, private route: ActivatedRoute) {
    this.auctionForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      lastBid: [0, [Validators.required, Validators.min(0)]],
      reservePrice: [0, [Validators.min(0)]],
      images: [[], Validators.required],
      expireDate: ['', Validators.required],
      book: [''], // Verrà popolato dal cookie
      condition: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', [Validators.required, Validators.maxLength(2)]]
    }, { validators: this.crossFieldValidator.bind(this) });
  }

  ngOnInit() {
    // Imposta la data di scadenza a una settimana dal momento attuale
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7); // Imposta la data a una settimana da oggi
    this.expireDate = currentDate.toISOString().split('T')[0]; // Formatta la data come stringa 'yyyy-mm-dd'
    
    // Imposta la data di scadenza nel form
    this.auctionForm.patchValue({
      expireDate: this.expireDate
    });

    /*// Recupera il token del libro dal cookie
    const selectedBookCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('selectedBook='));

    if (selectedBookCookie) {
      try {
        const cookieValue = decodeURIComponent(selectedBookCookie.split('=')[1]);
        const parsedCookie = JSON.parse(cookieValue);
        
        // Assumendo che il cookie contenga un campo 'token'
        const bookToken = parsedCookie.token;
        this.selectedBookTitle = parsedCookie.title;
        
        this.auctionForm.patchValue({
          book: bookToken
        });

      } catch (error) {
        console.error('Errore nel parsing del cookie:', error);
        // Gestione dell'errore
      }
    }*/

    // Recupera il token del libro dal session storage
    const selectedBook = sessionStorage.getItem('selectedBook');
    if (selectedBook) {
      this.selectedBookTitle = sessionStorage.getItem('selectedBookTitle') || "Nessun libro";
      this.auctionForm.patchValue({
        book: selectedBook
      });
    }
    else{
      this.selectedBookTitle = "Nessun libro";
    }

    this.auctionForm.get('lastBid')?.valueChanges.subscribe(() => {
      this.auctionForm.get('reservePrice')?.updateValueAndValidity();
      this.auctionForm.updateValueAndValidity();
    });
  }


  // Aggiungi questo validatore incrociato
  private crossFieldValidator(): ValidationErrors | null {
    const lastBid = this.auctionForm?.get('lastBid')?.value;
    const reservePrice = this.auctionForm?.get('reservePrice')?.value;

    if (this.isReserveEnabled && reservePrice <= lastBid) {
      return { reserveTooLow: true };
    }
    return null;
  }
  // Aggiungi questo metodo alla classe
  private reservePriceValidator(control: AbstractControl): ValidationErrors | null {
    const lastBid = this.auctionForm?.get('lastBid')?.value;
    const reservePrice = control.value;
    
    if (this.isReserveEnabled && reservePrice <= lastBid) {
      return { reserveTooLow: true };
    }
    return null;
  }


  // Aggiungi questi metodi alla classe
  toggleReservePrice() {
    this.isReserveEnabled = !this.isReserveEnabled;
    const reserveControl = this.auctionForm.get('reservePrice');
  
    if (this.isReserveEnabled) {
      reserveControl?.setValidators([
        Validators.required,
        Validators.min(0),
        this.reservePriceValidator.bind(this)
      ]);
    } else {
      reserveControl?.reset(0);
      reserveControl?.clearValidators();
    }
    
    reserveControl?.updateValueAndValidity();
    this.auctionForm.updateValueAndValidity(); // Aggiorna validazione globale
  }

  onSubmit() {
    if (this.auctionForm.invalid) {
      if (this.auctionForm.errors?.['reserveTooLow']) {
        alert('Il prezzo riserva deve essere maggiore del prezzo iniziale!');
      }
      return;
    }

    if (this.auctionForm.valid) {
      // Crea un oggetto FormData
      const formData = new FormData();
  
      // Aggiungi i campi del form
      Object.keys(this.auctionForm.value).forEach(key => {
        if (key !== 'images' && key !== 'reservePrice') { // Escludi i file per ora
          formData.append(key, this.auctionForm.value[key]);
        }
      });

      if(this.isReserveEnabled){
        formData.append('reservePrice', this.auctionForm.value.reservePrice)
      }

      // Aggiungi i file
      this.selectedImages.forEach((file, index) => {
        formData.append('images', file, file.name); // Usa 'images' come chiave
      });
  
      console.log('Form data:', formData);

      this.auctionService.createAuction(formData).subscribe({
        next: () => {
          sessionStorage.removeItem('selectedBook'),
          sessionStorage.removeItem('selectedBookTitle');
          this.router.navigate(['/CreateAuctionSuccess'], {
            state: { message: 'Asta pubblicata con successo!' }
          });
        },
        error: (err) => {
          //sessionStorage.removeItem('selectedBook'),
          //sessionStorage.removeItem('selectedBookTitle');
          console.error('Errore nella creazione dell\'asta:', err);
          alert('Si è verificato un errore durante la pubblicazione dell\'asta');
        }
      });
    }
  }
  
  onFileSelected(event: any) {
    const files = event.target.files as FileList;
    
    // Converti FileList in array e filtra file non immagini
    const imageFiles = Array.from(files).filter(file => 
      file.type.match(/image\/*/)
    );

    // Aggiungi i nuovi file
    imageFiles.forEach(file => {
      if (!this.selectedImages.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedImages.push(file);
        this.imagePreviews.push(URL.createObjectURL(file));
      }
    });

    // Aggiorna il form control con l'array di File
    this.auctionForm.patchValue({
      images: this.selectedImages
    });
  }

  // Modifica il metodo removeImage
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    
    // Aggiorna il form control
    this.auctionForm.patchValue({
      images: this.selectedImages
    });
  }
}
