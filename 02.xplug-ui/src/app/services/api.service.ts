import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as $ from 'jquery';
import { XgModalService } from '../commonUX/xg-modal.service';
import { PlugsService } from './plugs.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImMxZGIzMTAyLTQ1YTEtNGViYS04ODA0LTU0OTFjOTQ1YThkMyJ9.eyJjbGllbnRfaWQiOiJsb2NhbC10b2tlbiIsInJvbGUiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZSI6Ii90aGluZ3M6cmVhZHdyaXRlIiwiaWF0IjoxNTQ4NDgxNzM3LCJpc3MiOiJOb3Qgc2V0LiJ9.T1xR04nQCgPNC_px0N9dWCQ-eZW4wnuUBGAgYWr0X_sQs_K87wWcFmcW3B01JVk5XXjEc48zH1nHFaz2xLQwSQ',
    'Content-Type': 'application/json; charset=utf-8',
    'timeout' : '30000'
  }),
  timeout: 30000,
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public httpOption = httpOptions;

  public control = true;

  public simulation = false;

  public isNetworkErr = false;  //Network   Error 상태
  public isGatewayErr = true;   //Gateway  연결 Error 상태

  public url_server = 'http://' + $(location).attr('hostname') + '/rest';

  // public url_server = 'http://192.168.0.202/rest';   //  Gateway ng

  public url_devices            = this.url_server + '/devices';
  public url_sites              = this.url_server + '/sites';

  private url_report_hour       = this.url_server + '/report_hour';
  private url_report_hour_total = this.url_server + '/report_hour/total';

  private url_report_day        = this.url_server + '/report_day';
  private url_report_day_total  = this.url_server + '/report_day/total';

  private url_report_mon_total  = this.url_server + '/report_mon/total';

  private url_report_swevnt     = this.url_server + '/report_swevnt';   //플러그 동작이력
  private url_report_contorl    = this.url_server + '/report_control';  //플로그 제어이력

  private url_allOn             = this.url_server + '/all/on';
  private url_allOff            = this.url_server + '/all/off';

  private url_groups            = this.url_server + '/groups';
  private url_permit            = this.url_server + '/permit_join';
  private url_channel           = this.url_server + '/find_channel'

  private url_schedules_times   = this.url_server + '/schedules_times';
  private url_schedules         = this.url_server + '/schedules';

  private url_schedule_ones     = this.url_server + '/schedule_once';
  private url_atmSchd           = this.url_server + '/autodev_schedules';

  private url_savekwh           = this.url_server + '/report_mon/total';
  private url_holidays          = this.url_server + '/holidays';

  private url_stat_zbgroup      = this.url_server + '/admin/stat_zbgroup';
  private url_reset_zbgroup     = this.url_server + '/admin/reset_zbgroup';

  private url_report_config     = this.url_server + '/report_config';
  private url_nwk_addr          = this.url_server  + '/nwk_addr';
  private url_time_sync         = this.url_server + '/time_sync';                    // 태블릿과 시간동기화

  private url_init_devnm        = this.url_server + '/admin/devices/devnm_init';    //디바이스명 "001,002..." 형태로 초기화 하기
  private url_network_info      = this.url_server + '/admin/network_info';          //게이트웨이 현재 네트워크 정보 ( 설정 파일 아님 ) 조회 및 설정
  private url_wifi_info         = this.url_server + '/admin/wifi_scan';             //와이파이 스캔 및 정보저장

  private url_network_file      = this.url_server + '/admin/network_file';          //네트워크 설정파일 정보 GET=읽기, POST=쓰기 (/etc/network/interfaces)
  private url_wifi_file         = this.url_server + '/admin/wifi_file';             //와이파이 설정파일 정보 GET=읽기, POST=쓰기 (/etc/wpa_supplicant/wpa_supplicant.conf)

  private url_network_file_fmt  = this.url_server + '/admin/network_file_fmt';    //네트워크 설정파일 정보 GET=읽기, POST=쓰기 (/etc/network/interfaces)
  private url_wifi_file_fmt     = this.url_server + '/admin/wifi_file_fmt';       //와이파이 설정파일 정보 GET=읽기, POST=쓰기 (/etc/wpa_supplicant/wpa_supplicant.conf)

  private url_reboot            = this.url_server + '/admin/reboot';                //재시작
  private url_restart_net       = this.url_server + '/admin/restartnetwork';        //재시작


  public siteInfo = {
    WORK_STM: 830,
    WORK_ETM: 1830,
    WORK_STM_STR: "08:30",
    WORK_ETM_STR: "18:30",
  };
  public plugs = [];
  public groups: any;

  public schedules: any;
  public schedule_times: any;

  public devGubuns: Array<object> = [{ DEVGB_SQ: 0, DEVGB_NM: "사무기기" }
    , { DEVGB_SQ: 1, DEVGB_NM: "고객용기기" }
    , { DEVGB_SQ: 2, DEVGB_NM: "에어컨" }
    , { DEVGB_SQ: 999, DEVGB_NM: "자동화기기" }
  ];

  tm_boot = '';

  constructor(
    public plugSvc: PlugsService,
    private http: HttpClient,
    private router: Router) {

    this.plugSvc.setApi(this);

    this.updatePlugs();
    this.updateData();

    this.tm_boot = moment().format("HHmm");

    setInterval(() => { this.crontab(); }, 3000);
    setInterval(() => { this.updatePlugs(); }, 1000);
    setInterval(() => { this.updateData(); }, 10000);

    setInterval(() => { this.setTimeSync(); }, 10000);

  }

  crontab() {
    let tm_curr = moment().format("HHmm");

    if (tm_curr == this.tm_boot) return;  //방금부팅 했따면 무시

    if (tm_curr == '355' || tm_curr == '0355')  //새벽 3:55분 재로딩 ..( 브라우져 메모리 누수 방지 )
    {
      if( this.isNetworkErr == false && this.isGatewayErr == false )  //네트워크 및 API연결 상태가 정상일경우만 재로딩 합니다.
        window.location.reload();
    }
  }


  reload() {
    this.updateData();
  }

  updateData() {

    this.getGroups().subscribe(data => {
      if (data['rcd'] === 0) {
        this.groups = data['data'];
      }
    }, error => {
      console.log(error);
    });

    this.getScheduleTimes().subscribe(data => {
      if (data['rcd'] === 0) {
        this.schedule_times = data['data'];
      }
    }, error => {
      console.log(error);
    });

    this.getSchedules().subscribe(data => {
      if (data['rcd'] === 0) {
        this.schedules = data['data'];
      }
    }, error => {
      console.log(error);
    });

    this.updateSiteInfo();
  }

  updateSiteInfo() {
    this.getSites().subscribe(response => {

      if (response['rcd'] === 0) {

        if (response['data'].length > 0) {

          this.siteInfo = response['data'][0];

          if (this.isEmpty(this.siteInfo.WORK_STM))
            this.siteInfo.WORK_STM = 830;

          if (this.isEmpty(this.siteInfo.WORK_ETM))
            this.siteInfo.WORK_ETM = 1830;

          this.siteInfo.WORK_STM_STR = moment(this.siteInfo.WORK_STM, "Hmm").format("HH:mm");
          this.siteInfo.WORK_ETM_STR = moment(this.siteInfo.WORK_ETM, "Hmm").format("HH:mm");
        }

      }
      else {
        console.log("updateSiteInfo Error :", response['rcd'], response['rms']);
      }

    }, error => {
      console.log("updateSiteInfo Error :", error)
    });
  }

  //  플러그정보 가져오기
  updatePlugs() {

    return this.http.get(this.url_devices, httpOptions).subscribe(response => {
      if (response['rcd'] === 0) {

        let tmp = response['data'];

        //  TEST 반드시 지울것
        if (this.simulation) {

          tmp.forEach( item => {
            // item.KW = Math.floor((Math.random() * 1000000) + 50) * 0.001;

            item.KW  = this.rand( 50000, 100000 ) * 0.001;
            item.DEV_ST = 1;
            item.SW_ST = 1;
          });

          tmp[0].SW_ST = 0;
          tmp[1].SW_ST = 0;
          tmp[2].DEV_ST = 0;
          tmp[3].DEV_ST = 0;
          tmp[3].SW_ST = 0;
          tmp[4].DEV_ST = 0;
        }

        this.plugs = tmp;
      }
      else {
        console.log("getPlugs error: " + response['rms']);
      }
    }, error => {
      console.log("getPlugs error: " + error);
    });
  }


  //  현장정보
  getSites() {
    return this.http.get(this.url_sites, httpOptions);
  }

  updateSite(obj: any) {
    return this.http.post(`${this.url_sites}/${obj.STE_SQ}`, JSON.stringify(obj), httpOptions);
  }



  //  플러그정보
  getPlugs() {
    return this.plugs;
  }

  //  플러그
  getPlug(addr: any) {
    return this.plugs.find(item => {
      return item["ZB_ADDR"] === addr;
    });
  }

  getPlugsByGroup(grp_sq: any) {

    let arrPlugs: any[] = [];

    this.plugs.forEach(item => {
      if (item["GRP_SQ"] === grp_sq)
        arrPlugs.push(item);
    });

    return arrPlugs;
  }



  getPlugCountByGroup(GRP_SQ: any) {

    let count = 0;
    this.plugs.forEach(item => {
      if (item["GRP_SQ"] === GRP_SQ) count++;
    });

    return count;
  }

  addGroup(obj: any) {
    return this.http.post(`${this.url_groups}`, JSON.stringify(obj), httpOptions);
  }
  deleteGroup(GRP_SQ: any) {
    return this.http.delete(`${this.url_groups}/${GRP_SQ}`, httpOptions);
  }

  updateGroup(obj: any) {
    return this.http.post(`${this.url_groups}/${obj.GRP_SQ}`, JSON.stringify(obj), httpOptions);
  }

  updatePlug(obj: any) {
    return this.http.post(`${this.url_devices}/${obj.ZB_ADDR}`, JSON.stringify(obj), httpOptions);
  }

  deletePlug(obj: any) {
    // return this.http.post(`${this.url_devices}/${obj.ZB_ADDR}`,  JSON.stringify(obj), httpOptions ) ;
    return this.http.delete(`${this.url_devices}/${obj.ZB_ADDR}`, httpOptions);
  }

  //  절감량
  getSaveEng() {
    return this.http.get(this.url_savekwh, httpOptions);
  }


  //  보고서
  getReportMonTotal(fr_mon, to_mon) {
    let url = this.url_report_mon_total;
    url += "?FR_MONTH=" + fr_mon;
    url += "&TO_MONTH=" + to_mon;

    return this.http.get(url, httpOptions);
  }


  //  보고서
  getReportDay(fr_date: any, to_date: any) {
    let url = this.url_report_day;
    url += "?FR_DATE=" + fr_date;
    url += "&TO_DATE=" + to_date;

    return this.http.get(url, httpOptions);
  }

  //  보고서
  getReportDayTotal(fr_dt, to_dt) {
    let url = this.url_report_day_total;
    url += "?FR_DATE=" + fr_dt;
    url += "&TO_DATE=" + to_dt;

    return this.http.get(url, httpOptions);
  }

  //  시간 보고서
  getReportHourTotal(fr_dt, to_dt) {
    let url = this.url_report_hour_total;
    url += "?FR_DATE=" + fr_dt;
    url += "&TO_DATE=" + to_dt;

    return this.http.get(url, httpOptions);
  }

   //동작이력 보고서
   getReportSwEvnt(fr_date: any, to_date: any) {
    let url = this.url_report_swevnt;
    url += "?FR_DATE=" + fr_date;
    url += "&TO_DATE=" + to_date;

    return this.http.get(url, httpOptions);
  }

  //제어이력 보고서
  getReportControl(fr_date: any, to_date: any) {
    let url = this.url_report_contorl;
    url += "?FR_DATE=" + fr_date;
    url += "&TO_DATE=" + to_date;

    return this.http.get(url, httpOptions);
  }

  allOn() {
    return this.http.get(this.url_allOn, httpOptions);
  }

  allOff(yn) {
    return this.http.get(this.url_allOff + '?FILTER=' + yn, httpOptions);
  }


  //그룹정보
  getGroups() {
    return this.http.get(this.url_groups);
  }

  getGroup(grp_sq: any) {
    return this.groups.find(item => {
      return item.GRP_SQ === grp_sq;
    });
  }

  permitJoin(jointime: number = 20) {
    console.log("permitJoin", jointime);
    return this.http.get(`${this.url_permit}/${jointime}`, httpOptions);
  }

  findChannel() {
    console.log("findChannel");
    return this.http.get(`${this.url_channel}`, httpOptions);
  }






  //스케쥴 일자정보,시간정보 동시등록
  addScheduleOnce(obj: any) {
    return this.http.post(`${this.url_schedule_ones}`, JSON.stringify(obj), httpOptions);
  }
  //스케쥴 일자정보,시간정보 동시삭제
  deleteScheduleOnce(SCHD_SQ: any) {
    return this.http.delete(`${this.url_schedule_ones}/${SCHD_SQ}`, httpOptions);
  }
  //스케줄  일자정보,시간정보 동시조회
  getScheduleOnce() {
    return this.http.get(this.url_schedule_ones, httpOptions);
  }



  //  스케줄 등록
  addSchedule(obj: any) {
    return this.http.post(`${this.url_schedules}`, JSON.stringify(obj), httpOptions);
  }
  //  스케줄 목록
  getSchedules() {
    return this.http.get(this.url_schedules, httpOptions);
  }
  //  스케줄
  getSchedule(schd_sq: any) {
    return this.schedules.find(item => {
      return item.SCHD_SQ === schd_sq;
    });
  }
  getScheduleByGroup(grp_sq: any) {
    return this.schedules.find(item => {
      return item.GRP_SQ === grp_sq;
    });
  }
  getSchedulesByGroup(grp_sq: any) {

    let arrSchedules: any[] = [];
    this.schedules.find(item => {
      if (item.GRP_SQ === grp_sq) arrSchedules.push(item);
    });
    return arrSchedules;
  }
  getScheduleGroup(GRP_SQ: any) {
    let count = 0;
    this.schedules.find(item => {
      if (item.GRP_SQ === GRP_SQ) count++;
    });
    return count;
  }
  updateSchedule(obj: any) {
    return this.http.post(`${this.url_schedules}/${obj.SCHD_SQ}`, JSON.stringify(obj), httpOptions);
  }
  deleteSchedule(obj: any) {
    return this.http.delete(`${this.url_schedules}/${obj.SCHD_SQ}`, httpOptions);
  }

  //시간스케쥴등록
  addScheduleTime(obj: any) {
    return this.http.post(`${this.url_schedules_times}`, JSON.stringify(obj), httpOptions);
  }

  //  스케줄시간 목록
  getScheduleTimes() {
    return this.http.get(this.url_schedules_times, httpOptions);
  }
  //  스케줄시간 목록
  getScheduleTimesByGroup(grp_sq: any) {

    let arrScheduleTimes: any[] = [];

    this.schedule_times.find(item => {
      if (item.GRP_SQ === grp_sq)
        arrScheduleTimes.push(item);
    });

    return arrScheduleTimes;
  }

  getScheduleTimesByGroupAndSchd(grp_sq: any, schd_sq: any) {

    let arrScheduleTimes: any[] = [];

    this.schedule_times.find(item => {
      if (item.GRP_SQ === grp_sq && item.SCHD_SQ === schd_sq)
        arrScheduleTimes.push(item);
    });

    return arrScheduleTimes;
  }

  //  스케줄 시간
  getScheduleTime(schd_tm_sq: any) {
    return this.schedule_times.find(item => {
      return item.SCHD_TM_SQ === schd_tm_sq
    });
  }
  getScheduleTimeCountByGroup(GRP_SQ: any) {
    let count = 0;
    this.schedule_times.find(item => {
      if (item.GRP_SQ === GRP_SQ) count++;
    });

    return count;
  }
  updateScheduleTime(obj: any) {
    return this.http.post(`${this.url_schedules_times}/${obj.SCHD_TM_SQ}`, JSON.stringify(obj), httpOptions);
  }
  deleteScheduleTime(obj: any) {
    return this.http.delete(`${this.url_schedules_times}/${obj.SCHD_TM_SQ}`, httpOptions);
  }

  //  onoff => 'on' or 'off'
  //  filter => 'y' or 'n'  : 대기전력체크여부
  onoff(addr64, onoff, filter) {
    // get         /devices/:ZB_ADDR/on            //플러그 ON 제어
    // get         /devices/:ZB_ADDR/off           //플러그 OFF 제어
    let url = this.url_devices + "/" + addr64 + "/" + onoff + "?FILTER=" + filter;
    return this.http.get(url, httpOptions);
  }

  groupOnOff(grp_sq, onoff, filter) {
    // get         /devices/:ZB_ADDR/on            //플러그 ON 제어
    // get         /devices/:ZB_ADDR/off           //플러그 OFF 제어
    let url = this.url_groups + "/" + grp_sq + "/" + onoff + "?FILTER=" + filter;
    return this.http.get(url, httpOptions);
  }

  getAtmSchd() {
    return this.http.get(this.url_atmSchd, httpOptions);
  }

  getHolidays() {
    return this.http.get(this.url_holidays, httpOptions);
  }

  addHoliday(obj: any) {
    return this.http.post(`${this.url_holidays}`, JSON.stringify(obj), httpOptions);
  }

  delHoliday(holidt: any) {
    return this.http.delete(`${this.url_holidays}/${holidt}`, httpOptions);
  }

  //네트워크(16BIT) 주소 확인요청
  setNetworkAddr(addr64) {
    return this.http.get(this.url_nwk_addr + '?addr64=' + addr64, httpOptions);
  }

  //Report 전송 주기 설정 요청
  setReportConfig(addr64, kind, min, max, val ) {
    let url = this.url_report_config + "?addr64=" + addr64 + "&knd=" +kind + "&min=" +min + "&max=" +max + "&val=" +val ;
    return this.http.get(url, httpOptions);
  }


  //게이트웨이 시간 설정
  setTimeSync() {

    let cTime = moment().format('YYYY-MM-DD HH:mm:ss');

    return this.http.get(this.url_time_sync + '?time=' + cTime, httpOptions).subscribe(data => {
      if (data['rcd'] === 0)  console.log(`success time sync:${cTime}, Realod : ${this.tm_boot}(HHmm)` );
      else                    console.log(`faild   time sync:${cTime}, Realod : ${this.tm_boot}(HHmm)` );

    }, error => {
      console.log(error);
    });
  }




  //Common Utils

  formatTM(date: any, time = ''): string {
    let tTime = '';
    if (!isNaN(Number(date)) && !isNaN(Number(time)))
      tTime = ((date * 1000000) + time) + "";
    else
      tTime = date + '' + time;
    return moment(tTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm');
  }

  isEmpty(value: any) {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value === "") return true;
    if (typeof value === "object" && !Object.keys(value).length) return true;
    return false
  }
  rand(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
  }






  ///admin
  getZbGroupStat() {
    return this.http.get(this.url_stat_zbgroup, httpOptions);
  }

  getZbGroupReset() {
    return this.http.get(this.url_reset_zbgroup, httpOptions);
  }



    // 게이트웨이 현재 네트워크 정보
    getNetworkInfo() {
      return this.http.get(this.url_network_info, httpOptions);
    }

    //네트워크 설정파일 정보 GET=읽기
    getNetworkFile() {
      return this.http.get(this.url_network_file, httpOptions);
    }

    //네트워크 설정파일 정보 GET=쓰기
    saveNetworkFile(obj: any) {
        return this.http.post(`${this.url_network_file}`, JSON.stringify(obj), httpOptions);
    }



    //네트워크 설정파일 정보 GET=읽기
    getNetworkFileFmt() {
      return this.http.get(this.url_network_file_fmt, httpOptions);
    }

    //네트워크 설정파일 정보 GET=쓰기
    saveNetworkFileFmt(obj: any) {
        return this.http.post(`${this.url_network_file_fmt}`, JSON.stringify(obj), httpOptions);
    }



    // 와이파이(SSID) SCAN 목록
    getWifiScan() {
      return this.http.get(this.url_wifi_info, httpOptions);
    }

    // 와이파이 설정파일 조회
    getWifiFile() {
      return this.http.get(this.url_wifi_file, httpOptions);
    }

    // 와이파이 설정파일  저장
    saveWifiFile(obj: any) {
      return this.http.post(`${this.url_wifi_file}`, JSON.stringify(obj), httpOptions);
    }


    // 와이파이 설정파일 조회
    getWifiFileFmt() {
      return this.http.get(this.url_wifi_file_fmt, httpOptions);
    }

    // 와이파이 설정파일  저장
    saveWifiFileFmt(obj: any) {
      return this.http.post(`${this.url_wifi_file_fmt}`, JSON.stringify(obj), httpOptions);
    }



    // 게이트웨이 재시작
    reboot() {
      return this.http.get(this.url_reboot, httpOptions);
    }


    // 게이트웨이 재시작
    restartNetwork() {
      return this.http.get(this.url_restart_net, httpOptions);
    }









}
