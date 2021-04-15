import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { XgModalService } from 'src/app/commonUX/xg-modal.service';

@Component({
  selector: 'app-schd-list',
  templateUrl: './schd-list.component.html',
  styles:[':host ::ng-deep .onweek{ font-weight:bod; font-size:1.1rem; color:#00ffc8 !important;}'],
  styleUrls: ['./schd-list.component.scss']
})
export class SchdListComponent implements OnInit {

  private grp_sq : number ;  
  public  group : {};  
  public schedules = [];


  constructor(public api: ApiService, 
    public modal: XgModalService,
    private activatedRoute: ActivatedRoute,  
    private router: Router  ) {

      this.grp_sq = Number(activatedRoute.snapshot.params["GRP_SQ"]); 
  }

  ngOnInit() {
    this.group = Object.assign({}, this.api.getGroup( this.grp_sq) );    
    this.dataRefresh();
  }

  dataRefresh()
  {     
    
    this.api.getScheduleTimes().subscribe(data => {
      if (data['rcd'] === 0) {        
        this.api.schedule_times = data['data'];
        this.schedules =  this.api.getScheduleTimesByGroup( this.grp_sq ) ;  //시간 스케쥴 

        console.log( this.schedules );
      }    
    }, error => {
      console.log(error);
    });   
    
  }

  getStringWeekBit( weekBit )
  {
    let weekStr = "";
    weekStr += (weekBit.substr(0,1) == "1") ? "<span class='onweek'>일</span>" : "<span class='offweek'>일</span>" ;
    weekStr += (weekBit.substr(1,1) == "1") ? "<span class='onweek'>월</span>" : "<span class='offweek'>월</span>" ;
    weekStr += (weekBit.substr(2,1) == "1") ? "<span class='onweek'>화</span>" : "<span class='offweek'>화</span>" ;
    weekStr += (weekBit.substr(3,1) == "1") ? "<span class='onweek'>수</span>" : "<span class='offweek'>수</span>" ;
    weekStr += (weekBit.substr(4,1) == "1") ? "<span class='onweek'>목</span>" : "<span class='offweek'>목</span>" ;
    weekStr += (weekBit.substr(5,1) == "1") ? "<span class='onweek'>금</span>" : "<span class='offweek'>금</span>" ;
    weekStr += (weekBit.substr(6,1) == "1") ? "<span class='onweek'>토</span>" : "<span class='offweek'>토</span>" ;
    return weekStr;    
  }

  
  goBack()
  {
    this.router.navigate(['/app/settings/set-groups']);
  }

   //그룹삭제 
   goDeleteSchedule(SCHD_SQ)
   {
     const initialState = {      
       title : "삭제", 
       message  : "스케쥴을 삭제 하시겠습니까?" ,
       confirmBtnName : "삭제",
       declineBtnName : "취소"
     };
 
     this.modal.openConfirm(initialState).then( success => {      
       console.log( "OK", initialState );
 
       this.api.deleteScheduleOnce(SCHD_SQ).subscribe( res => {            
            this.dataRefresh();           
       },
       err => {        
         this.modal.alert( "삭제", "삭제 되지 않았습니다. 관리자 문의 바랍니다." );
       });      
     }).catch( ()=>{
       console.log( "Cancle", initialState );
     });
   } //End of goGroupDelete()



   goAddSchedule(GRP_SQ)
   {
      this.router.navigate(['/app/settings/set-groups/set-schedules-detail', GRP_SQ]);               
   }

}
