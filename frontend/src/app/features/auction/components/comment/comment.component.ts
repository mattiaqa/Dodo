import {Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {AuctionService} from '../../../../services/auction.service';
import {ActivatedRoute} from '@angular/router';
import {StorageService} from '../../../../storage/storage.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-comment',
  imports: [
    FormsModule,
    NgForOf,
    DatePipe,
    NgIf,
    FaIconComponent
  ],
  templateUrl: './comment.component.html',
  standalone: true,
  styleUrl: './comment.component.scss'
})
export class CommentComponent implements OnInit {
  comments: any = [];
  auctionId: string = '';
  isAdmin: boolean = false;

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
    this.isAdmin = this.serviceStorage.isUserAdmin();
  }

  submitComment() {
    this.auctionModel.submitComment(this.auctionId, this.commentInputBox).subscribe({
      next: ()=> {
        this.comments.push({
          comment: this.commentInputBox,
          username: this.serviceStorage.getUser().name,
          createdAt: new Date()
        });
        this.commentInputBox = ''
        window.location.reload();
      }
    });
  }

  deleteComment(commentId: string) {
    this.auctionModel.deleteComment(commentId).subscribe(data => {
      this.comments = this.comments.filter((comment: { _id: string; }) => comment._id !== commentId);
    })
  }
}
