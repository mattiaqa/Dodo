import {Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf} from '@angular/common';
import {AuctionService} from '../../../../services/auction.service';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../../../services/user.service';
import {StorageService} from '../../../../storage/storage.service';

@Component({
  selector: 'app-comment',
  imports: [
    FormsModule,
    NgForOf,
    DatePipe
  ],
  templateUrl: './comment.component.html',
  standalone: true,
  styleUrl: './comment.component.scss'
})
export class CommentComponent implements OnInit {
  comments: any;
  auctionId: string = '';

  constructor(private auctionModel: AuctionService,
              private serviceStorage: StorageService,
              private route: ActivatedRoute) {}

  @Input() commentInput: {
    comment: string;
    username: string;
    createdAt: string;
  } | undefined;
  commentInputBox: any;

  ngOnInit() {
    this.auctionId = this.route.snapshot.paramMap.get('auctionId') || '';
    this.auctionModel.getAuctionComments(this.auctionId).subscribe(comments => {
      this.comments = comments;
    });
  }

  submitComment() {
    this.auctionModel.submitComment(this.auctionId, this.commentInputBox).subscribe({
      next: ()=> {
        //window.location.reload();
      }
    });
  }
}
