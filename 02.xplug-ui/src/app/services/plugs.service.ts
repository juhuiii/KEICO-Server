import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PlugsService {

  // get         /devices                        //플러그 목록조회
  // get         /devices/:ZB_ADDR               //플러그 개별조회
  // delete      /devices/:ZB_ADDR               //플러그 삭제
  // post        /devices/:ZB_ADDR               //플러그 정보수정
  // get         /devices/:ZB_ADDR/on            //플러그 ON 제어
  // get         /devices/:ZB_ADDR/off           //플러그 OFF 제어

  private api: ApiService;
  public url_devices = '/devices';

  constructor(private http: HttpClient) {
  }

  setApi(_api:ApiService) {
    this.api = _api;
    this.url_devices = this.api.url_server + '/devices';
  }

  getPlugs() {
    return this.http.get( this.url_devices, this.api.httpOption);
  }

}
