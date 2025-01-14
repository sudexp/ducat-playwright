import { type Page } from '@playwright/test';

export interface LocalStorageItem {
  key: string;
  value: string;
}

export interface LaunchResult {
  accessTab: Page;
  appUrl: string;
  successUrl: string;
}

export interface WalletStorage {
  [key: string]: string;
}

export interface MixPanelPayloadProperties {
  $os: string;
  $browser: string;
  $current_url: string;
  $browser_version: number;
  $screen_height: number;
  $screen_width: number;
  mp_lib: string;
  $lib_version: string;
  $insert_id: string;
  time: string;
  distinct_id: string;
  $device_id: string;
  $initial_referrer: string;
  $initial_referring_domain: string;
  $user_id: string;
  current_page_title: string;
  current_domain: string;
  current_url_path: string;
  current_url_protocol: string;
  token: string;
  mp_sent_by_lib_version: string;
}

export interface MixPanelPayload {
  data: {
    event: string;
    properties: MixPanelPayloadProperties;
  }[];
}
