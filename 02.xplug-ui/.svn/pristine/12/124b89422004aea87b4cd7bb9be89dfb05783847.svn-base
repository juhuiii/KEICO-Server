import { Component, OnInit,ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';
import { isNgTemplate } from '@angular/compiler';

@Component({
  selector: 'app-set-groups-detail',
  templateUrl: './set-groups-detail.component.html',
  styleUrls: ['./set-groups-detail.component.scss']
})
export class SetGroupsDetailComponent implements OnInit  {

   
  private grp_sq : number ;  
  public  group : {};  
  public  plugs : any[];          //플러그 목록 
    

  constructor( 
    public api: ApiService, 
    public modal: XgModalService,
    private activatedRoute: ActivatedRoute,  
    private router: Router  ,
    ) { 
    this.grp_sq = Number(activatedRoute.snapshot.params["GRP_SQ"]);    
  }

  ngOnInit() {
    this.group = Object.assign({}, this.api.getGroup( this.grp_sq) ); 
    this.dataRefresh();    
  } //End of ngOnInit()

  dataRefresh()
  {    
    this.plugs = this.api.getPlugsByGroup( this.grp_sq );

    console.log(this.plugs);
  }

    //그룹삭제 
  goGroupDelete()
  {
    const initialState = {      
      title : "삭제", 
      message  : "그룹을 삭제 하시겠습니까?" ,
      confirmBtnName : "삭제",
      declineBtnName : "취소"
    };

    this.modal.openConfirm(initialState).then( success => {      
      console.log( "OK", initialState );

      this.api.deleteGroup(this.grp_sq).subscribe( res => {        
          this.router.navigate(['/app/settings/set-groups']);        
      },
      err => {        
        this.modal.alert("그룹삭제",  "삭제 되지 않았습니다. 관리자 문의 바랍니다." );
      });      
    }).catch( ()=>{
      console.log( "Cancle", initialState );
    });
  } //End of goGroupDelete()




  
  goGroupUpdate()
  { 
    this.api.updateGroup(this.group).subscribe( res => {        

        this.modal.alert("그룹설정", "저장되었습니다.");
        this.api.reload();
      },
      err => {
        this.modal.alert( "그룹설정", "저장 되지 않았습니다. 관리자 문의 바랍니다." );        
        console.log("Error occured");
      }
    );
  }
  

  goBack()
  {
        this.router.navigate(['/app/settings/set-groups']);
  }



}



