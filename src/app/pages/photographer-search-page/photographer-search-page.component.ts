import { AgmMap } from '@agm/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { PhotographerProfile } from '../../interfaces/photographer-profile';
import { FirebaseFirestoreService } from '../../services/firebase/firestore/firebase-firestore.service';
import { GeolocationService } from '../../services/geolocation/geolocation.service';

/**
 * Photographer search page component
 * @author Daniel Sogl
 */
@Component({
  selector: 'app-photographer-search-page',
  templateUrl: './photographer-search-page.component.html',
  styleUrls: ['./photographer-search-page.component.scss']
})
export class PhotographerSearchPageComponent implements OnInit {
  /** Logger */
  private log = Log.create('PhotographerSearchPageComponent');

  /** Photographer profiles collection */
  public photographer: PhotographerProfile[] = [];

  /** Edited photographer profiles collection */
  public editedPhotographer: PhotographerProfile[] = [];

  /** indicator for parting line */
  public hasBothProfiles: boolean;

  /** Photographer profile */
  public photograph: PhotographerProfile = {
    about: '',
    email: '',
    facebook: '',
    instagram: '',
    name: '',
    phone: '',
    tumbler: '',
    twitter: '',
    uid: '',
    website: '',
    premium: false,
    profileUrl: '',
    location: {
      lat: 0,
      lng: 0
    }
  };

  /** position of user */
  private userLat: number;
  private userLng: number;

  /** Google maps ref */
  @ViewChild('map') public agmMap: AgmMap;

  constructor(
    private geolocation: GeolocationService,
    private afs: FirebaseFirestoreService
  ) {}

  /**
   * Initialize component
   */
  ngOnInit() {
    this.log.color = 'orange';
    this.log.d('Component initialized');

    // Init map
    this.agmMap.latitude = 51.165691;
    this.agmMap.longitude = 10.451526000000058;
    this.agmMap.zoom = 11;

    // Load all photographer profiles
    this.afs
      .getAllPhotographer()
      .valueChanges()
      .subscribe(photographer => {
        this.photographer = photographer;
      });

    // Get browser geolocation
    if (!!navigator.geolocation) {
      /* geolocation is available */
      this.geolocation
        .getBrowserLocation()
        .then(position => {
          this.log.d('Current position', position.coords);
          this.setPosition(position.coords.latitude, position.coords.longitude);
          this.userLat = position.coords.latitude;
          this.userLng = position.coords.longitude;
        })
        .catch((err: any) => {
          this.log.er('Error getting location', err);
        });
    }
    // Show photographer profiles of users area
    this.refreshPhotographerList();
  }

  /** return number of kilometres between a certain photographer and the user position */
  getPhotographerDistance(photographer: PhotographerProfile) {
    return this.geolocation.calculateGpsDistance(
      photographer.location.lat,
      photographer.location.lng,
      this.userLat,
      this.userLng
    );
  }

  /**
   * Set the position on the map
   * @param  {number} latitude Latitude
   * @param  {number} longitude Longitude
   */
  setPosition(latitude: number, longitude: number) {
    this.agmMap.latitude = latitude;
    this.agmMap.longitude = longitude;
    this.agmMap.zoom = 11;
    this.agmMap.triggerResize();
  }

  /** return input value */
  onKey(event: any) {
    if (+event.target.value && event.target.value.length === 5) {
      this.handleEnteredZip(event.target.value);
    }
    // TODO: Alert for valid and invalid zip
  }

  /** get entered zip, convert zip to coordinates, refresh map */
  handleEnteredZip(zip: string) {
    this.log.info('valid zip-length entered');
    this.geolocation.getCoordinatesFromZip(zip).then((result: any) => {
      if (result.results[0].geometry.location) {
        this.photograph.location = result.results[0].geometry.location;
        this.setPosition(
          this.photograph.location.lat,
          this.photograph.location.lng
        );
        this.userLat = this.photograph.location.lat;
        this.userLng = this.photograph.location.lng;
        this.refreshPhotographerList();
      } else {
        this.log.error('Cannot get location from Service');
      }
    });
  }

  /** add photographers to displayed list when they are in the users area */
  refreshPhotographerList() {
    // clean displayed list
    if (this.editedPhotographer) {
      this.editedPhotographer.splice(0);
    }

    let hasPremium: boolean;
    let hasStandard: boolean;
    hasPremium = false;
    hasStandard = false;
    this.hasBothProfiles = false;

    for (let i = 0; i < this.photographer.length; i++) {
      let distance: number;
      distance = this.getPhotographerDistance(this.photographer[i]);

      // add all photographers in the circle of 10 kilometres
      if (distance < 10) {
        this.editedPhotographer.push(this.photographer[i]);

        /** check whether parting line is required */
        if (this.photographer[i].premium) {
          hasPremium = true;
        } else if (!this.photographer[i].premium) {
          hasStandard = true;
        }
      }
    }
    if (hasPremium && hasStandard) {
      this.hasBothProfiles = true;
    }
  }
}
