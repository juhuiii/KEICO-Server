import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports/reports.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';
import { ControlGroupComponent } from './controls/control-group/control-group.component';
import { ControlPlugComponent } from './controls/control-plug/control-plug.component';
import { MeasPlugsComponent } from './reports/meas-plugs/meas-plugs.component';
import { MeasRptDayComponent } from './reports/meas-rpt-day/meas-rpt-day.component';
import { MeasRptHourComponent } from './reports/meas-rpt-hour/meas-rpt-hour.component';
import { SetPlugsComponent } from './settings/plugs/set-plugs.component';
import { SetPlugsDetailComponent } from './settings/plugs/set-plugs-detail/set-plugs-detail.component';
import { SetGroupsComponent } from './settings/groups/set-groups.component';
import { SetGroupsDetailComponent  } from "./settings/groups/set-groups-detail/set-groups-detail.component";
import { ReptSwitchComponent } from './reports/rept-switch/rept-switch.component';
import { ReptCtrlComponent } from './reports/rept-ctrl/rept-ctrl.component';
import { ReptSchdComponent } from './reports/rept-schd/rept-schd.component';
import { FindPlugComponent } from './settings/find-plug/find-plug.component';
import { SetDefaultComponent } from './settings/set-default/set-default.component';
import { SetHolidaysComponent } from './settings/set-holidays/set-holidays.component';
import { SchdListComponent } from './settings/schd/schd-list/schd-list.component';
import { SchdDetailComponent  } from './settings/schd/schd-detail/schd-detail.component';
import { AppComponent } from './app.component';
import { ControlComponent } from './controls/control.component';
import { AdminAppComponent } from './admin/admin-app.component';
import { ZigbeeComponent } from './admin/zigbee/zigbee.component'
import { WifiComponent } from './admin/wifi/wifi.component';
import { MeasRptMonComponent } from './reports/meas-rpt-mon/meas-rpt-mon.component';
import { VersionComponent } from './admin/version/version.component';
import { NetworkComponent } from './admin/network/network.component';
import { TestControlComponent } from './admin/test/test-control.component';

// const routes: Routes = [
//   { path: 'home', component: HomeComponent, data: {state: 'home'} },
//   { path: 'controlGroup', component: ControlGroupComponent, data: {state: 'controlGroup'} },
//   { path: 'controlPlug', component: ControlPlugComponent, data: {state: 'controlPlug'} },
//   { path: 'reports', component: ReportsComponent, data: {state: 'reports'},
//     children: [
//       { path: 'rept-plug'   , component: MeasPlugsComponent  , data: {state: 'rept-plug'  } },
//       { path: 'rept-hour'   , component: MeasRptHourComponent, data: {state: 'rept-hour'  } },
//       { path: 'rept-day'    , component: MeasRptDayComponent , data: {state: 'rept-day'   } },
//       { path: 'rept-switch' , component: ReptSwitchComponent , data: {state: 'rept-switch'} },
//       { path: 'rept-ctrl'   , component: ReptCtrlComponent   , data: {state: 'rept-ctrl'  } },
//       { path: 'rept-schd'   , component: ReptSchdComponent   , data: {state: 'rept-schd'  } },
//       { path: '', redirectTo: 'rept-plug', pathMatch: 'full' },
//     ]
//   },
//   {
//     path: 'settings', component: SettingsComponent, data: {state: 'settings'},
//     children: [
//       { path: 'set-find'                  , component: FindPlugComponent,       data: {state: 'set-find'  } },
//       { path: 'set-plugs'                 , component: SetPlugsComponent,       data: {state: 'set-plugs'  } },
//       { path: 'set-plugs/:ZB_ADDR'        , component: SetPlugsDetailComponent, data: {state: 'set-plugs'  } },
//       { path: 'set-groups'                , component: SetGroupsComponent,      data: {state: 'set-groups'  } },
//       { path: 'set-groups/:GRP_SQ'        , component: SetGroupsDetailComponent,data: {state: 'set-groups'  } },
//       { path: 'set-holidays'              , component: SetHolidaysComponent,    data: {state: 'set-holidays'  } },
//       { path: 'set-default'               , component: SetDefaultComponent,     data: {state: 'set-default'  } },
//       { path: 'set-groups/set-schedules/:GRP_SQ', component: SchdListComponent, data: {state: 'set-schedules'  } },
//       { path: 'set-groups/set-schedules-detail/:GRP_SQ', component: SchdDetailComponent, data: {state: 'set-schedules'  } },
//       { path: '', redirectTo: 'set-plugs', pathMatch: 'full' },
//     ]
//   },
//   {
//     path: 'admin', component: AdminHomeComponent, data: {state: 'admin'}, outlet: "admin-out",
//     children: []
//   },
//   { path: '', redirectTo: '/home', pathMatch: 'full' },
// ];


const routes: Routes = [
    { path: 'app', component: AppComponent,
      children : [
        { path: 'home', component: HomeComponent },
        { path: 'control', component: ControlComponent,
          children: [
            { path: 'controlGroup', component: ControlGroupComponent },
            { path: 'controlPlug', component: ControlPlugComponent },
            { path: '', redirectTo: 'controlGroup', pathMatch: 'full' },
          ],
        },
        { path: 'reports', component: ReportsComponent,
          children: [
            { path: 'rept-plug'   , component: MeasPlugsComponent  , data: {state: 'rept-plug'  } },
            { path: 'rept-hour'   , component: MeasRptHourComponent, data: {state: 'rept-hour'  } },
            { path: 'rept-day'    , component: MeasRptDayComponent , data: {state: 'rept-day'   } },
            { path: 'rept-mon'    , component: MeasRptMonComponent , data: {state: 'rept-mon'   } },
            { path: 'rept-switch' , component: ReptSwitchComponent , data: {state: 'rept-switch'} },
            { path: 'rept-ctrl'   , component: ReptCtrlComponent   , data: {state: 'rept-ctrl'  } },
            { path: 'rept-schd'   , component: ReptSchdComponent   , data: {state: 'rept-schd'  } },
            { path: '', redirectTo: 'rept-plug', pathMatch: 'full' },
          ]
        },
        {
          path: 'settings', component: SettingsComponent, data: {state: 'settings'},
          children: [
            { path: 'set-find'                  , component: FindPlugComponent,       data: {state: 'set-find'  } },
            { path: 'set-plugs'                 , component: SetPlugsComponent,       data: {state: 'set-plugs'  } },
            { path: 'set-plugs/:ZB_ADDR'        , component: SetPlugsDetailComponent, data: {state: 'set-plugs'  } },
            { path: 'set-groups'                , component: SetGroupsComponent,      data: {state: 'set-groups'  } },
            { path: 'set-groups/:GRP_SQ'        , component: SetGroupsDetailComponent,data: {state: 'set-groups'  } },
            { path: 'set-holidays'              , component: SetHolidaysComponent,    data: {state: 'set-holidays'  } },
            { path: 'set-default'               , component: SetDefaultComponent,     data: {state: 'set-default'  } },
            { path: 'set-groups/set-schedules/:GRP_SQ', component: SchdListComponent, data: {state: 'set-schedules'  } },
            { path: 'set-groups/set-schedules-detail/:GRP_SQ', component: SchdDetailComponent, data: {state: 'set-schedules'  } },
            { path: '', redirectTo: 'set-plugs', pathMatch: 'full' },
          ]
        },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
      ]
    },
    {
      path: 'admin', component: AdminAppComponent, data: {state: 'admin'},
      children: [
        { path: 'version', component: VersionComponent },
        { path: 'zigbee', component: ZigbeeComponent },
        { path: 'network-admin', component: WifiComponent },
        { path: 'network', component: NetworkComponent },
        { path: 'test', component: TestControlComponent },
        { path: '', redirectTo: 'network', pathMatch: 'full' },
      ]
    },
    { path: '**', redirectTo: '/app/home', pathMatch: 'full' },
  ];


@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }


