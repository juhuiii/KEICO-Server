import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';

@Component({
  selector: 'app-find-plug',
  templateUrl: './find-plug.component.html',
  styleUrls: ['./find-plug.component.scss']
})
export class FindPlugComponent implements OnInit {

  constructor(public api: ApiService, public modal: XgModalService) { }

  count: number;

  ngOnInit() {
    this.count = 0;
  }

  filterPlug(plug: any) {
    return plug.GRP_SQ <= 0 || plug.GRP_SQ == "";
  }

  trackPlug(index, item) {
    return item.ZB_ADDR;
  }
  
  onPermitJoin() {
    this.api.permitJoin(250).subscribe(data => {

      const initialState = {
        message: "플러그 검색중",
        displayCancleBtn: true,
        cancleBtnName: "취소",
        displayShowTimeout: true,
        showTimeout: 250,        
      };

      this.modal.openProcess(initialState).then(result => {
        this.api.permitJoin(0).subscribe(data => { }, error => { });
        console.log("Permit Join End");
      }).catch(reason => {
        console.log("Permit Join Error ");
      });
    }, error => {

      this.modal.alert("플러그 검색", "플러그검색 요청이 실패되었습니다.");

      console.log(error);
    });
  }



  onFindChannel() {
    this.api.findChannel().subscribe(data => {

      const initialState = {
        message: "채널검색중",
        displayCancleBtn: true,
        cancleBtnName: "취소",
        displayShowTimeout: true,
        showTimeout: 20,        
      };

      this.modal.openProcess(initialState).then(result => {
        console.log("Find Channel End");
      }).catch(reason => {
        console.log("Find Channel Error ");
      });
    }, error => {

      this.modal.alert("채널 검색", "채널검색 요청이 실패되었습니다." );

      console.log(error);
    });

  }

}
